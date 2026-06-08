# 代码自检记录

本文档记录入口模块化后的代码自检结论。

## 1. 自检范围

本次自检覆盖：

- `df_game_r.lua`
- `script/bootstrap.lua`
- `script/config.lua`
- `script/handlers/quest.lua`
- `script/handlers/job.lua`
- `script/handlers/inherit.lua`
- `script/handlers/misc.lua`
- `script/handlers/item_cleanup.lua`
- `script/handlers/pvp.lua`

## 2. 已确认事项

### 2.1 入口文件

`df_game_r.lua` 已瘦身为轻量入口，只负责：

- 初始化 DP/DPX/Game/World/Logger
- 加载 `script/bootstrap.lua`
- 加载 `df.frida`
- 注册 `on_frida_call`
- 注册上线提示 hook
- 注册 `UseItem2` hook
- 调用 `bootstrap.apply_dpx_startup(ctx)`

旧的 `item_handler[...]` 大段实现已经从入口移除。

### 2.2 handler 加载

当前 `script/config.lua` 已开启全部 handler 模块：

```lua
modular_handlers = {
    quest = true,
    job = true,
    item_cleanup = true,
    inherit = true,
    pvp = true,
    misc = true,
}
```

### 2.3 风险开关

高风险能力默认关闭：

```lua
risk = {
    enable_sql_handlers = false,
    enable_delete_handlers = false,
    enable_security_bypass = false,
    enable_shell_handlers = false,
}
```

默认关闭影响：

- SQL 类 handler 默认拒绝并返还道具。
- 删除类 handler 默认拒绝并返还道具。
- PVP shell handler 默认拒绝并返还道具。

## 3. 本次发现并修复的问题

### 3.1 模块注册顺序不稳定

问题：

`script/bootstrap.lua` 原先使用 `pairs(handler_modules)` 遍历模块，Lua 表遍历顺序不稳定。

风险：

如果未来出现 item_id 重叠，不同运行环境可能产生不同覆盖顺序。

修复：

改为数组形式，并使用 `ipairs` 固定注册顺序：

1. quest
2. job
3. inherit
4. misc
5. item_cleanup
6. pvp

### 3.2 `inherit.lua` 参数不一致

问题：

`inherit.lua` 中 `dpx.item.info` 原先使用 `user` 作为第一个参数。

风险：

大部分模块和原 DPX 用法都使用 `user.cptr`，参数不一致可能导致运行时异常。

修复：

统一改为：

```lua
dpx.item.info(user.cptr, game.ItemSpace.INVENTORY, slot)
```

### 3.3 PVP shell handler 缺少失败保护

问题：

`pvp.lua` 原先直接执行：

```lua
local handle = io.popen(...)
local sql = handle:read("*a")
```

风险：

脚本不存在、执行失败或返回空 SQL 时，可能导致空执行、报错或吞道具。

修复：

新增：

- `io.popen` 失败判断
- 空 SQL 判断
- 失败返还道具
- 错误日志
- 成功日志

### 3.4 过时注释

问题：

部分 handler 文件仍写着“接入 bootstrap 前不会改变运行行为”。

风险：

当前 handler 已经接入 bootstrap，这类注释会误导维护者。

修复：

更新注释为“已接入 bootstrap 加载链路”。

## 4. 暂未处理的问题

### 4.1 删除类 handler 的二次确认

当前删除类 handler 默认关闭。

如果后续开启 `enable_delete_handlers=true`，仍建议增加更细粒度保护，例如：

- 只允许 GM 使用
- 增加确认道具或二次确认
- 白名单角色 ID
- 更完整日志

### 4.2 SQL 类 handler 的回滚策略

当前 SQL 类 handler 默认关闭。

如果后续开启 `enable_sql_handlers=true`，仍需要：

- 数据库备份
- 明确影响表
- 记录变更前后状态
- 准备回滚 SQL

### 4.3 `df_game_r.js` 仍未深度整理

JS 侧目前只做了审查文档，尚未完成逐函数索引和未使用函数清理。

但当前优先级低于服务器启动验证。

## 5. 下一步建议

下一步应进入服务器烟测：

- 部署到测试环境。
- 启动普通频道。
- 查看 bootstrap 日志。
- 验证 `frida.load`。
- 验证 `UseItem2` hook。
- 测试低/中风险道具。
- 测试高风险道具默认拒绝并返还。

## 6. 当前进度

```text
安全可部署版：74%
完全功能恢复版：61%
```
