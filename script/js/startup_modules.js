// 模块启动调度中心
// 来源：从旧 frida.js start() 迁移并重构
// 用途：按配置和顺序启动所有 JS 模块
//
// 在 dp_load 模式下，本文件被 df_game_r.js 通过 dp_load('startup_modules') 加载。
// 加载后会先通过 safeLoadModule() 加载所有依赖子模块，
// 再按 ctx 模式创建 bindings 并启动各功能模块。
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

// 加载所有依赖子模块（dp_load 模式下必须主动加载）
// 顺序必须与 tools/build_frida_bundle.js 中的拼接顺序一致
//
// 返回: true=全部加载成功或 bundle fallback 模式，false=有模块加载失败
function loadRuntimeDependencies() {
  // bundle fallback：如果 dp_load 不存在，说明可能是 dist/df_game_r.bundle.js 单文件模式
  // 此时模块已经在拼接时加载完成，不需要动态加载依赖
  if (typeof dp_load !== 'function') {
    console.log('[startup] dp_load 不存在，按 bundle fallback 模式运行，跳过动态依赖加载');
    return true;
  }

  if (typeof safeLoadModule !== 'function') {
    console.log('[startup] safeLoadModule 不存在，无法加载依赖模块，终止 runtime 启动');
    return false;
  }

  var modules = [
    // 核心和 binding 已经在 df_game_r.js 中预加载：
    //   runtime_addresses, runtime_config, core/runtime_utils,
    //   core/hook_guard, startup_helpers, startup_modules（本文件）
    // 以下加载其余所有依赖：

    'bindings/native_functions',

    'core/logger',
    'core/time',
    'core/random',
    'core/memory',
    'core/file',

    'bindings/packet',
    'bindings/mysql',
    'bindings/user',
    'bindings/inventory',
    'bindings/item',
    'bindings/mail',
    'bindings/game_world',
    'bindings/timer_dispatcher',
    'bindings/quest',

    'features/tod_fix',
    'features/emblem_fix',
    'features/hidden_option',
    'features/return_user',
    'features/online_reward',
    'features/ranking',
    'features/user_inout',

    'features/village_attack/constants',
    'features/village_attack/state',
    'features/village_attack/db',
    'features/village_attack/notify',
    'features/village_attack/reward',
    'features/village_attack/settlement',
    'features/village_attack/flow',
    'features/village_attack/hooks',
    'features/village_attack/index',
  ];

  var allOk = true;
  for (var i = 0; i < modules.length; i++) {
    if (!safeLoadModule(modules[i])) {
      console.log('[startup] 依赖模块加载失败: ' + modules[i]);
      allOk = false;
    }
  }

  if (!allOk) {
    console.log('[startup] 依赖模块加载失败，终止 runtime 启动');
    return false;
  }

  return true;
}

