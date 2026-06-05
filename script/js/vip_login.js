// VIP 等级登录公告（来源：dp2/df_game_r.js）

function getQuestIds1() { return [8892]; }
function getQuestIds2() { return [8893]; }
function getQuestIds3() { return [8894]; }
function getQuestIds4() { return [8895]; }
function getQuestIds5() { return [8896]; }

function Inspection_tasks(user, quest_ids) {
    var WongWork_CQuestClear = CUser_getCurCharacQuestW(user).add(4);
    var completedQuests = [];
    for (var i = 0; i < quest_ids.length; i++) {
        if (WongWork_CQuestClear_isClearedQuest(WongWork_CQuestClear, quest_ids[i])) {
            completedQuests.push(quest_ids[i]);
        }
    }
    return completedQuests;
}

function vip_Login() {
    Interceptor.attach(ptr(0x86C4E50), {
        onEnter: function (args) { this.user = args[1]; },
        onLeave: function (retval) {
            var user = this.user;
            var c1 = Inspection_tasks(user, getQuestIds1()).length;
            var c2 = Inspection_tasks(user, getQuestIds2()).length;
            var c3 = Inspection_tasks(user, getQuestIds3()).length;
            var c4 = Inspection_tasks(user, getQuestIds4()).length;
            var c5 = Inspection_tasks(user, getQuestIds5()).length;
            if (c5 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip5玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }
            else if (c4 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip4玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }
            else if (c3 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip3玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }
            else if (c2 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip2玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }
            else if (c1 > 0) { api_gameWorld_SendNotiPacketMessage('尊贵的心悦Vip1玩家[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']上线了！！！', 14); }
        }
    });
}
