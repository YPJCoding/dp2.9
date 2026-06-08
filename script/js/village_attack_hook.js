// 怪物攻城 hook 保护适配模块
//
// 迁移范围：
// - 当前只包装 df_game_r.js 中仍保留的 hook_VillageAttack()。
// - 增加重复安装保护，避免模块化启动或热加载时重复 Interceptor.attach。
//
// 说明：
// - hook 内的 PT 阶段转换、刷怪、结算、奖励逻辑暂不迁移。
// - 后续会按阶段拆出 hook body、PT 计算、结算奖励。

var g_village_attack_hook_guard_installed = false;
var g_village_attack_hook_attached = false;
var g_village_attack_hook_original = null;

function villageAttackHookLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [village_attack_hook] ' + message);
  } catch (e) {
    console.log('[village_attack_hook] ' + message);
  }
}

function resolveLegacyVillageAttackHook() {
  if (g_village_attack_hook_original) {
    return g_village_attack_hook_original;
  }

  if (typeof hook_VillageAttack === 'function') {
    return hook_VillageAttack;
  }

  if (typeof globalThis !== 'undefined' && typeof globalThis.hook_VillageAttack === 'function') {
    return globalThis.hook_VillageAttack;
  }

  try {
    var fn = eval('hook_VillageAttack');
    if (typeof fn === 'function') {
      return fn;
    }
  } catch (e) {}

  return null;
}

function installVillageAttackHookGuard() {
  if (g_village_attack_hook_guard_installed) {
    villageAttackHookLog('hook guard already installed');
    return true;
  }

  var original = resolveLegacyVillageAttackHook();
  if (!original) {
    villageAttackHookLog('hook guard not installed: hook_VillageAttack not found');
    return false;
  }

  g_village_attack_hook_original = original;

  try {
    hook_VillageAttack = function () {
      if (g_village_attack_hook_attached) {
        villageAttackHookLog('skip hook_VillageAttack: already attached');
        return false;
      }

      g_village_attack_hook_attached = true;
      try {
        g_village_attack_hook_original();
        villageAttackHookLog('hook_VillageAttack attached');
        return true;
      } catch (e) {
        g_village_attack_hook_attached = false;
        villageAttackHookLog('hook_VillageAttack failed: ' + e.message);
        return false;
      }
    };

    g_village_attack_hook_guard_installed = true;
    villageAttackHookLog('hook guard installed');
    return true;
  } catch (e) {
    villageAttackHookLog('hook guard install failed: ' + e.message);
    return false;
  }
}

installVillageAttackHookGuard();
