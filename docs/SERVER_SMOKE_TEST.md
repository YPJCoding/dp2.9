# 服务器烟测记录

本文档记录 `refactor/dp2-9-base` 分支在真实服务器 / 容器环境中的烟测结果。

## 1. 测试环境

- 容器仓库：`1995chen/dnf`
- DP 版本日志：`dp 2.9.0`
- 测试频道：`siroco11`
- 日志路径：`/data/log/siroco11/dp2/dp2_2026-06-04.log`
- 测试角色：`acc=18000000 chr=1`

## 2. 启动链路验证

已确认启动日志正常出现：

```text
[lua] opt: siroco11
[bootstrap] installed legacy utils
[bootstrap] registered handler module=script.handlers.quest
[bootstrap] registered handler module=script.handlers.job
[bootstrap] registered handler module=script.handlers.inherit
[bootstrap] registered handler module=script.handlers.misc
[bootstrap] registered handler module=script.handlers.item_cleanup
[bootstrap] registered handler module=script.handlers.pvp
[debug] enable_useitem_trace=false
[frida] loaded
[hook] registered Reach_GameWord
[bootstrap] applied dpx startup config
[hook] registered UseItem1
[hook] registered UseItem2
```

结论：

- DP2 本体加载成功。
- Lua 入口 `/dp2/df_game_r.lua` 执行成功。
- `script/bootstrap.lua` 加载成功。
- 所有 handler 模块注册成功。
- `script/config.lua` 生效。
- `frida.load` 成功。
- `Reach_GameWord` / `UseItem1` / `UseItem2` hook 注册成功。

## 3. 登录 hook 验证

登录角色后已确认出现：

```text
[hook][Reach_GameWord] acc: 18000000 chr: 1
```

结论：

- `Reach_GameWord` hook 正常。
- 游戏内上线提示已出现。

## 4. UseItem hook 验证

### 4.1 问题现象

最初只注册 `UseItem2` 时，使用 7457、1034-1037 等城镇可用道具没有任何 `useitem` 日志。

### 4.2 HookType 探针结果

通过打印 `game.HookType`，确认 DP 2.9 可用道具相关 hook 为：

```text
UseItem1=17
UseItem2=18
```

`UseItem` 不存在。

### 4.3 UseItem1 实测结果

注册 `UseItem1` 探针后，使用 1034-1037 经验书出现：

```text
[hook][UseItem1] argc=3 arg1=userdata:userdata: 0xe1fa500c, arg2=number:1034, arg3=number:58
[hook][UseItem1] argc=3 arg1=userdata:userdata: 0xe1fa500c, arg2=number:1037, arg3=number:59
[hook][UseItem1] argc=3 arg1=userdata:userdata: 0xe1fa500c, arg2=number:1036, arg3=number:60
[hook][UseItem1] argc=3 arg1=userdata:userdata: 0xe1fa500c, arg2=number:1035, arg3=number:61
```

参数结论：

```text
arg1 = user
arg2 = item_id
arg3 = slot / position
```

### 4.4 正式分发验证

临时 debug handler 开启时，使用 1034-1037 出现：

```text
[useitem1][trace] acc: 18000000 chr: 1 item_id: 1034 slot: 58 has_handler: true
[useitem][test] acc=18000000 chr=1 item_id=1034
[useitem] hook: UseItem1 acc: 18000000 chr: 1 item_id: 1034 slot: 58
```

结论：

- 普通右键消耗品走 `UseItem1`。
- `UseItem1 -> item_handler` 分发链路已验证成功。
- `UseItem2` 仍保留作为兼容入口。

## 5. 正式收敛状态

已完成正式收敛：

- `UseItem1` 已正式接入 `item_handler` 分发。
- `UseItem2` 保留兼容。
- 1034-1037 临时 debug handler 已关闭。
- `enable_useitem_trace=false` 已生效。

正式收敛后的启动日志已确认：

```text
[debug] enable_useitem_trace=false
[hook] registered UseItem1
[hook] registered UseItem2
[hook][Reach_GameWord] acc: 18000000 chr: 1
```

## 6. 高风险默认关闭代码级确认

已完成代码级确认并补充拒绝 / 返还日志：

- `script/handlers/job.lua`
  - SQL 类职业转换默认受 `risk.enable_sql_handlers=false` 控制。
  - 默认关闭时拒绝执行 SQL，并返还道具。
- `script/handlers/misc.lua`
  - SQL 类角色出战、装备设计图熟练度默认受 `risk.enable_sql_handlers=false` 控制。
  - 默认关闭时拒绝执行 SQL，并返还道具。
- `script/handlers/item_cleanup.lua`
  - 删除类宠物 / 时装 / 装备清理默认受 `risk.enable_delete_handlers=false` 控制。
  - 默认关闭时拒绝删除，并返还道具。
- `script/handlers/pvp.lua`
  - PVP shell 类能力默认受 `risk.enable_shell_handlers=false` 控制。
  - 默认关闭时拒绝执行 shell，并返还道具。

统一日志格式：

```text
[useitem][reject] module=xxx risk=xxx acc=... chr=... item_id=... reason=...
[useitem][return] module=xxx acc=... chr=... item_id=... reason=...
```

## 7. 暂不验证项

当前 PVF 暂不添加以下正式 DP 道具，放到最后阶段验证：

- `2021458802` 主线任务清理
- `2021458808` 每日任务清理
- `2021458809` 成就任务清理
- `2021458804` 异界 E2 重置
- `2021458805` 异界 E3 重置
- `2022110505` 装备继承

这些不阻塞当前安全可部署底板验收。

## 8. 当前结论

安全可部署底板当前状态：

```text
启动链路：通过
bootstrap：通过
handler 注册：通过
frida.load：通过
Reach_GameWord：通过
UseItem1：通过
UseItem1 -> item_handler：通过
UseItem2：保留兼容
临时 debug handler：已关闭
高风险默认关闭：代码级确认通过，服务器实测后置
PVF 正式道具：后置
```
