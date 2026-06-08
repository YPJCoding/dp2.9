// 模块启动调度中心
// 来源：从旧 frida.js start() 迁移并重构
// 用途：按配置和顺序启动所有 JS 模块
//
// 启动顺序推荐（来源：模块依赖关系）：
// 1. Logger/Config（任何模块都依赖日志和配置）
// 2. Runtime Addresses（bindings 依赖地址）
// 3. Native Bindings（所有功能模块依赖 binding）
// 4. Timer Dispatcher（异步任务调度必须最先启动）
// 5. Database（排行榜和怪物攻城需要 DB）
// 6. 基础 Patch 类（tod_fix, emblem_fix, hidden_option, return_user）
// 7. 事件类（user_inout, ranking）
// 8. 大型活动（village_attack）
// 9. 可选模块（online_reward）

var g_runtime_modules_started = false;

function startRuntimeModules() {
  if (g_runtime_modules_started) {
    console.log('[startup] runtime modules already started');
    return;
  }

  console.log('==================== frida runtime start ====================');

  var addr = globalThis.PROJECT_ADDRESSES;
  var cfg = globalThis.PROJECT_JS_CONFIG;
  var helpers = globalThis.createStartupHelpers(addr);

  helpers.logStartup('initializing runtime...');

  // ---- 第 1 步：Logger ----
  helpers.logModuleStart('logger');
  var logger;
  try {
    logger = globalThis.createLogger({ getChannelName: helpers.getChannelName });
    helpers.logModuleDone('logger');
  } catch (err) {
    helpers.logModuleFailed('logger', err);
    logger = { log: console.log, getTimestamp: function () { return ''; } };
  }

  // ---- 第 2 步：Config（已由文件加载到 globalThis，此处做校验） ----
  helpers.logModuleStart('config');
  if (!cfg || !cfg.features) {
    helpers.logModuleFailed('config', 'PROJECT_JS_CONFIG not found');
    return;
  }
  helpers.logModuleDone('config');

  // ---- 第 3 步：Time Module ----
  helpers.logModuleStart('time');
  var timeMod;
  try {
    timeMod = globalThis.createTimeModule({
      system_time: addr.globaldata_system_time,
    });
    helpers.logModuleDone('time');
  } catch (err) {
    helpers.logModuleFailed('time', err);
    timeMod = { getCurSec: function () { return 0; } };
  }

  // ---- 第 4 步：Native Bindings ----
  helpers.logModuleStart('bindings');

  var packetBind, mysqlBind, userBind, inventoryBind, itemBind, mailBind, gwBind, timerBind, questBind;

  try {
    packetBind = globalThis.createPacketBinding(addr);
    helpers.logModuleDone('packet binding');
  } catch (err) { helpers.logModuleFailed('packet binding', err); packetBind = null; }

  try {
    mysqlBind = globalThis.createMysqlBinding(addr);
    helpers.logModuleDone('mysql binding');
  } catch (err) { helpers.logModuleFailed('mysql binding', err); mysqlBind = null; }

  try {
    userBind = globalThis.createUserBinding(addr);
    helpers.logModuleDone('user binding');
  } catch (err) { helpers.logModuleFailed('user binding', err); userBind = null; }

  try {
    inventoryBind = globalThis.createInventoryBinding(addr);
    helpers.logModuleDone('inventory binding');
  } catch (err) { helpers.logModuleFailed('inventory binding', err); inventoryBind = null; }

  try {
    itemBind = globalThis.createItemBinding(addr);
    helpers.logModuleDone('item binding');
  } catch (err) { helpers.logModuleFailed('item binding', err); itemBind = null; }

  try {
    mailBind = globalThis.createMailBinding(addr);
    helpers.logModuleDone('mail binding');
  } catch (err) { helpers.logModuleFailed('mail binding', err); mailBind = null; }

  try {
    gwBind = globalThis.createGameWorldBinding(addr);
    helpers.logModuleDone('game_world binding');
  } catch (err) { helpers.logModuleFailed('game_world binding', err); gwBind = null; }

  try {
    timerBind = globalThis.createTimerDispatcherBinding(addr);
    helpers.logModuleDone('timer_dispatcher binding');
  } catch (err) { helpers.logModuleFailed('timer_dispatcher binding', err); timerBind = null; }

  try {
    questBind = globalThis.createQuestBinding(addr);
    helpers.logModuleDone('quest binding');
  } catch (err) { helpers.logModuleFailed('quest binding', err); questBind = null; }

  // ---- 构建 ctx 对象（模块之间通过 ctx 通信） ----
  //
  // 数据库上下文说明：
  //   ctx.mysql    = MySQL binding 本身（用于 open/close 等操作）
  //   ctx.db       = 原始数据库句柄集合 { taiwanCain, taiwanCain2nd, taiwanBilling, frida }
  //   ctx.fridaDb  = 绑定 frida 句柄的便捷 DB 对象（用于 exec/fetch/getStr 等）
  //
  // 日志上下文说明：
  //   ctx.logger   = logger 完整对象（有 .log() 和 .getTimestamp()）
  //   ctx.log      = 便捷日志函数 logger.log(msg)
  var ctx = {
    addresses: addr,
    config: cfg,
    logger: logger,
    log: function (msg) {
      logger.log(msg);
    },
    time: timeMod,
    packet: packetBind,
    mysql: mysqlBind,     // MySQL binding（底层 API: exec(handle, sql), close(handle) 等）
    db: null,             // 原始数据库句柄集合，数据库初始化后填充
    fridaDb: null,        // 绑定 frida 句柄的便捷 DB 对象，数据库初始化后填充
    user: userBind,
    inventory: inventoryBind,
    item: itemBind,
    mail: mailBind,
    gw: gwBind,
    timer: timerBind,
    quest: questBind,
  };

  // ---- 第 5 步：Timer Dispatcher ----
  // 为什么必须第一个：所有异步任务都需要在 dispatcher 线程执行
  if (cfg.features.timer_dispatcher) {
    helpers.logModuleStart('timer_dispatcher');
    try {
      // 挂接消息分发线程，确保代码线程安全
      // 来源：从旧 frida.js hook_TimerDispatcher_dispatch 迁移
      attachOnce('timer_dispatcher', addr.timer_dispatcher_dispatch, {
        onEnter: function (args) {},
        onLeave: function (retval) {
          if (timerBind) {
            timerBind.dispatch();
          }
        }
      });
      helpers.logModuleDone('timer_dispatcher');
    } catch (err) {
      helpers.logModuleFailed('timer_dispatcher', err);
    }
  }

  // ---- 第 6 步：Database 初始化 ----
  // 来源：从旧 frida.js init_db 迁移
  var dbInitialized = false;
  if (cfg.features.database) {
    helpers.logModuleStart('database');
    try {
      // 加载本地配置文件（数据库连接信息）
      var fileMod = globalThis.createFileModule();
      var globalConfig = fileMod.loadConfig('frida_config.json');

      if (!globalConfig) {
        // 配置文件读取失败，无法获取数据库账号
        console.log('[database] frida_config.json 读取失败，数据库账号为空，跳过数据库初始化');
      } else {
        var dbConfig = globalConfig['db_config'] || {};

        if (!dbConfig['account'] || !dbConfig['password']) {
          console.log('[database] frida_config.json 中 db_config.account/password 为空，跳过数据库初始化');
        } else if (mysqlBind) {
          // 初始化数据库连接
          // 风险：数据库连接信息使用 localhost:3306，生产环境需从配置读取
          var mysqlTaiwanCain = mysqlBind.open('taiwan_cain', '127.0.0.1', 3306, dbConfig['account'], dbConfig['password']);
          var mysqlTaiwanCain2nd = mysqlBind.open('taiwan_cain_2nd', '127.0.0.1', 3306, dbConfig['account'], dbConfig['password']);
          var mysqlTaiwanBilling = mysqlBind.open('taiwan_billing', '127.0.0.1', 3306, dbConfig['account'], dbConfig['password']);

          // 建库 frida
          if (mysqlTaiwanCain) {
            mysqlBind.exec(mysqlTaiwanCain, 'create database if not exists frida default charset utf8;');
          }

          var mysqlFrida = mysqlBind.open('frida', '127.0.0.1', 3306, dbConfig['account'], dbConfig['password']);

          if (mysqlFrida) {
            // 建表 game_event（存储活动数据和排行榜）
            mysqlBind.exec(mysqlFrida,
              'CREATE TABLE game_event (' +
              'event_id varchar(30) NOT NULL, event_info mediumtext NULL,' +
              'PRIMARY KEY (event_id)' +
              ') ENGINE=InnoDB DEFAULT CHARSET=utf8;'
            );

            // 保存数据库句柄集合
            ctx.db = {
              taiwanCain: mysqlTaiwanCain,
              taiwanCain2nd: mysqlTaiwanCain2nd,
              taiwanBilling: mysqlTaiwanBilling,
              frida: mysqlFrida,
            };

            // 创建绑定 frida 句柄的便捷 DB 对象
            // 为什么需要这个东西：
            //   mysqlBind 的 exec/getNRows/fetch/getStr 等函数第一个参数是 mysql 句柄
            //   业务模块不直接操作 mysql 句柄，通过 fridaDb 简化调用
            ctx.fridaDb = createBoundMysqlDb(mysqlBind, mysqlFrida);

            dbInitialized = true;
          } else {
            console.log('[database] frida 数据库连接失败');
          }
        }
      }
      helpers.logModuleDone('database');
    } catch (err) {
      helpers.logModuleFailed('database', err);
    }
  }

  // ---- 第 7 步：基础修复类模块 ----
  // tod_fix: 绝望之塔修复
  if (cfg.features.tod_fix) {
    helpers.logModuleStart('tod_fix');
    try { globalThis.startTodFixFeature(ctx); helpers.logModuleDone('tod_fix'); }
    catch (err) { helpers.logModuleFailed('tod_fix', err); }
  }

  // emblem_fix: 时装徽章镶嵌修复
  if (cfg.features.emblem_fix) {
    helpers.logModuleStart('emblem_fix');
    try { globalThis.startEmblemFixFeature(ctx); helpers.logModuleDone('emblem_fix'); }
    catch (err) { helpers.logModuleFailed('emblem_fix', err); }
  }

  // hidden_option: 时装潜能
  if (cfg.features.hidden_option) {
    helpers.logModuleStart('hidden_option');
    try { globalThis.startHiddenOptionFeature(ctx); helpers.logModuleDone('hidden_option'); }
    catch (err) { helpers.logModuleFailed('hidden_option', err); }
  }

  // return_user: 勇士归来
  if (cfg.features.return_user) {
    helpers.logModuleStart('return_user');
    try { globalThis.startReturnUserFeature(ctx); helpers.logModuleDone('return_user'); }
    catch (err) { helpers.logModuleFailed('return_user', err); }
  }

  // ---- 第 8 步：事件/排行榜类模块 ----
  // ranking: 战力排行
  if (cfg.features.ranking) {
    helpers.logModuleStart('ranking');
    try {
      // 如果数据库未初始化，排行榜无法持久化，但仍然可以启动
      // 启动时输出中文日志说明
      if (!dbInitialized) {
        console.log('[ranking] 数据库未初始化，排行榜将无法持久化');
      }
      globalThis.startRankingFeature(ctx);
      // 保存排行榜的 save 回调，供 dispose 时使用
      ctx._rankingSaveToDb = function () {
        if (globalThis.ranking_saveToDb && ctx.fridaDb) {
          globalThis.ranking_saveToDb(ctx.fridaDb);
        }
      };
      helpers.logModuleDone('ranking');
    }
    catch (err) { helpers.logModuleFailed('ranking', err); }
  }

  // user_inout: 玩家上下线处理
  if (cfg.features.user_inout) {
    helpers.logModuleStart('user_inout');
    try {
      // 设置事件回调（解耦 user_inout 和 ranking/village_attack）
      ctx.onUserEnter = function (curUser) {
        // 排行榜下发
        if (globalThis.ranking_onUserEnter) {
          globalThis.ranking_onUserEnter(ctx, curUser);
        }
      };

      ctx.onUserLeave = function (curUser) {
        // 排行榜更新
        if (globalThis.ranking_onUserLeave) {
          globalThis.ranking_onUserLeave(ctx, curUser);
        }
      };

      ctx.onUserEnterVillageAttack = function (curUser) {
        // 怪物攻城进度通知（village_attack 模块会设置 ctx.va_notify）
        if (ctx.va_notify) {
          ctx.va_notify.notifyPlayerScore(curUser);
          ctx.va_notify.broadcastPhase();
        }
      };

      globalThis.startUserInoutFeature(ctx);
      helpers.logModuleDone('user_inout');
    }
    catch (err) { helpers.logModuleFailed('user_inout', err); }
  }

  // ---- 第 9 步：大型活动模块 ----
  // village_attack: 怪物攻城
  if (cfg.features.village_attack) {
    helpers.logModuleStart('village_attack');
    try {
      if (!dbInitialized) {
        console.log('[village_attack] 数据库未初始化，活动数据将无法持久化');
      }
      globalThis.startVillageAttackFeature(ctx);
      // 保存数据库保存回调供 dispose 使用
      ctx._villageAttackSaveToDb = function () {
        if (ctx.va_db) {
          ctx.va_db.save(globalThis.village_attack_state.getInfo());
        }
      };
      helpers.logModuleDone('village_attack');
    }
    catch (err) { helpers.logModuleFailed('village_attack', err); }
  }

  // ---- 第 10 步：可选模块 ----
  // online_reward: 在线奖励（默认关闭，高风险）
  if (cfg.features.online_reward) {
    helpers.logModuleStart('online_reward');
    try { globalThis.startOnlineRewardFeature(ctx); helpers.logModuleDone('online_reward'); }
    catch (err) { helpers.logModuleFailed('online_reward', err); }
  }

  // 保存 ctx 到 globalThis 供 dispose 使用
  globalThis._runtimeCtx = ctx;

  g_runtime_modules_started = true;
  console.log('==================== frida runtime started ====================');
}

