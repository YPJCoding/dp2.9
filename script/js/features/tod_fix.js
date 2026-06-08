// 绝望之塔修复模块
// 来源：从旧 frida.js fix_TOD(skip_user_apc) 迁移
// 用途：修复绝望之塔的门票、金币、每10层跳过用户APC
//
// 包含以下修复：
// 1. 挑战成功后可以继续使用门票（不再需要重新购买）
// 2. 可选跳过每10层的 UserAPC（当 skip_user_apc=true 时）
// 3. 绝望之塔不再扣除金币

var g_tod_fix_started = false;

function startTodFixFeature(ctx) {
  if (g_tod_fix_started) {
    console.log('[tod_fix] already started');
    return;
  }

  var addr = ctx.addresses;
  var cfg = ctx.config.tod_fix;

  try {
    // ---- 修复1：挑战成功后可以继续使用门票 ----
    // 来源：从旧 frida.js fix_TOD 第一个 hook 迁移
    // 原函数：TOD_UserState 相关逻辑
    // 为什么需要：原版成功挑战后门票被消耗，需要重新购买
    // Hook 点：onLeave 替换返回值为 0，表示门票未消耗
    // 风险：如果门票消耗逻辑变更，此修复可能失效
    attachOnce('tod_ticket_check', addr.tod_ticket_check, {
      onEnter: function (args) {
        // 不需要修改参数
      },
      onLeave: function (retval) {
        retval.replace(0);
      }
    });

    // ---- 修复2：跳过每10层的 UserAPC ----
    // 来源：从旧 frida.js fix_TOD skip_user_apc hook 迁移
    // 原函数：TOD_UserState::getTodayEnterLayer
    // 为什么需要：每10层（10/20/.../90）需要挑战玩家 APC，
    //   但服务器内角色不足时无法生成 APC 导致卡关
    // 实现：检测到当前层数为 10 的倍数时，直接跳到下一层
    // 风险：跳过 UserAPC 可能影响一些与层数相关的任务
    if (cfg.skip_user_apc) {
      attachOnce('tod_skip_user_apc', addr.tod_get_today_enter_layer, {
        onEnter: function (args) {
          // 绝望之塔当前层数（偏移 0x14 来源：游戏逆向分析）
          var todayEnterLayer = args[1].add(0x14).readShort();

          // 当下层是 10 的倍数（即 9, 19, 29, ... 99-1=98, 但最后一层=99 需要处理）
          if (((todayEnterLayer % 10) == 9) && (todayEnterLayer > 0) && (todayEnterLayer < 99)) {
            // 直接进入下一层，跳过 UserAPC
            args[1].add(0x14).writeShort(todayEnterLayer + 1);
          }
        },
        onLeave: function (retval) {
          // 不需要修改返回值
        }
      });
    }

    // ---- 修复3：绝望之塔不扣除金币 ----
    // 来源：从旧 frida.js fix_TOD CParty_UseAncientDungeonItems replace 迁移
    // 原函数：CParty::UseAncientDungeonItems
    // 为什么需要 replace（而不是 attach）：
    //   需要完全替换道具消耗逻辑，对绝望之塔直接返回成功
    // 为什么安全：
    //   只在副本 ID 是绝望之塔（11008-11107）时跳过，
    //   其他副本仍然执行原始逻辑
    // 风险：如果绝望之塔副本 ID 范围变更，需要更新判断条件
    var CDungeonGetIndex = nf(addr.cdungeon_get_index, 'int', ['pointer']);
    var originalUseAncientDungeonItems = nf(
      addr.cparty_use_ancient_dungeon_items,
      'int',
      ['pointer', 'pointer', 'pointer', 'pointer']
    );

    replaceOnce('tod_no_gold', addr.cparty_use_ancient_dungeon_items, function (party, dungeon, invenItem, a4) {
      // 当前进入的地下城 ID
      var dungeonIndex = CDungeonGetIndex(dungeon);
      // 根据地下城 ID 判断是否为绝望之塔（范围 11008-11107）
      if ((dungeonIndex >= 11008) && (dungeonIndex <= 11107)) {
        // 绝望之塔 不再扣除金币
        return 1;
      }
      // 其他副本执行原始扣除道具逻辑
      return originalUseAncientDungeonItems(party, dungeon, invenItem, a4);
    }, 'int', ['pointer', 'pointer', 'pointer', 'pointer']);

    g_tod_fix_started = true;
    if (ctx.log) ctx.log('[tod_fix] started');
  } catch (err) {
    if (ctx.log) ctx.log('[tod_fix] failed: ' + err);
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.startTodFixFeature = startTodFixFeature;
}
