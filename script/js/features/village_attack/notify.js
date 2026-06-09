// 怪物攻城世界广播与通知
// 来源：从旧 frida.js event_villageattack_broadcast_diffcult / gameworld_update_villageattack_score / notify_villageattack_score 迁移
// 用途：向玩家发送怪物攻城活动进度和状态通知

function createVillageAttackNotify(ctx) {
  const st = globalThis.village_attack_state;
  const C = globalThis.VILLAGE_ATTACK_CONSTANTS;

  // 世界广播活动当前阶段和难度
  // 来源：从旧 frida.js event_villageattack_broadcast_diffcult 迁移
  // 风险：全局广播有一定频率，不应在高频路径上调用
  function broadcastPhase() {
    if (st.getState() != C.STATE_END) {
      // 使用 gw binding 中封装的 sendNotiPacketMessage 进行世界广播
      ctx.gw.sendNotiPacketMessage(
        '<怪物攻城活动> 当前阶段:' + (st.getState() + 1) + ', 当前难度等级: ' + st.getDifficult(),
        14
      );
    }
  }

  // 世界广播任意消息
  // 用途：活动开始/结束/世界BOSS刷新等需要通知全服玩家的事件
  function broadcastMessage(msg) {
    ctx.gw.sendNotiPacketMessage(msg, 14);
  }

  // 更新怪物攻城当前进度（广播给频道内在线玩家）
  // 来源：从旧 frida.js gameworld_update_villageattack_score 迁移
  // 协议: ENUM_NOTIPACKET_UPDATE_VILLAGE_ATTACKED (247)
  function updateScoreBroadcast() {
    const remainTime = st.getRemainTime(ctx.time.getCurSec(), ctx.villageAttackConfig.total_time);
    if ((remainTime <= 0) || (st.getState() == C.STATE_END)) {
      return;
    }

    const pkt = ctx.packet.createPacketGuard();
    ctx.packet.putHeader(pkt, 0, 247);
    ctx.packet.putInt(pkt, remainTime);                                   // 活动剩余时间
    ctx.packet.putInt(pkt, st.getScore());                                // 当前频道 PT 点数
    ctx.packet.putInt(pkt, ctx.villageAttackConfig.target_score[2]);      // 成功防守所需点数
    ctx.packet.finalize(pkt, 1);

    ctx.gw.sendAll(ctx.gw.getGameWorld(), pkt);
    ctx.packet.destroyPacketGuard(pkt);
  }

  // 通知单个玩家怪物攻城进度
  // 来源：从旧 frida.js notify_villageattack_score 迁移
  // 协议: ENUM_NOTIPACKET_STARTED_VILLAGE_ATTACKED (248)
  // 用途：在玩家进入游戏时调用，打开怪物攻城 UI 并更新当前进度
  function notifyPlayerScore(curUser) {
    const characNo = ctx.user.getCurCharacNo(curUser).toString();
    const pt = st.getUserPt(characNo);

    const remainTime = st.getRemainTime(ctx.time.getCurSec(), ctx.villageAttackConfig.total_time);
    if ((remainTime <= 0) || (st.getState() == C.STATE_END)) {
      return;
    }

    const pkt = ctx.packet.createPacketGuard();
    ctx.packet.putHeader(pkt, 0, 248);
    ctx.packet.putInt(pkt, remainTime);                                   // 活动剩余时间
    ctx.packet.putInt(pkt, st.getScore());                                // 当前频道 PT 点数
    ctx.packet.putInt(pkt, ctx.villageAttackConfig.target_score[2]);      // 成功防守所需点数
    ctx.packet.putInt(pkt, pt);                                           // 个人 PT 点数
    ctx.packet.finalize(pkt, 1);

    ctx.user.send(curUser, pkt);
    ctx.packet.destroyPacketGuard(pkt);
  }

  return {
    broadcastPhase: broadcastPhase,
    broadcastMessage: broadcastMessage,
    updateScoreBroadcast: updateScoreBroadcast,
    notifyPlayerScore: notifyPlayerScore,
  };
}

RuntimeUtils.exposeGlobal('createVillageAttackNotify', createVillageAttackNotify);
