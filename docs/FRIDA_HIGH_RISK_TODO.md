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

状态：`[!] 已接入 startup_modules 启动适配并建立状态承接模块，核心实现仍在 df_game_r.js，默认开启但未专项验证`

相关文件：

```text
df_game_r.js
script/js/village_attack.js
script/js/village_attack_state.js
script/js/startup_modules.js
script/config.lua
```

当前配置：

```lua
js_features.enable_village_attack = true
```

已完成：

- [x] 新增 `script/js/village_attack.js` 启动适配模块。
- [x] `village_attack.js` 增加启动请求保护，避免适配入口被重复调用。
- [x] `village_attack.js` 会对旧 `start_event_villageattack` 安装 guard，避免过渡期双路径重复启动。
- [x] `startup_modules.js` 已按 `enable_village_attack` 调用 `startVillageAttack()`。
- [x] 新增 `script/js/village_attack_state.js`，承接状态常量、默认状态对象和低风险状态 helper。
- [x] `village_attack.js` 启动时会加载 `village_attack_state.js`。
- [x] 暂不迁移奖励、刷怪、UI 包、DB 结算等核心逻辑，避免一次性高风险变更。

过渡期说明：

- `df_game_r.js` 内的旧直接 `start_event_villageattack` 调度已由本地提交删除后，应只通过 `startup_modules.js -> startVillageAttack()` 启动。
- `df_game_r.js` 内仍保留怪物攻城状态常量、`villageAttackEventInfo` 和旧状态函数定义。
- `village_attack_state.js` 当前只在缺失时补齐全局定义，不强制覆盖旧状态，避免热加载或重复加载时重置活动进度。
- 下一步确认启动日志稳定后，再从 `df_game_r.js` 删除重复状态定义和纯状态函数。

风险点：

- 依赖 MySQL / `frida.game_event`。
- 涉及定时器、刷怪、UI 包、攻城状态、PT、邮件奖励。
- 核心实现当前仍混在 `df_game_r.js` 中，尚未完成独立模块迁移。
- `start()` 调度中 DB 初始化时序已通过 `village_attack.js` retry 做缓解，但仍需测试服日志确认。

后续迁移要求：

- [x] 建立 `script/js/village_attack.js` 迁移承接文件。
- [x] 增加启动适配层的重复启动保护。
- [x] 将 `startup_modules.js` 接入 `startVillageAttack()`。
- [x] 删除 `df_game_r.js` 中旧的 `api_scheduleOnMainThread(start_event_villageattack, null)` 直接调度。
- [x] 增加 DB 未就绪保护：`village_attack.js` 会等待 `mysql_taiwan_cain` / `mysql_frida` 初始化后再调用旧 `start_event_villageattack`。
- [x] 小步拆出状态与常量承接模块：`village_attack_state.js`。
- [~] 小步拆出纯状态函数：已在 `village_attack_state.js` 提供状态重置、剩余时间、难度设置、进度广播 helper；旧函数体仍保留在 `df_game_r.js`，待启动稳定后删除/切换。
- [ ] 小步拆出定时器与启动流程。
- [ ] 最后拆出高风险 hook、刷怪、PT、结算、奖励邮件。
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

- [x] 将 `df_game_r.js` 启动入口从旧内联函数切换到 `script/js/luck_point_drop.js`。
- [ ] 确认 `g_luck_point_current_user` 生命周期是否覆盖所有掉落入口。
- [ ] 测试不同 rarity 的幸运值变化。
- [ ] 决定默认开关是否继续保持 true。

## 4. 在线奖励 / 幸运在线玩家

状态：`[~] online_reward 已拆模块，lucky_online 已补兼容桩，默认关闭`

相关文件：

```text
script/js/online_reward.js
script/js/lucky_online.js
script/config.lua
```

当前配置：

```lua
js_features.enable_online_reward = false
js_features.enable_lucky_online = false
```

已完成：

- [x] 从旧 `enable_online_reward()` 拆出 `script/js/online_reward.js`。
- [x] `online_reward` 增加重复 hook 保护。
- [x] `online_reward` 保留旧入口 `enable_online_reward()`。
- [x] 新增 `script/js/lucky_online.js` 兼容入口 `start_event_lucky_online_user()`。
- [x] `lucky_online` 默认保持关闭，且不凭空实现抽奖/发奖逻辑。
- [x] `startup_modules.js` 已接入 `online_reward` / `lucky_online` 开关调度。

风险点：

- `online_reward` 会按在线时长发点券。
- `lucky_online` 可能发点券、发道具或邮件，但当前未找到明确旧函数体。
- 与经济系统强相关。

后续迁移要求：

- [x] 将 `df_game_r.js` 启动入口从旧内联函数切换到 `script/js/online_reward.js`。
- [x] 将 `df_game_r.js` 启动入口从旧缺失函数切换到 `script/js/lucky_online.js`。
- [ ] 确认 `lucky_online` 的真实来源或旧实现。
- [ ] 奖励项配置化。
- [ ] 增加每日/每账号限制。
- [ ] 增加日志和防重复发放。
- [ ] 测试通过前保持默认关闭。

## 5. 掉落公告 / 掉落奖励

状态：`[~] 已拆模块，默认关闭，待专项测试`

相关文件：

```text
script/js/drop_announce.js
script/js/startup_modules.js
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
- [x] `startup_modules.js` 已按开关加载 `drop_announce`，供 `history_log` 复用处理函数。

后续要求：

- [ ] 确认公告触发点、物品 rarity 阈值、奖励逻辑。
- [ ] 确认点券奖励范围是否继续使用 `50 ~ 888`。
- [ ] 测试通过前保持默认关闭。
