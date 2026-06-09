// clean runtime project JS entry
// 该文件只负责 Frida 生命周期和启动调度，不写具体业务逻辑。
//
// 职责：
// - early 阶段：等待服务器初始化完成后延迟启动
// - 非 early 阶段（热重载）：直接启动
// - dispose 阶段：调用统一清理函数
//
// 真实业务逻辑全部在 script/js/ 目录下的模块中。
// 不要在此文件中出现真实地址、NativeFunction、业务函数。
//
// 所有 hook（包括本文件的 early hook）都通过 attachOnce 注册，
// 防止热重载时重复 attach。
//
// 推荐部署产物：dist/df_game_r.bundle.js
// 如果单独部署 df_game_r.js，script/js/ 下的模块不会被自动加载。

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

// 延迟启动：等待 check_argv 执行完后启动
function awake() {
  const addr = globalThis.PROJECT_ADDRESSES;
  if (!addr || !addr.check_argv) {
    // 地址不可用，直接启动
    console.log('[entry] check_argv 地址不可用，直接启动');
    start();
    return;
  }

  if (typeof globalThis.attachOnce !== 'function') {
    // attachOnce 未加载，无法注册延迟启动 hook
    console.log('[entry] attachOnce 不存在，无法注册 check_argv 延迟启动 hook，直接启动');
    start();
    return;
  }

  // 使用 attachOnce 防重复注册
  // attachOnce 返回 false 表示注册失败（地址异常、函数不可 hook 等），
  // 此时必须兜底直接启动，否则整个 runtime 静默不启动
  const attached = globalThis.attachOnce('runtime_check_argv', addr.check_argv, {
    onEnter: function (args) {
    },
    onLeave: function () {
      // check_argv 执行完毕=服务器初始化完成，开始加载
      start();
    }
  });

  if (!attached) {
    console.log('[entry] check_argv hook 注册失败，直接启动');
    start();
  }
}

// 启动函数
function start() {
  console.log('++++++++++++++++++++ frida init ++++++++++++++++++++');

  // startRuntimeModules 只在 bundle 中存在
  // 如果单独部署了 df_game_r.js，此函数不存在，必须明确提示
  if (typeof globalThis.startRuntimeModules !== 'function') {
    console.log('[entry] startRuntimeModules 不存在，请确认部署的是 dist/df_game_r.bundle.js，而不是单独的 df_game_r.js');
    return;
  }

  globalThis.startRuntimeModules();

  console.log('++++++++++++++++++++ frida started ++++++++++++++++++++');
}
