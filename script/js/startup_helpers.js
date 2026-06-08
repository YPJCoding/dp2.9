// Frida 启动调度辅助函数
//
// 目标：
// - 统一封装功能开关判断。
// - 模块或函数不存在时只记录日志，不中断整个 Frida 启动。
// - 单个功能启动失败时不影响其他功能。
// - 后续 df_game_r.js 入口瘦身时逐步替换直接调用。

var g_startup_loaded_modules = (typeof g_startup_loaded_modules !== 'undefined') ? g_startup_loaded_modules : {};

function startupLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [startup] ' + message);
  } catch (e) {
    console.log('[startup] ' + message);
  }
}

function isFeatureEnabled(config, featureName, defaultValue) {
  if (!config || typeof config !== 'object') {
    return defaultValue === true;
  }
  if (typeof config[featureName] === 'undefined') {
    return defaultValue === true;
  }
  return config[featureName] === true;
}

function safeLoadModule(moduleName) {
  if (!moduleName) {
    return false;
  }

  if (g_startup_loaded_modules[moduleName] === true) {
    startupLog('module already loaded=' + moduleName);
    return true;
  }

  try {
    if (typeof dp_load !== 'function') {
      startupLog('missing dp_load, skip module=' + moduleName);
      return false;
    }

    var loaded = dp_load(moduleName);
    if (loaded !== true) {
      startupLog('load module returned false module=' + moduleName);
      return false;
    }

    g_startup_loaded_modules[moduleName] = true;
    startupLog('loaded module=' + moduleName);
    return true;
  } catch (e) {
    startupLog('load module failed module=' + moduleName + ' error=' + e.message);
    return false;
  }
}

function resolveStartupFunction(functionName) {
  if (!functionName) {
    return null;
  }

  if (typeof globalThis !== 'undefined' && typeof globalThis[functionName] === 'function') {
    return globalThis[functionName];
  }

  if (typeof this !== 'undefined' && typeof this[functionName] === 'function') {
    return this[functionName];
  }

  try {
    var fn = eval(functionName);
    if (typeof fn === 'function') {
      return fn;
    }
  } catch (e) {}

  return null;
}

function safeFeature(featureName, enabled, runner) {
  if (enabled !== true) {
    startupLog('skip feature=' + featureName);
    return false;
  }

  if (typeof runner !== 'function') {
    startupLog('missing runner feature=' + featureName);
    return false;
  }

  try {
    runner();
    startupLog('started feature=' + featureName);
    return true;
  } catch (e) {
    startupLog('failed feature=' + featureName + ' error=' + e.message);
    return false;
  }
}

function safeModuleFeature(featureName, enabled, moduleName, functionName, args) {
  return safeFeature(featureName, enabled, function () {
    if (moduleName && !safeLoadModule(moduleName)) {
      throw new Error('load module failed ' + moduleName);
    }

    var fn = resolveStartupFunction(functionName);
    if (typeof fn !== 'function') {
      throw new Error('missing function ' + functionName);
    }

    return fn.apply(null, args || []);
  });
}
