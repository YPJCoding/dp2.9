// 勇士归来（回归用户）模块
// 来源：从旧 frida.js set_return_user(day) 迁移
// 用途：修改游戏内存中的回归用户判定时间阈值
//
// 为什么需要：
// 原游戏判定勇士归来需要距离上次登录超过一定天数（如 28 天）。
// 通过修改内存中的判定阈值，可以自定义回归时长。
//
// 风险：
// 1. 直接修改代码段内存，版本更新后地址可能变化
// 2. 设置过小的天数可能导致所有玩家都算回归，破坏游戏平衡

var g_return_user_started = false;

function startReturnUserFeature(ctx) {
  if (g_return_user_started) {
    console.log('[return_user] already started');
    return;
  }

  var addr = ctx.addresses;
  var cfg = ctx.config.return_user;

  try {
    // 计算回归判定时间阈值（秒）
    // day * 86400 秒/天
    var day = cfg.day || 15;
    var time = day * 86400;

    // 修改内存：将回归判定时间写入代码段
    // 来源：从旧 frida.js set_return_user 迁移
    // 为什么直接写内存：原代码中的判定时间是硬编码的常数，
    //   修改它不需要 hook，直接改值即可
    // 为什么用 protect：代码段默认不可写，需要修改保护属性
    // 风险：地址偏移可能随版本变化，写入错误可能导致崩溃
    Memory.protect(addr.return_user_time_patch, 32, 'rwx');
    addr.return_user_time_patch.writeU32(time);

    g_return_user_started = true;
    if (ctx.log) ctx.log('[return_user] day=' + day + ' (threshold=' + time + 's)');
  } catch (err) {
    if (ctx.log) ctx.log('[return_user] failed: ' + err);
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.startReturnUserFeature = startReturnUserFeature;
}
