# 开发说明

## 目标

本模板用于快速开始新的 DP runtime 项目。

核心原则：

- 入口文件只负责启动。
- 业务逻辑必须放在模块中。
- 每个模块必须有独立配置开关。
- 高风险能力必须默认关闭。
- 新功能必须可单独测试、单独回滚。

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

## JS 模块规范

JS 模块应提供明确启动函数：

```js
function startExampleModule() {
    console.log('started');
}
```

涉及 hook/patch 的模块必须：

- 写清楚地址来源
- 写清楚服务端版本
- 写清楚风险
- 有重复 hook 防护
- 有配置开关
- 默认关闭

## 禁止事项

- 不要在入口文件堆业务逻辑。
- 不要默认开启高风险功能。
- 不要写通用 SQL 执行器。
- 不要写通用 shell 执行器。
- 不要把 GM 输入直接拼进 SQL。
- 不要隐藏真实风险。
