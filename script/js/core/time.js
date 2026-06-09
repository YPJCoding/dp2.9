// 时间模块
// 来源：从旧 frida.js 迁移并扩展
// 用途：统一时间相关工具函数
//
// 两类时间必须区分：
//   游戏服务器时间：getCurSec() — 业务逻辑使用
//   日志展示时间：formatLocalTimestamp() — 日志展示和文件名使用
// 不要混用。

function createTimeModule(addr) {
  // 系统时间全局变量地址
  // 来源：从旧 frida.js 迁移，原代码: GlobalData_s_systemTime_
  // 用途：读取游戏服务器的系统 UTC 时间（秒）
  // 风险：地址依赖特定游戏版本，升级后需确认是否仍然有效
  // 注意：地址由调用方从 runtime_addresses.js 传入，不使用裸地址回退
  const systemTimePtr = addr.system_time || null;

  if (!systemTimePtr) {
    console.log('[time] system_time 地址未提供，时间模块将返回 0');
  }

  // ---- 游戏服务器时间（秒） ----
  function getCurSec() {
    if (!systemTimePtr) {
      return 0;
    }
    return systemTimePtr.readInt();
  }

  // ---- JS runtime 本地时间（毫秒） ----
  function getNowMs() {
    return new Date().getTime();
  }

  // ---- 日期拆分（统一格式，不补零） ----
  function getDateParts(date) {
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

  // ---- 本地时间戳格式化（日志展示用） ----
  function formatLocalTimestamp(date) {
    var p = getDateParts(date || new Date());
    return p.year + '-' + p.month + '-' + p.day + ' ' +
      p.hour + ':' + p.minute + ':' + p.second + '.' + p.ms;
  }

  // ---- 日志文件日期（文件名轮转用） ----
  function formatLogFileDate(date) {
    var p = getDateParts(date || new Date());
    return {
      year: p.year,
      month: p.month,
      day: p.day
    };
  }

  // ---- 时间差计算（基于游戏服务器时间 getCurSec()） ----
  function diffSeconds(endSec, startSec) {
    return endSec - startSec;
  }

  function diffMinutes(endSec, startSec) {
    return Math.floor((endSec - startSec) / 60);
  }

  // ---- 时间单位换算 ----
  function minutesToSeconds(minutes) {
    return minutes * 60;
  }

  function hoursToMinutes(hours) {
    return hours * 60;
  }

  function daysToSeconds(days) {
    return days * 86400;
  }

  return {
    getCurSec: getCurSec,
    getNowMs: getNowMs,
    getDateParts: getDateParts,
    formatLocalTimestamp: formatLocalTimestamp,
    formatLogFileDate: formatLogFileDate,
    diffSeconds: diffSeconds,
    diffMinutes: diffMinutes,
    minutesToSeconds: minutesToSeconds,
    hoursToMinutes: hoursToMinutes,
    daysToSeconds: daysToSeconds
  };
}

RuntimeUtils.exposeGlobal('createTimeModule', createTimeModule);
