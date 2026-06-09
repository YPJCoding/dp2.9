// 战力排行模块
// 来源：从旧 frida.js ranklist / GetRankNumber / GetMyEquInfo / SetRanking / SendRankLits - 相关函数迁移
// 用途：维护服务器战力排行榜前三名，在城镇显示雕像
//
// 功能说明：
// 1. 查询角色战力值（从数据库 frida.battle 表）
// 2. 角色下线时更新排行
// 3. 向客户端下发排行榜数据
// 4. 排行榜数据持久化到数据库（热重载恢复）
//
// 注意：战力值查询 SQL 需要适配不同的数据库环境
//   - 花枝战力值数据库：SELECT ZLZ FROM frida.battle WHERE CID=?
//   - 暴雨：SELECT ZLZ FROM d_starsky.zhanli WHERE CID=?
//   - 暴雨2：SELECT ZLZ FROM d_baoyu.zhanli WHERE CID=?
//   - RS：SELECT ZLZ FROM Rslogin.battle WHERE ZID=?

// 默认榜单数据（服务器刚启动时使用）
// 来源：从旧 frida.js ranklist 默认数据迁移
// 每个条目包含：
//   rank: 战力值（越大排名越高）
//   characname: 角色名
//   job: 职业
//   lev: 等级
//   Grow: PVP 段位
//   Guilkey: 公会 ID
//   Guilname: 公会名
//   str: 角色名附带空格（屏蔽客户端自定义显示）
//   equip: 外观装备列表（11件: 武器/上衣/下衣/帽子/头发等）
var g_ranklist = {
  '1': {
    'rank': 100,
    'characname': '虚位以待',
    'job': 0,
    'lev': 85,
    'Grow': 17,
    'Guilkey': 1,
    'Guilname': '',
    'str': '111！',
    'equip': [101531433, 101551558, 101501731, 101571413, 101561697, 101521488, 101511859, 101541622, 0, -1, 101040146]
  },
  '2': {
    'rank': 90,
    'characname': '虚位以待',
    'job': 1,
    'lev': 85,
    'Grow': 17,
    'Guilkey': 1,
    'Guilname': '',
    'str': '222！',
    'equip': [45486, 43101, 44757, 43879, 43541, 44283, 45155, 45935, 0, -1, 102040100]
  },
  '3': {
    'rank': 80,
    'characname': '虚位以待',
    'job': 4,
    'lev': 85,
    'Grow': 17,
    'Guilkey': 1,
    'Guilname': '',
    'str': '333！',
    'equip': [57519, 55153, 56754, 55922, 55533, 56332, 57147, 57946, 0, -1, 108030043]
  },
};

// ---- 查询角色战力值 ----
// 来源：从旧 frida.js GetRankNumber 迁移
// characNo: 角色 charac_no
// fridaDb: 绑定 frida 句柄的便捷 DB 对象（ctx.fridaDb）
// 返回: 战力值，查询失败返回 undefined
function getRankNumber(fridaDb, characNo) {
  // DB 未初始化时直接返回 0，不查询
  if (!fridaDb) {
    return 0;
  }
  // SQL 拼接未做转义，characNo 为数字类型是安全的
  const sql = "SELECT ZLZ FROM frida.battle WHERE CID='" + characNo + "';";
  if (fridaDb.exec(sql)) {
    if (fridaDb.getNRows() == 1) {
      fridaDb.fetch();
      return parseInt(fridaDb.getStr(0));
    }
  }
}

// ---- 获取角色排行数据 ----
// 来源：从旧 frida.js GetMyEquInfo 迁移
// 注意：角色名处多加空格用于屏蔽客户端内排行榜对显示框的修改
function getMyEquInfo(ctx, curUser) {
  const MyRanklist = {
    'rank': 0,
    'characname': '',
    'job': 0,
    'lev': 0,
    'Grow': 0,
    'Guilkey': 0,
    'Guilname': '',
    'str': '',
    'equip': []
  };

  const characNo = ctx.user.getCurCharacNo(curUser);
  MyRanklist.rank = getRankNumber(ctx.fridaDb, characNo) || 0;
  // 名字后加空格用于屏蔽客户端自定义显示字符串
  MyRanklist.characname = ctx.user.getCurCharacName(curUser) + ' ';
  MyRanklist.job = ctx.user.getCharacJob(curUser);
  MyRanklist.lev = ctx.user.getCharacLevel(curUser);
  MyRanklist.Grow = ctx.user.getCurCharacGrowType(curUser);
  MyRanklist.Guilkey = ctx.user.getCharacGuildkey(curUser);
  MyRanklist.Guilname = ctx.user.getGuildName(curUser);
  if (!MyRanklist.Guilname) {
    MyRanklist.Guilname = '未加入公会';
  }

  // 读取角色身上穿的装备
  const InvenW = ctx.user.getCurCharacInvenW(curUser);
  for (var i = 0; i <= 10; i++) {
    if (i != 9) {
      const invenItem = ctx.inventory.getInvenRef(InvenW, ctx.inventory.TYPE_BODY, i);
      MyRanklist.equip.push(ctx.inventory.getItemKey(invenItem));
    } else {
      MyRanklist.equip.push(-1);
    }
  }

  return MyRanklist;
}

