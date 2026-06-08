// 掉落公告 / 掉落奖励（来源：dp2.9/df_game_r.js 残留 processing_data 实现）
//
// 说明：
// - 旧逻辑位于 df_game_r.js 的 processing_data(item_id, user, award_item_id, award_item_count, count)。
// - 该逻辑会在玩家获得 rarity >= 3 的物品时全服公告，并随机发放点券。
// - 属于经济高风险功能，默认必须由 js_features.enable_drop_announce 控制为关闭。
// - 本模块只提供独立实现和启动函数，是否调用由 df_game_r.js 入口配置控制。

var g_drop_announce_started = false;

function dropAnnounceLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [drop_announce] ' + message);
  } catch (e) {
    console.log('[drop_announce] ' + message);
  }
}

function getDropAnnounceRewardCera() {
  if (typeof get_random_int === 'function') {
    return get_random_int(50, 888);
  }
  return Math.floor(Math.random() * (888 - 50)) + 50;
}

function shouldAnnounceDroppedItem(itemId) {
  try {
    const citem = CDataManager_find_item(G_CDataManager(), itemId);
    if (!citem || citem.isNull()) {
      return { ok: false, rarity: 0, itemName: 'unknown' };
    }
    const rarity = parseInt(CItem_get_rarity(citem));
    const itemName = api_CItem_GetItemName(itemId);
    return { ok: rarity >= 3, rarity: rarity, itemName: itemName };
  } catch (e) {
    dropAnnounceLog('inspect item failed item_id=' + itemId + ' err=' + e.message);
    return { ok: false, rarity: 0, itemName: 'unknown' };
  }
}

function processDropAnnounce(itemId, user) {
  if (!user || user.isNull()) {
    return false;
  }

  const result = shouldAnnounceDroppedItem(itemId);
  if (!result.ok) {
    return false;
  }

  const rewardCera = getDropAnnounceRewardCera();
  const characName = api_CUserCharacInfo_getCurCharacName(user);
  api_GameWorld_SendNotiPacketMessage(
    '恭喜玩家[' + characName + ']在地下城中获得了' + result.rarity + '[' + result.itemName + '], 随机奖励点券：' + rewardCera,
    14
  );
  api_recharge_cash_cera(user, rewardCera);
  dropAnnounceLog('announce item_id=' + itemId + ' rarity=' + result.rarity + ' reward_cera=' + rewardCera + ' user=' + characName);
  return true;
}

function parseHistoryLogForDrop(user, historyLog) {
  if (!historyLog || typeof historyLog !== 'string') {
    return false;
  }

  const group = historyLog.split(',');
  if (group.length < 19) {
    return false;
  }

  const gameEvent = group[13] ? group[13].slice(1) : '';
  if (gameEvent !== 'Item+') {
    return false;
  }

  const itemId = parseInt(group[15]);
  const reason = parseInt(group[18]);

  // 旧残留逻辑中 group[18] == 4 代表副本拾取触发点。
  if (!itemId || reason !== 4) {
    return false;
  }

  return processDropAnnounce(itemId, user);
}

function startDropAnnounce() {
  if (g_drop_announce_started) {
    dropAnnounceLog('already started, skip duplicate hook');
    return;
  }

  Interceptor.attach(ptr(0x854F990), {
    onEnter: function (args) {
      try {
        const historyLog = args[1].readUtf8String(-1);
        const group = historyLog.split(',');
        const accountId = parseInt(group[1]);
        if (!accountId) {
          return;
        }
        const user = GameWorld_find_user_from_world_byaccid(G_GameWorld(), accountId);
        if (!user || user.isNull()) {
          return;
        }
        parseHistoryLogForDrop(user, historyLog);
      } catch (e) {
        dropAnnounceLog('hook failed: ' + e.message);
      }
    },
    onLeave: function (retval) {}
  });

  g_drop_announce_started = true;
  dropAnnounceLog('started');
}

// 兼容可能的旧/新入口命名。
function drop_announce() {
  return startDropAnnounce();
}
