# Lua 模块开发指南

## 目标

Lua 侧模块用于承载服务端运行时业务逻辑。入口文件只负责启动，具体功能必须放入 `script/modules/` 或 `script/handlers/`。

## 推荐目录

```text
script/
  config.lua
  logger.lua
  bootstrap.lua
  modules/
    example_module.lua
  handlers/
    example_handler.lua
```

## 模块结构

普通模块使用 `setup(ctx)`：

```lua
local M = {}

function M.setup(ctx)
    local config = ctx.config or {}
    local logger = ctx.logger

    if logger then
        logger.info('[module] setup')
    end

    return M
end

return M
```

handler 模块使用 `register(item_handler, ctx)`：

```lua
local M = {}

function M.register(item_handler, ctx)
    local logger = ctx and ctx.logger

    if not item_handler then
        if logger then
            logger.error('[handler] missing item_handler')
        end
        return
    end

    -- 真实项目中在这里注册 item_handler[item_id]
end

return M
```

## ctx 使用规范

模块只通过 `ctx` 获取运行时能力：

- `ctx.config`：配置。
- `ctx.logger`：日志。
- `ctx.game`：游戏对象。
- `ctx.dpx`：DPX 能力。

不要直接依赖隐式全局变量。确实需要全局能力时，应在入口或 bootstrap 里显式注入。

## 配置规范

所有模块必须先有配置开关：

```lua
features = {
    enable_example_module = false,
}
```

模块私有配置独立成区：

```lua
example_module = {
    message = 'example',
}
```

高风险模块必须再增加 risk 开关：

```lua
risk = {
    enable_example_sql = false,
}
```

## Bootstrap 注册规范

新增模块后，在 `script/bootstrap.lua` 的模块表中注册：

```lua
local modules = {
    {
        key = 'example_module',
        feature = 'enable_example_module',
        module = 'script.modules.example_module',
    },
}
```

启动时必须用 `pcall` 包住模块 setup，避免单个模块异常影响整个启动流程。

## Handler 开发规范

handler 常用于道具触发逻辑。真实业务中必须遵守：

- item_id 必须写清楚来源。
- 不能使用模板中的示例 ID 作为真实业务 ID。
- 失败时要提示玩家并记录日志。
- 涉及发奖、删除、SQL、shell 时必须有 risk 开关。
- 参数必须严格校验。
- 不允许把用户输入直接拼入 SQL 或 shell。

## 日志规范

日志建议格式：

```lua
logger.info('[module] action=%s result=%s detail=%s', action, result, detail)
```

高风险操作必须记录：

- 操作者账号。
- 操作者角色。
- 目标对象。
- 参数。
- 结果。
- 失败原因。

## 错误处理规范

- 外部 API 调用建议用 `pcall` 包裹。
- 配置缺失时使用保守默认值。
- 能拒绝就拒绝，不要猜测执行。
- 失败路径也必须记录日志。

## 禁止事项

- 禁止入口文件直接写业务。
- 禁止默认开启高风险功能。
- 禁止通用 SQL 执行器。
- 禁止通用 shell 执行器。
- 禁止无日志的经济操作。
- 禁止无权限判断的 GM 功能。
