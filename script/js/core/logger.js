// 日志模块
// 来源：从旧 frida.js 迁移并重构
// 用途：统一日志输出（控制台 + 文件）
// 风险：文件日志依赖 libc fopen/fread 等底层函数，如果运行环境变化可能失效

var g_log_file = null;
var g_log_day = null;
var g_log_dir_path = './frida_log/';

// ---- 本地时间 fallback（ctx.time 不可用时使用） ----
function _fallbackDateParts(date) {
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
}

function _fallbackTimestamp(date) {
  var p = _fallbackDateParts(date || new Date());
  return p.year + '-' + p.month + '-' + p.day + ' ' +
    p.hour + ':' + p.minute + ':' + p.second + '.' + p.ms;
}

// 日志对象，挂载到 globalThis 供所有模块使用
function createLogger(ctx) {
  // 打开目录
  var opendir = new NativeFunction(Module.getGlobalExportByName('opendir'), 'int', ['pointer'], {'abi': 'sysv'});
  var mkdir = new NativeFunction(Module.getGlobalExportByName('mkdir'), 'int', ['pointer', 'int'], {'abi': 'sysv'});

  function ensureDir(path) {
    var pathPtr = Memory.allocUtf8String(path);
    if (opendir(pathPtr)) {
      return true;
    }
    return mkdir(pathPtr, 0x1FF);
  }

  // 获取时间戳字符串（优先使用 ctx.time 的时间格式化）
  function getTimestamp() {
    if (ctx && ctx.time && ctx.time.formatLocalTimestamp) {
      return ctx.time.formatLocalTimestamp();
    }
    return _fallbackTimestamp();
  }

  // 获取日期拆解（优先使用 ctx.time）
  function getDateParts(date) {
    if (ctx && ctx.time && ctx.time.getDateParts) {
      return ctx.time.getDateParts(date);
    }
    return _fallbackDateParts(date);
  }

  // 获取频道名
  function getChannelName() {
    if (ctx && ctx.getChannelName) {
      return ctx.getChannelName();
    }
    return 'unknown';
  }

  // 日志主函数
  // 注意：日志模块依赖 globalThis.fopen 和 globalThis.fread 等全局 NativeFunction，
  // 这些需要在启动前由 bindings 初始化好。
  function log(msg) {
    var date = new Date();
    var dateParts = getDateParts(date);

    var year = dateParts.year;
    var month = dateParts.month;
    var day = dateParts.day;

    // 按日期轮转日志文件
    if ((g_log_file === null) || (g_log_day != day)) {
      ensureDir(g_log_dir_path);
      if (typeof globalThis.fopen !== 'undefined') {
        g_log_file = new File(g_log_dir_path + 'frida_' + getChannelName() + '_' + year + '_' + month + '_' + day + '.log', 'a+');
      }
      g_log_day = day;
    }

    var timestamp;
    if (ctx && ctx.time && ctx.time.formatLocalTimestamp) {
      timestamp = ctx.time.formatLocalTimestamp(date);
    } else {
      timestamp = _fallbackTimestamp(date);
    }

    // 控制台日志
    console.log('[' + timestamp + '] ' + msg + '\n');

    // 文件日志
    if (g_log_file !== null) {
      try {
        g_log_file.write('[' + timestamp + '] ' + msg + '\n');
        g_log_file.flush();
      } catch (e) {
        // 日志写入失败不应影响主流程
      }
    }
  }

  return { log: log, getTimestamp: getTimestamp };
}

RuntimeUtils.exposeGlobal('createLogger', createLogger);
