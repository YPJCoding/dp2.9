# 模块开发指南

本文档是模块开发总览。Lua 细节见 [LUA_MODULE_GUIDE.md](LUA_MODULE_GUIDE.md)，Frida/JS 细节见 [FRIDA_MODULE_GUIDE.md](FRIDA_MODULE_GUIDE.md)。

## 模块拆分原则

- 一个功能一个模块。
- 入口文件只做启动。
- 配置集中放在 `script/config.lua`。
- 模块注册集中放在 `script/bootstrap.lua` 或 JS 启动调度文件中。

## 新增 Lua 模块

1. 在 `script/modules/` 新建模块。
2. 在 `script/config.lua` 中新增配置开关。
3. 在 `script/bootstrap.lua` 中注册模块。

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

handler 用于运行时事件接入。

要求：

- 不绑定真实 item_id 作为模板默认值。
- 只展示注册结构。

## 新增 JS/Frida 模块

1. 在 `script/js/` 新建模块。
2. 提供 `startXxx()`。
3. 在 JS 入口或 loader 中按配置加载。
4. 涉及 hook 时使用防重复 attach。
5. 真实地址集中放入地址文件，不要散落在业务模块。

示例：

```js
var g_example_started = false;

function startExampleFeature(cfg, addresses) {
    if (g_example_started) {
        console.log('[example] already started');
        return;
    }

    if (!cfg || cfg.enabled !== true) {
        console.log('[example] disabled');
        return;
    }

    g_example_started = true;
    console.log('[example] started');
}

if (typeof globalThis !== 'undefined') {
    globalThis.startExampleFeature = startExampleFeature;
}
```

## 配置要求

功能通过配置开关启用：

```lua
features = {
    enable_example_module = false,
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
