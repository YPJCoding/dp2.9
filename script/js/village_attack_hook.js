// 怪物攻城 hook 模块
//
// 迁移范围：
// - hook_VillageAttack()
//
// 说明：
// - 本模块保留旧 hook 业务语义，只增加重复安装保护。
// - PT 阶段转换、刷怪、结算触发、额外经验奖励仍保持旧逻辑。
// - 结束结算、奖励邮件和 DB 存档仍保留在 df_game_r.js。

var g_village_attack_hook_attached = false;

function villageAttackHookLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [village_attack_hook] ' + message);
  } catch (e) {
    console.log('[village_attack_hook] ' + message);
  }
}

function ensureVillageAttackHookDependencies() {
  try {
    if (typeof safeLoadModule === 'function') {
      safeLoadModule('village_attack_state');
      safeLoadModule('village_attack_notify');
      return true;
    }
    dp_load('village_attack_state');
    dp_load('village_attack_notify');
    return true;
  } catch (e) {
    villageAttackHookLog('load dependencies failed: ' + e.message);
    return false;
  }
}

// 怪物攻城活动相关 patch。
function hook_VillageAttack() {
  if (g_village_attack_hook_attached) {
    villageAttackHookLog('skip hook_VillageAttack: already attached');
    return false;
  }

  ensureVillageAttackHookDependencies();
  g_village_attack_hook_attached = true;

  try {
    // 怪物攻城副本回调。
    Interceptor.attach(ptr(0x086B34A0), {
      onEnter: function (args) {
        this.user = args[1];
      },
      onLeave: function (retval) {
        if (retval == 0 && this.user.isNull() == false) {
          VillageAttackedRewardSendReward(this.user);
        }
      }
    });

    // hook 挑战攻城怪物副本结束事件，更新怪物攻城活动各阶段状态。
    // village_attacked::CVillageMonster::SendVillageMonsterFightResult
    Interceptor.attach(ptr(0x086B330A), {
      onEnter: function (args) {
        this.village_monster = args[0];
        this.user = args[1];
        this.result = args[2].toInt32();
      },
      onLeave: function (retval) {
        if (this.result == 1) {
          if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_END) {
            return;
          }

          var village_monster_id = this.village_monster.add(2).readUShort();
          var bonus_pt = 2 ** villageAttackEventInfo.difficult;
          var party = CUser_GetParty(this.user);
          if (party.isNull()) {
            return;
          }

          for (var i = 0; i < 4; ++i) {
            var user = CParty_get_user(party, i);
            if (!user.isNull()) {
              var charac_no = CUserCharacInfo_getCurCharacNo(user).toString();
              if (!(charac_no in villageAttackEventInfo.user_pt_info)) {
                villageAttackEventInfo.user_pt_info[charac_no] = [CUser_get_acc_id(user), 0];
              }
              villageAttackEventInfo.user_pt_info[charac_no][1] += bonus_pt;

              if ((village_monster_id == TAU_META_COW_MONSTER_ID) && (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P3)) {
                villageAttackEventInfo.user_pt_info[charac_no][1] += 1000 * (1 + villageAttackEventInfo.difficult);
              }
            }
          }

          if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P1) {
            villageAttackEventInfo.score += bonus_pt;

            if (villageAttackEventInfo.score < EVENT_VILLAGEATTACK_TARGET_SCORE[0]) {
              if (village_monster_id == TAU_CAPTAIN_MONSTER_ID) {
                if (villageAttackEventInfo.difficult < 4) {
                  villageAttackEventInfo.difficult += 1;
                  set_villageattack_dungeon_difficult(villageAttackEventInfo.difficult);
                  villageAttackEventInfo.next_village_monster_id = TAU_CAPTAIN_MONSTER_ID;
                  event_villageattack_broadcast_difficulty();
                }
              }
            } else {
              villageAttackEventInfo.state = VILLAGEATTACK_STATE_P2;
              villageAttackEventInfo.score = EVENT_VILLAGEATTACK_TARGET_SCORE[0];
              villageAttackEventInfo.p2_last_killed_monster_time = 0;
              villageAttackEventInfo.last_killed_monster_id = 0;
              villageAttackEventInfo.p2_kill_combo = 0;
              event_villageattack_broadcast_difficulty();
            }
          } else if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P2) {
            var cur_time = api_CSystemTime_getCurSec();
            var diff_time = cur_time - villageAttackEventInfo.p2_last_killed_monster_time;

            if ((diff_time < 60) && (village_monster_id == villageAttackEventInfo.last_killed_monster_id)) {
              villageAttackEventInfo.p2_kill_combo += 1;
              if (villageAttackEventInfo.p2_kill_combo >= 3) {
                villageAttackEventInfo.score += 33;
                villageAttackEventInfo.last_killed_monster_id = 0;
                villageAttackEventInfo.p2_kill_combo = 0;
              }
            } else {
              villageAttackEventInfo.last_killed_monster_id = village_monster_id;
              villageAttackEventInfo.p2_kill_combo = 1;
            }

            villageAttackEventInfo.p2_last_killed_monster_time = cur_time;

            if (villageAttackEventInfo.score >= EVENT_VILLAGEATTACK_TARGET_SCORE[1]) {
              villageAttackEventInfo.state = VILLAGEATTACK_STATE_P3;
              villageAttackEventInfo.score = EVENT_VILLAGEATTACK_TARGET_SCORE[1];
              villageAttackEventInfo.next_village_monster_id = TAU_META_COW_MONSTER_ID;
              event_villageattack_broadcast_difficulty();
            }
          } else if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P3) {
            if (village_monster_id == TAU_META_COW_MONSTER_ID) {
              villageAttackEventInfo.score += 25;
              villageAttackEventInfo.next_village_monster_id = TAU_META_COW_MONSTER_ID;
              api_GameWorld_SendNotiPacketMessage('<怪物攻城活动> 世界BOSS已被[' + api_CUserCharacInfo_getCurCharacName(this.user) + ']击杀!', 14);

              if (villageAttackEventInfo.score >= EVENT_VILLAGEATTACK_TARGET_SCORE[2]) {
                villageAttackEventInfo.defend_success = 1;
                api_scheduleOnMainThread(on_end_event_villageattack, null);
                return;
              }
            }
          }

          gameworld_update_villageattack_score();

          for (var j = 0; j < 4; ++j) {
            var party_user = CParty_get_user(party, j);
            if (!party_user.isNull()) {
              notify_villageattack_score(party_user);
            }
          }

          if (village_monster_id == GBL_POPE_MONSTER_ID) {
            if (villageAttackEventInfo.gbl_cnt > 0) {
              villageAttackEventInfo.gbl_cnt -= 1;
            }
          }
        }
      }
    });

    // hook 刷新攻城怪物函数，控制下一只刷新的攻城怪物 id。
    // village_attacked::CVillageMonsterArea::GetAttackedMonster
    Interceptor.attach(ptr(0x086B3AEA), {
      onEnter: function (args) {},
      onLeave: function (retval) {
        if (retval != 0) {
          var next_village_monster = ptr(retval);
          var next_village_monster_id = next_village_monster.readUShort();

          if ((next_village_monster_id == TAU_META_COW_MONSTER_ID) || (next_village_monster_id == TAU_CAPTAIN_MONSTER_ID)) {
            next_village_monster.writeUShort(get_random_int(1, 17));
          }

          if (villageAttackEventInfo.next_village_monster_id) {
            if ((villageAttackEventInfo.state == VILLAGEATTACK_STATE_P1) || (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P2)) {
              next_village_monster.writeUShort(villageAttackEventInfo.next_village_monster_id);
              villageAttackEventInfo.next_village_monster_id = 0;
            } else if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P3) {
              if (get_random_int(0, 100) < 44) {
                next_village_monster.writeUShort(villageAttackEventInfo.next_village_monster_id);
                villageAttackEventInfo.next_village_monster_id = 0;
                api_GameWorld_SendNotiPacketMessage('<怪物攻城活动> 世界BOSS已刷新, 请勇士们前往挑战!', 14);
              }
            }
          }

          if (next_village_monster.readUShort() == GBL_POPE_MONSTER_ID) {
            villageAttackEventInfo.gbl_cnt += 1;
          }
        }
      }
    });

    var state_on_fighting = false;
    var on_fighting_village_monster_id = 0;

    // hook 挑战攻城怪物函数，控制副本刷怪流程。
    // CParty::OnFightVillageMonster
    Interceptor.attach(ptr(0x085B9596), {
      onEnter: function (args) {
        state_on_fighting = true;
        on_fighting_village_monster_id = 0;
      },
      onLeave: function (retval) {
        on_fighting_village_monster_id = 0;
        state_on_fighting = false;
      }
    });

    // village_attacked::CVillageMonster::OnFightVillageMonster
    Interceptor.attach(ptr(0x086B3240), {
      onEnter: function (args) {
        if (state_on_fighting) {
          var village_monster = args[0];
          on_fighting_village_monster_id = village_monster.add(2).readU16();
        }
      },
      onLeave: function (retval) {}
    });

    // hook 副本刷怪函数，控制副本内怪物的数量和属性。
    // MapInfo::Add_Mob
    var read_f = new NativeFunction(ptr(0x08151612), 'int', ['pointer', 'pointer'], { "abi": "sysv" });
    Interceptor.replace(ptr(0x08151612), new NativeCallback(function (map_info, monster) {
      if (state_on_fighting) {
        if (villageAttackEventInfo != VILLAGEATTACK_STATE_END) {
          if (on_fighting_village_monster_id == TAU_META_COW_MONSTER_ID) {
            if (villageAttackEventInfo.state == VILLAGEATTACK_STATE_P3) {
              if (get_random_int(0, 100) < ((villageAttackEventInfo.score - EVENT_VILLAGEATTACK_TARGET_SCORE[1]) + (6 * villageAttackEventInfo.difficult))) {
                monster.add(0xc).writeUInt(TAU_META_COW_MONSTER_ID);
              }
            }
          }

          if (villageAttackEventInfo.difficult == 0) {
            return read_f(map_info, monster);
          } else if (villageAttackEventInfo.difficult == 1) {
            monster.add(16).writeU8(100);
            return read_f(map_info, monster);
          } else if (villageAttackEventInfo.difficult == 2) {
            monster.add(16).writeU8(110);
            if (monster.add(8).readU8() != 3) {
              if (get_random_int(0, 100) < 50) {
                monster.add(8).writeU8(1);
              }
            }
            return read_f(map_info, monster);
          } else if (villageAttackEventInfo.difficult == 3) {
            monster.add(16).writeU8(120);
            if (monster.add(8).readU8() != 3) {
              if (get_random_int(0, 100) < 75) {
                monster.add(8).writeU8(2);
              }
            }
            read_f(map_info, monster);
            var cnt = 1;
            var uid_offset = 1000;
            var ret = 0;
            while (cnt > 0) {
              --cnt;
              monster.writeUInt(monster.readUInt() + uid_offset);
              monster.add(4).writeUInt(monster.add(4).readUInt() + uid_offset);
              ret = read_f(map_info, monster);
            }
            return ret;
          } else if (villageAttackEventInfo.difficult == 4) {
            monster.add(16).writeU8(127);
            if (monster.add(8).readU8() != 3) {
              monster.add(8).writeU8(get_random_int(1, 3));
            }
            read_f(map_info, monster);
            var cnt2 = 3;
            var uid_offset2 = 1000;
            var ret2 = 0;
            while (cnt2 > 0) {
              --cnt2;
              monster.writeUInt(monster.readUInt() + uid_offset2);
              monster.add(4).writeUInt(monster.add(4).readUInt() + uid_offset2);
              ret2 = read_f(map_info, monster);
            }
            return ret2;
          }
        }
      }
      return read_f(map_info, monster);
    }, 'int', ['pointer', 'pointer']));

    // 每次通关额外获取当前等级升级所需经验的 0%-0.1%。
    // village_attacked::CVillageMonsterMgr::OnKillVillageMonster
    Interceptor.attach(ptr(0x086B4866), {
      onEnter: function (args) {
        this.user = args[1];
        this.result = args[2].toInt32();
      },
      onLeave: function (retval) {
        if (retval == 0) {
          if (this.result) {
            var party = CUser_GetParty(this.user);
            for (var i = 0; i < 4; ++i) {
              var user = CParty_get_user(party, i);
              if (!user.isNull()) {
                var cur_level = CUserCharacInfo_get_charac_level(user);
                var reward_exp = Math.floor(CUserCharacInfo_get_level_up_exp(user, cur_level) * get_random_int(0, 1000) / 1000000);
                api_CUser_gain_exp_sp(user, reward_exp);
                api_CUser_SendNotiPacketMessage(user, '怪物攻城挑战成功, 获取额外经验奖励' + reward_exp, 0);
              }
            }
          }
        }
      }
    });

    villageAttackHookLog('hook_VillageAttack attached');
    return true;
  } catch (e) {
    g_village_attack_hook_attached = false;
    villageAttackHookLog('hook_VillageAttack failed: ' + e.message);
    return false;
  }
}

villageAttackHookLog('hook module loaded');
