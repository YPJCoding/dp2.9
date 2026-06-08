// 上下线处理兼容模块（来源：dp2.9/df_game_r.js 入口残留调用）
//
// 说明：
// - df_game_r.js 当前入口仍会在 enable_user_inout_hook=true 时调用 hook_user_inout_game_world()。
// - 但当前 dp2.9 仓库和 dp2 旧仓库都未找到该函数的明确实现。
// - 为避免入口切换过程中出现 ReferenceError，这里先提供保守兼容入口。
// - 不在这里凭空实现排行榜刷新、怪物攻城 UI、幸运点等业务逻辑。
// - 后续找到真实旧实现后，再补全实际逻辑。

var g_user_inout_started = false;

function userInoutLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [user_inout] ' + message);
  } catch (e) {
    console.log('[user_inout] ' + message);
  }
}

function startUserInoutHook() {
  if (g_user_inout_started) {
    userInoutLog('already started, skip duplicate startup');
    return;
  }

  g_user_inout_started = true;
  userInoutLog('compat stub started: real hook_user_inout_game_world implementation not found');
}

// 兼容旧入口命名。
function hook_user_inout_game_world() {
  return startUserInoutHook();
}
