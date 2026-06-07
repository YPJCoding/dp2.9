// 怪物攻城启动适配模块
//
// 迁移策略：
// - 本文件当前只提供启动适配与重复启动保护。
// - 怪物攻城核心实现仍保留在 df_game_r.js，避免一次性搬迁奖励、刷怪、UI 包、DB 等高风险逻辑。
// - 后续按状态、定时器、UI、hook、奖励结算分组逐步迁移。

var g_village_attack_start_requested = false;
var g_village_attack_legacy_guard_installed = false;
var g_village_attack_legacy_start_original = null;

function villageAttackLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [village_attack] ' + message);
  } catch (e) {
    console.log('[village_attack] ' + message);
  }
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

function callVillageAttackStarterOnce(starter, source) {
  if (g_village_attack_start_requested) {
    villageAttackLog('skip start from ' + source + ': already requested');
    return false;
  }

  if (!starter) {
    villageAttackLog('skip start from ' + source + ': legacy start_event_villageattack not found');
    return false;
  }

  g_village_attack_start_requested = true;
  try {
    starter();
    villageAttackLog('start requested from ' + source);
    return true;
  } catch (e) {
    g_village_attack_start_requested = false;
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
  var starter = resolveLegacyVillageAttackStarter();
  return callVillageAttackStarterOnce(starter, 'startVillageAttack');
}

// 旧命名兼容：后续入口切换或手动调试时可直接调用。
function start_village_attack() {
  return startVillageAttack();
}

// 模块加载时先保护旧入口。当前 df_game_r.js 仍直接调度 start_event_villageattack，
// 因此先安装 guard，后续再把实际启动入口切到 startup_modules.js。
installVillageAttackLegacyStartGuard();
