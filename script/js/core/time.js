// 时间模块
// 来源：从旧 frida.js 迁移
// 用途：提供系统时间、时间戳等相关工具函数

function createTimeModule(addr) {
  // 系统时间全局变量地址
  // 来源：从旧 frida.js 迁移，原代码: GlobalData_s_systemTime_
  // 用途：读取游戏服务器的系统 UTC 时间（秒）
  // 风险：地址依赖特定游戏版本，升级后需确认是否仍然有效
  var systemTimePtr = addr.system_time || ptr('0x941F714');

  // 获取系统UTC时间(秒)
  function getCurSec() {
    return systemTimePtr.readInt();
  }

  return { getCurSec: getCurSec };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createTimeModule = createTimeModule;
}
