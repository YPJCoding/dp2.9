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

## 2. 下一批迁移候选

优先低风险、只读或独立功能，避免先迁充值、发物品、清背包、改库等高风险 GM 指令。

候选：

- [ ] `//指令` 菜单：只读菜单展示，可拆成 `command_menu.lua`。
- [ ] `//postwn` 城镇坐标：如仅查询/展示则可低风险迁移；需先确认旧实现是否改状态。
- [ ] `//view` 帮助菜单：当前 `item_query` 已支持 `//viewid` / `//viewname`，可补帮助菜单。

暂缓：

- [ ] `//send` 发物品，高风险。
- [ ] `//cz*` 充值/点券/代币/SP/TP/QP，高风险。
- [ ] `//set*` 改库，高风险。
- [ ] `//clearp*` 清背包，高风险。
- [ ] 强化/增幅保护，涉及装备成长和经济，暂缓。
