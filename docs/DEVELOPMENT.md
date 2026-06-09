# 开发说明

## 模块重构后的启动流程

### JS/Frida 侧

```text
rpc.exports.init(stage='early')
  -> Interceptor.attach(check_argv) -- 等待服务器初始化完成
  -> start()
    -> startRuntimeModules()
      -> createLogger() + createTimeModule()
      -> createPacketBinding(), createMysqlBinding(), ... (全部 binding)
      -> attachOnce('timer_dispatcher') -- 线程安全调度
      -> 数据库初始化（建库建表）
      -> startTodFixFeature(ctx)
      -> startEmblemFixFeature(ctx)
      -> startHiddenOptionFeature(ctx)
      -> startReturnUserFeature(ctx)
      -> startRankingFeature(ctx)
      -> startUserInoutFeature(ctx)
      -> startVillageAttackFeature(ctx)
      -> startOnlineRewardFeature(ctx) -- 默认关闭

rpc.exports.dispose()
  -> disposeRuntimeModules()
    -> 保存排行榜/活动数据
    -> 关闭数据库连接
```

### Lua 侧

保持不变。`df_game_r.lua` 负责 Lua 模块加载，与 JS 侧解耦。

## 地址管理

所有运行时地址集中在：

```text
script/js/runtime_addresses.js
```

新增地址时请同时添加中文注释。

## 配置管理

所有功能开关和参数集中在：

```text
script/js/runtime_config.js
```

通过 `ctx.config` 读取配置，不要在业务模块中硬编码。

## Hook 管理

所有 hook 必须通过 `attachOnce()` / `replaceOnce()` 注册：

- 防止热重载时重复 hook
- 提供统一的错误日志

位置：`script/js/core/hook_guard.js`

## 部署说明

### 默认部署：df_game_r.js + dp_load

```text
部署文件：df_game_r.js
加载方式：dp_load 动态加载 script/js 模块
```

`df_game_r.js` 通过 `dp_load('runtime_addresses')`、`dp_load('startup_modules')` 等加载引导模块，
`startup_modules.js` 通过 `loadRuntimeDependencies()` 加载其余所有子模块。

### Fallback：bundle

```bash
bash tools/build_frida_bundle.sh
# 输出：dist/df_game_r.bundle.js（无 dp_load 环境备用）
```

## 构建 bundle

## 本地检查

```bash
# JS 语法检查 (Frida 兼容语法)
bash tools/check_js_syntax.sh

# Lua 语法检查
bash tools/check_lua_syntax.sh
```

## 目录结构

```text
script/js/
  core/          # 基础工具模块
  bindings/      # 游戏 API 封装
  features/      # 业务功能模块
    village_attack/  # 大型活动模块（子目录）
```

## 模块加载顺序

1. Logger / Config
2. Runtime Addresses
3. Native Bindings（packet, mysql, user, inventory, item, mail, game_world, timer_dispatcher, quest）
4. Timer Dispatcher（线程安全调度，必须最先启动）
5. Database（排行榜和怪物攻城依赖）
6. 基础修复类（tod_fix, emblem_fix, hidden_option, return_user）
7. 事件类（user_inout, ranking）
8. 大型活动（village_attack）
9. 可选模块（online_reward）

顺序不能随意调整，因为存在模块间依赖。
