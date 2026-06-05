// VIP 等级登录公告（来源：dp2/df_game_r.js）

function getQuestIdsVip1() { return [8892]; }
function getQuestIdsVip2() { return [8893]; }
function getQuestIdsVip3() { return [8894]; }
function getQuestIdsVip4() { return [8895]; }
function getQuestIdsVip5() { return [8896]; }

function inspectVipTasks(user, questIds) {
  var questClear = CUser_getCurCharacQuestW(user).add(4);
  var completed = [];
  for (var i = 0; i < questIds.length; i++) {
    if (WongWork_CQuestClear_isClearedQuest(questClear, questIds[i])) {
      completed.push(questIds[i]);
    }
  }
  return completed;
}

function startVipLogin() {
  Interceptor.attach(ptr(0x86C4E50), {
    onEnter: function (args) { this.user = args[1]; },
    onLeave: function (retval) {
      var user = this.user;
      var c1 = inspectVipTasks(user, getQuestIdsVip1()).length;
      var c2 = inspectVipTasks(user, getQuestIdsVip2()).length;
      var c3 = inspectVipTasks(user, getQuestIdsVip3()).length;
      var c4 = inspectVipTasks(user, getQuestIdsVip4()).length;
      var c5 = inspectVipTasks(user, getQuestIdsVip5()).length;
      if (c5 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip5玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }
      else if (c4 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip4玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }
      else if (c3 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip3玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }
      else if (c2 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip2玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }
      else if (c1 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip1玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }
    }
  });
}
