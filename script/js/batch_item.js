// 批量物品添加 + UI 通知（来源：dp2/df_game_r.js）

function addItemList(user, itemList) {
  for (var i = 0; i < itemList.length; i++) {
    api_CUser_AddItem(user, itemList[i][0], itemList[i][1]);
  }
  sendItemNotification(user, itemList);
}

function sendItemNotification(user, itemList) {
  const packet = api_PacketGuard_PacketGuard();
  InterfacePacketBuf_put_header(packet, 1, 163);
  InterfacePacketBuf_put_byte(packet, 1);
  InterfacePacketBuf_put_short(packet, 0);
  InterfacePacketBuf_put_int(packet, 0);
  InterfacePacketBuf_put_short(packet, itemList.length);
  for (var i = 0; i < itemList.length; i++) {
    InterfacePacketBuf_put_int(packet, itemList[i][0]);
    InterfacePacketBuf_put_int(packet, itemList[i][1]);
  }
  InterfacePacketBuf_finalize(packet, 1);
  CUser_Send(user, packet);
  Destroy_PacketGuard_PacketGuard(packet);
}
