# Frida High Risk TODO

本文档记录 `df_game_r.js` / `script/js/*.js` 中尚未适合直接测试服开启的高风险功能。

## 1. 账号仓库扩展 `account_cargo`

状态：`[!] 已有迁移代码，默认关闭，高风险待拆分`

相关文件：

```text
script/js/account_cargo.js
script/config.lua
```

当前配置：

```lua
js_features.enable_account_cargo = false
```

风险点：

- 一次性 hook/replace 大量账号仓库函数。
- 涉及账号仓库容量、金钱、物品、DB load/save、压缩/解压逻辑。
- 与数据库 `account_cargo` 表结构强绑定。
- 出错可能导致账号仓库打不开、物品丢失或 DB 存档异常。

后续迁移要求：

- [ ] 给 `setMaxCAccountCargoSolt(maxSlot)` 增加重复启动保护。
- [ ] 将 `console.log(1)` 等调试输出改成明确日志。
- [ ] 按功能拆分测试：只读查询 -> 容量 -> load -> save -> insert/delete/move -> money。
- [ ] 确认 `account_cargo` DB 字段和旧服一致。
- [ ] 准备数据库备份和回滚方案。
- [ ] 测试通过前保持默认关闭。

## 2. 怪物攻城 `village_attack`

状态：`[!] 大型系统已存在于 df_game_r.js，默认开启但未专项验证`

相关文件：

```text
df_game_r.js
script/config.lua
```

当前配置：

```lua
js_features.enable_village_attack = true
```

风险点：

- 依赖 MySQL / `frida.game_event`。
- 涉及定时器、刷怪、UI 包、攻城状态、PT、邮件奖励。
- 当前仍混在 `df_game_r.js` 中，尚未拆成独立模块。
- `start()` 调度中 DB 初始化时序仍需确认。

后续迁移要求：

- [ ] 拆为 `script/js/village_attack.js`。
- [ ] 增加重复启动保护。
- [ ] 增加 DB 未就绪保护。
- [ ] 拆分测试：状态初始化 -> 活动开始 -> UI -> 刷怪 -> PT -> 结算 -> 奖励邮件。
- [ ] 决定默认开关是否继续保持 true。

## 3. 幸运点掉落 `luck_point_drop`

状态：`[~] 已拆模块，默认开启，高风险待入口切换/待测`

相关文件：

```text
script/js/luck_point_drop.js
df_game_r.js
script/config.lua
```

当前配置：

```lua
js_features.enable_luck_point_drop = true
```

已完成：

- [x] 从旧 `enable_drop_use_luck_point()` 拆出 `script/js/luck_point_drop.js`。
- [x] 增加重复启动保护，避免重复 attach/replace。
- [x] 保留旧入口 `enable_drop_use_luck_point()`。
- [x] 保留命运硬币修改幸运点入口 `use_ftcoin_change_luck_point()`。
- [x] 幸运点写入统一 clamp 到 `1 ~ 99999`。

风险点：

- 会 replace `CLuckPoint::GetItemRarity`。
- 直接影响装备出货品质概率。
- 会修改角色幸运值。
- 属于经济/掉落核心逻辑。

后续迁移要求：

- [ ] 将 `df_game_r.js` 启动入口从旧内联函数切换到 `script/js/luck_point_drop.js`。
- [ ] 确认 `g_luck_point_current_user` 生命周期是否覆盖所有掉落入口。
- [ ] 测试不同 rarity 的幸运值变化。
- [ ] 决定默认开关是否继续保持 true。

## 4. 在线奖励 / 幸运在线玩家

状态：`[~] online_reward 已拆模块，lucky_online 源实现待确认，默认关闭`

相关文件：

```text
script/js/online_reward.js
script/config.lua
```

当前配置：

```lua
js_features.enable_online_reward = false
js_features.enable_lucky_online = false
```

已完成：

- [x] 从旧 `enable_online_reward()` 拆出 `script/js/online_reward.js`。
- [x] 增加重复 hook 保护。
- [x] 保留旧入口 `enable_online_reward()`。
- [x] 默认保持关闭。

风险点：

- `online_reward` 会按在线时长发点券。
- `lucky_online` 可能发点券、发道具或邮件，但当前未找到明确旧函数体。
- 与经济系统强相关。

后续迁移要求：

- [ ] 将 `df_game_r.js` 启动入口从旧内联函数切换到 `script/js/online_reward.js`。
- [ ] 确认 `lucky_online` 的真实来源或旧实现。
- [ ] 奖励项配置化。
- [ ] 增加每日/每账号限制。
- [ ] 增加日志和防重复发放。
- [ ] 测试通过前保持默认关闭。

## 5. 掉落公告 / 掉落奖励

状态：`[~] 已拆模块，默认关闭，待入口接入/待测`

相关文件：

```text
script/js/drop_announce.js
script/config.lua
```

当前配置：

```lua
js_features.enable_drop_announce = false
```

已完成：

- [x] 从 `df_game_r.js` 残留 `processing_data(...)` 逻辑拆出 `script/js/drop_announce.js`。
- [x] 增加重复 hook 保护。
- [x] 默认保持关闭。

后续要求：

- [ ] 接入 `df_game_r.js` 启动调度。
- [ ] 确认公告触发点、物品 rarity 阈值、奖励逻辑。
- [ ] 确认点券奖励范围是否继续使用 `50 ~ 888`。
- [ ] 测试通过前保持默认关闭。
