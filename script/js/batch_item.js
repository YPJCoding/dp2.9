// 批量物品添加 + UI 通知（来源：dp2/df_game_r.js）

function api_CUser_Add_Item_list(user, item_list) {
    for (var i in item_list) {
        api_CUser_AddItem(user, item_list[i][0], item_list[i][1]);
    }
    SendItemWindowNotification(user, item_list);
}

function SendItemWindowNotification(user, item_list) {
    var packet_guard = api_PacketGuard_PacketGuard();
    InterfacePacketBuf_put_header(packet_guard, 1, 163);
    InterfacePacketBuf_put_byte(packet_guard, 1);
    InterfacePacketBuf_put_short(packet_guard, 0);
    InterfacePacketBuf_put_int(packet_guard, 0);
    InterfacePacketBuf_put_short(packet_guard, item_list.length);
    for (var i = 0; i < item_list.length; i++) {
        InterfacePacketBuf_put_int(packet_guard, item_list[i][0]);
        InterfacePacketBuf_put_int(packet_guard, item_list[i][1]);
    }
    InterfacePacketBuf_finalize(packet_guard, 1);
    CUser_Send(user, packet_guard);
    Destroy_PacketGuard_PacketGuard(packet_guard);
}
