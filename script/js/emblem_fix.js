// 时装镶嵌修复（来源：dp2/frida.js / dp2.9/df_game_r.js）
//
// 说明：
// - 旧实现位于 df_game_r.js 的 fix_use_emblem()。
// - 本模块保持旧逻辑：校验时装/徽章/插槽，删除徽章，写入时装插槽数据，通知客户端刷新。
// - 增加重复 hook 保护，避免 start() 或热重载重复挂接 Dispatcher_UseJewel。

var g_emblem_fix_started = false;

function emblemFixLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [emblem_fix] ' + message);
  } catch (e) {
    console.log('[emblem_fix] ' + message);
  }
}

function setJewelSocketData(jewelSocketData, slot, emblemItemId) {
  if (!jewelSocketData || jewelSocketData.isNull()) {
    return false;
  }
  // 每个槽数据长 6 字节：2 字节槽类型 + 4 字节徽章 item_id。
  jewelSocketData.add(slot * 6 + 2).writeInt(emblemItemId);
  return true;
}

function handleUseEmblem(user, packetBuf) {
  const state = CUser_get_state(user);
  if (state != 3) {
    return false;
  }

  const avatarInvenSlot = api_PacketBuf_get_short(packetBuf);
  const avatarItemId = api_PacketBuf_get_int(packetBuf);
  const emblemCount = api_PacketBuf_get_byte(packetBuf);

  const inven = CUserCharacInfo_getCurCharacInvenW(user);
  const avatar = CInventory_GetInvenRef(inven, INVENTORY_TYPE_AVATAR, avatarInvenSlot);

  if (Inven_Item_isEmpty(avatar) || Inven_Item_getKey(avatar) != avatarItemId || CUser_CheckItemLock(user, 2, avatarInvenSlot)) {
    return false;
  }

  const avatarAddInfo = Inven_Item_get_add_info(avatar);
  const avatarMgr = CInventory_GetAvatarItemMgrR(inven);
  const jewelSocketData = WongWork_CAvatarItemMgr_getJewelSocketData(avatarMgr, avatarAddInfo);

  if (!jewelSocketData || jewelSocketData.isNull()) {
    return false;
  }

  if (emblemCount > 3) {
    return false;
  }

  const emblems = {};
  for (var i = 0; i < emblemCount; i++) {
    const emblemInvenSlot = api_PacketBuf_get_short(packetBuf);
    const emblemItemId = api_PacketBuf_get_int(packetBuf);
    const avatarSocketSlot = api_PacketBuf_get_byte(packetBuf);

    const emblem = CInventory_GetInvenRef(inven, INVENTORY_TYPE_ITEM, emblemInvenSlot);
    if (Inven_Item_isEmpty(emblem) || Inven_Item_getKey(emblem) != emblemItemId || avatarSocketSlot >= 3) {
      return false;
    }

    const citem = CDataManager_find_item(G_CDataManager(), emblemItemId);
    if (!citem || citem.isNull()) {
      return false;
    }

    if (!CItem_is_stackable(citem) || CStackableItem_GetItemType(citem) != 20) {
      return false;
    }

    const emblemSocketType = CStackableItem_getJewelTargetSocket(citem);
    const avatarSocketType = jewelSocketData.add(avatarSocketSlot * 6).readShort();
    if (!(emblemSocketType & avatarSocketType)) {
      return false;
    }

    emblems[avatarSocketSlot] = [emblemInvenSlot, emblemItemId];
  }

  for (var avatarSocketSlot in emblems) {
    const emblemInvenSlot = emblems[avatarSocketSlot][0];
    const emblemItemId = emblems[avatarSocketSlot][1];
    CInventory_delete_item(inven, 1, emblemInvenSlot, 1, 8, 1);
    setJewelSocketData(jewelSocketData, avatarSocketSlot, emblemItemId);
  }

  DB_UpdateAvatarJewelSlot_makeRequest(CUserCharacInfo_getCurCharacNo(user), api_get_avatar_ui_id(avatar), jewelSocketData);
  CUser_SendUpdateItemList(user, 1, 1, avatarInvenSlot);

  const packetGuard = api_PacketGuard_PacketGuard();
  InterfacePacketBuf_put_header(packetGuard, 1, 204);
  InterfacePacketBuf_put_int(packetGuard, 1);
  InterfacePacketBuf_finalize(packetGuard, 1);
  CUser_Send(user, packetGuard);
  Destroy_PacketGuard_PacketGuard(packetGuard);

  return true;
}

function startEmblemFix() {
  if (g_emblem_fix_started) {
    emblemFixLog('already started, skip duplicate hook');
    return;
  }

  Interceptor.attach(ptr(0x8217BD6), {
    onEnter: function (args) {
      try {
        this.handled = handleUseEmblem(args[1], args[2]);
      } catch (error) {
        this.handled = false;
        emblemFixLog('handle failed: ' + error);
      }
    },
    onLeave: function (retval) {
      // 保持旧逻辑：返回 0，避免原始流程异常踢线。
      retval.replace(0);
    }
  });

  g_emblem_fix_started = true;
  emblemFixLog('started');
}

// 兼容旧入口命名。
function fix_use_emblem() {
  return startEmblemFix();
}
