// 启动辅助模块
// 来源：从旧 frida.js 工具函数迁移并重构，对齐 main 分支 dp_load 模式
// 用途：
//   - 提供 safeLoadModule() 通过 dp_load 加载模块（带缓存）
//   - 提供创建 startup helpers 对象（日志辅助等）

// 模块加载缓存，避免同一启动流程重复 load
var g_startup_loaded_modules = (typeof g_startup_loaded_modules !== 'undefined') ? g_startup_loaded_modules : {};

// 通过 dp_load 安全加载模块
// moduleName: 模块路径名（如 'core/hook_guard'、'features/ranking'）
// 返回: true=加载成功或已加载, false=加载失败
function safeLoadModule(moduleName) {
  if (!moduleName) {
    return false;
  }

  // 已加载过，跳过
  if (g_startup_loaded_modules[moduleName] === true) {
    return true;
  }

  // dp_load 不存在时无法加载
  if (typeof dp_load !== 'function') {
    console.log('[startup] dp_load 不存在，无法加载模块: ' + moduleName);
    return false;
  }

  try {
    var ok = dp_load(moduleName);
    if (ok !== true) {
      console.log('[startup] dp_load 返回失败: ' + moduleName);
      return false;
    }

    g_startup_loaded_modules[moduleName] = true;
    return true;
  } catch (e) {
    console.log('[startup] dp_load 异常: ' + moduleName + ', error=' + e);
    return false;
  }
}

// 获取服务器环境配置
// 来源：从旧 frida.js G_CEnvironment + CEnvironment_get_file_name 迁移
function createStartupHelpers(addr) {
  var _G_CEnvironment = nf(addr.g_cenvironment, 'pointer', []);
  var _GetFileName = nf(addr.cenvironment_get_file_name, 'pointer', ['pointer']);

  function getChannelName() {
    try {
      var filename = _GetFileName(_G_CEnvironment());
      return filename.readUtf8String(-1);
    } catch (e) {
      return 'unknown';
    }
  }

  // 启动日志辅助
  function logStartup(msg) {
    console.log('[startup] ' + msg);
  }

  function logModuleStart(name) {
    console.log('[startup] starting module: ' + name);
  }

  function logModuleDone(name) {
    console.log('[startup] module started: ' + name);
  }

  function logModuleFailed(name, err) {
    console.log('[startup] module FAILED: ' + name + ' - ' + err);
  }

  return {
    getChannelName: getChannelName,
    logStartup: logStartup,
    logModuleStart: logModuleStart,
    logModuleDone: logModuleDone,
    logModuleFailed: logModuleFailed,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.safeLoadModule = safeLoadModule;
  globalThis.g_startup_loaded_modules = g_startup_loaded_modules;
  globalThis.createStartupHelpers = createStartupHelpers;
}