// ---- 辅助函数：创建绑定 MySQL 句柄的便捷 DB 对象 ----
// mysqlBind: createMysqlBinding 返回的 binding 对象
// mysqlHandle: MySQL 连接的原始指针（由 mysqlBind.open 返回）
//
// 为什么需要这个函数：
//   mysqlBind 的 exec/getNRows/fetch/getStr 等函数第一个参数是 mysql 句柄
//   业务模块不应该直接持有和传递句柄，通过此对象统一管理
function createBoundMysqlDb(mysqlBind, mysqlHandle) {
  // 为什么需要这里统一 exec() 的布尔语义：
  //   底层 MySQLExec 在游戏引擎中的返回值约定为「非零成功，零失败」，
  //   业务模块不应直接依赖底层 raw 返回码。
  //   exec() 返回布尔值：true=执行成功，false=执行失败。
  //   execRaw() 返回底层原始值，供需要检查底层返回码时使用。
  return {
    // 业务层通用接口：返回布尔值，true 表示 SQL 执行成功
    exec: function (sql) {
      // 底层非零=成功，零=失败
      return mysqlBind.exec(mysqlHandle, sql) != 0;
    },
    // 底层原始接口：返回游戏引擎的原始返回码（非零=成功，零=失败）
    execRaw: function (sql) {
      return mysqlBind.exec(mysqlHandle, sql);
    },
    getNRows: function () {
      return mysqlBind.getNRows(mysqlHandle);
    },
    fetch: function () {
      return mysqlBind.fetch(mysqlHandle);
    },
    getInt: function (index) {
      return mysqlBind.getInt(mysqlHandle, index);
    },
    getStr: function (index) {
      return mysqlBind.getStr(mysqlHandle, index);
    },
    getBinary: function (index) {
      return mysqlBind.getBinary(mysqlHandle, index);
    },
    // 原始句柄引用（仅在需要创建第二个 bound db 时使用）
    raw: mysqlHandle,
  };
}

