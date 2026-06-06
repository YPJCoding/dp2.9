# Next Migration TODO

本文档记录当前已经迁移但尚未测试服验证的功能，以及下一批迁移候选。

## 1. 已迁移，待测试服验证

### 1.1 signin 每日签到

状态：`[~] 已迁移，待测试`

相关文件：

```text
script/modules/signin.lua
script/config.lua
docs/SIGNIN_TEST_CHECKLIST.md
```

配置状态：

```lua
features.enable_signin = false
```

待办测试：

- [ ] 默认关闭时，`//qd` 不触发签到奖励。
- [ ] 开启 `features.enable_signin=true` 并重启后，日志出现 `[signin] registered GmInput hook`。
- [ ] 首次输入 `//qd` 后，邮件收到 `3340 x1`。
- [ ] 同一角色重复输入 `//qd`，不重复发邮件，并提示剩余冷却时间。
- [ ] 可选：`broadcast_enabled=true` 时签到成功后全服广播。
- [ ] 可选：`require_gm=true` 时普通玩家被拒绝，GM 可签到。

### 1.2 player_info 个人信息查询

状态：`[~] 已迁移，待测试`

相关文件：

```text
script/modules/player_info.lua
script/config.lua
docs/PLAYER_INFO_TEST_CHECKLIST.md
```

配置状态：

```lua
features.enable_player_info = true
player_info.command = "//myinfo"
```

待办测试：

- [ ] 重启后日志出现 `[player_info] registered GmInput hook command=//myinfo`。
- [ ] 输入 `//myinfo` 后展示账号编号、角色编号、角色姓名、等级、职业、转职、副职、疲劳。
- [ ] 日志出现 `[player_info][myinfo]`。
- [ ] 关闭 `features.enable_player_info=false` 并重启后，`//myinfo` 不触发模块逻辑。

### 1.3 command_menu 指令菜单

状态：`[~] 已迁移，待测试`

相关文件：

```text
script/modules/command_menu.lua
script/config.lua
```

配置状态：

```lua
features.enable_command_menu = true
command_menu.command = "//指令"
```

待办测试：

- [ ] 重启后日志出现 `[command_menu] registered GmInput hook command=//指令`。
- [ ] 输入 `//指令` 后展示当前已开放的安全命令。
- [ ] `features.enable_signin=false` 时，菜单显示每日签到暂未开放。
- [ ] 菜单不展示 `//send`、`//cz*`、`//set*`、`//clearp*` 等高风险未开放命令。
- [ ] 关闭 `features.enable_command_menu=false` 并重启后，`//指令` 不触发模块逻辑。

### 1.4 item_query 查询帮助

状态：`[~] 已迁移，待测试`

相关文件：

```text
script/modules/item_query.lua
```

配置状态：

```lua
features.enable_item_query = true
```

待办测试：

- [ ] 输入 `//view` 后展示物品查询帮助。
- [ ] 输入 `//viewid <物品名称>` 可查询物品 ID。
- [ ] 输入 `//viewname <物品ID>` 可查询物品名称。
- [ ] 兼容旧写法：`//viewid物品名称`。
- [ ] 兼容旧写法：`//viewname物品ID`。
- [ ] 输入 `//viewid` 空参数时提示正确用法。
- [ ] 输入 `//viewname非数字` 时提示正确用法。

## 2. 下一批迁移候选

优先低风险、只读或独立功能，避免先迁充值、发物品、清背包、改库等高风险 GM 指令。

候选：

- [ ] 任务/职业/继承等只读帮助菜单：例如 `//getq`、`//zhiye`、`//trans` 的帮助文本；仅展示当前已迁移的道具券或暂未开放提示，不迁移改库子命令。
- [ ] `//pvp` 决斗信息帮助菜单：仅展示当前 PVP 经验书 handler 状态，不迁移 shell 执行命令。

待确认：

- [ ] `//postwn` 城镇坐标：当前在旧 `dp2` 仓库未找到 `postwn` / `//post` / 坐标相关实现；需要确认真实来源或正确指令名后再迁移。

暂缓：

- [ ] `//send` 发物品，高风险。
- [ ] `//cz*` 充值/点券/代币/SP/TP/QP，高风险。
- [ ] `//set*` 改库，高风险。
- [ ] `//clearp*` 清背包，高风险。
- [ ] 强化/增幅保护，涉及装备成长和经济，暂缓。