// ---- 更新个人排名 ----
// 来源：从旧 frida.js SetRanking 迁移
// 原理：获取角色战力值，与现有排行榜比较，只保留前三名
function setRanking(ctx, curUser) {
  const MyRanklist = getMyEquInfo(ctx, curUser);

  // findIndex 可能为 ES6+ 语法，使用循环代替
  var existingIndex = -1;
  const rankKeys = [];
  for (var key in g_ranklist) {
    if (g_ranklist.hasOwnProperty(key)) {
      rankKeys.push(key);
      if (g_ranklist[key].characname === MyRanklist.characname) {
        existingIndex = parseInt(key) - 1;
      }
    }
  }

  if (MyRanklist.rank) {
    if (existingIndex !== -1) {
      // 已在排行榜中，更新信息
      g_ranklist[(existingIndex + 1).toString()] = MyRanklist;
    } else {
      // 新人加入排行
      g_ranklist['4'] = MyRanklist;
    }

    // 排序（按战力值降序）
    const rankArray = [];
    for (var key in g_ranklist) {
      if (g_ranklist.hasOwnProperty(key)) {
        rankArray.push(g_ranklist[key]);
      }
    }
    rankArray.sort(function (a, b) { return b.rank - a.rank; });

    // 只保留前三名
    const topThree = rankArray.slice(0, 3);

    const tmp = {};
    for (var i = 0; i < topThree.length; i++) {
      tmp[(i + 1).toString()] = topThree[i];
    }

    // 删除第四名
    delete g_ranklist['4'];
    g_ranklist = tmp;
  }
}

// ---- 发送排行榜给玩家 ----
// 来源：从旧 frida.js SendRankLits 迁移
// user: CUser 指针
// all: true=全体下发, false=单体下发
function sendRankLits(ctx, curUser, all) {
  const packetGuard = ctx.packet.createPacketGuard();
  // 协议 ENUM_NOTIPACKET_STATUE_POSITION (182)
  ctx.packet.putHeader(packetGuard, 0, 182);
  ctx.packet.putByte(packetGuard, Object.keys(g_ranklist).length);

  for (var key in g_ranklist) {
    if (g_ranklist.hasOwnProperty(key)) {
      const data = g_ranklist[key];
      const characName = data.characname;
      const characLevel = data.lev;
      const characJob = data.job;
      const characGrowType = data.Grow;
      const characGuilname = data.Guilname;
      const characGuilkey = data.Guilkey;
      const equip = data.equip;

      ctx.packet.putString(packetGuard, characName);
      ctx.packet.putByte(packetGuard, characLevel);
      ctx.packet.putByte(packetGuard, characJob);
      ctx.packet.putByte(packetGuard, characGrowType);
      ctx.packet.putString(packetGuard, characGuilname);
      ctx.packet.putInt(packetGuard, characGuilkey);

      for (var i = 0; i < equip.length; i++) {
        const itemId = (i != 9) ? equip[i] : -1;
        ctx.packet.putInt(packetGuard, itemId);
      }
    }
  }

  ctx.packet.finalize(packetGuard, 1);

  if (all) {
    // 全体下发
    ctx.gw.sendAll(ctx.gw.getGameWorld(), packetGuard);
  } else {
    // 单下发
    ctx.user.send(curUser, packetGuard);
  }

  ctx.packet.destroyPacketGuard(packetGuard);
}

// ---- 从数据库加载排行榜 ----
// 来源：从旧 frida.js event_rankinfo_load_from_db 迁移
function loadRankInfoFromDb(fridaDb) {
  if (fridaDb.exec("select event_info from game_event where event_id = 'rankinfo';")) {
    if (fridaDb.getNRows() == 1) {
      fridaDb.fetch();
      const info = fridaDb.getStr(0);
      if (info) {
        try {
          g_ranklist = JSON.parse(info);
        } catch (e) {
          console.log('[ranking] failed to parse saved ranklist: ' + e);
        }
      }
    }
  }
}

// ---- 保存排行榜到数据库 ----
// 来源：从旧 frida.js event_rankinfo_save_to_db 迁移
function saveRankInfoToDb(fridaDb) {
  try {
    // SQL 拼接 JSON，排行榜数据不包含用户输入，相对安全
    // 风险：如果角色名中包含特殊字符可能导致 SQL 语法错误
    // TODO: 后续统一使用参数化查询
    fridaDb.exec("replace into game_event (event_id, event_info) values ('rankinfo', '" + JSON.stringify(g_ranklist) + "');");
  } catch (error) {
    console.log('[ranking] save failed: ' + error);
  }
}

// ---- 启动模块 ----
var g_ranking_started = false;

function startRankingFeature(ctx) {
  if (g_ranking_started) {
    console.log('[ranking] already started');
    return;
  }

  // 从 DB 加载持久化排行数据
  // 使用 ctx.fridaDb（绑定 frida 句柄的便捷 DB 对象）
  if (ctx.fridaDb) {
    try {
      loadRankInfoFromDb(ctx.fridaDb);
    } catch (e) {
      console.log('[ranking] load from db failed: ' + e);
    }
  }

  g_ranking_started = true;
  if (ctx.log) ctx.log('[ranking] started');
}

// ---- 暴露给 user_inout 的回调 ----
// 用户进入时：发送排行榜（全体下发）
function onUserEnterRanking(ctx, curUser) {
  if (!curUser.isNull()) {
    sendRankLits(ctx, curUser, true);
  }
}

// 用户离开时：更新排名
function onUserLeaveRanking(ctx, curUser) {
  // 防御式检查：curUser 可能为空
  if (!curUser || curUser.isNull()) {
    return;
  }

  // DB 不可用时跳过排名更新和持久化
  if (!ctx.fridaDb) {
    if (ctx.log) {
      ctx.log('[ranking] fridaDb 不存在，跳过排行榜更新');
    }
    return;
  }

  setRanking(ctx, curUser);
  // 存盘
  saveRankInfoToDb(ctx.fridaDb);
}

if (typeof globalThis !== 'undefined') {
  globalThis.startRankingFeature = startRankingFeature;
  globalThis.ranking_onUserEnter = onUserEnterRanking;
  globalThis.ranking_onUserLeave = onUserLeaveRanking;
  globalThis.ranking_saveToDb = saveRankInfoToDb;
}
