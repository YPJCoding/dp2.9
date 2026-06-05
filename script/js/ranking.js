// 战力排行榜系统（来源：dp2/frida.js）

var g_rankList = {
  "1": { "rank": 100, "characname": "虚位以待", "job": 0, "lev": 85, "Grow": 17, "Guilkey": 1, "Guilname": "", "str": "111！", "equip": [101531433, 101551558, 101501731, 101571413, 101561697, 101521488, 101511859, 101541622, 0, -1, 101040146] },
  "2": { "rank": 90, "characname": "虚位以待", "job": 1, "lev": 85, "Grow": 17, "Guilkey": 1, "Guilname": "", "str": "222！", "equip": [45486, 43101, 44757, 43879, 43541, 44283, 45155, 45935, 0, -1, 102040100] },
  "3": { "rank": 80, "characname": "虚位以待", "job": 4, "lev": 85, "Grow": 17, "Guilkey": 1, "Guilname": "", "str": "333！", "equip": [57519, 55153, 56754, 55922, 55533, 56332, 57147, 57946, 0, -1, 108030043] },
};

function getRankScore(characNo) {
  var query = "SELECT ZLZ FROM frida.battle WHERE CID='" + characNo + "';";
  if (api_MySQL_exec(mysql_taiwan_cain, query)) {
    if (MySQL_get_n_rows(mysql_taiwan_cain) == 1) {
      MySQL_fetch(mysql_taiwan_cain);
      return parseInt(api_MySQL_get_str(mysql_taiwan_cain, 0));
    }
  }
}

function buildRankEntry(user) {
  var entry = { "rank": 0, "characname": "", "job": 0, "lev": 0, "Grow": 0, "Guilkey": 0, "Guilname": "", "str": "", "equip": [] };
  var characNo = CUserCharacInfo_getCurCharacNo(user);
  entry.rank = getRankScore(characNo);
  entry.characname = api_CUserCharacInfo_getCurCharacName(user) + "";
  entry.job = CUserCharacInfo_get_charac_job(user);
  entry.lev = CUserCharacInfo_get_charac_level(user);
  entry.Grow = CUserCharacInfo_getCurCharacGrowType(user);
  entry.Guilkey = CUserCharacInfo_get_charac_guildkey(user);
  entry.Guilname = api_CUser_GetGuildName(user);
  if (!entry.Guilname) { entry.Guilname = '未加入公会'; }
  var invenW = CUserCharacInfo_getCurCharacInvenW(user);
  for (var i = 0; i <= 10; i++) {
    if (i != 9) {
      var invenItem = CInventory_GetInvenRef(invenW, INVENTORY_TYPE_BODY, i);
      entry.equip.push(Inven_Item_getKey(invenItem));
    } else {
      entry.equip.push(-1);
    }
  }
  return entry;
}

function updateRanking(user) {
  var entry = buildRankEntry(user);
  var existingIndex = Object.values(g_rankList).findIndex(function(item) { return item.characname === entry.characname; });
  if (entry.rank) {
    if (existingIndex !== -1) { g_rankList[existingIndex + 1] = entry; }
    else { g_rankList["4"] = entry; }
    var rankArray = Object.values(g_rankList);
    rankArray.sort(function(a, b) { return b.rank - a.rank; });
    var topThree = rankArray.slice(0, 3);
    var tmp = {};
    topThree.forEach(function(item, index) { tmp[(index + 1).toString()] = item; });
    delete g_rankList["4"];
    g_rankList = tmp;
  }
}

function sendRankListToUser(user, broadcast) {
  var packet = api_PacketGuard_PacketGuard();
  InterfacePacketBuf_put_header(packet, 0, 182);
  InterfacePacketBuf_put_byte(packet, Object.keys(g_rankList).length);
  for (var key in g_rankList) {
    if (g_rankList.hasOwnProperty(key)) {
      api_InterfacePacketBuf_put_string(packet, g_rankList[key].characname);
      InterfacePacketBuf_put_byte(packet, g_rankList[key].lev);
      InterfacePacketBuf_put_byte(packet, g_rankList[key].job);
      InterfacePacketBuf_put_byte(packet, g_rankList[key].Grow);
      api_InterfacePacketBuf_put_string(packet, g_rankList[key].Guilname);
      InterfacePacketBuf_put_int(packet, g_rankList[key].Guilkey);
      for (var i = 0; i < g_rankList[key].equip.length; i++) {
        InterfacePacketBuf_put_int(packet, g_rankList[key].equip[i]);
      }
    }
  }
  InterfacePacketBuf_finalize(packet, 1);
  if (broadcast) { GameWorld_send_all(G_GameWorld(), packet); }
  else { CUser_Send(user, packet); }
  Destroy_PacketGuard_PacketGuard(packet);
}

function loadRankFromDb() {
  if (api_MySQL_exec(mysql_frida, "select event_info from game_event where event_id = 'rankinfo';")) {
    if (MySQL_get_n_rows(mysql_frida) == 1) {
      MySQL_fetch(mysql_frida);
      var info = api_MySQL_get_str(mysql_frida, 0);
      g_rankList = JSON.parse(info);
    }
  }
}

function saveRankToDb() {
  try {
    api_MySQL_exec(mysql_frida, "replace into game_event (event_id, event_info) values ('rankinfo', '" + JSON.stringify(g_rankList) + "');");
  } catch (error) {}
}

function startRanking() {
  loadRankFromDb();
}
