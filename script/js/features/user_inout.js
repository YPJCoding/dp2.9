// 玩家上线/下线处理模块
// 来源：从旧 frida.js hook_user_inout_game_world() 迁移
// 用途：处理玩家进入和离开游戏世界的事件
//
// 进入时：
// 1. 发送排行榜数据给全体玩家
// 2. 如果怪物攻城活动进行中，通知当前进度
// 3. 发送问候消息
//
// 离开时：
// 1. 更新个人排行榜排名
//
// 设计原则：
// 不要在 user_inout 里直接写排行榜、怪物攻城等业务细节。
// 通过 ctx 中的回调或函数调用实现解耦。

var g_user_inout_started = false;

function startUserInoutFeature(ctx) {
  if (g_user_inout_started) {
    console.log('[user_inout] already started');
    return;
  }

  var addr = ctx.addresses;

  try {
    // ---- Hook 1: GameWorld::reach_game_world（玩家进入游戏世界） ----
    // 来源：从旧 frida.js hook_user_inout_game_world 第一个 hook 迁移
    // 原函数：玩家选择角色后进入游戏世界
    // 为什么 hook onLeave：需要等原函数完成角色初始化后才能安全操作
    // 风险：游戏初始化完成前访问角色数据可能导致崩溃
    attachOnce('user_inout_reach', addr.gameworld_reach_game_world, {
      onEnter: function (args) {
        // 保存角色指针，onLeave 时使用
        this.user = args[1];
      },
      onLeave: function (retval) {
        var curUser = this.user;

        // 战力排行榜下发（全体）
        // 通过 ctx 的事件回调触发，不直接写排行榜逻辑
        if (ctx.onUserEnter) {
          ctx.onUserEnter(curUser);
        }

        // 怪物攻城活动进度通知
        // 通过 ctx 的事件回调触发
        if (ctx.onUserEnterVillageAttack) {
          ctx.onUserEnterVillageAttack(curUser);
        }

        // 问候消息
        // 来源：从旧 frida.js 移植，向进入游戏的玩家发送问候
        if (ctx.user) {
          var characName = ctx.user.getCurCharacName(curUser);
          ctx.user.sendNotiPacketMessage(curUser, 'Hello : ' + characName, 2);
        }
      }
    });

    // ---- Hook 2: GameWorld::leave_game_world（玩家离开游戏世界） ----
    // 来源：从旧 frida.js hook_user_inout_game_world 第二个 hook 迁移
    // 为什么 hook onEnter：角色离开前最后操作，此时数据仍然完整
    // Hook 点：onEnter 时更新排行榜排名
    attachOnce('user_inout_leave', addr.gameworld_leave_game_world, {
      onEnter: function (args) {
        var curUser = args[1];

        // 通过 ctx 的事件回调触发排行榜更新
        if (ctx.onUserLeave) {
          ctx.onUserLeave(curUser);
        }
      },
      onLeave: function (retval) {}
    });

    g_user_inout_started = true;
    if (ctx.log) ctx.log('[user_inout] started');
  } catch (err) {
    if (ctx.log) ctx.log('[user_inout] failed: ' + err);
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.startUserInoutFeature = startUserInoutFeature;
}
