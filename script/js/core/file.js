// 文件操作模块
// 来源：从旧 frida.js 迁移并重构
// 用途：封装 Linux 文件读写操作
// 风险：依赖 libc 原生函数（fopen/fread/fclose），运行环境变化可能导致失效
//
// 为什么需要自初始化 libc 函数：
// 不依赖外部 globalThis.fopen/fread/fclose，避免启动顺序问题

function createFileModule() {
  // ---- 自初始化 libc 文件 API ----
  // 为什么放在内部：避免依赖外部 globalThis 上的传入值
  // fopen 返回 pointer 而非 int（避免 32 位截断问题）
  var _fopen = null;
  var _fread = null;
  var _fclose = null;

  function initLibc() {
    if (_fopen !== null) {
      return true;
    }
    try {
      _fopen = new NativeFunction(Module.getGlobalExportByName('fopen'), 'pointer', ['pointer', 'pointer'], { abi: 'sysv' });
      _fread = new NativeFunction(Module.getGlobalExportByName('fread'), 'int', ['pointer', 'int', 'int', 'pointer'], { abi: 'sysv' });
      _fclose = new NativeFunction(Module.getGlobalExportByName('fclose'), 'int', ['pointer'], { abi: 'sysv' });
      return true;
    } catch (e) {
      console.log('[file] 初始化 libc 文件 API 失败: ' + e);
      return false;
    }
  }

  // 读取文件
  // path: 文件路径
  // mode: 'r'=读, 'rb'=二进制读
  // len: 读取缓冲区大小
  function readFile(path, mode, len) {
    if (!initLibc()) {
      console.log('[file] libc 文件 API 未初始化，无法读取文件: ' + path);
      return null;
    }

    var pathPtr = Memory.allocUtf8String(path);
    var modePtr = Memory.allocUtf8String(mode);
    var f = _fopen(pathPtr, modePtr);

    // 使用 .isNull() 判断 fopen 失败（pointer 类型）
    if (f.isNull()) {
      console.log('[file] fopen 失败: ' + path);
      return null;
    }

    var data = Memory.alloc(len);
    var freadRet = _fread(data, 1, len, f);
    _fclose(f);

    if (mode == 'r') {
      return data.readUtf8String(freadRet);
    }
    return data;
  }

  // 加载本地 JSON 配置文件
  function loadConfig(path) {
    var data = readFile(path, 'r', 10 * 1024 * 1024);
    if (!data) {
      console.log('[file] 配置文件读取失败: ' + path);
      return null;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.log('[file] JSON 解析失败: ' + path + ' - ' + e);
      return null;
    }
  }

  return { readFile: readFile, loadConfig: loadConfig };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createFileModule = createFileModule;
}
