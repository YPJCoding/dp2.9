// Frida Runtime 公共工具模块
// 来源：新增，用于封装各模块中重复出现的公共模式
// 用途：提供统一工具函数，减少重复代码
//
// 设计原则：
// - 只封装公共流程，不改变业务行为
// - 高风险操作保留显式函数名和中文注释
// - 不引入 ES6 class/import/export/箭头函数
// - 挂载到 globalThis.RuntimeUtils

var RuntimeUtils = {};

// ---- 1. 全局暴露 ----

// 替代重复的 `if (typeof globalThis !== 'undefined') { globalThis.xxx = xxx; }`
// name: 挂载到 globalThis 上的属性名
// value: 要挂载的值
RuntimeUtils.exposeGlobal = function (name, value) {
  if (typeof globalThis !== 'undefined') {
    globalThis[name] = value;
    return true;
  }
  return false;
};

// ---- 2. 安全日志 ----

// 替代重复的 `if (ctx.log) ctx.log(msg)`
// ctx: 运行时上下文（必须有 log 属性）
// msg: 日志消息
RuntimeUtils.safeLog = function (ctx, msg) {
  if (ctx && ctx.log) {
    ctx.log(msg);
  } else {
    console.log(msg);
  }
};

// ---- 3. 安全调用（统一 try/catch） ----

// 替代各模块中重复的 try/catch/log 模式
// name: 操作名称（用于日志）
// runner: 执行函数
// fallbackValue: runner 异常时的回退值
// logger: 可选，日志函数 (name, err) -> void
RuntimeUtils.safeCall = function (name, runner, fallbackValue, logger) {
  try {
    return runner();
  } catch (err) {
    if (logger) {
      logger(name, err);
    } else {
      console.log('[safeCall] ' + name + ' failed: ' + err);
    }
    return fallbackValue;
  }
};

// ---- 4. Feature 防重复启动 ----

// 封装各 feature 的重复启动保护模板
// ctx: 运行时上下文
// state: { started: boolean } 状态对象，注意会修改 state.started
// featureName: 功能名称（用于日志）
// runner: 启动逻辑函数
// 返回: true=启动成功或已启动, false=启动异常
RuntimeUtils.startOnce = function (ctx, state, featureName, runner) {
  if (state.started) {
    console.log('[' + featureName + '] already started');
    return true;
  }

  try {
    var ret = runner();
    state.started = true;
    RuntimeUtils.safeLog(ctx, '[' + featureName + '] started');
    return true;
  } catch (err) {
    RuntimeUtils.safeLog(ctx, '[' + featureName + '] failed: ' + err);
    return false;
  }
};

// ---- 5. 启动步骤封装 ----

// 封装 startup_modules 里重复的 helpers.logModuleStart/try/helpers.logModuleDone 模式
// helpers: createStartupHelpers 返回的对象
// name: 步骤名称
// runner: 执行逻辑
// fallbackValue: 异常时的回退值
RuntimeUtils.runStep = function (helpers, name, runner, fallbackValue) {
  helpers.logModuleStart(name);
  try {
    var result = runner();
    helpers.logModuleDone(name);
    return result;
  } catch (err) {
    helpers.logModuleFailed(name, err);
    return fallbackValue;
  }
};

// ---- 6. Feature 步骤封装 ----

// 用于 startup_modules.js 中按配置启动 feature
// helpers: createStartupHelpers 返回的对象
// name: feature 名称
// enabled: 是否启用
// runner: 启动逻辑
RuntimeUtils.runFeatureStep = function (helpers, name, enabled, runner) {
  if (!enabled) {
    return false;
  }

  helpers.logModuleStart(name);
  try {
    var result = runner();

    if (result === false) {
      helpers.logModuleFailed(name, 'returned false');
      return false;
    }

    helpers.logModuleDone(name);
    return true;
  } catch (err) {
    helpers.logModuleFailed(name, err);
    return false;
  }
};

// ---- 7. Out 参数读取 ----

// 封装 NativeFunction 的 out 参数读取模式
// size: out 参数的内存大小（字节）
// nativeCall: function(p) -> boolean, p 是分配的 out 缓冲区
// reader: function(p) -> value, 从 p 读取返回值
// failMessage: 可选，失败时的日志
RuntimeUtils.readNativeOut = function (size, nativeCall, reader, failMessage) {
  var p = Memory.alloc(size);
  if (nativeCall(p)) {
    return reader(p);
  }
  if (failMessage) {
    console.log(failMessage);
  }
  return null;
};

