// 批量物品添加 UI 通知（来源：dp2.9/df_game_r.js）
//
// 说明：
// - 旧实现位于 df_game_r.js 的 api_CUser_Add_Item_list() / SendItemWindowNotification()。
// - 该模块只负责批量加物品后的客户端 UI 通知，不自行决定是否允许发物品。
// - 实际发放入口仍应由 Lua 回调和 js_features.enable_batch_item_add 做校验。

function batchItemNotifyLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [batch_item_notify] ' + message);
  } catch (e) {
    console.log('[batch_item_notify] ' + message);
  }
}

function sendItemWindowNotification(user, itemList) {
  if (!user || user.isNull()) {
    return false;
  }
  if (!itemList || itemList.length <= 0) {
    return false;
  }

  const packetGuard = api_PacketGuard_PacketGuard();
  InterfacePacketBuf_put_header(packetGuard, 1, 163);
  InterfacePacketBuf_put_byte(packetGuard, 1);
  InterfacePacketBuf_put_short(packetGuard, 0);
  InterfacePacketBuf_put_int(packetGuard, 0);
  InterfacePacketBuf_put_short(packetGuard, itemList.length);

  for (var i = 0; i < itemList.length; i++) {
    InterfacePacketBuf_put_int(packetGuard, itemList[i][0]);
    InterfacePacketBuf_put_int(packetGuard, itemList[i][1]);
  }

  InterfacePacketBuf_finalize(packetGuard, 1);
  CUser_Send(user, packetGuard);
  Destroy_PacketGuard_PacketGuard(packetGuard);
  return true;
}

function addItemListWithNotification(user, itemList) {
  if (!user || user.isNull()) {
    return false;
  }
  if (!itemList || itemList.length <= 0) {
    return false;
  }

  for (var i = 0; i < itemList.length; i++) {
    const itemId = parseInt(itemList[i][0]);
    const count = parseInt(itemList[i][1]);
    if (!itemId || !count || count <= 0) {
      batchItemNotifyLog('skip invalid item index=' + i + ' item_id=' + itemList[i][0] + ' count=' + itemList[i][1]);
      continue;
    }
    api_CUser_AddItem(user, itemId, count);
  }

  sendItemWindowNotification(user, itemList);
  return true;
}

// 兼容旧入口命名。
function SendItemWindowNotification(user, item_list) {
  return sendItemWindowNotification(user, item_list);
}

// 兼容旧入口命名。
function api_CUser_Add_Item_list(user, item_list) {
  return addItemListWithNotification(user, item_list);
}
