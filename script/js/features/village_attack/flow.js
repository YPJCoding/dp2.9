// 怪物攻城活动流程控制
// 来源：从旧 frida.js start_villageattack / on_start_event_villageattack / event_villageattack_timer / on_end_event_villageattack 等迁移
// 用途：控制活动开启、计时、阶段流转、活动结束

function createVillageAttackFlow(ctx) {
  const st = globalThis.village_attack_state;
  const C = globalThis.VILLAGE_ATTACK_CONSTANTS;
  const notify = ctx.va_notify;
  const db = ctx.va_db;

  const _InterVillageAttackedStart = globalThis.nf(ctx.addresses.inter_village_attacked_start_dispatch, 'pointer', ['pointer', 'pointer', 'pointer']);
  const _OnDestroyVillageMonster = globalThis.nf(ctx.addresses.cvillagemonstermgr_on_destroy_village_monster, 'pointer', ['pointer', 'int']);
  const _GlobalVillageMonsterMgr = ctx.addresses.globaldata_villagemonstermgr;

  // 设置怪物攻城副本难度
  // 来源：从旧 frida.js set_villageattack_dungeon_difficult 迁移
  // 为什么直接写内存：难度值硬编码在代码段，hook 不掉，必须直接修改
  // 风险：地址偏移可能随版本变化
  function setDungeonDifficult(difficult) {
    Memory.protect(ctx.addresses.villageattack_dungeon_difficult, 4, 'rwx');
    ctx.addresses.villageattack_dungeon_difficult.writeInt(difficult);
  }

  // 开启怪物攻城活动（调用游戏原生函数）
  // 来源：从旧 frida.js start_villageattack 迁移
  function startGameEvent(totalTime, score, targetScore) {
    const a3 = Memory.alloc(100);
    a3.add(10).writeInt(totalTime);    // 活动剩余时间
    a3.add(14).writeInt(score);        // 当前频道 PT 点数
    a3.add(18).writeInt(targetScore);  // 成功防守所需点数
    _InterVillageAttackedStart(ptr(0), ptr(0), a3);
  }

  // 结束怪物攻城活动（销毁所有攻城怪物）
  // 来源：从旧 frida.js end_villageattack 迁移
  function endGameEvent() {
    _OnDestroyVillageMonster(_GlobalVillageMonsterMgr.readPointer(), 2);
  }

  // 开启活动（入口函数）
  // 来源：从旧 frida.js on_start_event_villageattack 迁移
  function onStart() {
    const curTime = ctx.time.getCurSec();
    // 重置活动状态
    st.reset(curTime);
    setDungeonDifficult(st.getDifficult());

    // 通知全服玩家活动开始并刷新城镇怪物
    startGameEvent(
      ctx.villageAttackConfig.total_time,
      st.getScore(),
      ctx.villageAttackConfig.target_score[2]
    );

    // 开启活动计时器（每 5 秒触发一次）
    ctx.timer.scheduleDelay(onTimer, null, 5000);

    // 世界广播活动开始
    notify.broadcastPhase();
  }

  // 活动计时器（每 5 秒触发一次）
  // 来源：从旧 frida.js event_villageattack_timer 迁移
  // 为什么每 5 秒：平衡实时性和性能开销
  // 为什么需要这个计时器：
  //   1. P2/P3 阶段 GBL 主教持续扣 PT
  //   2. P3 阶段世界 BOSS 自身回血
  //   3. 检测活动是否超时
  function onTimer() {
    if (st.getState() == C.STATE_END) {
      return;
    }

    // 活动结束检测
    const remainTime = st.getRemainTime(ctx.time.getCurSec(), ctx.villageAttackConfig.total_time);
    if (remainTime <= 0) {
      onEnd();
      return;
    }

    // 当前应扣除的 PT
    var damage = 0;

    // P2/P3 阶段 GBL 教主教扣 PT
    if ((st.getState() == C.STATE_P2) || (st.getState() == C.STATE_P3)) {
      for (var i = 0; i < st.getGblCnt(); ++i) {
        if (globalThis.getRandomInt(0, 100) < (4 + st.getDifficult())) {
          damage += 1;
        }
      }
    }

    // P3 阶段世界 BOSS 自身回血
    if (st.getState() == C.STATE_P3) {
      if (globalThis.getRandomInt(0, 100) < (6 + st.getDifficult())) {
        damage += 1;
      }
    }

    // 扣除 PT（不低于当前阶段最低值）
    if (damage > 0) {
      var currentScore = st.getScore() - damage;
      const minScore = ctx.villageAttackConfig.target_score[st.getState() - 1];
      if (currentScore < minScore) {
        currentScore = minScore;
      }
      st.setScore(currentScore);
      notify.updateScoreBroadcast();
    }

    // 重复触发计时器
    if (st.getState() != C.STATE_END) {
      ctx.timer.scheduleDelay(onTimer, null, 5000);
    }
  }

  // 活动结束
  // 来源：从旧 frida.js on_end_event_villageattack 迁移
  // 注意：结算逻辑不在 flow 中，由 settlement 模块负责
  function onEnd() {
    if (st.getState() == C.STATE_END) {
      return;
    }

    // 保存状态
    const wasDefendSuccess = st.getDefendSuccess();
    const wasState = st.getState();

    // 设置活动结束
    st.setState(C.STATE_END);
    endGameEvent();

    // 触发结算
    if (ctx.va_settlement) {
      ctx.va_settlement(onEnd);
    }

    // 持久化保存
    if (db) {
      db.save(st.getInfo());
    }

    // 重新启动定时器等待下一轮活动
    scheduleNextEvent();
  }

  // 安排下一轮活动
  // 来源：从旧 frida.js start_event_villageattack_timer 迁移
  function scheduleNextEvent() {
    const curTime = ctx.time.getCurSec();
    const startHour = ctx.villageAttackConfig.start_hour || C.DEFAULT_START_HOUR;
    // 计算距离下次开启的时间
    var delayTime = (3600 * startHour) - (curTime % (3600 * 24));
    if (delayTime <= 0) {
      delayTime += 3600 * 24;
    }

    if (ctx.log) ctx.log('[village_attack] next event in ' + (delayTime / 3600).toFixed(1) + ' hours');

    // 定时开启活动
    ctx.timer.scheduleDelay(onStart, null, delayTime * 1000);
  }

  // 初始化流程
  // 根据当前状态决定：恢复计时器 or 等待下一轮
  function initFlow() {
    if (st.getState() == C.STATE_END) {
      // 活动已结束，等待下一轮
      scheduleNextEvent();
    } else {
      // 活动进行中，恢复计时器
      ctx.timer.scheduleDelay(onTimer, null, 5000);
    }
  }

  return {
    onStart: onStart,
    onEnd: onEnd,
    initFlow: initFlow,
    setDungeonDifficult: setDungeonDifficult,
    startGameEvent: startGameEvent,
  };
}

RuntimeUtils.exposeGlobal('createVillageAttackFlow', createVillageAttackFlow);
