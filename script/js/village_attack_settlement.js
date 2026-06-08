// 怪物攻城结束与结算模块
//
// 迁移范围：
// - end_villageattack()
// - on_end_event_villageattack()
//
// 说明：
// - 保留旧奖励、点券、装备强化、失败惩罚逻辑，不调整数值和规则。
// - DB save/load 仍保留在 df_game_r.js；本模块继续调用 event_villageattack_save_to_db()。
// - NativeFunction 声明仍保留在 df_game_r.js。

function villageAttackSettlementLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [village_attack_settlement] ' + message);
  } catch (e) {
    console.log('[village_attack_settlement] ' + message);
  }
}

function ensureVillageAttackSettlementStateModule() {
  try {
    if (typeof safeLoadModule === 'function') {
      return safeLoadModule('village_attack_state');
    }
    dp_load('village_attack_state');
    return true;
  } catch (e) {
    villageAttackSettlementLog('load village_attack_state failed: ' + e.message);
    return false;
  }
}

// 结束怪物攻城活动：立即销毁攻城怪物，不开启逆袭之谷，不发送活动奖励。
function end_villageattack() {
  village_attacked_CVillageMonsterMgr_OnDestroyVillageMonster(GlobalData_s_villageMonsterMgr.readPointer(), 2);
}

// 结束怪物攻城活动。
function on_end_event_villageattack() {
  ensureVillageAttackEventInfo();

  if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_END) {
    return;
  }

  villageAttackEventInfo.state = VILLAGEATTACK_STATE_END;
  end_villageattack();

  if (villageAttackEventInfo.defend_success) {
    // 频道内在线玩家发奖：金币 + 道具。
    var reward_gold = 1000000 * (1 + villageAttackEventInfo.difficult);
    var reward_item_list = [
      [7745, 5 * (1 + villageAttackEventInfo.difficult)],
      [2600028, 5 * (1 + villageAttackEventInfo.difficult)],
      [42, 5 * (1 + villageAttackEventInfo.difficult)],
      [3314, 1 + villageAttackEventInfo.difficult],
    ];
    api_gameworld_send_mail('<怪物攻城活动>', '恭喜勇士!', reward_gold, reward_item_list);

    // 特殊奖励。
    api_gameworld_foreach(function (user, args) {
      api_TOD_UserState_setEnterLayer(user, 99);

      var inven = CUserCharacInfo_getCurCharacInvenW(user);
      var slot = get_random_int(10, 21);
      var equ = CInventory_GetInvenRef(inven, INVENTORY_TYPE_BODY, slot);
      if (Inven_Item_getKey(equ)) {
        var upgrade_level = equ.add(6).readU8();
        if (upgrade_level < 31) {
          var bonus_level = get_random_int(1, 1 + villageAttackEventInfo.difficult);
          upgrade_level += bonus_level;
          if (upgrade_level >= 31) {
            upgrade_level = 31;
          }
          equ.add(6).writeU8(upgrade_level);
          CUser_SendUpdateItemList(user, 1, 3, slot);
        }
      }
    }, null);

    var rank_first_charac_no = 0;
    var rank_first_account_id = 0;
    var max_pt = 0;

    // 论功行赏。
    for (var charac_no in villageAttackEventInfo.user_pt_info) {
      var account_id = villageAttackEventInfo.user_pt_info[charac_no][0];
      var pt = villageAttackEventInfo.user_pt_info[charac_no][1];
      var reward_cera = pt * 10;
      var user_pr = GameWorld_find_user_from_world_byaccid(G_GameWorld(), account_id);
      api_recharge_cash_cera(user_pr, reward_cera);

      if (pt > max_pt) {
        rank_first_charac_no = charac_no;
        rank_first_account_id = account_id;
        max_pt = pt;
      }
    }

    api_GameWorld_SendNotiPacketMessage('<怪物攻城活动> 防守成功, 奖励已发送!', 14);

    if (rank_first_charac_no) {
      var rank_first_user_pr = GameWorld_find_user_from_world_byaccid(G_GameWorld(), rank_first_account_id);
      api_recharge_cash_cera(rank_first_user_pr, max_pt * 10);

      var rank_first_charac_name = api_get_charac_name_by_charac_no(rank_first_charac_no);
      api_GameWorld_SendNotiPacketMessage('<怪物攻城活动> 恭喜勇士 [' + rank_first_charac_name + '] 成为个人积分排行榜第一名(' + max_pt + 'pt)!', 14);
    }
  } else {
    // 防守失败。
    api_gameworld_foreach(function (user, args) {
      var inven = CUserCharacInfo_getCurCharacInvenW(user);

      if (get_random_int(0, 100) < 7) {
        var slot = get_random_int(10, 21);
        var equ = CInventory_GetInvenRef(inven, INVENTORY_TYPE_BODY, slot);
        if (Inven_Item_getKey(equ)) {
          Inven_Item_reset(equ);
          CUser_SendNotiPacket(user, 1, 2, 3);
        }
      }

      var rate = get_random_int(1, 11);
      var cur_gold = CInventory_get_money(inven);
      var tax = Math.floor((rate / 100) * cur_gold);
      CInventory_use_money(inven, tax, 0, 0);
      CUser_SendUpdateItemList(user, 1, 0, 0);
    }, null);

    api_GameWorld_SendNotiPacketMessage('<怪物攻城活动> 防守失败, 请勇士们再接再厉!', 14);
  }

  villageAttackEventInfo.user_pt_info = {};
  event_villageattack_save_to_db();
  start_event_villageattack_timer();
}

ensureVillageAttackSettlementStateModule();
villageAttackSettlementLog('settlement helpers loaded');
