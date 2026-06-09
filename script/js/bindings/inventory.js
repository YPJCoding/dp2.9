// 背包/道具 binding
// 来源：从旧 frida.js CInventory*/Inven_Item* 系列函数迁移
// 用途：封装背包操作、道具查询等
//
// 风险：直接操作玩家背包，错误操作可能导致道具丢失

function createInventoryBinding(addr) {
  const _GetInvenRef = nf(addr.cinventory_get_inven_ref, 'pointer', ['pointer', 'int', 'int']);
  const _IsEquipable = nf(addr.inven_item_is_equipable_item_type, 'int', ['pointer']);
  const _IsEmpty = nf(addr.inven_item_is_empty, 'int', ['pointer']);
  const _GetKey = nf(addr.inven_item_get_key, 'int', ['pointer']);
  const _GetAddInfo = nf(addr.inven_item_get_add_info, 'int', ['pointer']);
  const _InvenItemConstructor = nf(addr.inven_item_constructor, 'pointer', ['pointer']);
  const _Reset = nf(addr.inven_item_reset, 'int', ['pointer']);
  const _UseMoney = nf(addr.cinventory_use_money, 'int', ['pointer', 'int', 'int', 'int']);
  const _DeleteItem = nf(addr.cinventory_delete_item, 'int', ['pointer', 'int', 'int', 'int', 'int', 'int']);
  const _GetMoney = nf(addr.cinventory_get_money, 'int', ['pointer']);
  const _GetAvatarItemMgrR = nf(addr.cinventory_get_avatar_item_mgr_r, 'pointer', ['pointer']);

  // 背包类型常量（来源：从旧 frida.js 迁移）
  const TYPE_BODY = 0;   // 身上穿的装备
  const TYPE_ITEM = 1;   // 物品栏
  const TYPE_AVARTAR = 2; // 时装栏

  // 获取背包指定槽位的道具
  function getInvenRef(inven, invenType, slot) {
    return _GetInvenRef(inven, invenType, slot);
  }

  // 判断道具是否为装备类型
  function isEquipableItemType(item) {
    return _IsEquipable(item);
  }

  // 检查背包中道具槽是否为空
  function isItemEmpty(item) {
    return _IsEmpty(item);
  }

  // 获取道具 item_id
  function getItemKey(item) {
    return _GetKey(item);
  }

  // 获取道具附加信息（时装插槽相关）
  function getAddInfo(item) {
    return _GetAddInfo(item);
  }

  // 初始化/清空背包道具
  function initItem(itemPtr) {
    _InvenItemConstructor(itemPtr);
  }

  // 删除背包槽中的道具（重置为空）
  // 风险：直接删除玩家道具，误用会导致道具丢失
  function resetItem(item) {
    return _Reset(item);
  }

  // 扣除角色金币
  // 风险：直接操作角色金币，误扣无法恢复
  function useMoney(inven, amount, arg2, arg3) {
    return _UseMoney(inven, amount, arg2, arg3);
  }

  // 从背包中删除道具
  // invenType: 背包类型, slot: 槽位, count: 数量, reason: 删除原因, log: 是否记录日志
  // 风险：直接删除玩家道具，误删会导致道具丢失
  function deleteItem(inven, invenType, slot, count, reason, log) {
    return _DeleteItem(inven, invenType, slot, count, reason, log);
  }

  // 获取角色当前持有金币数量
  function getMoney(inven) {
    return _GetMoney(inven);
  }

  // 获取时装管理器
  function getAvatarItemMgrR(inven) {
    return _GetAvatarItemMgrR(inven);
  }

  return {
    TYPE_BODY: TYPE_BODY,
    TYPE_ITEM: TYPE_ITEM,
    TYPE_AVARTAR: TYPE_AVARTAR,
    getInvenRef: getInvenRef,
    isEquipableItemType: isEquipableItemType,
    isItemEmpty: isItemEmpty,
    getItemKey: getItemKey,
    getAddInfo: getAddInfo,
    initItem: initItem,
    resetItem: resetItem,
    useMoney: useMoney,
    deleteItem: deleteItem,
    getMoney: getMoney,
    getAvatarItemMgrR: getAvatarItemMgrR,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createInventoryBinding = createInventoryBinding;
}
