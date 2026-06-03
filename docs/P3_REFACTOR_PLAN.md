# P3 重构计划

本文档记录 P3 阶段的重构执行顺序。

## 目标

P3 的目标是让 `df_game_r.lua` 从“大入口文件”逐步变成“入口 + 模块装配”。

本阶段优先保持行为稳定，不做功能扩展。

## 已完成

- 已建立 `script/config.lua`。
- 已建立 `script/utils.lua`。
- 已建立 `script/bootstrap.lua`。
- 已建立 `script/handlers/` 模块目录。
- 已迁移任务类 handler 到 `script/handlers/quest.lua`。
- 已迁移职业类 handler 到 `script/handlers/job.lua`。
- 已迁移清理类 handler 到 `script/handlers/item_cleanup.lua`。
- 已迁移继承类 handler 到 `script/handlers/inherit.lua`。
- 已迁移 PVP 类 handler 到 `script/handlers/pvp.lua`。

## 暂未完成

- `script/handlers/misc.lua` 暂时只保留模板。
- `df_game_r.lua` 尚未接入 `script/bootstrap.lua`。
- 旧 handler 仍保留在 `df_game_r.lua` 中。

## 下一步

### Step 1：接入 bootstrap

在 `df_game_r.lua` 顶部加载：

```lua
local bootstrap = require("script.bootstrap")
```

构造基础上下文：

```lua
local ctx = bootstrap.setup(item_handler, {
    dp = dp,
    dpx = dpx,
    game = game,
    world = world,
    logger = logger,
})
```

### Step 2：逐步移除旧 handler

每次只移除一组旧 handler：

1. 任务类
2. 职业类
3. 清理类
4. 继承类
5. PVP 类
6. misc 类

每移除一组后，需要确认：

- 模块是否已经注册相同 item id。
- 成功提示是否保持一致。
- 失败时是否仍返还道具。
- 日志是否仍可追踪。

### Step 3：配置开关接入

配置开关接入顺序：

1. debug 配置
2. feature 配置
3. risk 配置
4. limits 配置

### Step 4：入口瘦身

最终目标：

- `df_game_r.lua` 只保留依赖加载、上下文构造、模块注册、hook 注册和 DPX 开关应用。
- 业务逻辑全部进入模块文件。
