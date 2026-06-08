# 模块开发指南

本文档是模块开发总览。Lua 细节见 [LUA_MODULE_GUIDE.md](LUA_MODULE_GUIDE.md)，Frida/JS 细节见 [FRIDA_MODULE_GUIDE.md](FRIDA_MODULE_GUIDE.md)。

## 模块拆分原则

- 一个功能一个模块。
- 入口文件只做启动。
- 配置集中放在 `script/config.lua`。
- 模块注册集中放在 `script/bootstrap.lua` 或 JS 启动调度文件中。
- 高风险功能必须默认关闭。
- 模块必须可单独开启、单独关闭、单独回滚。

## 新增 Lua 模块

1. 在 `script/modules/` 新建模块。
2. 在 `script/config.lua` 中新增配置开关。
3. 在 `script/bootstrap.lua` 中注册模块。
4. 默认关闭。
5. 补充测试说明。

示例：

```lua
local M = {}

function M.setup(ctx)
    local logger = ctx.logger
    if logger then
        logger.info('module started')
    end
    return M
end

return M
```

## 新增 Lua handler

handler 用于道具触发或事件触发类功能。

要求：

- 不绑定真实 item_id 作为模板默认值。
- 真实业务中 item_id 必须写清楚来源。
- 高风险 handler 必须有 risk 开关。
- 失败时应清晰提示并记录日志。
- 涉及发奖、删除、SQL、shell 的 handler 必须单独 review。

## 新增 JS/Frida 模块

1. 在 `script/js/` 新建模块。
2. 提供 `startXxx()`。
3. 在 JS 入口或 loader 中按配置加载。
4. 涉及 hook 时必须防重复 attach。
5. 真实地址集中放入地址文件，不要散落在业务模块。

示例：

```js
var g_example_started = false;

function startExampleFeature(cfg, addresses) {
    if (g_example_started) {
        console.log('[example] already started');
        return;
    }
    g_example_started = true;

    if (!cfg || cfg.enabled !== true) {
        console.log('[example] disabled');
        return;
    }

    console.log('[example] started');
}

if (typeof globalThis !== 'undefined') {
    globalThis.startExampleFeature = startExampleFeature;
}
```

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

## 命名规范

Lua：

- 文件名使用 `snake_case.lua`。
- 局部函数使用 `snake_case`。
- 模块表统一命名为 `M`。
- 对外入口使用 `setup(ctx)` 或 `register(...)`。

JS：

- 文件名使用 `snake_case.js`。
- 启动函数使用 `startXxxFeature()`。
- 防重复变量使用 `g_xxx_started`。
- 地址对象命名应包含项目/版本前缀。

## Review 检查清单

新增模块前至少检查：

- 是否默认关闭。
- 是否有配置说明。
- 是否有日志。
- 是否有测试说明。
- 是否改了入口文件业务逻辑。
- 是否引入 SQL / shell / delete。
- 是否影响其他模块启动顺序。
- JS 是否有裸地址和重复 hook 风险。
