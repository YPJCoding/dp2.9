// 已迁移 JS 模块集中启动器
//
// 说明：
// - 用于承接 df_game_r.js 入口瘦身。
// - df_game_r.js 后续只需加载 startup_helpers.js 和 startup_modules.js，调用 startMigratedModules(cfg)。
// - 本文件只调度已经拆分到 script/js/*.js 的模块。
// - 不处理仍留在 df_game_r.js 的怪物攻城、TOD 等大型旧逻辑。

function startupModulesLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [startup_modules] ' + message);
  } catch (e) {
    console.log('[startup_modules] ' + message);
  }
}

function getFeatureFlag(cfg, name, defaultValue) {
  if (typeof isFeatureEnabled === 'function') {
    return isFeatureEnabled(cfg, name, defaultValue);
  }
  if (!cfg || typeof cfg[name] === 'undefined') {
    return defaultValue;
  }
  return cfg[name] === true;
}

function loadModuleOnly(featureName, enabled, moduleName) {
  if (!enabled) {
    startupModulesLog('skip ' + featureName + ': disabled');
    return false;
  }

  if (typeof safeLoadModule === 'function') {
    return safeLoadModule(moduleName);
  }

  try {
    dp_load(moduleName);
    startupModulesLog('loaded ' + moduleName);
    return true;
  } catch (e) {
    startupModulesLog('load failed ' + moduleName + ': ' + e.message);
    return false;
  }
}

function startModuleFeature(featureName, enabled, moduleName, functionName, args) {
  if (typeof safeModuleFeature === 'function') {
    return safeModuleFeature(featureName, enabled, moduleName, functionName, args || []);
  }

  if (!enabled) {
    startupModulesLog('skip ' + featureName + ': disabled');
    return false;
  }

  try {
    dp_load(moduleName);
  } catch (e) {
    startupModulesLog('load failed ' + moduleName + ': ' + e.message);
    return false;
  }

  if (typeof globalThis !== 'undefined' && typeof globalThis[functionName] === 'function') {
    try {
      globalThis[functionName].apply(null, args || []);
      startupModulesLog('started ' + featureName);
      return true;
    } catch (e) {
      startupModulesLog('start failed ' + featureName + ': ' + e.message);
      return false;
    }
  }

  if (typeof this !== 'undefined' && typeof this[functionName] === 'function') {
    try {
      this[functionName].apply(null, args || []);
      startupModulesLog('started ' + featureName);
      return true;
    } catch (e) {
      startupModulesLog('start failed ' + featureName + ': ' + e.message);
      return false;
    }
  }

  startupModulesLog('missing function ' + functionName + ' for ' + featureName);
  return false;
}

function startMigratedModules(cfg) {
  cfg = cfg || {};

  // 纯 helper / callback 模块：先加载，供后续 history_log 或 Lua/JS 回调复用。
  loadModuleOnly('batch_item_notify', getFeatureFlag(cfg, 'enable_batch_item_add', true), 'batch_item_notify');
  loadModuleOnly('user_use_item_event', getFeatureFlag(cfg, 'enable_history_log', true), 'user_use_item_event');

  // drop_announce 的处理函数由 history_log 复用；history_log 开启时不额外启动 drop_announce 自己的 hook，避免双重 cHistoryTrace hook。
  loadModuleOnly('drop_announce', getFeatureFlag(cfg, 'enable_drop_announce', false), 'drop_announce');

  // 随机属性模块提供多个入口，按开关分别启动。
  loadModuleOnly('random_option', getFeatureFlag(cfg, 'enable_random_option_inherit', false) || getFeatureFlag(cfg, 'enable_auto_unseal', false), 'random_option');
  startModuleFeature('random_option_inherit', getFeatureFlag(cfg, 'enable_random_option_inherit', false), 'random_option', 'startRandomOptionInherit');
  startModuleFeature('auto_unseal_random_option', getFeatureFlag(cfg, 'enable_auto_unseal', false), 'random_option', 'startAutoUnsealRandomOptionEquipment');

  // 通用历史日志分发。若 drop_announce/random_option 已加载，会按模块内函数做可选联动。
  startModuleFeature('history_log', getFeatureFlag(cfg, 'enable_history_log', true), 'history_log', 'startHistoryLog');

  // 其余已拆分功能。
  startModuleFeature('emblem_fix', getFeatureFlag(cfg, 'enable_emblem_fix', true), 'emblem_fix', 'startEmblemFix');
  startModuleFeature('user_inout', getFeatureFlag(cfg, 'enable_user_inout_hook', true), 'user_inout', 'startUserInoutHook');
  startModuleFeature('online_reward', getFeatureFlag(cfg, 'enable_online_reward', false), 'online_reward', 'startOnlineReward');
  startModuleFeature('lucky_online', getFeatureFlag(cfg, 'enable_lucky_online', false), 'lucky_online', 'startLuckyOnlineUserEvent');
  startModuleFeature('luck_point_drop', getFeatureFlag(cfg, 'enable_luck_point_drop', true), 'luck_point_drop', 'startLuckPointDrop');
  startModuleFeature('ranking', getFeatureFlag(cfg, 'enable_ranking', true), 'ranking', 'startRanking');
  startModuleFeature('hidden_option', getFeatureFlag(cfg, 'enable_hidden_option', true), 'hidden_option', 'startHiddenOption');
  startModuleFeature('return_user', getFeatureFlag(cfg, 'enable_return_user', true), 'return_user', 'setReturnUser', [15]);
  startModuleFeature('vip_login', getFeatureFlag(cfg, 'enable_vip_login', true), 'vip_login', 'startVipLogin');

  startupModulesLog('migrated module startup finished');
}
