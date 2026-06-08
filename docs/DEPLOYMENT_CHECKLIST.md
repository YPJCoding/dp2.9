# 部署前检查清单

本文档用于 `dp2.9` 部署到服务器前的检查、验证和回滚。

## 1. 当前运行入口

当前主入口为：

```text
/dp2/df_game_r.lua
```

入口职责已经收敛为：

- 初始化 DP/DPX/Game/World/Logger
- 加载 `script/bootstrap.lua`
- 加载 `df.frida`
- 注册 `on_frida_call`
- 注册上线提示 hook
- 注册 `UseItem1` hook，并接入普通右键消耗品 `UseItem1 -> item_handler` 分发
- 保留 `UseItem2` hook 作为兼容入口
- 通过 `bootstrap.apply_dpx_startup(ctx)` 应用 DPX 启动配置

业务 handler 已迁移到：

```text
script/handlers/
  quest.lua
  job.lua
  item_cleanup.lua
  inherit.lua
  pvp.lua
  misc.lua
```

玩法与基础设施模块已迁移到：

```text
script/modules/
  online.lua
  broadcast.lua
  gm_permissions.lua
  item_query.lua
  player_info.lua
  command_menu.lua
  command_help.lua
  signin.lua
  exp_dungeon.lua
  dungeon_gate.lua
  drop_rules.lua
  finish_back_home.lua
  hot_reload.lua
  legacy_patches.lua
```

## 2. 部署目录检查

服务器上应存在以下结构：

```text
/dp2
  libdp2.xml
  libdp2pre.so
  libdp2.so
  df_game_r.lua
  df_game_r.js
  lib/
  lua/
  script/
    bootstrap.lua
    config.lua
    utils.lua
    handlers/
      quest.lua
      job.lua
      item_cleanup.lua
      inherit.lua
      pvp.lua
      misc.lua
    modules/
      online.lua
      broadcast.lua
      gm_permissions.lua
      item_query.lua
      player_info.lua
      command_menu.lua
      command_help.lua
      signin.lua
      exp_dungeon.lua
      dungeon_gate.lua
      drop_rules.lua
      finish_back_home.lua
      hot_reload.lua
      legacy_patches.lua
```

检查重点：

- `script/config.lua` 必须存在。
- `script/bootstrap.lua` 必须存在。
- `script/utils.lua` 必须存在。
- `script/handlers/*.lua` 必须存在。
- `script/modules/*.lua` 必须存在。
- `df_game_r.js` 必须仍在 `/dp2/df_game_r.js`。
- `frida.js` 不是默认加载文件，不作为部署必需项。

## 3. 启动命令

普通频道启动示例：

```shell
LD_PRELOAD=/dp2/libdp2pre.so ./df_game_r cain01 start &
```

PK 频道是否加载按实际需要决定。

## 4. 配置检查

当前配置文件：

```text
script/config.lua
```

### 4.1 模块开关

默认应启用：

```lua
features = {
    enable_item_handlers = true,
    enable_modular_handlers = true,
    modular_handlers = {
        quest = true,
        job = true,
        item_cleanup = true,
        inherit = true,
        pvp = true,
        misc = true,
    },
    enable_online_module = true,
    enable_broadcast_module = true,
    enable_item_query = true,
    enable_player_info = true,
    enable_command_menu = true,
    enable_command_help = true,
    enable_signin = false,
    enable_finish_back_home = true,
    enable_legacy_patches = false,
}
```

说明：

- `signin` 默认关闭，测试服确认后再按需要开启。
- `legacy_patches` 默认关闭；子功能开启路径已在测试服验证，但发布前仍建议保持关闭，按需要逐项启用。
- `hot_reload.enabled=true` 默认开启，仅热应用显式支持的运行时配置。

### 4.2 风险开关

部署前建议保持关闭：

```lua
risk = {
    enable_sql_handlers = false,
    enable_delete_handlers = false,
    enable_security_bypass = false,
    enable_shell_handlers = false,
}
```

含义：

- `enable_sql_handlers=false`：禁止模块 handler 执行直接 SQL 类操作。
- `enable_delete_handlers=false`：禁止删除宠物、时装、装备和一键分解。
- `enable_shell_handlers=false`：禁止 PVP 经验书执行外部 shell。
- `enable_security_bypass=false`：预留安全限制开关，当前 DPX 启动行为由 `dpx_startup` 控制。

## 5. 首次启动观察日志

启动后重点观察日志中是否出现：

```text
[bootstrap] installed legacy utils
[bootstrap] registered handler module=script.handlers.quest
[bootstrap] registered handler module=script.handlers.job
[bootstrap] registered handler module=script.handlers.item_cleanup
[bootstrap] registered handler module=script.handlers.inherit
[bootstrap] registered handler module=script.handlers.pvp
[bootstrap] registered handler module=script.handlers.misc
[bootstrap] applied dpx startup config
```

如果启用了对应模块，还应关注：

```text
[online] registered Reach_GameWord/Leave_GameWord hooks
[item_query] registered GmInput hook
[player_info] registered GmInput hook command=//myinfo
[command_menu] registered GmInput hook command=//指令
[command_help] registered GmInput hooks
[hot_reload] timer started
```

如果看到：

```text
[bootstrap] failed to require module=...
```

说明 Lua require 路径或文件部署有问题。

如果看到：

