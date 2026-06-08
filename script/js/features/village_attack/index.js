// 怪物攻城活动入口模块
// 来源：从旧 frida.js start_event_villageattack() 迁移
// 用途：启动怪物攻城功能的所有子模块
//
// 启动顺序：
// 1. constants.js（已经通过 globalThis 加载）
// 2. state.js（活动状态管理）
// 3. db.js（数据库持久化）
// 4. notify.js（通知系统）
// 5. flow.js（流程控制）
// 6. hooks.js（hook 注册）
// 7. reward.js（奖励发放）
// 8. settlement.js（结算）

var g_village_attack_started = false;

function startVillageAttackFeature(ctx) {
  if (g_village_attack_started) {
    console.log('[village_attack] already started');
    return;
  }

  try {
    // 配置覆盖默认值
    ctx.villageAttackConfig = {
      start_hour: ctx.config.village_attack.start_hour || 12,
      total_time: ctx.config.village_attack.total_time || 3600,
      target_score: ctx.config.village_attack.target_score || [100, 200, 300],
    };

    // 需要传递给 flow/reward 的配置通过 ctx 传递
    // state 和 constants 已经通过 globalThis 全局可用

    // 初始化数据库模块
    var vaDb = globalThis.createVillageAttackDb(ctx.msql);
    ctx.va_db = vaDb;

    // 从数据库加载活动状态
    var savedInfo = vaDb.load();
    if (savedInfo) {
      globalThis.village_attack_state.setInfo(savedInfo);
    }

    // 初始化通知模块
    ctx.va_notify = globalThis.createVillageAttackNotify(ctx);

    // 初始化流程模块（先创建，因为 hooks 和 settlement 需要引用它）
    var vaFlow = globalThis.createVillageAttackFlow(ctx);
    ctx.va_flow = vaFlow;

    // 初始化奖励模块
    ctx.va_reward = globalThis.createVillageAttackReward(ctx);

    // 初始化结算模块
    var vaSettlement = globalThis.createVillageAttackSettlement(ctx);
    ctx.va_settlement = vaSettlement.settle;

    // 根据角色 charac_no 查询角色名（结算时广播用）
    ctx.va_getCharacNameByNo = function (characNo) {
      // 从数据库查询角色名
      // 风险：直接拼接 SQL，characNo 为数字类型是安全的
      var msql = ctx.msql;
      if (msql.exec("select charac_name from charac_info where charac_no=" + characNo + ";")) {
        if (msql.getNRows() == 1) {
          msql.fetch();
          var name = msql.getStr(0);
          if (name) {
            return name;
          }
        }
      }
      return characNo.toString();
    };

    // 注册所有 hook（这是启动的关键步骤）
    globalThis.createVillageAttackHooks(ctx);

    // 启动活动流程（恢复计时器 or 等待下一轮）
    vaFlow.initFlow();

    g_village_attack_started = true;
    if (ctx.log) ctx.log('[village_attack] started');
  } catch (err) {
    if (ctx.log) ctx.log('[village_attack] failed: ' + err);
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.startVillageAttackFeature = startVillageAttackFeature;
}
