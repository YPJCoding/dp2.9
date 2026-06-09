// clean runtime project JS entry
// 默认部署文件：df_game_r.js
// 该文件通过 dp_load 动态加载 script/js 模块，不直接写业务逻辑。
//
// 职责：
// - early 阶段：通过 dp_load 加载启动模块后，等待服务器初始化延迟启动
// - 非 early 阶段（热重载）：直接启动
// - dispose 阶段：调用统一清理函数
//
// 真实业务逻辑全部在 script/js/ 目录下的模块中。
// 不要在此文件中出现真实地址、NativeFunction、业务函数。
//
// 所有 hook（包括本文件的 early hook）都通过 attachOnce 注册，
// 防止热重载时重复 attach。
//
// 部署说明：
//   默认部署 df_game_r.js，通过 dp_load 动态加载 script/js 模块。
//   dist/df_game_r.bundle.js 仅作为无 dp_load 环境的 fallback / 静态检查产物。

var g_entry_started = false;

function entryLog(msg) {
  console.log('[entry] ' + msg);
}

// 使用 dp_load 加载模块
function loadEntryModule(name) {
  if (typeof dp_load !== 'function') {
    entryLog('dp_load 不存在，无法加载模块: ' + name);
    return false;
  }

  try {
    var ok = dp_load(name);
    if (ok !== true) {
      entryLog('dp_load 返回失败: ' + name);
      return false;
    }
    return true;
  } catch (e) {
    entryLog('dp_load 异常: ' + name + ', error=' + e);
    return false;
  }
}

// 加载启动所需的最小依赖
// 顺序不能乱：addresses/config -> hook_guard -> startup_helpers -> startup_modules
function loadRuntimeBootstrapModules() {
  var ok = true;

  // 第 1 步：地址表和配置（所有模块依赖它们）
  ok = loadEntryModule('runtime_addresses') && ok;
  ok = loadEntryModule('runtime_config') && ok;

  // 第 2 步：公共工具（后续模块依赖 RuntimeUtils，必须在 hook_guard 前加载）
  ok = loadEntryModule('core/runtime_utils') && ok;

  // 第 3 步：hook guard（early hook 需要 attachOnce）
  ok = loadEntryModule('core/hook_guard') && ok;

  // 第 4 步：启动辅助和调度（负责加载后续所有模块）
  ok = loadEntryModule('startup_helpers') && ok;
  ok = loadEntryModule('startup_modules') && ok;

  return ok;
}

rpc.exports = {
  init: function (stage, parameters) {
    if (stage == 'early') {
      // 首次加载插件：等待服务器初始化后再加载
      // 为什么需要等待：服务器初始化完成前不能 hook，
      // 否则可能访问未初始化的数据导致崩溃
      // 来源：从旧 frida.js awake() 迁移
      awake();
    } else {
      // 热重载：直接启动
      start();
    }
  },

  dispose: function () {
    // 统一调用模块清理函数
    if (typeof globalThis.disposeRuntimeModules === 'function') {
      globalThis.disposeRuntimeModules();
    }
    console.log('-------------------- frida dispose --------------------');
  },
};

// 延迟启动：加载引导模块，注册 check_argv hook
function awake() {
  // 先加载引导模块（addresses, config, hook_guard, helpers, modules）
  // 必须在 attachOnce 前执行，否则 attachOnce 不可用
  loadRuntimeBootstrapModules();

  var addr = globalThis.PROJECT_ADDRESSES;
  if (!addr || !addr.check_argv) {
    // 地址不可用，直接启动
    entryLog('check_argv 地址不可用，直接启动');
    start();
    return;
  }

  if (typeof globalThis.attachOnce !== 'function') {
    // attachOnce 未加载，无法注册延迟启动 hook
    entryLog('attachOnce 不存在，无法注册 check_argv 延迟启动 hook，直接启动');
    start();
    return;
  }

  // 使用 attachOnce 防重复注册
  // attachOnce 返回 false 表示注册失败（地址异常、函数不可 hook 等），
  // 此时必须兜底直接启动，否则整个 runtime 静默不启动
  var attached = globalThis.attachOnce('runtime_check_argv', addr.check_argv, {
    onEnter: function (args) {},
    onLeave: function (retval) {
      // check_argv 执行完毕=服务器初始化完成，开始加载
      start();
    }
  });

  if (!attached) {
    entryLog('check_argv hook 注册失败，直接启动');
    start();
  }
}

// 启动函数
function start() {
  if (g_entry_started) {
    entryLog('runtime already started, skip');
    return;
  }

  entryLog('frida init');

  // 加载引导模块（热重载路径可能还没加载）
  loadRuntimeBootstrapModules();

  // startRuntimeModules 在 startup_modules.js 中定义，
  // 通过 dp_load 加载后挂载到 globalThis
  if (typeof globalThis.startRuntimeModules !== 'function') {
    entryLog('startRuntimeModules 不存在，请确认 df_game_r.js 已通过 dp_load 成功加载 startup_modules');
    return;
  }

  try {
    var started = globalThis.startRuntimeModules();
    if (started === false) {
      entryLog('runtime start failed，等待下次重试');
      return;
    }

    g_entry_started = true;
    entryLog('frida started');
  } catch (e) {
    entryLog('runtime start exception: ' + e);
  }
}