// 模块卸载清理
function disposeRuntimeModules() {
  console.log('-------------------- frida dispose --------------------');

  var ctx = globalThis._runtimeCtx;
  if (!ctx) {
    return;
  }

  try {
    // 保存排行数据
    if (ctx._rankingSaveToDb) {
      ctx._rankingSaveToDb();
    }

    // 保存怪物攻城数据
    if (ctx._villageAttackSaveToDb) {
      ctx._villageAttackSaveToDb();
    }

    // 关闭数据库连接（使用 ctx.mysql binding 的 close 函数）
    if (ctx.db && ctx.mysql) {
      var db = ctx.db;
      if (db.frida) {
        ctx.mysql.close(db.frida);
      }
      if (db.taiwanCain) {
        ctx.mysql.close(db.taiwanCain);
      }
      if (db.taiwanCain2nd) {
        ctx.mysql.close(db.taiwanCain2nd);
      }
      if (db.taiwanBilling) {
        ctx.mysql.close(db.taiwanBilling);
      }
    }
  } catch (err) {
    console.log('[dispose] error: ' + err);
  }

  console.log('-------------------- frida dispose done --------------------');
}

if (typeof globalThis !== 'undefined') {
  globalThis.startRuntimeModules = startRuntimeModules;
  globalThis.disposeRuntimeModules = disposeRuntimeModules;
  globalThis.createBoundMysqlDb = createBoundMysqlDb;
}
