# 模块开发指南

## 新增 Lua 模块

1. 在 `script/modules/` 新建模块。
2. 在 `script/config.lua` 中新增配置开关。
3. 在 `script/bootstrap.lua` 中注册模块。
4. 默认关闭。
5. 补充测试说明。

## 示例

```lua
local M = {}

function M.setup(ctx)
    local logger = ctx.logger
    if logger then
        logger.info("module started")
    end
    return M
end

return M
```

## 新增 JS 模块

1. 在 `script/js/` 新建模块。
2. 提供 `startXxx()`。
3. 在 JS 入口或 loader 中按配置加载。
4. 涉及 hook 时必须防重复 attach。

## 配置要求

所有功能必须有配置开关：

```lua
features = {
    enable_example_module = false,
}
```

高风险功能还必须有 risk 开关：

```lua
risk = {
    enable_example_risky_feature = false,
}
```
