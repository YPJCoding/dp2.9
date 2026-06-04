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
- 注册 `UseItem2` hook
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
```

检查重点：

- `script/config.lua` 必须存在。
- `script/bootstrap.lua` 必须存在。
- `script/utils.lua` 必须存在。
- `script/handlers/*.lua` 必须存在。
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
}
```

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

### 6.2 低风险 handler

优先测试：

- 主线任务清理券
- 每日任务清理券
- 成就任务清理券
- 异界 E2/E3 重置券

### 6.3 中风险 handler

再测试：

- 觉醒券
- 转职任务获取券
- 装备继承券
- 跨界石

### 6.4 高风险默认关闭验证

在风险开关关闭时测试：

- 女鬼剑职业转换券应提示功能未开启并返还道具。
- 角色出战券应提示功能未开启并返还道具。
- 装备设计图熟练度券应提示功能未开启并返还道具。
- 宠物清理券应提示功能未开启并返还道具。
- 时装清理券应提示功能未开启并返还道具。
- 副职业一键分解券应提示功能未开启并返还道具。
- PVP 经验书应提示功能未开启并返还道具。

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

### 7.2 回滚到 main

如果重构分支启动异常，回滚到 main 分支对应版本的 `/dp2` 文件。

至少回滚：

```text
df_game_r.lua
script/
```

如果 JS 侧没有改动，可暂不回滚 `df_game_r.js`。

### 7.3 回滚高风险能力

只需保持风险开关关闭：

```lua
enable_sql_handlers = false
enable_delete_handlers = false
enable_shell_handlers = false
```

## 8. 发布前不建议开启的能力

除非已经完成测试和备份，否则不建议开启：

- `enable_sql_handlers`
- `enable_delete_handlers`
- `enable_shell_handlers`
- GM 模式
- 未完成审查的 JS Hook

## 9. 部署前最终确认

- [ ] 已备份旧 `/dp2` 目录。
- [ ] 已确认 `script/config.lua` 风险开关默认关闭。
- [ ] 已确认所有 handler 模块存在。
- [ ] 已确认 `df_game_r.lua` 可以加载 `script/bootstrap.lua`。
- [ ] 已确认 `df_game_r.js` 文件存在。
- [ ] 已完成至少一次普通频道启动验证。
- [ ] 已完成至少一次低风险 handler 验证。
- [ ] 已确认高风险功能默认拒绝并返还道具。
