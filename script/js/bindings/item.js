// 道具/装备数据 binding
// 来源：从旧 frida.js CItem* / CStackableItem* 系列函数迁移
// 用途：封装道具属性查询、PVF 数据查询等

function createItemBinding(addr) {
  var _GetRarity = nf(addr.citem_get_rarity, 'int', ['pointer']);
  var _GetUsableLevel = nf(addr.citem_get_usable_level, 'int', ['pointer']);
  var _GetItemGroupName = nf(addr.citem_get_item_group_name, 'int', ['pointer']);
  var _IsStackable = nf(addr.citem_is_stackable, 'int', ['pointer']);
  var _GetItemIndex = nf(addr.getitem_index, 'int', ['pointer']);
  var _GetStackableItemType = nf(addr.cstackableitem_get_item_type, 'int', ['pointer']);
  var _GetJewelTargetSocket = nf(addr.cstackableitem_get_jewel_target_socket, 'int', ['pointer']);

  // PVF 数据查询
  var _G_CDataManager = nf(addr.g_cdata_manager, 'pointer', []);
  var _FindItem = nf(addr.cdata_manager_find_item, 'pointer', ['pointer', 'int']);
  var _FindQuest = nf(addr.cdata_manager_find_quest, 'pointer', ['pointer', 'int']);

  // 获取装备品级
  function getRarity(item) {
    return _GetRarity(item);
  }

  // 获取装备可穿戴等级
  function getUsableLevel(item) {
    return _GetUsableLevel(item);
  }

  // 获取装备组名称
  function getItemGroupName(item) {
    return _GetItemGroupName(item);
  }

  // 判断道具是否为可堆叠（消耗品）类型
  function isStackable(item) {
    return _IsStackable(item);
  }

  // 从道具 PVF 数据中获取 item_id
  function getIndex(item) {
    return _GetItemIndex(item);
  }

  // 从 PVF 数据中查询道具
  function findItem(itemId) {
    return _FindItem(_G_CDataManager(), itemId);
  }

  // 从 PVF 数据中查询任务
  function findQuest(questId) {
    return _FindQuest(_G_CDataManager(), questId);
  }

  // 获取消耗品类型（20 = 徽章）
  function getStackableItemType(item) {
    return _GetStackableItemType(item);
  }

  // 获取徽章支持的镶嵌槽类型
  // 红=0x1, 黄=0x2, 绿=0x4, 蓝=0x8, 白金=0x10
  function getJewelTargetSocket(item) {
    return _GetJewelTargetSocket(item);
  }

  return {
    getRarity: getRarity,
    getUsableLevel: getUsableLevel,
    getItemGroupName: getItemGroupName,
    isStackable: isStackable,
    getIndex: getIndex,
    findItem: findItem,
    findQuest: findQuest,
    getStackableItemType: getStackableItemType,
    getJewelTargetSocket: getJewelTargetSocket,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createItemBinding = createItemBinding;
}
