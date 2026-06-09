// 时装徽章镶嵌修复模块
// 来源：从旧 frida.js fix_use_emblem() 迁移
// 用途：处理时装徽章镶嵌请求，替代游戏原有的（已失效的）镶嵌流程
//
// 为什么需要这个模块：
// 1. 原游戏的时装镶嵌功能可能有 bug 或已损坏
// 2. Frida 可以拦截镶嵌请求包，自行实现完整的镶嵌流程
//
// 处理流程：
// 1. 解析客户端封包（时装位置、item_id、徽章列表）
// 2. 校验角色状态（必须在游戏中）
// 3. 校验时装道具（存在、未被锁定）
// 4. 校验每个徽章（存在、类型正确、插槽颜色匹配）
// 5. 写入插槽数据
// 6. 删除消耗的徽章
// 7. 时装数据存盘
// 8. 通知客户端更新

var g_emblem_fix_state = { started: false };

function startEmblemFixFeature(ctx) {
  return RuntimeUtils.startOnce(ctx, g_emblem_fix_state, 'emblem_fix', function () {
    const addr = ctx.addresses;
    const packet = ctx.packet;
    const user = ctx.user;
    const inventory = ctx.inventory;
    const item = ctx.item;

    // ---- 辅助函数：获取时装数据库 UI ID ----
    // 来源：从旧 frida.js api_get_avartar_ui_id 迁移
    function getAvatarUiId(avartar) {
      return avartar.add(7).readInt();
    }

    // ---- 辅助函数：设置时装插槽数据 ----
    // 来源：从旧 frida.js api_set_JewelSocketData 迁移
    // jewelSocketData: 时装插槽数据指针
    // slot: 插槽索引 (0-2)
    // emblemItemId: 要镶嵌的徽章 item_id
    // jewel_type: 红=0x1, 黄=0x2, 绿=0x4, 蓝=0x8, 白金=0x10
    function setJewelSocketData(jewelSocketData, slot, emblemItemId) {
      if (!jewelSocketData.isNull()) {
        // 每个槽数据长 6 字节: 2 字节槽类型 + 4 字节徽章 item_id
        // 镶嵌不改变槽类型，只修改徽章 id
        jewelSocketData.add(slot * 6 + 2).writeInt(emblemItemId);
      }
    }

    // ---- 时装插槽数据存盘 ----
    // 来源：从旧 frida.js DB_UpdateAvatarJewelSlot_makeRequest 迁移
    const _UpdateAvatarJewelSlot = nf(addr.db_update_avatar_jewel_slot_make_request, 'pointer', ['int', 'int', 'pointer']);

    function saveJewelSlotData(characNo, avatarUiId, jewelSocketData) {
      _UpdateAvatarJewelSlot(characNo, avatarUiId, jewelSocketData);
    }

    // ---- 主 Hook：拦截镶嵌请求 ----
    // 来源：从旧 frida.js fix_use_emblem 迁移
    // 原函数：Dispatcher_UseJewel::dispatch_sig
    // 为什么是这个地址：此函数处理客户端发来的时装镶嵌请求
    // 风险：封包解析错误可能导致客户端异常或角色数据异常
    // 为什么 onLeave 替换返回值为 0：原函数返回非 0 会让客户端断线
    attachOnce('emblem_fix_dispatch', addr.use_jewel_dispatch, {
      onEnter: function (args) {
        try {
          const curUser = args[1];
          const packetBuf = args[2];

          // 步骤1：校验角色状态是否允许镶嵌
          // 只在玩家已进入游戏（state == 3）时处理
          const state = user.getState(curUser);
          if (state != 3) {
            return;
          }

          // 步骤2：解析客户端封包
          // 封包格式（来源：协议逆向分析）：
          //   short: 时装所在的背包槽
          //   int: 时装 item_id
          //   byte: 本次镶嵌徽章数量
          //   对每个徽章: short(背包槽) + int(item_id) + byte(目标插槽)

          // 时装所在的背包槽
          const avartarInvenSlot = packet.getShort(packetBuf);
          // 时装 item_id
          const avartarItemId = packet.getInt(packetBuf);
          // 本次镶嵌徽章数量
          const emblemCnt = packet.getByte(packetBuf);

          // 步骤3：获取并校验时装道具
          const inven = user.getCurCharacInvenW(curUser);
          const avartar = inventory.getInvenRef(inven, inventory.TYPE_AVARTAR, avartarInvenSlot);

          // 时装必须存在、ID 匹配、未被锁定
          if (inventory.isItemEmpty(avartar) ||
              inventory.getItemKey(avartar) != avartarItemId ||
              user.checkItemLock(curUser, 2, avartarInvenSlot)) {
            return;
          }

          // 步骤4：获取时装插槽数据
          const avartarAddInfo = inventory.getAddInfo(avartar);
          const invenAvartarMgr = inventory.getAvatarItemMgrR(inven);

          // CAvatarItemMgr::getJewelSocketData
          const _GetJewelSocketData = nf(addr.cavataritemmgr_get_jewel_socket_data, 'pointer', ['pointer', 'int']);
          const jewelSocketData = _GetJewelSocketData(invenAvartarMgr, avartarAddInfo);

          if (jewelSocketData.isNull()) {
            return;
          }

          // 步骤5：最多只支持 3 个插槽
          if (emblemCnt <= 3) {
            const emblems = {};
            for (var i = 0; i < emblemCnt; i++) {
              // 徽章所在的背包槽
              var emblemInvenSlot = packet.getShort(packetBuf);
              // 徽章 item_id
              var emblemItemId = packet.getInt(packetBuf);
              // 该徽章要镶嵌的时装插槽 ID
              var avartarSocketSlot = packet.getByte(packetBuf);

              // 步骤6：校验徽章道具
              const emblem = inventory.getInvenRef(inven, inventory.TYPE_ITEM, emblemInvenSlot);
              if (inventory.isItemEmpty(emblem) ||
                  inventory.getItemKey(emblem) != emblemItemId ||
                  avartarSocketSlot >= 3) {
                return;
              }

              // 步骤7：校验徽章类型（必须是消耗品且类型为 20 = 徽章）
              const citem = item.findItem(emblemItemId);
              if (citem.isNull()) {
                return;
              }
              if (!item.isStackable(citem) || item.getStackableItemType(citem) != 20) {
                return;
              }

              // 步骤8：校验徽章插槽颜色是否匹配
              // 获取徽章支持的插槽类型
              const emblemSocketType = item.getJewelTargetSocket(citem);
              // 获取时装插槽类型（从插槽数据中读取）
              const avartarSocketType = jewelSocketData.add(avartarSocketSlot * 6).readShort();
              if (!(emblemSocketType & avartarSocketType)) {
                // 插槽类型不匹配，跳过
                return;
              }

              emblems[avartarSocketSlot] = [emblemInvenSlot, emblemItemId];
            }

            // 步骤9：执行镶嵌
            for (var avartarSocketSlot in emblems) {
              // 删除消耗的徽章
              var emblemInvenSlot = emblems[avartarSocketSlot][0];
              inventory.deleteItem(inven, 1, emblemInvenSlot, 1, 8, 1);

              // 设置时装插槽数据
              var emblemItemId = emblems[avartarSocketSlot][1];
              setJewelSocketData(jewelSocketData, avartarSocketSlot, emblemItemId);
            }

            // 步骤10：时装插槽数据存盘
            saveJewelSlotData(
              user.getCurCharacNo(curUser),
              getAvatarUiId(avartar),
              jewelSocketData
            );

            // 步骤11：通知客户端时装数据已更新
            user.sendUpdateItemList(curUser, 1, 1, avartarInvenSlot);

            // 步骤12：回包给客户端通知镶嵌成功
            const packetGuard = packet.createPacketGuard();
            packet.putHeader(packetGuard, 1, 204);
            packet.putInt(packetGuard, 1);
            packet.finalize(packetGuard, 1);
            user.send(curUser, packetGuard);
            packet.destroyPacketGuard(packetGuard);
          }
        } catch (error) {
          // 镶嵌过程中出现异常，记录日志但不影响主流程
          if (ctx.log) ctx.log('[emblem_fix] exception: ' + error);
        }
      },
      onLeave: function (retval) {
        // 返回值改为 0，不再踢线（原函数返回非 0 会导致客户端断线）
        retval.replace(0);
      }
    });
  });
}

RuntimeUtils.exposeGlobal('startEmblemFixFeature', startEmblemFixFeature);
