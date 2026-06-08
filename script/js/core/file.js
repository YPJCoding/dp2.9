// 文件操作模块
// 来源：从旧 frida.js 迁移
// 用途：封装 Linux 文件读写操作
// 风险：依赖 libc 原生函数，运行环境变化可能导致失效

function createFileModule() {
  // 读取文件
  function readFile(path, mode, len) {
    if (typeof globalThis.fopen === 'undefined' ||
        typeof globalThis.fread === 'undefined' ||
        typeof globalThis.fclose === 'undefined') {
      console.log('[file] fopen/fread/fclose not initialized');
      return null;
    }

    var pathPtr = Memory.allocUtf8String(path);
    var modePtr = Memory.allocUtf8String(mode);
    var f = globalThis.fopen(pathPtr, modePtr);
    if (f == 0) {
      return null;
    }

    var data = Memory.alloc(len);
    var freadRet = globalThis.fread(data, 1, len, f);
    globalThis.fclose(f);

    if (mode == 'r') {
      return data.readUtf8String(freadRet);
    }
    return data;
  }

  // 加载本地 JSON 配置文件
  function loadConfig(path) {
    var data = readFile(path, 'r', 10 * 1024 * 1024);
    if (!data) {
      console.log('[file] failed to load config: ' + path);
      return {};
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      console.log('[file] failed to parse config: ' + e);
      return {};
    }
  }

  return { readFile: readFile, loadConfig: loadConfig };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createFileModule = createFileModule;
}