// 同 readNativeOut，但失败时抛异常（用于 packet 读取）
RuntimeUtils.readNativeOutOrThrow = function (size, nativeCall, reader, failMessage) {
  var result = RuntimeUtils.readNativeOut(size, nativeCall, reader, null);
  if (result === null) {
    throw new Error(failMessage);
  }
  return result;
};

// ---- 8. DB 查询工具 ----

// 查询一行字符串
// db: ctx.fridaDb 或类似的 { exec, getNRows, fetch, getStr } 对象
// sql: SQL 语句
// index: 字段索引（默认 0）
RuntimeUtils.queryOneStr = function (db, sql, index) {
  if (!db) {
    return null;
  }

  var fieldIndex = index || 0;
  if (db.exec(sql)) {
    if (db.getNRows() == 1) {
      db.fetch();
      return db.getStr(fieldIndex);
    }
  }
  return null;
};

// 查询一行整数（在 queryOneStr 基础上 parseInt）
RuntimeUtils.queryOneInt = function (db, sql, index) {
  var value = RuntimeUtils.queryOneStr(db, sql, index);
  if (value === null || typeof value === 'undefined') {
    return null;
  }
  return parseInt(value);
};

// ---- 9. NativeFunction 批量声明 ----

// 封装批量 NativeFunction 声明，减少重复
// addr: PROJECT_ADDRESSES 对象
// specs: { name: { addr: 'key_in_addr', ret: 'int', args: ['pointer'] } }
// 返回: { name: NativeFunction }
//
// 注意：只用于低风险包装，高风险操作（如 deleteItem、recharge）仍保留显式声明
RuntimeUtils.createNativeMap = function (addr, specs) {
  var out = {};
  for (var name in specs) {
    if (specs.hasOwnProperty(name)) {
      var spec = specs[name];
      out[name] = nf(addr[spec.addr], spec.ret, spec.args);
    }
  }
  return out;
};

// ---- 10. 函数存在性验证 ----

// 启动前验证函数存在
RuntimeUtils.ensureFn = function (name, fn) {
  if (typeof fn !== 'function') {
    console.log('[runtime_utils] missing function: ' + name);
    return false;
  }
  return true;
};

// ---- 11. Hook 辅助封装 ----

// 封装 attachOnce 调用，增加 feature 级别的失败日志
// ctx: 运行时上下文
// featureName: 功能名称
// key: hook 唯一标识
// address: hook 目标地址
// callbacks: { onEnter, onLeave }
RuntimeUtils.attachFeatureHook = function (ctx, featureName, key, address, callbacks) {
  var ok = attachOnce(key, address, callbacks);
  if (!ok) {
    RuntimeUtils.safeLog(ctx, '[' + featureName + '] hook 注册失败: ' + key);
  }
  return ok;
};

// 封装 replaceOnce 调用
RuntimeUtils.replaceFeatureHook = function (ctx, featureName, key, address, callback, retType, argTypes) {
  var ok = replaceOnce(key, address, callback, retType, argTypes);
  if (!ok) {
    RuntimeUtils.safeLog(ctx, '[' + featureName + '] hook replace 失败: ' + key);
  }
  return ok;
};

// ---- 12. 纯 JS 时间工具（不依赖 ctx / PROJECT_ADDRESSES） ----

// 日期拆分为 year/month/day/hour/minute/second/ms（不补零，保持旧格式）
RuntimeUtils.getDateParts = function (date) {
  var d = date || new Date();
  return {
    year: d.getFullYear().toString(),
    month: (d.getMonth() + 1).toString(),
    day: d.getDate().toString(),
    hour: d.getHours().toString(),
    minute: d.getMinutes().toString(),
    second: d.getSeconds().toString(),
    ms: d.getMilliseconds().toString()
  };
};

// 本地时间戳格式化（日志展示用）
RuntimeUtils.formatLocalTimestamp = function (date) {
  var p = RuntimeUtils.getDateParts(date || new Date());
  return p.year + '-' + p.month + '-' + p.day + ' ' +
    p.hour + ':' + p.minute + ':' + p.second + '.' + p.ms;
};

// ---- 挂载到 globalThis ----

if (typeof globalThis !== 'undefined') {
  globalThis.RuntimeUtils = RuntimeUtils;
}
