// 战力排行榜系统（来源：dp2/frida.js）

var ranklist = {
  "1": { "rank": 100, "characname": "虚位以待", "job": 0, "lev": 85, "Grow": 17, "Guilkey": 1, "Guilname": "", "str": "111！", "equip": [101531433, 101551558, 101501731, 101571413, 101561697, 101521488, 101511859, 101541622, 0, -1, 101040146] },
  "2": { "rank": 90, "characname": "虚位以待", "job": 1, "lev": 85, "Grow": 17, "Guilkey": 1, "Guilname": "", "str": "222！", "equip": [45486, 43101, 44757, 43879, 43541, 44283, 45155, 45935, 0, -1, 102040100] },
  "3": { "rank": 80, "characname": "虚位以待", "job": 4, "lev": 85, "Grow": 17, "Guilkey": 1, "Guilname": "", "str": "333！", "equip": [57519, 55153, 56754, 55922, 55533, 56332, 57147, 57946, 0, -1, 108030043] },
};

function GetRankNumber(characNo) {
  var query = "SELECT ZLZ FROM frida.battle WHERE CID='" + characNo + "';";
  if (api_MySQL_exec(mysql_taiwan_cain, query)) {
    if (MySQL_get_n_rows(mysql_taiwan_cain) == 1) {
      MySQL_fetch(mysql_taiwan_cain);
      return parseInt(api_MySQL_get_str(mysql_taiwan_cain, 0));
    }
  }
}

function GetMyEquInfo(user) {
  var info = { "rank": 0, "characname": "", "job": 0, "lev": 0, "Grow": 0, "Guilkey": 0, "Guilname": "", "str": "", "equip": [] };
  var characNo = CUserCharacInfo_getCurCharacNo(user);
  info.rank = GetRankNumber(characNo);
  info.characname = api_CUserCharacInfo_getCurCharacName(user) + "";
  info.job = CUserCharacInfo_get_charac_job(user);
  info.lev = CUserCharacInfo_get_charac_level(user);
  info.Grow = CUserCharacInfo_getCurCharacGrowType(user);
  info.Guilkey = CUserCharacInfo_get_charac_guildkey(user);
  info.Guilname = api_CUser_GetGuildName(user);
  if (!info.Guilname) { info.Guilname = '未加入公会'; }
  var invenW = CUserCharacInfo_getCurCharacInvenW(user);
  for (var i = 0; i <= 10; i++) {
    if (i != 9) {
      var invenItem = CInventory_GetInvenRef(invenW, INVENTORY_TYPE_BODY, i);
      info.equip.push(Inven_Item_getKey(invenItem));
    } else {
      info.equip.push(-1);
    }
  }
  return info;
}

function SetRanking(user) {
  var info = GetMyEquInfo(user);
  var existingIndex = Object.values(ranklist).findIndex(function(item) { return item.characname === info.characname; });
  if (info.rank) {
    if (existingIndex !== -1) { ranklist[existingIndex + 1] = info; }
    else { ranklist["4"] = info; }
    var rankArray = Object.values(ranklist);
    rankArray.sort(function(a, b) { return b.rank - a.rank; });
    var topThree = rankArray.slice(0, 3);
    var tmp = {};
    topThree.forEach(function(item, index) { tmp[(index + 1).toString()] = item; });
    delete ranklist["4"];
    ranklist = tmp;
  }
}

function SendRankLits(user, all) {
  var packet = api_PacketGuard_PacketGuard();
  InterfacePacketBuf_put_header(packet, 0, 182);
  InterfacePacketBuf_put_byte(packet, Object.keys(ranklist).length);
  for (var key in ranklist) {
    if (ranklist.hasOwnProperty(key)) {
      api_InterfacePacketBuf_put_string(packet, ranklist[key].characname);
      InterfacePacketBuf_put_byte(packet, ranklist[key].lev);
      InterfacePacketBuf_put_byte(packet, ranklist[key].job);
      InterfacePacketBuf_put_byte(packet, ranklist[key].Grow);
      api_InterfacePacketBuf_put_string(packet, ranklist[key].Guilname);
      InterfacePacketBuf_put_int(packet, ranklist[key].Guilkey);
      for (var i = 0; i < ranklist[key].equip.length; i++) {
        InterfacePacketBuf_put_int(packet, ranklist[key].equip[i]);
      }
    }
  }
  InterfacePacketBuf_finalize(packet, 1);
  if (all) { GameWorld_send_all(G_GameWorld(), packet); }
  else { CUser_Send(user, packet); }
  Destroy_PacketGuard_PacketGuard(packet);
}

function event_rankinfo_load_from_db() {
  if (api_MySQL_exec(mysql_frida, "select event_info from game_event where event_id = 'rankinfo';")) {
    if (MySQL_get_n_rows(mysql_frida) == 1) {
      MySQL_fetch(mysql_frida);
      var info = api_MySQL_get_str(mysql_frida, 0);
      ranklist = JSON.parse(info);
    }
  }
}

function event_rankinfo_save_to_db() {
  try {
    api_MySQL_exec(mysql_frida, "replace into game_event (event_id, event_info) values ('rankinfo', '" + JSON.stringify(ranklist) + "');");
  } catch (error) {}
}

function start_ranking() {
  event_rankinfo_load_from_db();
}
