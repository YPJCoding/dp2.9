// 怪物攻城 UI/进度通知模块
//
// 迁移范围：
// - gameworld_update_villageattack_score
// - notify_villageattack_score
//
// 说明：
// - 只负责广播频道活动进度和通知单个玩家活动 UI/PT。
// - 不处理 hook、刷怪、PT 结算、奖励邮件或 DB 存档。
// - 依赖 df_game_r.js 仍提供的 PacketGuard / InterfacePacketBuf / CUser / GameWorld native 绑定。

function villageAttackNotifyLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [village_attack_notify] ' + message);
  } catch (e) {
    console.log('[village_attack_notify] ' + message);
  }
}

function ensureVillageAttackNotifyStateModule() {
  try {
    if (typeof safeLoadModule === 'function') {
      return safeLoadModule('village_attack_state');
    }
    dp_load('village_attack_state');
    return true;
  } catch (e) {
    villageAttackNotifyLog('load village_attack_state failed: ' + e.message);
    return false;
  }
}

// 更新怪物攻城当前进度(广播给频道内在线玩家)。
function gameworld_update_villageattack_score() {
  ensureVillageAttackEventInfo();

  var remain_time = event_villageattack_get_remain_time();
  if ((remain_time <= 0) || (villageAttackEventInfo.state == VILLAGEATTACK_STATE_END)) {
    return;
  }

  var packet_guard = api_PacketGuard_PacketGuard();
  InterfacePacketBuf_put_header(packet_guard, 0, 247); // ENUM_NOTIPACKET_UPDATE_VILLAGE_ATTACKED
  InterfacePacketBuf_put_int(packet_guard, remain_time);
  InterfacePacketBuf_put_int(packet_guard, villageAttackEventInfo.score);
  InterfacePacketBuf_put_int(packet_guard, EVENT_VILLAGEATTACK_TARGET_SCORE[2]);
  InterfacePacketBuf_finalize(packet_guard, 1);
  GameWorld_send_all(G_GameWorld(), packet_guard);
  Destroy_PacketGuard_PacketGuard(packet_guard);
}

// 通知玩家怪物攻城进度。
function notify_villageattack_score(user) {
  ensureVillageAttackEventInfo();

  var charac_no = CUserCharacInfo_getCurCharacNo(user).toString();
  var villageattack_pt = 0;
  if (charac_no in villageAttackEventInfo.user_pt_info) {
    villageattack_pt = villageAttackEventInfo.user_pt_info[charac_no][1];
  }

  var remain_time = event_villageattack_get_remain_time();
  if ((remain_time <= 0) || (villageAttackEventInfo.state == VILLAGEATTACK_STATE_END)) {
    return;
  }

  var packet_guard = api_PacketGuard_PacketGuard();
  InterfacePacketBuf_put_header(packet_guard, 0, 248); // ENUM_NOTIPACKET_STARTED_VILLAGE_ATTACKED
  InterfacePacketBuf_put_int(packet_guard, remain_time);
  InterfacePacketBuf_put_int(packet_guard, villageAttackEventInfo.score);
  InterfacePacketBuf_put_int(packet_guard, EVENT_VILLAGEATTACK_TARGET_SCORE[2]);
  InterfacePacketBuf_put_int(packet_guard, villageattack_pt);
  InterfacePacketBuf_finalize(packet_guard, 1);
  CUser_Send(user, packet_guard);
  Destroy_PacketGuard_PacketGuard(packet_guard);
}

ensureVillageAttackNotifyStateModule();
villageAttackNotifyLog('notify helpers loaded');
