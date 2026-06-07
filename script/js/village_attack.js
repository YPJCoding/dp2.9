// 怪物攻城启动适配模块
//
// 迁移策略：
// - 本文件当前只提供启动适配与重复启动保护。
// - 怪物攻城核心实现仍保留在 df_game_r.js，避免一次性搬迁奖励、刷怪、UI 包、DB 等高风险逻辑。
// - 后续按状态、定时器、UI、hook、奖励结算分组逐步迁移。

var g_village_attack_start_requested = false;

function villageAttackLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [village_attack] ' + message);
  } catch (e) {
    console.log('[village_attack] ' + message);
  }
}

function resolveLegacyVillageAttackStarter() {
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

function startVillageAttack() {
  if (g_village_attack_start_requested) {
    villageAttackLog('skip start: already requested');
    return false;
  }

  var starter = resolveLegacyVillageAttackStarter();
  if (!starter) {
    villageAttackLog('skip start: legacy start_event_villageattack not found');
    return false;
  }

  g_village_attack_start_requested = true;
  try {
    starter();
    villageAttackLog('start requested via legacy start_event_villageattack');
    return true;
  } catch (e) {
    g_village_attack_start_requested = false;
    villageAttackLog('start failed: ' + e.message);
    return false;
  }
}

// 旧命名兼容：后续入口切换或手动调试时可直接调用。
function start_village_attack() {
  return startVillageAttack();
}
