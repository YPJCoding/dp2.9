// 幸运在线玩家兼容模块（来源：df_game_r.js 入口残留调用）
//
// 说明：
// - df_game_r.js 当前入口会在 enable_lucky_online=true 时调用 start_event_lucky_online_user()。
// - 当前 dp2.9 仓库和 dp2 旧仓库均未找到该函数的明确实现。
// - 该功能涉及随机在线玩家、发点券/道具/邮件等经济逻辑，不能凭空实现。
// - 本模块只提供兼容入口，避免配置误开后 ReferenceError。
// - 找到真实旧实现后，再补完整迁移。

var g_lucky_online_started = false;

function luckyOnlineLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [lucky_online] ' + message);
  } catch (e) {
    console.log('[lucky_online] ' + message);
  }
}

function startLuckyOnlineUserEvent() {
  if (g_lucky_online_started) {
    luckyOnlineLog('already started, skip duplicate startup');
    return;
  }

  g_lucky_online_started = true;
  luckyOnlineLog('compat stub started: real start_event_lucky_online_user implementation not found');
}

// 兼容旧入口命名。
function start_event_lucky_online_user() {
  return startLuckyOnlineUserEvent();
}
