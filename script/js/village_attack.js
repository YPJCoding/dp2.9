// 怪物攻城启动适配模块
//
// 迁移策略：
// - 本文件当前只提供启动适配、重复启动保护和 DB ready 等待。
// - 怪物攻城核心实现仍保留在 df_game_r.js，避免一次性搬迁奖励、刷怪、UI 包、DB 等高风险逻辑。
// - 后续按状态、定时器、UI、hook、奖励结算分组逐步迁移。

var g_village_attack_start_requested = false;
var g_village_attack_legacy_guard_installed = false;
var g_village_attack_legacy_start_original = null;
var g_village_attack_pending_starter = null;
var g_village_attack_pending_source = '';
var g_village_attack_start_retry_count = 0;
var g_village_attack_state_loaded = false;

var VILLAGE_ATTACK_DB_RETRY_MS = 1000;
var VILLAGE_ATTACK_DB_RETRY_MAX = 30;

function villageAttackLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [village_attack] ' + message);
  } catch (e) {
    console.log('[village_attack] ' + message);
  }
}

function loadVillageAttackStateModule() {
  if (g_village_attack_state_loaded) {
    return true;
  }

  try {
    if (typeof safeLoadModule === 'function') {
      g_village_attack_state_loaded = safeLoadModule('village_attack_state');
    } else {
      dp_load('village_attack_state');
      g_village_attack_state_loaded = true;
    }
  } catch (e) {
    villageAttackLog('load village_attack_state failed: ' + e.message);
    g_village_attack_state_loaded = false;
  }

  if (g_village_attack_state_loaded) {
    villageAttackLog('loaded village_attack_state');
  }
  return g_village_attack_state_loaded;
}

function resolveLegacyVillageAttackStarter() {
  if (g_village_attack_legacy_start_original) {
    return g_village_attack_legacy_start_original;
  }

  if (typeof start_event_villageattack === 'function') {
    return start_event_villageattack;
  }

  if (typeof globalThis !== 'undefined' && typeof globalThis.start_event_villageattack === 'function') {
    return globalThis.start_event_villageattack;
  }

  try {
    var fn = eval('start_event_villageattack');
    if (typeof fn === 'function') {
      return fn;
    }
  } catch (e) {}

  return null;
}

function isVillageAttackDbReady() {
  try {
    if (typeof mysql_taiwan_cain === 'undefined' || mysql_taiwan_cain == null) {
      return false;
    }
    if (typeof mysql_frida === 'undefined' || mysql_frida == null) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

function scheduleVillageAttackStarter() {
  if (typeof api_scheduleOnMainThread_delay === 'function') {
    api_scheduleOnMainThread_delay(runVillageAttackStarterWhenReady, null, VILLAGE_ATTACK_DB_RETRY_MS);
    return true;
  }

  if (typeof api_scheduleOnMainThread === 'function') {
    api_scheduleOnMainThread(runVillageAttackStarterWhenReady, null);
    return true;
  }

  return false;
}

function resetVillageAttackPendingStart() {
  g_village_attack_start_requested = false;
  g_village_attack_pending_starter = null;
  g_village_attack_pending_source = '';
  g_village_attack_start_retry_count = 0;
}

function runVillageAttackStarterWhenReady() {
  if (!g_village_attack_pending_starter) {
    villageAttackLog('skip scheduled start: no pending starter');
    return;
  }

  if (!isVillageAttackDbReady()) {
    g_village_attack_start_retry_count += 1;

    if (g_village_attack_start_retry_count <= VILLAGE_ATTACK_DB_RETRY_MAX) {
      villageAttackLog(
        'wait db ready for ' +
        g_village_attack_pending_source +
        ': retry=' +
        g_village_attack_start_retry_count
      );
      scheduleVillageAttackStarter();
      return;
    }

    villageAttackLog('start aborted: db not ready after retries');
    resetVillageAttackPendingStart();
    return;
  }

  var starter = g_village_attack_pending_starter;
  var source = g_village_attack_pending_source;

  g_village_attack_pending_starter = null;
  g_village_attack_pending_source = '';
  g_village_attack_start_retry_count = 0;

  try {
    starter();
    villageAttackLog('start requested from ' + source);
  } catch (e) {
    g_village_attack_start_requested = false;
    villageAttackLog('start failed from ' + source + ': ' + e.message);
  }
}

function callVillageAttackStarterOnce(starter, source) {
  if (g_village_attack_start_requested) {
    villageAttackLog('skip start from ' + source + ': already requested');
    return false;
  }

  if (!starter) {
    villageAttackLog('skip start from ' + source + ': legacy start_event_villageattack not found');
    return false;
  }

  loadVillageAttackStateModule();

  g_village_attack_start_requested = true;
  g_village_attack_pending_starter = starter;
  g_village_attack_pending_source = source;
  g_village_attack_start_retry_count = 0;

  if (scheduleVillageAttackStarter()) {
    villageAttackLog('start scheduled from ' + source);
    return true;
  }

  try {
    starter();
    villageAttackLog('start requested immediately from ' + source);
    return true;
  } catch (e) {
    resetVillageAttackPendingStart();
    villageAttackLog('start failed from ' + source + ': ' + e.message);
    return false;
  }
}

function installVillageAttackLegacyStartGuard() {
  if (g_village_attack_legacy_guard_installed) {
    villageAttackLog('legacy start guard already installed');
    return true;
  }

  var starter = resolveLegacyVillageAttackStarter();
  if (!starter) {
    villageAttackLog('legacy start guard not installed: start_event_villageattack not found');
    return false;
  }

  g_village_attack_legacy_start_original = starter;

  try {
    start_event_villageattack = function () {
      return callVillageAttackStarterOnce(g_village_attack_legacy_start_original, 'legacy start_event_villageattack');
    };
    g_village_attack_legacy_guard_installed = true;
    villageAttackLog('legacy start guard installed');
    return true;
  } catch (e) {
    villageAttackLog('legacy start guard install failed: ' + e.message);
    return false;
  }
}

function startVillageAttack() {
  loadVillageAttackStateModule();
  var starter = resolveLegacyVillageAttackStarter();
  return callVillageAttackStarterOnce(starter, 'startVillageAttack');
}

// 旧命名兼容：后续入口切换或手动调试时可直接调用。
function start_village_attack() {
  return startVillageAttack();
}

// 模块加载时先保护旧入口。若 df_game_r.js 中仍残留旧直接调度，
// guard 会保证重复请求只记录 skip，不会重复启动。
loadVillageAttackStateModule();
installVillageAttackLegacyStartGuard();
