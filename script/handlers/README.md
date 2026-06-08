# Handler 模块说明

`script/handlers/` 用于存放道具使用后的业务处理逻辑。

当前目录先作为模板结构引入，暂不改变现有业务行为。后续会逐步把 `df_game_r.lua` 中的 `item_handler[item_id] = function(...)` 迁移到这里。

## 模块注册约定

每个模块返回一个表，并暴露 `register(item_handler, ctx)` 函数：

```lua
local M = {}

function M.register(item_handler, ctx)
    item_handler[1000000001] = function(user, item_id)
        ctx.logger.info("[useitem] acc=%d chr=%d item_id=%d action=%s", user:GetAccId(), user:GetCharacNo(), item_id, "example")
    end
end

return M
```

## ctx 约定

`ctx` 用于传递公共依赖，避免每个模块重复 require 或依赖全局变量。

```lua
local ctx = {
    dp = dp,
    dpx = dpx,
    game = game,
    world = world,
    logger = logger,
    config = config,
    utils = utils,
}
```

## 风险标记

每个 handler 必须标明风险等级：

```lua
-- [RISK:LOW] 只读查询或提示
-- [RISK:MEDIUM] 普通发奖、任务状态整理
-- [RISK:HIGH] 直接 SQL、删除物品、修改职业/觉醒/任务
-- [RISK:CRITICAL] 影响全服经济、掉落、交易或核心 Hook
```

## 推荐拆分

```text
quest.lua        任务清理类
job.lua          职业转换、转职、觉醒类
item_cleanup.lua 宠物、时装、装备清理类
inherit.lua      装备继承类
pvp.lua          PVP 经验、胜点类
misc.lua         其他零散道具券
```
