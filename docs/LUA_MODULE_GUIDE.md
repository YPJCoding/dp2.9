# Lua 模块开发指南

## 目标

Lua 侧模块用于承载项目运行时逻辑。入口文件建议只负责启动，具体功能可以放入 `script/modules/` 或 `script/handlers/`。

本文档只说明模板结构和编码风格，不规定真实项目的业务逻辑。

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

普通模块可以使用 `setup(ctx)`：

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

handler 模块可以使用 `register(handler_table, ctx)`：

```lua
local M = {}

function M.register(handler_table, ctx)
    local logger = ctx and ctx.logger

    if not handler_table then
        if logger then
            logger.error('[handler] missing handler_table')
        end
        return
    end

    -- 在真实项目中按项目需要补充注册逻辑
end

return M
```

## ctx 使用建议

模块建议通过 `ctx` 获取运行时能力：

- `ctx.config`：配置。
- `ctx.logger`：日志。
- `ctx.runtime`：运行时对象。

不建议直接依赖隐式全局变量。确实需要全局能力时，可以在入口或 bootstrap 里显式注入。

## 配置读取示例

模板提供一个简单配置结构，用于展示模块如何读取配置：

```lua
features = {
    enable_example_module = false,
}
```

模块私有配置也可以独立成区：

```lua
example_module = {
    message = 'example',
}
```

以上内容只是示例。真实项目可以按自身需要设计配置结构和功能接入方式。

## Bootstrap 注册示例

新增模块后，可以在 `script/bootstrap.lua` 的模块表中注册：

```lua
local modules = {
    {
        key = 'example_module',
        feature = 'enable_example_module',
        module = 'script.modules.example_module',
    },
}
```

启动时可以用 `pcall` 包住模块 setup，避免单个模块异常影响整个启动流程。

## Handler 开发结构

handler 可用于运行时事件接入。模板只展示结构，不提供真实业务绑定。

建议：

- 示例 handler 不绑定真实项目标识。
- 示例 handler 不包含真实业务配置。
- 示例 handler 不包含真实业务逻辑。
- 真实项目可以按自身需要定义注册来源、参数处理和返回行为。

## 日志格式建议

日志建议格式：

```lua
logger.info('[module] action=%s result=%s detail=%s', action, result, detail)
```

日志字段可以按项目需要扩展。

## 错误处理建议

- 外部调用可以用 `pcall` 包裹。
- 配置缺失时可以提供清晰日志。
- 失败路径建议记录必要上下文，便于排查。

## 模板注意事项

- 入口文件不写真实业务逻辑。
- 模板分支不保留真实业务模块。
- 模板示例不绑定真实项目标识。
- 模板文档不规定具体业务功能的实现策略。