// 怪物攻城活动 Hook 集合
// 来源：从旧 frida.js hook_VillageAttack() 迁移（约 400 行 hook 代码）
// 用途：包含所有怪物攻城相关的 Interceptor.attach/replace
//
// 设计原则：
// 1. 所有 hook 使用 attachOnce/replaceOnce 防重复
// 2. 每个 hook 上方有中文注释说明原函数、作用、风险
// 3. hook 内尽量只做轻逻辑，复杂逻辑调用 flow/state/notify/reward
// 4. 所有 hook 内部有 try/catch 兜底，防止异常影响主流程
// 5. replace hook 异常时必须兜底调用原函数

function createVillageAttackHooks(ctx) {
  const st = globalThis.village_attack_state;
  const C = globalThis.VILLAGE_ATTACK_CONSTANTS;
  const notify = ctx.va_notify;
  const addr = ctx.addresses;

  // 辅助：获取队伍中所有在线玩家
  const _GetParty = globalThis.nf(addr.cuser_get_party, 'pointer', ['pointer']);
  const _GetPartyUser = globalThis.nf(addr.cparty_get_user, 'pointer', ['pointer', 'int']);

  // =====================================================
  // Hook 1: 攻城副本回调（队友击杀奖励）
  // =====================================================
  // 原函数：village_attacked::CVillageMonster::OnKillVillageMonster
  // 来源：从旧 frida.js hook_VillageAttack 第一个 hook 迁移
  // 用途：队友击杀攻城怪物后发放挑战次数对应奖励
  // Hook 点：onLeave retval==0 时发奖励
  // 风险：如果奖励发放逻辑变更，此处需要同步调整
  attachOnce('va_on_kill', addr.village_monster_on_kill, {
    onEnter: function (args) {
      this.user = args[1];
    },
    onLeave: function (retval) {
      try {
        if (retval == 0 && this.user.isNull() == false) {
          // 发放挑战次数对应奖励
          if (ctx.va_reward) {
            ctx.va_reward.sendChallengeReward(this.user);
          }
        }
      } catch (err) {
        if (ctx.log) ctx.log('[village_attack][va_on_kill] exception: ' + err);
      }
    }
  });

  // =====================================================
  // Hook 2: 挑战攻城怪物结果处理（阶段流转核心）
  // =====================================================
  // 原函数：village_attacked::CVillageMonster::SendVillageMonsterFightResult
  // 来源：从旧 frida.js hook_VillageAttack 第二个 hook 迁移
  // 用途：挑战结果处理，更新各阶段 PT、难度、状态
  // 为什么这个 hook 最复杂：所有阶段流转逻辑都在这里
  // 风险：阶段流转逻辑依赖很多全局状态，线程安全问题需关注
  attachOnce('va_fight_result', addr.village_monster_send_fight_result, {
    onEnter: function (args) {
      this.villageMonster = args[0];  // 当前挑战的攻城怪物对象
      this.user = args[1];            // 当前挑战的角色
      this.result = args[2].toInt32(); // 挑战结果: 1==成功
    },
    onLeave: function (retval) {
      try {
        // 只有挑战成功才处理
        if (this.result != 1) {
          return;
        }

        if (st.getState() == C.STATE_END) {
          return;
        }

        // 当前杀死的攻城怪物 ID
        const villageMonsterId = this.villageMonster.add(2).readUShort();
        // 当前阶段击杀每只攻城怪物 PT 点数奖励: (1, 2, 4, 8, 16)
        const bonusPt = Math.pow(2, st.getDifficult());

        // 获取玩家所在队伍
        const party = _GetParty(this.user);
        if (party.isNull()) {
          return;
        }

        // 更新队伍中的所有玩家 PT 点数
        for (var i = 0; i < 4; ++i) {
          var user = _GetPartyUser(party, i);
          if (!user.isNull()) {
            const characNo = ctx.user.getCurCharacNo(user).toString();
            // 记录角色 accid（方便离线充值）
            st.addUserPt(characNo, ctx.user.getAccId(user), bonusPt);

            // 击杀世界 BOSS 额外获得 PT 奖励
            if ((villageMonsterId == C.MONSTER_TAU_META_COW) && (st.getState() == C.STATE_P3)) {
              st.addUserPt(characNo, ctx.user.getAccId(user), 1000 * (1 + st.getDifficult()));
            }
          }
        }

        // ---- P1 阶段处理 ----
        if (st.getState() == C.STATE_P1) {
          st.addScore(bonusPt);

          if (st.getScore() < ctx.villageAttackConfig.target_score[0]) {
            // P1 未完成：击杀牛头统帅则难度 +1
            if (villageMonsterId == C.MONSTER_TAU_CAPTAIN) {
              if (st.getDifficult() < 4) {
                st.setDifficult(st.getDifficult() + 1);
                ctx.va_flow.setDungeonDifficult(st.getDifficult());
                st.setNextVillageMonsterId(C.MONSTER_TAU_CAPTAIN);
                notify.broadcastPhase();
              }
            }
          } else {
            // P1 完成 -> 进入 P2
            st.setState(C.STATE_P2);
            st.setScore(ctx.villageAttackConfig.target_score[0]);
            st.setP2LastKilledTime(0);
            st.setLastKilledMonsterId(0);
            st.setP2KillCombo(0);
            notify.broadcastPhase();
          }
        }
        // ---- P2 阶段处理 ----
        else if (st.getState() == C.STATE_P2) {
          const curTime = ctx.time.getCurSec();
          const diffTime = curTime - st.getP2LastKilledTime();

          // 1 分钟内连续击杀相同攻城怪物
          if ((diffTime < 60) && (villageMonsterId == st.getLastKilledMonsterId())) {
            st.setP2KillCombo(st.getP2KillCombo() + 1);
            if (st.getP2KillCombo() >= 3) {
              // 三连杀增加总 PT
              st.addScore(33);
              st.setLastKilledMonsterId(0);
              st.setP2KillCombo(0);
            }
          } else {
            st.setLastKilledMonsterId(villageMonsterId);
            st.setP2KillCombo(1);
          }
          st.setP2LastKilledTime(curTime);

          // P2 完成 -> 进入 P3
          if (st.getScore() >= ctx.villageAttackConfig.target_score[1]) {
            st.setState(C.STATE_P3);
            st.setScore(ctx.villageAttackConfig.target_score[1]);
            st.setNextVillageMonsterId(C.MONSTER_TAU_META_COW);
            notify.broadcastPhase();
          }
        }
        // ---- P3 阶段处理 ----
        else if (st.getState() == C.STATE_P3) {
          if (villageMonsterId == C.MONSTER_TAU_META_COW) {
            // 更新世界 BOSS 血量（PT）
            st.addScore(25);
            st.setNextVillageMonsterId(C.MONSTER_TAU_META_COW);

            // 世界广播：世界 BOSS 被击杀
            notify.broadcastMessage(
              '<怪物攻城活动> 世界BOSS已被【' + ctx.user.getCurCharacName(this.user) + '】击杀!'
            );

            // P3 完成 -> 防守成功
            if (st.getScore() >= ctx.villageAttackConfig.target_score[2]) {
              st.setDefendSuccess(1);
              // 在 dispatcher 线程结束活动
              ctx.timer.schedule(ctx.va_flow.onEnd, null);
              return;
            }
          }
        }

        // 世界广播当前进度
        notify.updateScoreBroadcast();

        // 通知队伍中的所有玩家更新 PT 点数
        for (var i = 0; i < 4; ++i) {
          var user = _GetPartyUser(party, i);
          if (!user.isNull()) {
            notify.notifyPlayerScore(user);
          }
        }

        // 更新存活 GBL 主教数量
        if (villageMonsterId == C.MONSTER_GBL_POPE) {
          if (st.getGblCnt() > 0) {
            st.setGblCnt(st.getGblCnt() - 1);
          }
        }
      } catch (err) {
        if (ctx.log) ctx.log('[village_attack][va_fight_result] exception: ' + err);
      }
    }
  });

  // =====================================================
  // Hook 3: 控制刷新攻城怪物
  // =====================================================
  // 原函数：village_attacked::CVillageMonsterArea::GetAttackedMonster
  // 来源：从旧 frida.js hook_VillageAttack 第三个 hook 迁移
  // 用途：控制下一只刷新的攻城怪物 ID
  // Hook 点：onLeave 修改刷新出来的怪物 ID
  // 为什么需要这个 hook：原游戏随机刷怪，需要改为按阶段刷特定怪物
  attachOnce('va_get_attacked_monster', addr.village_monster_area_get_attacked_monster, {
    onEnter: function (args) {},
    onLeave: function (retval) {
      try {
        if (retval == 0) {
          return;
        }

        const nextMonster = ptr(retval);
        const nextMonsterId = nextMonster.readUShort();

        // 当前刷新的怪物为机制怪物（牛头统帅或机械牛）
        // 替换为随机普通怪物，避免机制怪物被刷在错误阶段
        if ((nextMonsterId == C.MONSTER_TAU_META_COW) || (nextMonsterId == C.MONSTER_TAU_CAPTAIN)) {
          nextMonster.writeUShort(globalThis.getRandomInt(1, 17));
        }

        // 如果需要刷新指定怪物
        if (st.getNextVillageMonsterId()) {
          if ((st.getState() == C.STATE_P1) || (st.getState() == C.STATE_P2)) {
            // P1/P2 阶段立即刷新指定怪物
            nextMonster.writeUShort(st.getNextVillageMonsterId());
            st.setNextVillageMonsterId(0);
          } else if (st.getState() == C.STATE_P3) {
            // P3 阶段 44% 概率刷新出世界 BOSS
            // 为什么是 44%：来源旧 frida.js 的经验值，平衡了活动趣味性和难度
            if (globalThis.getRandomInt(0, 100) < 44) {
              nextMonster.writeUShort(st.getNextVillageMonsterId());
              st.setNextVillageMonsterId(0);
              notify.broadcastMessage('<怪物攻城活动> 世界BOSS已刷新, 请勇士们前往挑战!');
            }
          }
        }

        // 统计存活 GBL 主教数量
        if (nextMonster.readUShort() == C.MONSTER_GBL_POPE) {
          st.addGblCnt(1);
        }
      } catch (err) {
        if (ctx.log) ctx.log('[village_attack][va_get_attacked_monster] exception: ' + err);
      }
    }
  });

  // =====================================================
  // Hook 4 & 5: 挑战状态跟踪
  // =====================================================

  // 是否正在处理挑战请求
  var g_va_fighting_state = false;
  // 当前正在被挑战的怪物 ID
  var g_va_fighting_monster_id = 0;

  // Hook 4: CParty::OnFightVillageMonster
  // 来源：从旧 frida.js hook_VillageAttack 第四个 hook 迁移
  // 用途：标记正在挑战攻城怪物的状态
  attachOnce('va_on_fight_party', addr.cparty_on_fight_village_monster, {
    onEnter: function (args) {
      try {
        g_va_fighting_state = true;
        g_va_fighting_monster_id = 0;
      } catch (err) {
        if (ctx.log) ctx.log('[village_attack][va_on_fight_party] exception: ' + err);
      }
    },
    onLeave: function (retval) {
      try {
        g_va_fighting_monster_id = 0;
        g_va_fighting_state = false;
      } catch (err) {
        if (ctx.log) ctx.log('[village_attack][va_on_fight_party] onLeave exception: ' + err);
      }
    }
  });

  // Hook 5: village_attacked::CVillageMonster::OnFightVillageMonster
  // 来源：从旧 frida.js hook_VillageAttack 第五个 hook 迁移
  // 用途：记录当前正在挑战的攻城怪物 ID（用于副本内刷怪控制）
  attachOnce('va_on_fight_monster', addr.village_monster_on_fight, {
    onEnter: function (args) {
      try {
        if (g_va_fighting_state) {
          const villageMonster = args[0];
          g_va_fighting_monster_id = villageMonster.add(2).readU16();
        }
      } catch (err) {
        if (ctx.log) ctx.log('[village_attack][va_on_fight_monster] exception: ' + err);
      }
    },
    onLeave: function (retval) {}
  });

  // =====================================================
  // Hook 6: 副本刷怪控制（Replace - 最复杂的 hook）
  // =====================================================
  // 原函数：MapInfo::Add_Mob
  // 来源：从旧 frida.js MapInfo_Add_Mob replace hook 迁移
  // 用途：控制怪物攻城副本内怪物的数量、等级、类型
  // 为什么用 replace：需要完全控制刷怪流程
  // 为什么安全：只在怪物攻城进行且正在挑战时修改怪物属性
  // 为什么需要 try/catch 兜底原函数：
  //   此 hook 直接改写怪物对象内存，任何异常都可能导致
  //   整个副本刷怪流程崩溃。异常时必须回退到原函数
  // 风险：
  //   1. 直接修改怪物对象内存，如果结构体布局变化会导致崩溃
  //   2. 难度 3/4 额外刷怪逻辑涉及 index/uid 重新分配，需要确保唯一性
  const _OriginalAddMob = globalThis.nf(addr.mapinfo_add_mob, 'int', ['pointer', 'pointer']);

  replaceOnce('va_add_mob', addr.mapinfo_add_mob, function (mapInfo, monster) {
    try {
      // 只在怪物攻城状态中处理
      if (g_va_fighting_state && st.getState() != C.STATE_END) {
        // 正在挑战世界 BOSS 时副本内有几率刷出世界 BOSS
        if (g_va_fighting_monster_id == C.MONSTER_TAU_META_COW &&
            st.getState() == C.STATE_P3) {
          const p3Chance = (st.getScore() - ctx.villageAttackConfig.target_score[1]) + (6 * st.getDifficult());
          if (globalThis.getRandomInt(0, 100) < p3Chance) {
            monster.add(0xc).writeUInt(C.MONSTER_TAU_META_COW);
          }
        }

        const diff = st.getDifficult();

        if (diff == 0) {
          // 难度 0: 无变化
          return _OriginalAddMob(mapInfo, monster);
        } else if (diff == 1) {
          // 难度 1: 怪物等级提升至 100 级
          monster.add(16).writeU8(100);
          return _OriginalAddMob(mapInfo, monster);
        } else if (diff == 2) {
          // 难度 2: 怪物等级 110 级，50% 概率刷紫名怪
          monster.add(16).writeU8(110);
          if (monster.add(8).readU8() != 3) {
            if (globalThis.getRandomInt(0, 100) < 50) {
              monster.add(8).writeU8(1);
            }
          }
          return _OriginalAddMob(mapInfo, monster);
        } else if (diff == 3) {
          // 难度 3: 怪物等级 120 级，75% 刷粉名怪，怪物数量 *2
          monster.add(16).writeU8(120);
          if (monster.add(8).readU8() != 3) {
            if (globalThis.getRandomInt(0, 100) < 75) {
              monster.add(8).writeU8(2);
            }
          }
          _OriginalAddMob(mapInfo, monster);

          const uidOffset = 1000;
          monster.writeUInt(monster.readUInt() + uidOffset);
          monster.add(4).writeUInt(monster.add(4).readUInt() + uidOffset);
          return _OriginalAddMob(mapInfo, monster);
        } else if (diff == 4) {
          // 难度 4: 怪物等级 127 级，随机橙名怪，怪物数量 *4
          monster.add(16).writeU8(127);
          if (monster.add(8).readU8() != 3) {
            monster.add(8).writeU8(globalThis.getRandomInt(1, 3));
          }
          _OriginalAddMob(mapInfo, monster);

          const uidOffset2 = 1000;
          var ret = 0;
          for (var cnt = 3; cnt > 0; cnt--) {
            monster.writeUInt(monster.readUInt() + uidOffset2);
            monster.add(4).writeUInt(monster.add(4).readUInt() + uidOffset2);
            ret = _OriginalAddMob(mapInfo, monster);
          }
          return ret;
        }
      }

      // 非怪物攻城状态，执行原始刷怪逻辑
      return _OriginalAddMob(mapInfo, monster);
    } catch (err) {
      // 异常时兜底执行原函数，确保不阻断副本刷怪
      if (ctx.log) ctx.log('[village_attack][va_add_mob] exception, fallback to original: ' + err);
      return _OriginalAddMob(mapInfo, monster);
    }
  }, 'int', ['pointer', 'pointer']);

  // =====================================================
  // Hook 7: 通关额外经验奖励
  // =====================================================
  // 原函数：village_attacked::CVillageMonsterMgr::OnKillVillageMonster
  // 来源：从旧 frida.js hook_VillageAttack 最后一个 hook 迁移
  // 用途：挑战成功时给队伍所有成员发送额外经验奖励
  // Hook 点：onLeave retval==0 且 result==1 时发经验
  attachOnce('va_kill_village_monster', addr.villagemonstermgr_on_kill_village_monster, {
    onEnter: function (args) {
      this.user = args[1];
      this.result = args[2].toInt32();
    },
    onLeave: function (retval) {
      try {
        if (retval == 0 && this.result) {
          const party = _GetParty(this.user);

          // 给队伍所有成员发额外经验
          for (var i = 0; i < 4; ++i) {
            const user = _GetPartyUser(party, i);
            if (!user.isNull()) {
              const curLevel = ctx.user.getCharacLevel(user);
              // 随机经验奖励：当前等级升级所需经验的 0%-0.1%
              const rewardExp = Math.floor(
                ctx.user.getLevelUpExp(user, curLevel) * globalThis.getRandomInt(0, 1000) / 1000000
              );
              ctx.user.gainExpSp(user, rewardExp);
              ctx.user.sendNotiPacketMessage(user, '怪物攻城挑战成功, 获取额外经验奖励' + rewardExp, 0);
            }
          }
        }
      } catch (err) {
        if (ctx.log) ctx.log('[village_attack][va_kill_village_monster] exception: ' + err);
      }
    }
  });

  // 返回可被外部查询的状态变量
  return {
    isFighting: function () { return g_va_fighting_state; },
    fightingMonsterId: function () { return g_va_fighting_monster_id; },
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createVillageAttackHooks = createVillageAttackHooks;
}
