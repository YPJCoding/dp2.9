// 启动辅助模块
// 来源：从旧 frida.js 工具函数迁移并重构
// 用途：提供日志、环境检测、通道名获取等辅助函数

// 获取服务器环境配置
// 来源：从旧 frida.js G_CEnvironment + CEnvironment_get_file_name 迁移
function createStartupHelpers(addr) {
  const _G_CEnvironment = nf(addr.g_cenvironment, 'pointer', []);
  const _GetFileName = nf(addr.cenvironment_get_file_name, 'pointer', ['pointer']);

  function getChannelName() {
    try {
      const filename = _GetFileName(_G_CEnvironment());
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
  globalThis.createStartupHelpers = createStartupHelpers;
}
