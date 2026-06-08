// 魔法封印 / 随机属性相关功能（来源：dp2/frida.js / dp2.9/df_game_r.js）
//
// 包含：
// - 随机属性转换继承 change_random_option_inherit()
// - 自动解封魔法封印装备 auto_unseal_random_option_equipment()
//
// 说明：
// - 两个功能都属于装备成长/经济相关能力，默认由 js_features 控制关闭。
// - 本模块保留旧入口名，并增加重复 hook 保护，避免入口重复启动导致多次 attach。

var g_random_option_inherit_started = false;
var g_auto_unseal_random_option_started = false;

function randomOptionLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [random_option] ' + message);
  } catch (e) {
    console.log('[random_option] ' + message);
  }
}

// 增加魔法封印装备的魔法封印等级。
function boostRandomOptionEquip(invenItem) {
  if (Inven_Item_isEmpty(invenItem)) {
    return false;
  }

  const randomOption = invenItem.add(37);
  const randomOptionSlot = get_random_int(0, 3);

  if (randomOption.add(3 * randomOptionSlot).readU8()) {
    const valueSlot = get_random_int(1, 3);
    const randomOptionLevel = randomOption.add(3 * randomOptionSlot + valueSlot).readU8();
    if (randomOptionLevel < 0xFF) {
      if (get_random_int(randomOptionLevel, 100000) < 1000) {
        randomOption.add(3 * randomOptionSlot + valueSlot).writeU8(randomOptionLevel + 1);
        return true;
      }
    }
  }

  return false;
}

function boostRandomOptionEquipped(user) {
  const inven = CUserCharacInfo_getCurCharacInvenW(user);
  for (var slot = 10; slot <= 21; slot++) {
    const invenItem = CInventory_GetInvenRef(inven, INVENTORY_TYPE_BODY, slot);
    if (boostRandomOptionEquip(invenItem)) {
      CUser_SendUpdateItemList(user, 1, 3, slot);
    }
  }
}

// 兼容旧命名。
function _boost_random_option_equ(inven_item) {
  return boostRandomOptionEquip(inven_item);
}

function boost_random_option_equ(user) {
  return boostRandomOptionEquipped(user);
}

// 魔法封印属性转换时可以继承。
function startRandomOptionInherit() {
  if (g_random_option_inherit_started) {
    randomOptionLog('random option inherit already started');
    return;
  }

  Interceptor.attach(ptr(0x85F3340), {
    onEnter: function (args) {
      this.random_option = args[7];
      this.change_random_option_index = args[6].toInt32();
      this.random_option_type = this.random_option.add(3 * this.change_random_option_index).readU8();
      this.random_option_value_1 = this.random_option.add(3 * this.change_random_option_index + 1).readU8();
      this.random_option_value_2 = this.random_option.add(3 * this.change_random_option_index + 2).readU8();
    },
    onLeave: function (retval) {
      if (retval != 1) {
        return;
      }

      var index = -1;
      if (this.random_option.add(0).readU8() === 0) {
        index = 0;
      } else if (this.random_option.add(3).readU8() === 0) {
        index = 1;
      } else if (this.random_option.add(6).readU8() === 0) {
        index = 2;
      }

      if (index >= 0) {
        if ((this.random_option.add(11).readU8() <= 5) && (this.random_option.add(12).readU8() <= 5)) {
          this.random_option.add(3 * index).writeU8(this.random_option.add(10).readU8());
          this.random_option.add(3 * index + 1).writeU8(this.random_option.add(11).readU8());
          this.random_option.add(3 * index + 2).writeU8(this.random_option.add(12).readU8());
          this.random_option.add(10).writeInt(0);
          return;
        }
      }

      this.random_option.add(3 * this.change_random_option_index).writeU8(this.random_option.add(10).readU8());
      if (this.random_option.add(11).readU8() > this.random_option_value_1) {
        this.random_option.add(3 * this.change_random_option_index + 1).writeU8(this.random_option.add(11).readU8());
      }
      if (this.random_option.add(12).readU8() > this.random_option_value_2) {
        this.random_option.add(3 * this.change_random_option_index + 2).writeU8(this.random_option.add(12).readU8());
      }
      this.random_option.add(10).writeInt(0);
    }
  });

  g_random_option_inherit_started = true;
  randomOptionLog('random option inherit started');
}

// 兼容旧入口命名。
function change_random_option_inherit() {
  return startRandomOptionInherit();
}

function startAutoUnsealRandomOptionEquipment() {
  if (g_auto_unseal_random_option_started) {
    randomOptionLog('auto unseal already started');
    return;
  }

  Interceptor.attach(ptr(0x8502D86), {
    onEnter: function (args) {
      this.user = args[0].readPointer();
    },
    onLeave: function (retval) {
      const slot = retval.toInt32();
      if (slot <= 0) {
        return;
      }

      try {
        const user = this.user;
        const inven = CUserCharacInfo_getCurCharacInvenW(user);
        const invenItem = CInventory_GetInvenRef(inven, INVENTORY_TYPE_ITEM, slot);
        if (!Inven_Item_isEquipableItemType(invenItem)) {
          return;
        }

        const itemId = Inven_Item_getKey(invenItem);
        const citem = CDataManager_find_item(G_CDataManager(), itemId);
        if (!CEquipItem_IsRandomOption(citem)) {
          return;
        }

        const randomOption = invenItem.add(37);
        if (randomOption.readU32() || randomOption.add(4).readU32() || randomOption.add(8).readShort()) {
          return;
        }

        const ret = random_option_CRandomOptionItemHandle_give_option(
          ptr(0x941F820).readPointer(),
          itemId,
          CItem_get_rarity(citem),
          CItem_getUsableLevel(citem),
          CItem_getItemGroupName(citem),
          CEquipItem_GetRandomOptionGrade(citem),
          invenItem.add(37)
        );

        if (ret) {
          CUser_SendUpdateItemList(user, 1, 0, slot);
        }
      } catch (e) {
        randomOptionLog('auto unseal failed: ' + e.message);
      }
    }
  });

  g_auto_unseal_random_option_started = true;
  randomOptionLog('auto unseal started');
}

// 兼容旧入口命名。
function auto_unseal_random_option_equipment(user) {
  return startAutoUnsealRandomOptionEquipment(user);
}
