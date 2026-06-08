// 日志模块
// 来源：从旧 frida.js 迁移
// 用途：统一日志输出（控制台 + 文件）
// 风险：文件日志依赖 libc fopen/fread 等底层函数，如果运行环境变化可能失效

var g_log_file = null;
var g_log_day = null;
var g_log_dir_path = './frida_log/';

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

  // 获取时间戳字符串
  function getTimestamp() {
    var date = new Date();
    date = new Date(date.setHours(date.getHours() + 0));
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 1).toString();
    var day = date.getDate().toString();
    var hour = date.getHours().toString();
    var minute = date.getMinutes().toString();
    var second = date.getSeconds().toString();
    var ms = date.getMilliseconds().toString();
    return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + ms;
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
    date = new Date(date.setHours(date.getHours() + 0));
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 1).toString();
    var day = date.getDate().toString();
    var hour = date.getHours().toString();
    var minute = date.getMinutes().toString();
    var second = date.getSeconds().toString();
    var ms = date.getMilliseconds().toString();

    // 按日期轮转日志文件
    if ((g_log_file === null) || (g_log_day != day)) {
      ensureDir(g_log_dir_path);
      // 依赖 globalThis 上注册的 fopen 等函数
      if (typeof globalThis.fopen !== 'undefined') {
        g_log_file = new File(g_log_dir_path + 'frida_' + getChannelName() + '_' + year + '_' + month + '_' + day + '.log', 'a+');
      }
      g_log_day = day;
    }

    var timestamp = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second + '.' + ms;

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

if (typeof globalThis !== 'undefined') {
  globalThis.createLogger = createLogger;
}
