# 开发说明

## 目标

本模板用于快速开始新的 DP runtime 项目。

核心原则：

- 入口文件只负责启动。
- 业务逻辑放在模块中。
- 示例功能默认关闭。
- 模板分支不包含真实业务逻辑。

## 分支使用方式

```text
template/clean-runtime-skeleton
  -> your-project/business-branch
```

不要把模板分支合并回业务主线。模板分支只用于拉新项目底板。

## 入口文件职责

### `df_game_r.lua`

只负责 Lua 侧启动：

- 创建或接收 `ctx`。
- 调用 `script.bootstrap`。
- 不写业务逻辑。
- 不绑定真实 item_id。

### `df_game_r.js`

只负责 JS/Frida 侧启动：

- 调用 JS 启动函数。
- 加载 JS 模块。
- 不直接堆业务逻辑。
- 不直接散落真实地址。

## 配置原则

功能通过配置开关启用。

```lua
features = {
    enable_example_module = false,
}
```

## Lua 模块结构

```lua
local M = {}

function M.setup(ctx)
    return M
end

return M
```

模块通过 `ctx` 获取运行时对象。

## JS/Frida 模块结构

```js
function startExampleModule() {
    console.log('started');
}
```

JS 模块通过启动函数接入。

## 本地检查

```bash
bash tools/check_js_syntax.sh
bash tools/check_lua_syntax.sh
```

## 模板分支边界

- 不在入口文件写业务逻辑。
- 不在模板分支保留具体业务模块。
- 不在模板分支保留真实运行时地址。
- 不在模板分支保留真实 item_id。
