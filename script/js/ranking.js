// 战力排行榜系统（来源：dp2/frida.js）
//
// 说明：
// - 由 df_game_r.js 通过 dp_load('ranking') 加载。
// - startRanking() 可能早于 init_db() 被调用，因此这里会等待 mysql_frida 可用后再加载数据库。
// - 旧实现依赖 frida.battle 表中的 ZLZ 字段，本模块保持该口径。

var g_rankList = {
  "1": { "rank": 100, "characname": "虚位以待", "job": 0, "lev": 85, "Grow": 17, "Guilkey": 1, "Guilname": "", "str": "111！", "equip": [101531433, 101551558, 101501731, 101571413, 101561697, 101521488, 101511859, 101541622, 0, -1, 101040146] },
  "2": { "rank": 90, "characname": "虚位以待", "job": 1, "lev": 85, "Grow": 17, "Guilkey": 1, "Guilname": "", "str": "222！", "equip": [45486, 43101, 44757, 43879, 43541, 44283, 45155, 45935, 0, -1, 102040100] },
  "3": { "rank": 80, "characname": "虚位以待", "job": 4, "lev": 85, "Grow": 17, "Guilkey": 1, "Guilname": "", "str": "333！", "equip": [57519, 55153, 56754, 55922, 55533, 56332, 57147, 57946, 0, -1, 108030043] },
};

var g_ranking_started = false;
var g_ranking_load_scheduled = false;

function safeRankLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [ranking] ' + message);
  } catch (e) {
    console.log('[ranking] ' + message);
  }
}

function isRankingDbReady() {
  return typeof mysql_frida !== 'undefined' && mysql_frida !== null && typeof mysql_taiwan_cain !== 'undefined' && mysql_taiwan_cain !== null;
}

function getRankScore(characNo) {
  if (!isRankingDbReady()) {
    return null;
  }

  const query = "SELECT ZLZ FROM frida.battle WHERE CID='" + characNo + "';";
  if (api_MySQL_exec(mysql_taiwan_cain, query)) {
    if (MySQL_get_n_rows(mysql_taiwan_cain) == 1) {
      MySQL_fetch(mysql_taiwan_cain);
      const value = api_MySQL_get_str(mysql_taiwan_cain, 0);
      if (value !== null && value !== undefined) {
        return parseInt(value);
      }
    }
  }
  return null;
}

function getGuildNameSafe(user) {
  try {
    if (typeof api_CUser_GetGuildName === 'function') {
      const name = api_CUser_GetGuildName(user);
      if (name) {
        return name;
      }
    }
  } catch (e) {
    safeRankLog('get guild name failed: ' + e.message);
  }
  return '未加入公会';
}

function buildRankEntry(user) {
  const entry = { "rank": 0, "characname": "", "job": 0, "lev": 0, "Grow": 0, "Guilkey": 0, "Guilname": "", "str": "", "equip": [] };
  const characNo = CUserCharacInfo_getCurCharacNo(user);
  entry.rank = getRankScore(characNo);
  entry.characname = api_CUserCharacInfo_getCurCharacName(user) + "";
  entry.job = CUserCharacInfo_get_charac_job(user);
  entry.lev = CUserCharacInfo_get_charac_level(user);
  entry.Grow = CUserCharacInfo_getCurCharacGrowType(user);
  entry.Guilkey = CUserCharacInfo_get_charac_guildkey(user);
  entry.Guilname = getGuildNameSafe(user);

  const invenW = CUserCharacInfo_getCurCharacInvenW(user);
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
  const entry = buildRankEntry(user);
  const existingIndex = Object.values(g_rankList).findIndex(function(item) { return item.characname === entry.characname; });
  if (entry.rank) {
    if (existingIndex !== -1) { g_rankList[existingIndex + 1] = entry; }
    else { g_rankList["4"] = entry; }
    const rankArray = Object.values(g_rankList);
    rankArray.sort(function(a, b) { return b.rank - a.rank; });
    const topThree = rankArray.slice(0, 3);
    const tmp = {};
    topThree.forEach(function(item, index) { tmp[(index + 1).toString()] = item; });
    delete g_rankList["4"];
    g_rankList = tmp;
  }
}

function sendRankListToUser(user, broadcast) {
  const packet = api_PacketGuard_PacketGuard();
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
  if (!isRankingDbReady()) {
    safeRankLog('db not ready, skip loadRankFromDb');
    return false;
  }

  if (api_MySQL_exec(mysql_frida, "select event_info from game_event where event_id = 'rankinfo';")) {
    if (MySQL_get_n_rows(mysql_frida) == 1) {
      MySQL_fetch(mysql_frida);
      const info = api_MySQL_get_str(mysql_frida, 0);
      if (info) {
        try {
          g_rankList = JSON.parse(info);
          safeRankLog('loaded rank list from db');
          return true;
        } catch (e) {
          safeRankLog('rank db json parse failed: ' + e.message);
        }
      }
    }
  }
  return false;
}

function saveRankToDb() {
  if (!isRankingDbReady()) {
    return false;
  }

  try {
    api_MySQL_exec(mysql_frida, "replace into game_event (event_id, event_info) values ('rankinfo', '" + JSON.stringify(g_rankList) + "');");
    return true;
  } catch (error) {
    safeRankLog('saveRankToDb failed: ' + error.message);
    return false;
  }
}

function scheduleRankingLoadRetry() {
  if (g_ranking_load_scheduled) {
    return;
  }
  g_ranking_load_scheduled = true;
  try {
    api_scheduleOnMainThread_delay(function() {
      g_ranking_load_scheduled = false;
      startRanking();
    }, null, 5000);
  } catch (e) {
    safeRankLog('schedule retry failed: ' + e.message);
  }
}

function startRanking() {
  if (g_ranking_started && isRankingDbReady()) {
    return true;
  }

  if (!isRankingDbReady()) {
    safeRankLog('db not ready, retry later');
    scheduleRankingLoadRetry();
    return false;
  }

  loadRankFromDb();
  g_ranking_started = true;
  safeRankLog('started');
  return true;
}
