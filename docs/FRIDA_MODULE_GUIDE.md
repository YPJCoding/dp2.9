# Frida/JS 模块开发指南

## 目录结构

```text
script/js/
  startup_helpers.js          # 启动辅助（日志、环境检测）
  startup_modules.js          # 模块启动调度中心
  runtime_config.js           # 配置中心（功能开关、参数）
  runtime_addresses.js        # 所有 ptr 地址集中管理

  core/
    logger.js                 # 日志模块（控制台+文件）
    time.js                   # 时间模块（系统UTC时间）
    file.js                   # 文件操作模块
    random.js                 # 随机数模块
    hook_guard.js             # Hook 防重复模块
    memory.js                 # 内存操作模块

  bindings/
    native_functions.js       # NativeFunction 工厂
    packet.js                 # 封包读写 binding
    mysql.js                  # MySQL 操作 binding
    user.js                   # 角色操作 binding
    inventory.js              # 背包道具 binding
    item.js                   # 道具数据 binding
    mail.js                   # 邮件系统 binding
    game_world.js             # 游戏世界 binding
    timer_dispatcher.js       # 定时器调度 binding
    quest.js                  # 任务系统 binding

  features/
    tod_fix.js                # 绝望之塔修复
    emblem_fix.js             # 时装徽章镶嵌修复
    hidden_option.js          # 时装潜能
    return_user.js            # 勇士归来
    user_inout.js             # 玩家上下线处理
    ranking.js                # 战力排行
    online_reward.js          # 在线奖励

    village_attack/
      index.js                # 入口
      constants.js            # 常量
      state.js                # 状态管理
      db.js                   # 数据库操作
      flow.js                 # 流程控制
      hooks.js                # Hook 集合
      notify.js               # 通知/广播
      reward.js               # 奖励发放
      settlement.js           # 结算
```

## 文件职责

### df_game_r.js

只负责 Frida 脚本生命周期入口：

- early 阶段延迟启动（等待服务器初始化）
- 非 early 阶段直接启动（支持热重载）
- dispose 阶段调用统一清理函数

不包含任何业务逻辑、真实地址、NativeFunction 定义。

### startup_modules.js

模块启动调度中心，负责：

- 按依赖顺序创建 bindings 和 ctx
- 按配置启动各功能模块
- 捕获启动异常，不影响后续模块
- 输出中文启动日志

### runtime_addresses.js

**所有** ptr(0x...) 地址都放在这里，不散落在业务模块中。

每个地址必须包含：
- 中文注释说明作用
- 对应原函数或 hook 点
- 来源：从旧 frida.js 迁移
- 风险点或适用场景

### hook_guard.js

所有 Interceptor.attach 和 Interceptor.replace 都必须通过：

- `attachOnce(key, address, callbacks)` - 防重复 attach
- `replaceOnce(key, address, callback, retType, argTypes)` - 防重复 replace

为什么要必须使用：
1. Frida 热重载时原有 hook 不会被自动清除
2. 重复 attach 会导致同一个函数被多次 hook，造成逻辑叠加
3. 统一管理能确保同一个 key 只 hook 一次

### native_functions.js

提供统一的 `nf()` 工厂函数创建 NativeFunction：

```js
function nf(address, retType, argTypes) {
  return new NativeFunction(address, retType, argTypes, { abi: 'sysv' });
}
```

业务模块不直接创建 NativeFunction，通过 binding 或 ctx 调用。

### runtime_config.js

配置中心，使用 feature flag 控制各模块是否启用：

```js
var PROJECT_JS_CONFIG = {
  features: {
    timer_dispatcher: true,
    tod_fix: true,
    emblem_fix: true,
    // ...
    online_reward: false, // 高风险，默认关闭
  },
};
```

## 如何新增一个 Frida Feature

1. 在 `script/js/features/` 新建 `<feature>.js`
2. 实现 `startXxxFeature(ctx)` 函数
3. 使用 `attachOnce` / `replaceOnce` 注册 hook
4. 新地址添加到 `runtime_addresses.js`
5. 新配置项添加到 `runtime_config.js`
6. 在 `startup_modules.js` 中注册启动
7. 加中文注释
8. 运行 `bash tools/check_js_syntax.sh` 检查语法

## 编码规范

- 不使用 ES6+ 语法（let、箭头函数、class等）
- 使用 2 空格缩进
- 文件名使用 snake_case
- 启动函数使用 `startXxxFeature(ctx)`
- 防重复变量使用 `g_xxx_started`
- 每个 hook 加中文注释说明：原函数、作用、风险
- 每个内存 patch 加中文注释
- 每个会修改角色数据的操作加中文注释

## 模块间通信

通过 ctx 对象传递依赖：

```js
var ctx = {
  addresses: addr,  // 地址集
  config: cfg,      // 配置
  log: logger.log,  // 日志函数
  time: timeMod,    // 时间模块
  packet: packetBind, // 封包 binding
  msql: mysqlBind,  // MySQL binding
  user: userBind,   // 角色 binding
  inventory: inventoryBind, // 背包 binding
  item: itemBind,   // 道具 binding
  mail: mailBind,   // 邮件 binding
  gw: gwBind,       // GameWorld binding
  timer: timerBind, // 定时器 binding
  quest: questBind, // 任务 binding
};
```

## 本次迁移保留的功能

从旧 frida.js 完整迁移的功能：
- 绝望之塔门票/金币/每10层跳过修复
- 时装徽章镶嵌修复
- 时装潜能属性下发
- 勇士归来时间设置
- 战力排行榜（站街前三名）
- 玩家上下线处理
- 怪物攻城活动（完整：P1/P2/P3阶段、难度、奖励、结算）
- 在线奖励（默认关闭）
- 线程安全调度（TimerDispatcher）
- 数据库持久化

## Review 检查清单

- [ ] 是否有裸地址散落在多个模块中
- [ ] 是否所有 hook 都使用 attachOnce/replaceOnce
- [ ] 是否有 try/catch
- [ ] 是否在 hook 热路径中做了重操作
- [ ] 是否误用了示例地址占位
- [ ] 是否修改了入口文件中的真实业务逻辑
- [ ] 每个会修改角色数据的函数是否有中文注释
- [ ] 模块是否通过配置控制启用/禁用
- [ ] 启动顺序是否正确
