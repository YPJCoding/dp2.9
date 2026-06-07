// 怪物攻城状态与低风险工具函数
//
// 迁移范围：
// - 活动阶段常量。
// - 怪物 ID / 活动配置常量。
// - 默认状态对象构造。
// - 纯状态读写 helper。
//
// 说明：
// - 为了兼容过渡期，df_game_r.js 中仍保留同名旧定义。
// - 本模块只在缺失时补齐全局定义，不强制覆盖旧状态，避免热加载时重置活动进度。
// - 后续确认启动稳定后，再从 df_game_r.js 删除重复定义。

function villageAttackStateLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [village_attack_state] ' + message);
  } catch (e) {
    console.log('[village_attack_state] ' + message);
  }
}

function defineVillageAttackGlobal(name, value) {
  try {
    if (typeof globalThis !== 'undefined' && typeof globalThis[name] === 'undefined') {
      globalThis[name] = value;
    }
  } catch (e) {}
}

// 活动阶段。
defineVillageAttackGlobal('VILLAGEATTACK_STATE_P1', 0); // 一阶段
defineVillageAttackGlobal('VILLAGEATTACK_STATE_P2', 1); // 二阶段
defineVillageAttackGlobal('VILLAGEATTACK_STATE_P3', 2); // 三阶段
defineVillageAttackGlobal('VILLAGEATTACK_STATE_END', 3); // 活动已结束

// 怪物 ID。
defineVillageAttackGlobal('TAU_CAPTAIN_MONSTER_ID', 50071); // 牛头统帅
defineVillageAttackGlobal('GBL_POPE_MONSTER_ID', 262); // GBL 教主教
defineVillageAttackGlobal('TAU_META_COW_MONSTER_ID', 17); // 机械牛

// 活动配置。
defineVillageAttackGlobal('EVENT_VILLAGEATTACK_START_HOUR', 12);
defineVillageAttackGlobal('EVENT_VILLAGEATTACK_TARGET_SCORE', [100, 200, 300]);
defineVillageAttackGlobal('EVENT_VILLAGEATTACK_TOTAL_TIME', 3600);

function createDefaultVillageAttackEventInfo() {
  return {
    'state': VILLAGEATTACK_STATE_END,
    'score': 0,
    'start_time': 0,
    'difficult': 0,
    'next_village_monster_id': 0,
    'last_killed_monster_id': 0,
    'p2_last_killed_monster_time': 0,
    'p2_kill_combo': 0,
    'gbl_cnt': 0,
    'defend_success': 0,
    'user_pt_info': {},
  };
}

function ensureVillageAttackEventInfo() {
  try {
    if (typeof villageAttackEventInfo === 'undefined' || villageAttackEventInfo == null) {
      villageAttackEventInfo = createDefaultVillageAttackEventInfo();
      villageAttackStateLog('created default event info');
    }
  } catch (e) {
    try {
      globalThis.villageAttackEventInfo = createDefaultVillageAttackEventInfo();
      villageAttackStateLog('created default event info on globalThis');
    } catch (e2) {
      villageAttackStateLog('failed to create default event info: ' + e2.message);
    }
  }
  return villageAttackEventInfo;
}

function resetVillageAttackInfoStateOnly() {
  ensureVillageAttackEventInfo();
  villageAttackEventInfo.state = VILLAGEATTACK_STATE_P1;
  villageAttackEventInfo.score = 0;
  villageAttackEventInfo.difficult = 0;
  villageAttackEventInfo.next_village_monster_id = TAU_CAPTAIN_MONSTER_ID;
  villageAttackEventInfo.last_killed_monster_id = 0;
  villageAttackEventInfo.p2_kill_combo = 0;
  villageAttackEventInfo.user_pt_info = {};
  villageAttackEventInfo.start_time = api_CSystemTime_getCurSec();
  return villageAttackEventInfo;
}

function getVillageAttackRemainTime() {
  ensureVillageAttackEventInfo();
  var cur_time = api_CSystemTime_getCurSec();
  var event_end_time = villageAttackEventInfo.start_time + EVENT_VILLAGEATTACK_TOTAL_TIME;
  return event_end_time - cur_time;
}

function setVillageAttackDungeonDifficult(difficult) {
  Memory.protect(ptr(0x085B9605), 4, 'rwx');
  ptr(0x085B9605).writeInt(difficult);
}

function broadcastVillageAttackDifficulty() {
  ensureVillageAttackEventInfo();
  if (villageAttackEventInfo.state != VILLAGEATTACK_STATE_END) {
    api_GameWorld_SendNotiPacketMessage('<怪物攻城活动> 当前阶段:' + (villageAttackEventInfo.state + 1) + ', 当前难度等级: ' + villageAttackEventInfo.difficult, 14);
  }
}

// 旧函数名兼容。df_game_r.js 旧定义仍存在时不会影响旧入口；后续删除旧定义后可直接复用这些别名。
function reset_villageattack_info_state_only() {
  return resetVillageAttackInfoStateOnly();
}

function event_villageattack_get_remain_time_state_only() {
  return getVillageAttackRemainTime();
}

function set_villageattack_dungeon_difficult_state_only(difficult) {
  return setVillageAttackDungeonDifficult(difficult);
}

function event_villageattack_broadcast_difficulty_state_only() {
  return broadcastVillageAttackDifficulty();
}

ensureVillageAttackEventInfo();
villageAttackStateLog('state helpers loaded');
