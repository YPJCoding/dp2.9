# 开发说明

## 目标

本模板用于快速开始新的 DP runtime 项目。

核心原则：

- 入口文件只负责启动。
- 业务逻辑必须放在模块中。
- 每个模块必须有独立配置开关。
- 高风险能力必须默认关闭。
- 新功能必须可单独测试、单独回滚。
- 文档必须先说明风险，再说明使用方式。

## 分支使用方式

推荐流程：

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
- 不执行 SQL / shell / delete。

### `df_game_r.js`

只负责 JS/Frida 侧启动：

- 调用 JS 启动函数。
- 加载 JS 模块。
- 不直接堆业务 hook。
- 不直接散落真实地址。
- 不直接写内存 patch。

## 配置原则

所有功能必须先有配置，再有实现。

低风险功能：

```lua
features = {
    enable_example_module = false,
}
```

高风险功能还需要 risk 开关：

```lua
risk = {
    enable_example_risky_feature = false,
}
```

默认值必须保守，不能为了测试方便默认开启高风险功能。

## Lua 模块规范

Lua 模块应使用：

```lua
local M = {}

function M.setup(ctx)
    return M
end

return M
```

模块通过 `ctx` 获取能力：

- `ctx.config`
- `ctx.logger`
- `ctx.game`
- `ctx.dpx`

不要在模块中直接依赖全局状态。

详细规范见 [Lua 模块开发指南](LUA_MODULE_GUIDE.md)。

## JS/Frida 模块规范

JS 模块应提供明确启动函数：

```js
function startExampleModule() {
    console.log('started');
}
```

涉及 hook/patch 的模块必须：

- 写清楚地址来源。
- 写清楚服务端版本。
- 写清楚风险。
- 有重复 hook 防护。
- 有配置开关。
- 默认关闭。

详细规范见 [Frida/JS 模块开发指南](FRIDA_MODULE_GUIDE.md)。

## 日志规范

模块日志建议包含：

- 模块名。
- 动作。
- 结果。
- 关键参数。
- 错误信息。

示例：

```lua
logger.info('[example_module] action=%s result=%s', action, result)
```

日志不能替代权限判断，也不能吞掉关键错误。

## 测试规范

每个新业务功能至少提供：

1. 默认关闭验证。
2. 开启后主路径验证。
3. 参数错误验证。
4. 权限不足验证。
5. 失败路径验证。
6. 日志检查。
7. 不影响其他模块的回归检查。

## 禁止事项

- 不要在入口文件堆业务逻辑。
- 不要默认开启高风险功能。
- 不要写通用 SQL 执行器。
- 不要写通用 shell 执行器。
- 不要把 GM 输入直接拼进 SQL。
- 不要在 JS 模块中散落裸地址。
- 不要隐藏真实风险。