function startRuntimeModules() {
  if (g_runtime_modules_started) {
    console.log('[startup] runtime modules already started');
    return true;
  }

  console.log('==================== frida runtime start ====================');

  // dp_load 模式：先加载所有依赖子模块
  // bundle 模式：dp_load 不存在时返回 true，不报错
  if (!loadRuntimeDependencies()) {
    return false;
  }

  const addr = globalThis.PROJECT_ADDRESSES;
  const cfg = globalThis.PROJECT_JS_CONFIG;
  const helpers = globalThis.createStartupHelpers(addr);

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
    return false;
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
  var RU = RuntimeUtils;

  packetBind    = RU.runStep(helpers, 'packet binding',       function () { return globalThis.createPacketBinding(addr); }, null);
  mysqlBind     = RU.runStep(helpers, 'mysql binding',         function () { return globalThis.createMysqlBinding(addr); }, null);
  userBind      = RU.runStep(helpers, 'user binding',          function () { return globalThis.createUserBinding(addr); }, null);
  inventoryBind = RU.runStep(helpers, 'inventory binding',     function () { return globalThis.createInventoryBinding(addr); }, null);
  itemBind      = RU.runStep(helpers, 'item binding',          function () { return globalThis.createItemBinding(addr); }, null);
  mailBind      = RU.runStep(helpers, 'mail binding',          function () { return globalThis.createMailBinding(addr); }, null);
  gwBind        = RU.runStep(helpers, 'game_world binding',    function () { return globalThis.createGameWorldBinding(addr); }, null);
  timerBind     = RU.runStep(helpers, 'timer_dispatcher binding', function () { return globalThis.createTimerDispatcherBinding(addr); }, null);
  questBind     = RU.runStep(helpers, 'quest binding',         function () { return globalThis.createQuestBinding(addr); }, null);

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
  const ctx = {
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
  RU.runFeatureStep(helpers, 'timer_dispatcher', cfg.features.timer_dispatcher, function () {
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
  });

  // ---- 第 6 步：Database 初始化 ----
  // 来源：从旧 frida.js init_db 迁移
  var dbInitialized = false;
  RU.runFeatureStep(helpers, 'database', cfg.features.database, function () {
    // 加载本地配置文件（数据库连接信息）
    const fileMod = globalThis.createFileModule();
    const globalConfig = fileMod.loadConfig('frida_config.json');

    if (!globalConfig) {
      // 配置文件读取失败，无法获取数据库账号
      console.log('[database] frida_config.json 读取失败，数据库账号为空，跳过数据库初始化');
    } else {
      const dbConfig = globalConfig['db_config'] || {};

      if (!dbConfig['account'] || !dbConfig['password']) {
        console.log('[database] frida_config.json 中 db_config.account/password 为空，跳过数据库初始化');
      } else if (mysqlBind) {
        // 初始化数据库连接
        // 风险：数据库连接信息使用 localhost:3306，生产环境需从配置读取
        const mysqlTaiwanCain = mysqlBind.open('taiwan_cain', '127.0.0.1', 3306, dbConfig['account'], dbConfig['password']);
        const mysqlTaiwanCain2nd = mysqlBind.open('taiwan_cain_2nd', '127.0.0.1', 3306, dbConfig['account'], dbConfig['password']);
        const mysqlTaiwanBilling = mysqlBind.open('taiwan_billing', '127.0.0.1', 3306, dbConfig['account'], dbConfig['password']);

        // 建库 frida
        if (mysqlTaiwanCain) {
          mysqlBind.exec(mysqlTaiwanCain, 'create database if not exists frida default charset utf8;');
        }

        const mysqlFrida = mysqlBind.open('frida', '127.0.0.1', 3306, dbConfig['account'], dbConfig['password']);

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
  });

  // ---- 第 7 步：基础修复类模块 ----
  RU.runFeatureStep(helpers, 'tod_fix',       cfg.features.tod_fix,       function () { globalThis.startTodFixFeature(ctx); });
  RU.runFeatureStep(helpers, 'emblem_fix',    cfg.features.emblem_fix,    function () { globalThis.startEmblemFixFeature(ctx); });
  RU.runFeatureStep(helpers, 'hidden_option', cfg.features.hidden_option, function () { globalThis.startHiddenOptionFeature(ctx); });
  RU.runFeatureStep(helpers, 'return_user',   cfg.features.return_user,   function () { globalThis.startReturnUserFeature(ctx); });

  // ---- 第 8 步：事件/排行榜类模块 ----
  // ranking: 战力排行
  RU.runFeatureStep(helpers, 'ranking', cfg.features.ranking, function () {
    // 如果数据库未初始化，排行榜无法持久化，但仍然可以启动
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
  });

  // user_inout: 玩家上下线处理
  RU.runFeatureStep(helpers, 'user_inout', cfg.features.user_inout, function () {
    // 设置事件回调（解耦 user_inout 和 ranking/village_attack）
    ctx.onUserEnter = function (curUser) {
      if (globalThis.ranking_onUserEnter) {
        globalThis.ranking_onUserEnter(ctx, curUser);
      }
    };

    ctx.onUserLeave = function (curUser) {
      if (globalThis.ranking_onUserLeave) {
        globalThis.ranking_onUserLeave(ctx, curUser);
      }
    };

    ctx.onUserEnterVillageAttack = function (curUser) {
      if (ctx.va_notify) {
        ctx.va_notify.notifyPlayerScore(curUser);
        ctx.va_notify.broadcastPhase();
      }
    };

    globalThis.startUserInoutFeature(ctx);
  });

  // ---- 第 9 步：大型活动模块 ----
  // village_attack: 怪物攻城
  RU.runFeatureStep(helpers, 'village_attack', cfg.features.village_attack, function () {
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
  });

  // ---- 第 10 步：可选模块 ----
  // online_reward: 在线奖励（默认关闭，高风险）
  RU.runFeatureStep(helpers, 'online_reward', cfg.features.online_reward, function () {
    globalThis.startOnlineRewardFeature(ctx);
  });

  // 保存 ctx 到 globalThis 供 dispose 使用
  globalThis._runtimeCtx = ctx;

  g_runtime_modules_started = true;
  console.log('==================== frida runtime started ====================');
  return true;
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

  const ctx = globalThis._runtimeCtx;
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
      const db = ctx.db;
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

RuntimeUtils.exposeGlobal('startRuntimeModules', startRuntimeModules);
RuntimeUtils.exposeGlobal('disposeRuntimeModules', disposeRuntimeModules);
RuntimeUtils.exposeGlobal('createBoundMysqlDb', createBoundMysqlDb);
