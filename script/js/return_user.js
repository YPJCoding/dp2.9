// 回归勇士时间设置（来源：dp2/frida.js）
//
// 由 df_game_r.js 通过 dp_load('return_user') 加载。
// 旧脚本默认 set_return_user(15)，即离线 15 天算回归。

var g_return_user_applied_days = null;

function returnUserLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [return_user] ' + message);
  } catch (e) {
    console.log('[return_user] ' + message);
  }
}

function setReturnUser(day) {
  const days = parseInt(day);
  if (!days || days <= 0) {
    returnUserLog('invalid day=' + day);
    return false;
  }

  if (g_return_user_applied_days === days) {
    returnUserLog('already applied day=' + days);
    return true;
  }

  const time = days * 86400;
  Memory.protect(ptr(0x84C753D), 32, 'rwx');
  ptr(0x84C753D).writeU32(time);
  g_return_user_applied_days = days;
  returnUserLog('applied day=' + days + ' seconds=' + time);
  return true;
}

// 兼容旧入口命名。
function set_return_user(day) {
  return setReturnUser(day);
}
