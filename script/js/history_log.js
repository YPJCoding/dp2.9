// 历史日志追踪 / 游戏事件分发（来源：dp2/frida.js / dp2.9/df_game_r.js）
//
// 说明：
// - 旧实现为 hook_history_log()，hook cHistoryTrace::operator()。
// - 负责解析 Item- / Item+ / KillMob / Money+ / DungeonLeave 等游戏事件。
// - 本模块只拆分事件分发，不强行开启掉落公告或随机属性升级。
// - 若 drop_announce.js / random_option.js 已加载，则可复用其函数，但默认仍由入口配置决定是否加载相关模块。

var g_history_log_started = false;

function historyLogLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [history_log] ' + message);
  } catch (e) {
    console.log('[history_log] ' + message);
  }
}

function parseHistoryLogFields(historyLog) {
  if (!historyLog || typeof historyLog !== 'string') {
    return null;
  }

  const group = historyLog.split(',');
  if (group.length < 14) {
    return null;
  }

  return {
    raw: historyLog,
    group: group,
    accountId: parseInt(group[1]),
    time: group[3],
    characName: group[4],
    characNo: group[5],
    characLevel: group[6],
    characJob: group[7],
    characGrowType: group[8],
    userWebAddress: group[9],
    userPeerIp2: group[10],
    userPort: group[11],
    channelIndex: group[12],
    gameEvent: group[13] ? group[13].slice(1) : ''
  };
}

function dispatchItemMinusEvent(user, fields) {
  const group = fields.group;
  const itemId = parseInt(group[15]);
  const itemCount = parseInt(group[17]);
  const reason = parseInt(group[18]);

  if (!itemId) {
    return false;
  }

  if (reason === 3) {
    // 使用道具：保留旧逻辑，转发到 UserUseItemEvent。
    if (typeof UserUseItemEvent === 'function') {
      UserUseItemEvent(user, itemId, fields.accountId);
      return true;
    }
    historyLogLog('UserUseItemEvent missing, item use skipped item_id=' + itemId + ' count=' + itemCount);
  }

  return false;
}

function dispatchItemPlusEvent(user, fields) {
  const group = fields.group;
  const itemId = parseInt(group[15]);
  const reason = parseInt(group[18]);

  if (!itemId || reason !== 4) {
    return false;
  }

  // 掉落公告/奖励：仅在 drop_announce.js 已加载时复用。
  if (typeof processDropAnnounce === 'function') {
    return processDropAnnounce(itemId, user);
  }

  return false;
}

function dispatchKillMobEvent(user, fields) {
  // 魔法封印装备词条升级：仅在 random_option.js 已加载时复用。
  if (typeof boostRandomOptionEquipped === 'function') {
    boostRandomOptionEquipped(user);
    return true;
  }
  return false;
}

function dispatchMoneyPlusEvent(user, fields) {
  // 旧实现只解析日志，未执行业务逻辑。这里保留空分发点，方便后续扩展。
  return false;
}

function dispatchDungeonLeaveEvent(user, fields) {
  // 旧实现只保留事件分支，未执行业务逻辑。这里保留空分发点，方便后续扩展。
  return false;
}

function dispatchHistoryLogEvent(user, fields) {
  if (!fields || !fields.gameEvent) {
    return false;
  }

  if (fields.gameEvent === 'Item-') {
    return dispatchItemMinusEvent(user, fields);
  }

  if (fields.gameEvent === 'Item+') {
    return dispatchItemPlusEvent(user, fields);
  }

  if (fields.gameEvent === 'KillMob') {
    return dispatchKillMobEvent(user, fields);
  }

  if (fields.gameEvent === 'Money+') {
    return dispatchMoneyPlusEvent(user, fields);
  }

  if (fields.gameEvent === 'DungeonLeave') {
    return dispatchDungeonLeaveEvent(user, fields);
  }

  return false;
}

function startHistoryLog() {
  if (g_history_log_started) {
    historyLogLog('already started, skip duplicate hook');
    return;
  }

  // cHistoryTrace::operator()
  Interceptor.attach(ptr(0x854F990), {
    onEnter: function (args) {
      try {
        const historyLog = args[1].readUtf8String(-1);
        const fields = parseHistoryLogFields(historyLog);
        if (!fields || !fields.accountId) {
          return;
        }

        const user = GameWorld_find_user_from_world_byaccid(G_GameWorld(), fields.accountId);
        if (!user || user.isNull()) {
          return;
        }

        dispatchHistoryLogEvent(user, fields);
      } catch (e) {
        historyLogLog('dispatch failed: ' + e.message);
      }
    },
    onLeave: function (retval) {}
  });

  g_history_log_started = true;
  historyLogLog('started');
}

// 兼容旧入口命名。
function hook_history_log() {
  return startHistoryLog();
}
