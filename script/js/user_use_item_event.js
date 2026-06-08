// 角色使用道具触发事件（来源：dp2.9/df_game_r.js）
//
// 说明：
// - 旧实现位于 df_game_r.js 的 UserUseItemEvent(user, item_id, accid)。
// - 由 history_log.js 解析 Item- 且 reason=3 后分发调用。
// - 当前仅保留旧逻辑中明确启用的坐骑变身器返还邮件。
// - 旧逻辑中命运硬币、任务完成券等分支是注释状态，本模块继续保持不启用。

function userUseItemEventLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [user_use_item_event] ' + message);
  } catch (e) {
    console.log('[user_use_item_event] ' + message);
  }
}

var MOUNT_TRANSFORMER_ITEM_IDS = {
  20206321: true,
  20206322: true,
  20206323: true,
  20206324: true,
  20206325: true,
  20206326: true,
  20206327: true,
  20206328: true,
  20206329: true,
  20206330: true,
  20226321: true,
  20226322: true,
  20226323: true,
  20226324: true,
  20226325: true,
  20226326: true,
  20226327: true,
  20226328: true,
  20226329: true,
  20226330: true
};

function isMountTransformerItem(itemId) {
  return MOUNT_TRANSFORMER_ITEM_IDS[parseInt(itemId)] === true;
}

function returnMountTransformerByMail(user, itemId) {
  if (!user || user.isNull()) {
    return false;
  }
  if (!isMountTransformerItem(itemId)) {
    return false;
  }

  CMailBoxHelperReqDBSendNewSystemMail(user, parseInt(itemId), 1, 'GM', '返还坐骑变身器：');
  userUseItemEventLog('return mount transformer item_id=' + itemId + ' user=' + api_CUserCharacInfo_getCurCharacName(user));
  return true;
}

function dispatchUserUseItemEvent(user, itemId, accountId) {
  if (!itemId) {
    return false;
  }

  if (isMountTransformerItem(itemId)) {
    return returnMountTransformerByMail(user, itemId);
  }

  // 旧 df_game_r.js 中以下分支为注释状态，保持不启用：
  // - 1047: use_ftcoin_change_luck_point(user)
  // - 10303917: clear_doing_questEx(user, 674)
  // - 10303918: clear_doing_questEx(user, 675)
  return false;
}

// 兼容旧入口命名。
function UserUseItemEvent(user, item_id, accid) {
  return dispatchUserUseItemEvent(user, item_id, accid);
}
