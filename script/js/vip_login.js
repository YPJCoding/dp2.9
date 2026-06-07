// VIP 等级登录公告（来源：dp2/df_game_r.js）
//
// 说明：
// - 由 df_game_r.js 通过 dp_load('vip_login') 加载。
// - df_game_r.js 旧入口中还可能调用 vip_Login()，这里保留兼容别名并避免重复 hook。
// - 旧内联实现曾使用 api_gameWorld_SendNotiPacketMessage 小写函数名；这里补兼容别名，降低旧代码残留的运行风险。

if (typeof api_gameWorld_SendNotiPacketMessage === 'undefined' && typeof api_GameWorld_SendNotiPacketMessage === 'function') {
  var api_gameWorld_SendNotiPacketMessage = api_GameWorld_SendNotiPacketMessage;
}

var g_vip_login_started = false;

function getQuestIdsVip1() { return [8892]; }
function getQuestIdsVip2() { return [8893]; }
function getQuestIdsVip3() { return [8894]; }
function getQuestIdsVip4() { return [8895]; }
function getQuestIdsVip5() { return [8896]; }

function vipLoginLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [vip_login] ' + message);
  } catch (e) {
    console.log('[vip_login] ' + message);
  }
}

function inspectVipTasks(user, questIds) {
  const questClear = CUser_getCurCharacQuestW(user).add(4);
  const completed = [];
  for (var i = 0; i < questIds.length; i++) {
    if (WongWork_CQuestClear_isClearedQuest(questClear, questIds[i])) {
      completed.push(questIds[i]);
    }
  }
  return completed;
}

function sendVipLoginBroadcast(user) {
  const name = api_CUserCharacInfo_getCurCharacName(user);
  const c1 = inspectVipTasks(user, getQuestIdsVip1()).length;
  const c2 = inspectVipTasks(user, getQuestIdsVip2()).length;
  const c3 = inspectVipTasks(user, getQuestIdsVip3()).length;
  const c4 = inspectVipTasks(user, getQuestIdsVip4()).length;
  const c5 = inspectVipTasks(user, getQuestIdsVip5()).length;

  if (c5 > 0) { api_GameWorld_SendNotiPacketMessage('尊贵的心悦Vip5玩家[' + name + ']上线了！！！', 14); }
  else if (c4 > 0) { api_GameWorld_SendNotiPacketMessage('尊贵的心悦Vip4玩家[' + name + ']上线了！！！', 14); }
  else if (c3 > 0) { api_GameWorld_SendNotiPacketMessage('尊贵的心悦Vip3玩家[' + name + ']上线了！！！', 14); }
  else if (c2 > 0) { api_GameWorld_SendNotiPacketMessage('尊贵的心悦Vip2玩家[' + name + ']上线了！！！', 14); }
  else if (c1 > 0) { api_GameWorld_SendNotiPacketMessage('尊贵的心悦Vip1玩家[' + name + ']上线了！！！', 14); }
}

function startVipLogin() {
  if (g_vip_login_started) {
    vipLoginLog('already started, skip duplicate hook');
    return;
  }

  Interceptor.attach(ptr(0x86C4E50), {
    onEnter: function (args) { this.user = args[1]; },
    onLeave: function (retval) {
      if (!this.user || this.user.isNull()) {
        return;
      }
      try {
        sendVipLoginBroadcast(this.user);
      } catch (e) {
        vipLoginLog('broadcast failed: ' + e.message);
      }
    }
  });

  g_vip_login_started = true;
  vipLoginLog('started');
}

// 兼容旧入口命名。
function vip_Login() {
  return startVipLogin();
}
