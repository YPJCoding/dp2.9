# 开发说明

## 目标

本模板用于快速开始新的 DP runtime 项目。

核心原则：

- 入口文件只负责启动。
- 示例模块只展示结构。
- 模板分支不包含真实业务逻辑。
- 模板分支不规定具体业务实现方式。

## 分支使用方式

```text
template/clean-runtime-skeleton
  -> your-project/business-branch
```

不要把模板分支合并回业务主线。模板分支只用于拉新项目底板。

## 入口文件职责

### `df_game_r.lua`

建议只负责 Lua 侧启动：

- 创建或接收 `ctx`。
- 调用 `script.bootstrap`。
- 不写真实业务逻辑。
- 不绑定真实 item_id。

### `df_game_r.js`

建议只负责 JS/Frida 侧启动：

- 调用 JS 启动函数。
- 加载 JS 模块。
- 不直接堆真实业务逻辑。
- 不直接散落真实地址。

## 配置示例

模板提供一个最小配置示例，用于展示模块读取配置的方式。

```lua
features = {
    enable_example_module = false,
}
```

该配置仅用于示例，不代表真实项目必须使用相同配置结构或启用方式。

## Lua 模块结构

```lua
local M = {}

function M.setup(ctx)
    return M
end

return M
```

模块可以通过 `ctx` 获取运行时对象。

## JS/Frida 模块结构

```js
function startExampleModule() {
    console.log('started');
}
```

JS 模块可以通过启动函数接入。

## 本地检查

```bash
bash tools/check_js_syntax.sh
bash tools/check_lua_syntax.sh
```

## 模板分支边界

- 不在入口文件写真实业务逻辑。
- 不在模板分支保留具体业务模块。
- 不在模板分支保留真实运行时地址。
- 不在模板分支保留真实 item_id。
- 不在模板文档中规定具体业务功能的启用方式。