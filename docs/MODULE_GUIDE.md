# 模块开发指南

本文档是模块开发总览。Lua 细节见 [LUA_MODULE_GUIDE.md](LUA_MODULE_GUIDE.md)，Frida/JS 细节见 [FRIDA_MODULE_GUIDE.md](FRIDA_MODULE_GUIDE.md)。

## 模块拆分建议

- 一个相对独立的功能可以放在一个模块中。
- 入口文件建议只做启动。
- 公共配置可以集中放在 `script/config.lua`。
- 模块注册可以集中放在 `script/bootstrap.lua` 或 JS 启动调度文件中。

这些建议只用于保持模板结构清晰，不限制真实项目的业务实现方式。

## 新增 Lua 模块

1. 在 `script/modules/` 新建模块。
2. 按项目需要读取配置。
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

handler 可用于运行时事件接入。

模板建议：

- 不绑定真实项目标识作为模板默认值。
- 只展示注册结构。

## 新增 JS/Frida 模块

1. 在 `script/js/` 新建模块。
2. 提供 `startXxx()`。
3. 按项目需要从 JS 入口或 loader 中加载。
4. 涉及 hook 时建议使用防重复 attach。
5. 运行时地址建议集中管理，不要散落在多个模块中。

示例：

```js
var g_example_started = false;

function startExampleFeature(cfg, addresses) {
  if (g_example_started) {
    console.log('[example] already started');
    return;
  }

  if (!cfg || cfg.enabled !== true) {
    console.log('[example] config not enabled');
    return;
  }

  g_example_started = true;
  console.log('[example] started');
}

if (typeof globalThis !== 'undefined') {
  globalThis.startExampleFeature = startExampleFeature;
}
```

上面的 `cfg.enabled` 只是配置读取示例，不代表真实项目必须使用相同启用方式。

## 配置读取示例

模板提供一个配置结构示例：

```lua
features = {
    enable_example_module = false,
}
```

真实项目可以按自身需要设计配置结构。

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
- 使用 2 空格缩进。