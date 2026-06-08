// 怪物攻城活动结算模块
// 来源：从旧 frida.js on_end_event_villageattack 中的结算逻辑迁移
// 用途：活动结束时进行结算（发奖/惩罚）
//
// 风险说明：
// 1. 防守成功：全服发邮件、送装备强化、送点券 → 影响游戏经济
// 2. 防守失败：随机删除装备、扣金币 → 可能导致玩家不满
// 3. 点券充值调用 billing 库存储过程，务必确保操作正确
// 4. 所有真实地址已迁移到 runtime_addresses.js

function createVillageAttackSettlement(ctx) {
  var st = globalThis.village_attack_state;
  var C = globalThis.VILLAGE_ATTACK_CONSTANTS;

  // 点券充值（来源：从旧 frida.js api_recharge_cash_cera 迁移）
  // 风险：禁止直接修改 billing 库所有表字段，点券相关操作务必调用数据库存储过程
  var _IPGInput = globalThis.nf(ctx.addresses.cipghelper_ipg_input, 'int', ['pointer', 'pointer', 'int', 'int', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer']);
  var _IPGQuery = globalThis.nf(ctx.addresses.cipghelper_ipg_query, 'int', ['pointer', 'pointer']);

  function rechargeCashCera(curUser, amount) {
    // 地址来源：runtime_addresses.js cipghelper_global
    var ipgHelper = ctx.addresses.cipghelper_global.readPointer();
    // 地址来源：runtime_addresses.js ipg_empty_string
    var emptyString = ctx.addresses.ipg_empty_string;
    _IPGInput(ipgHelper, curUser, 5, amount, emptyString, emptyString, Memory.allocUtf8String('GM'), ptr(0), ptr(0), ptr(0));
    _IPGQuery(ipgHelper, curUser);
  }

  // 活动结束结算入口
  // 来源：从旧 frida.js on_end_event_villageattack 迁移
  function settle() {
    // 防守成功
    if (st.getDefendSuccess()) {
      settleSuccess();
    } else {
      // 防守失败
      settleFailure();
    }

    // 清理用户 PT 数据
    st.clearUserPtInfo();
  }

  // ---- 防守成功结算 ----
  // 来源：从旧 frida.js on_end_event_villageattack 防守成功分支迁移
  // 包括：全服发信奖励、装备强化、点券奖励、排名第一额外奖励
  function settleSuccess() {
    var diff = st.getDifficult();
    var multiplier = 1 + diff;

    // 1. 全服在线玩家发信：金币 + 道具
    var rewardGold = 1000000 * multiplier;
    var rewardItemList = [];
    var baseItems = C.DEFEND_SUCCESS_REWARD_ITEMS;
    for (var i = 0; i < baseItems.length; i++) {
      rewardItemList.push([baseItems[i][0], baseItems[i][1] * multiplier]);
    }

    // 遍历所有在线玩家发信
    ctx.gw.forEachUser(function (curUser, args) {
      var characNo = ctx.user.getCurCharacNo(curUser);
      ctx.mail.sendMultiMail(characNo, '<怪物攻城活动>', '恭喜勇士! 防守成功!', rewardGold, rewardItemList);
    }, null);

    // 2. 特殊奖励：绝望之塔推至 100 层 + 随机强化一件装备
    // 来源：从旧 frida.js 移植
    var _TODLayerConstructor = globalThis.nf(ctx.addresses.tod_layer_constructor, 'pointer', ['pointer', 'int']);
    var _TODSetEnterLayer = globalThis.nf(ctx.addresses.tod_userstate_set_enter_layer, 'pointer', ['pointer', 'pointer']);

    ctx.gw.forEachUser(function (curUser, args) {
      // 设置绝望之塔层数为 99（对应游戏内 100 层）
      var todLayer = Memory.alloc(100);
      _TODLayerConstructor(todLayer, 99);
      var expandData = ctx.user.getCharacExpandData(curUser, 13);
      _TODSetEnterLayer(expandData, todLayer);

      // 随机选择一件穿戴中的装备提升强化/增幅等级
      var inven = ctx.user.getCurCharacInvenW(curUser);
      var slot = globalThis.getRandomInt(10, 21); // 12 件装备 slot 范围 10-21
      var equ = ctx.inventory.getInvenRef(inven, ctx.inventory.TYPE_BODY, slot);

      if (ctx.inventory.getItemKey(equ)) {
        // 读取装备强化等级（偏移 6，来源：游戏逆向分析）
        var upgradeLevel = equ.add(6).readU8();
        if (upgradeLevel < 31) {
          // 提升强化/增幅等级（随机 1 到 1+difficult）
          var bonusLevel = globalThis.getRandomInt(1, 1 + diff);
          upgradeLevel += bonusLevel;
          if (upgradeLevel >= 31) {
            upgradeLevel = 31;
          }
          // 写入新的强化等级
          equ.add(6).writeU8(upgradeLevel);
          // 通知客户端更新装备
          ctx.user.sendUpdateItemList(curUser, 1, 3, slot);
        }
      }
    }, null);

    // 3. 个人 PT 排名奖励：点券
    // 奖励规则：个人 PT * 10 = 点券
    var rankFirstCharacNo = 0;
    var rankFirstAccountId = 0;
    var maxPt = 0;

    st.forEachUserPt(function (characNo, accountId, pt) {
      var rewardCera = pt * 10;
      var userPr = ctx.gw.findUserFromWorldByAccid(ctx.gw.getGameWorld(), accountId);
      if (!userPr || userPr.isNull()) {
        return;
      }
      rechargeCashCera(userPr, rewardCera);

      // 找出榜一大哥
      if (pt > maxPt) {
        rankFirstCharacNo = characNo;
        rankFirstAccountId = accountId;
        maxPt = pt;
      }
    });

    // 频道内公告活动结束（使用 notify 的 broadcastMessage）
    ctx.va_notify.broadcastMessage('<怪物攻城活动> 防守成功, 奖励已发送!');

    // 4. 榜一大哥额外 10 倍点券
    if (rankFirstCharacNo) {
      var userPr = ctx.gw.findUserFromWorldByAccid(ctx.gw.getGameWorld(), rankFirstAccountId);
      if (userPr && !userPr.isNull()) {
        rechargeCashCera(userPr, maxPt * 10);
      }

      // 广播排行榜第一名
      var rankFirstName = ctx.va_getCharacNameByNo(rankFirstCharacNo);
      ctx.va_notify.broadcastMessage('<怪物攻城活动> 恭喜勇士 【' + rankFirstName + '】 成为个人积分排行榜第一名(' + maxPt + 'pt)!');
    }
  }

  // ---- 防守失败结算 ----
  // 来源：从旧 frida.js on_end_event_villageattack 防守失败分支迁移
  // 惩罚：7% 概率被掠夺一件装备 + 扣除 1%-10% 金币
  // 风险：随机删除装备对玩家影响很大，需确认这个玩法是否被接受
  function settleFailure() {
    ctx.gw.forEachUser(function (curUser, args) {
      var inven = ctx.user.getCurCharacInvenW(curUser);

      // 7% 概率被掠夺一件穿戴中的装备
      if (globalThis.getRandomInt(0, 100) < 7) {
        var slot = globalThis.getRandomInt(10, 21);
        var equ = ctx.inventory.getInvenRef(inven, ctx.inventory.TYPE_BODY, slot);

        if (ctx.inventory.getItemKey(equ)) {
          ctx.inventory.resetItem(equ);
          ctx.user.sendNotiPacket(curUser, 1, 2, 3);
        }
      }

      // 随机掠夺 1%-10% 所持金币
      var rate = globalThis.getRandomInt(1, 11);
      var curGold = ctx.inventory.getMoney(inven);
      var tax = Math.floor((rate / 100) * curGold);
      ctx.inventory.useMoney(inven, tax, 0, 0);
      ctx.user.sendUpdateItemList(curUser, 1, 0, 0);
    }, null);

    // 使用 notify 的 broadcastMessage 进行世界广播
    ctx.va_notify.broadcastMessage('<怪物攻城活动> 防守失败, 请勇士们再接再厉!');
  }

  return {
    settle: settle,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createVillageAttackSettlement = createVillageAttackSettlement;
}
