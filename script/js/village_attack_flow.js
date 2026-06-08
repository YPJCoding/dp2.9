// 怪物攻城启动流程与定时器适配模块
//
// 迁移范围：
// - event_villageattack_timer
// - start_villageattack
// - on_start_event_villageattack
// - start_event_villageattack_timer
// - start_event_villageattack
//
// 说明：
// - 核心 hook、刷怪、PT 结算、奖励邮件仍保留在 df_game_r.js。
// - UI/进度通知已拆到 village_attack_notify.js。
// - hook 重复安装保护已拆到 village_attack_hook.js。
// - 结束与结算流程已拆到 village_attack_settlement.js。
// - 本模块目前保持旧流程语义，用于承接下一步 df_game_r.js 瘦身。
// - 先加载 village_attack_state，确保状态对象、常量和纯状态函数可用。

var g_village_attack_flow_loaded = true;
var g_village_attack_notify_loaded = false;
var g_village_attack_hook_loaded = false;
var g_village_attack_settlement_loaded = false;

function villageAttackFlowLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [village_attack_flow] ' + message);
  } catch (e) {
    console.log('[village_attack_flow] ' + message);
  }
}

function loadVillageAttackFlowModuleByName(moduleName) {
  if (typeof safeLoadModule === 'function') {
    return safeLoadModule(moduleName);
  }
  dp_load(moduleName);
  return true;
}

function ensureVillageAttackFlowStateModule() {
  try {
    return loadVillageAttackFlowModuleByName('village_attack_state');
  } catch (e) {
    villageAttackFlowLog('load village_attack_state failed: ' + e.message);
    return false;
  }
}

function ensureVillageAttackNotifyModule() {
  if (g_village_attack_notify_loaded) {
    return true;
  }

  ensureVillageAttackFlowStateModule();

  try {
    g_village_attack_notify_loaded = loadVillageAttackFlowModuleByName('village_attack_notify');
  } catch (e) {
    villageAttackFlowLog('load village_attack_notify failed: ' + e.message);
    g_village_attack_notify_loaded = false;
  }

  if (g_village_attack_notify_loaded) {
    villageAttackFlowLog('loaded village_attack_notify');
  }
  return g_village_attack_notify_loaded;
}

function ensureVillageAttackHookModule() {
  if (g_village_attack_hook_loaded) {
    return true;
  }

  try {
    g_village_attack_hook_loaded = loadVillageAttackFlowModuleByName('village_attack_hook');
  } catch (e) {
    villageAttackFlowLog('load village_attack_hook failed: ' + e.message);
    g_village_attack_hook_loaded = false;
  }

  if (g_village_attack_hook_loaded) {
    villageAttackFlowLog('loaded village_attack_hook');
  }
  return g_village_attack_hook_loaded;
}

function ensureVillageAttackSettlementModule() {
  if (g_village_attack_settlement_loaded) {
    return true;
  }

  ensureVillageAttackFlowStateModule();

  try {
    g_village_attack_settlement_loaded = loadVillageAttackFlowModuleByName('village_attack_settlement');
  } catch (e) {
    villageAttackFlowLog('load village_attack_settlement failed: ' + e.message);
    g_village_attack_settlement_loaded = false;
  }

  if (g_village_attack_settlement_loaded) {
    villageAttackFlowLog('loaded village_attack_settlement');
  }
  return g_village_attack_settlement_loaded;
}

// 怪物攻城活动计时器(每5秒触发一次)
function event_villageattack_timer() {
  ensureVillageAttackEventInfo();
  ensureVillageAttackNotifyModule();
  ensureVillageAttackSettlementModule();

  if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_END) {
    return;
  }

  // 活动结束检测。
  var remain_time = event_villageattack_get_remain_time();
  if (remain_time <= 0) {
    on_end_event_villageattack();
    return;
  }

  // 当前应扣除的 PT。
  var damage = 0;

  // P2/P3 阶段 GBL 主教扣 PT。
  if ((villageAttackEventInfo.state == VILLAGEATTACK_STATE_P2) || (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P3)) {
    for (var i = 0; i < villageAttackEventInfo.gbl_cnt; ++i) {
      if (get_random_int(0, 100) < (4 + villageAttackEventInfo.difficult)) {
        damage += 1;
      }
    }
  }

  // P3 阶段世界 BOSS 自身回血。
  if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P3) {
    if (get_random_int(0, 100) < (6 + villageAttackEventInfo.difficult)) {
      damage += 1;
    }
  }

  // 扣除 PT。
  if (damage > 0) {
    villageAttackEventInfo.score -= damage;
    if (villageAttackEventInfo.score < EVENT_VILLAGEATTACK_TARGET_SCORE[villageAttackEventInfo.state - 1]) {
      villageAttackEventInfo.score = EVENT_VILLAGEATTACK_TARGET_SCORE[villageAttackEventInfo.state - 1];
    }
    gameworld_update_villageattack_score();
  }

  if (villageAttackEventInfo.state != VILLAGEATTACK_STATE_END) {
    api_scheduleOnMainThread_delay(event_villageattack_timer, null, 5000);
  }
}

// 开启怪物攻城活动，通知全服玩家刷新城镇怪物。
function start_villageattack() {
  villageAttackFlowLog('start_villageattack');
  ensureVillageAttackEventInfo();

  var a3 = Memory.alloc(100);
  a3.add(10).writeInt(EVENT_VILLAGEATTACK_TOTAL_TIME);
  a3.add(14).writeInt(villageAttackEventInfo.score);
  a3.add(18).writeInt(EVENT_VILLAGEATTACK_TARGET_SCORE[2]);
  Inter_VillageAttackedStart_dispatch_sig(ptr(0), ptr(0), a3);
}

// 开始怪物攻城活动。
function on_start_event_villageattack() {
  ensureVillageAttackNotifyModule();
  ensureVillageAttackSettlementModule();
  reset_villageattack_info();
  start_villageattack();
  api_scheduleOnMainThread_delay(event_villageattack_timer, null, 5000);
  event_villageattack_broadcast_difficulty();
}

// 开启怪物攻城活动定时器。
function start_event_villageattack_timer() {
  var cur_time = api_CSystemTime_getCurSec();
  var delay_time = (3600 * EVENT_VILLAGEATTACK_START_HOUR) - (cur_time % (3600 * 24));
  if (delay_time <= 0) {
    delay_time += 3600 * 24;
  }

  villageAttackFlowLog('next start delay seconds=' + delay_time);
  api_scheduleOnMainThread_delay(on_start_event_villageattack, null, delay_time * 1000);
}

// 开启怪物攻城活动。
function start_event_villageattack() {
  ensureVillageAttackEventInfo();
  ensureVillageAttackNotifyModule();
  ensureVillageAttackHookModule();
  ensureVillageAttackSettlementModule();

  // patch 相关函数，修复活动流程。hook 实现仍保留在 df_game_r.js。
  hook_VillageAttack();
  villageAttackFlowLog('start_event_villageattack');

  if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_END) {
    start_event_villageattack_timer();
  } else {
    api_scheduleOnMainThread_delay(event_villageattack_timer, null, 5000);
  }
}

ensureVillageAttackFlowStateModule();
ensureVillageAttackNotifyModule();
ensureVillageAttackHookModule();
ensureVillageAttackSettlementModule();
villageAttackFlowLog('flow helpers loaded');