```text
[bootstrap] apply dpx startup fallback
```

说明 bootstrap 加载或 `apply_dpx_startup` 调用失败，入口走了 fallback。fallback 可以避免启动直接失败，但应尽快排查原因。

## 6. 功能验证顺序

建议按低风险到高风险测试。

### 6.1 基础启动

- 服务能启动。
- 角色能登录频道。
- 上线提示能正常显示。
- `frida.load` 不报错。
- 普通右键消耗品确认走 `UseItem1`。
- `UseItem1 -> item_handler` 分发可用。

### 6.2 已完成主路径验证

以下已完成主路径或测试服验证：

- 普通频道启动。
- bootstrap 日志正常。
- `frida.load` 正常。
- `Reach_GameWord` 登录 hook 正常。
- `UseItem1` 是普通右键消耗品入口。
- `UseItem1 -> item_handler` 分发已接入。
- 高风险 handler 默认关闭时拒绝并返还道具。
- 等级上限 85 与拍卖行最低等级 10。
- `legacy_patches` 默认关闭与三个子功能开启路径。
- `hot_reload` config-only 主路径。
- `finish_back_home` mode `0`~`5` 与 `equipment_rarities={0,1}` 主路径。

### 6.3 已迁移，待专项验证

以下已迁移，仍建议按模块专项验证：

- `signin`：默认关闭；开启后验证 `//qd`、重复签到、邮件奖励和可选广播。
- `player_info`：验证 `//myinfo` 展示基础信息。
- `command_menu`：验证 `//指令` 只展示安全命令。
- `command_help`：验证 `//getq`、`//clearq`、`//zhiye`、`//trans`、`//pvp` 只展示说明，不执行旧高风险逻辑。
- `item_query`：验证 `//view`、`//viewid`、`//viewname` 与旧无空格写法。
- `exp_dungeon`：需确认副本 `5000` 存在。
- `dungeon_gate`：需配置规则后验证。
- `drop_rules`：需高级角色 + 低级副本 + 豁免道具场景验证。

### 6.4 PVF 正式道具验证（后置）

当前 PVF 暂不添加 DP 正式道具，以下放到最后阶段验证：

- 主线任务清理券
- 每日任务清理券
- 成就任务清理券
- 异界 E2/E3 重置券
- 觉醒券
- 转职任务获取券
- 装备继承券
- 跨界石

### 6.5 高风险能力恢复验证（后置）

只有在明确需要恢复旧行为，并完成备份、回滚和专项验证后，才考虑开启：

- 女鬼剑职业转换券：需 `enable_sql_handlers=true`。
- 角色出战券：需 `enable_sql_handlers=true`。
- 装备设计图熟练度券：需 `enable_sql_handlers=true`。
- 宠物清理券：需 `enable_delete_handlers=true` 且部分路径需要 `enable_sql_handlers=true`。
- 时装清理券：需 `enable_delete_handlers=true` 且部分路径需要 `enable_sql_handlers=true`。
- 副职业一键分解券：需 `enable_delete_handlers=true`。
- PVP 经验书：需 `enable_shell_handlers=true` 且 `enable_sql_handlers=true`。

## 7. 回滚方式

### 7.1 回滚单个模块

编辑 `script/config.lua`：

```lua
modular_handlers = {
    quest = false,
    job = false,
    item_cleanup = false,
    inherit = false,
    pvp = false,
    misc = false,
}
```

注意：当前 `df_game_r.lua` 已移除旧 handler，所以关闭模块后，对应道具不会再执行旧逻辑。

玩法模块可通过 `features.enable_*` 开关关闭，通常需要重启频道才能彻底取消已注册 hook。

### 7.2 回滚到 main

如果重构分支启动异常，回滚到 main 分支对应版本的 `/dp2` 文件。

至少回滚：

```text
df_game_r.lua
df_game_r.js
script/
```

### 7.3 回滚高风险能力

保持风险开关关闭：

```lua
enable_sql_handlers = false
enable_delete_handlers = false
enable_shell_handlers = false
```

JS/Frida 高风险功能按 `js_features` 逐项关闭，并重启频道。

## 8. 发布前不建议开启的能力

除非已经完成测试和备份，否则不建议开启：

- `enable_sql_handlers`
- `enable_delete_handlers`
- `enable_shell_handlers`
- GM 聊天写操作指令
- 未完成审查的 JS Hook
- `js_features` 中标记为 `[RISK:HIGH]` 或 `[RISK:CRITICAL]` 且未完成专项验证的功能

## 9. 部署前最终确认

- [ ] 已备份旧 `/dp2` 目录。
- [ ] 已确认 `script/config.lua` 风险开关默认关闭。
- [ ] 已确认所有 handler 模块存在。
- [ ] 已确认所有启用的 `script/modules/*.lua` 存在。
- [ ] 已确认 `df_game_r.lua` 可以加载 `script/bootstrap.lua`。
- [ ] 已确认 `df_game_r.js` 文件存在。
- [ ] 已完成至少一次普通频道启动验证。
- [ ] 已确认普通右键消耗品走 `UseItem1`。
- [ ] 已确认 `UseItem1 -> item_handler` 分发可用。
- [ ] 已确认高风险功能默认拒绝并返还道具。
- [ ] 已确认 PVF 正式道具验证仍为后置项，不阻塞安全底板部署。
