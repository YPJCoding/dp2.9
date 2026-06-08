# dp2 未迁移功能清单

本文档记录 `YPJCoding/dp2` 中尚未迁移到 `dp2.9` 的功能，以及已经迁移但仍待测试服验证的功能。

迁移原则：

1. `dp2.9` 继续作为主底板，不整包覆盖 `dp2`。
2. 每次只迁移一个明确功能或一个小模块。
3. 所有新功能必须有配置开关。
4. 高风险功能默认关闭，除非明确决定恢复旧行为。
5. 涉及发物品、改库、删除、shell、经济系统的功能必须有日志。
6. JS/Frida 地址强绑定功能必须先记录版本、地址、风险，再决定是否迁移。

## 状态说明

- `[ ]` 未迁移。
- `[~]` 已迁移代码，待测试服验证或配置验证。
- `[x]` 已迁移并接入当前分支。
- `[!]` 高风险，默认暂缓或需专项验证。

## A. 已迁移基础能力

### A1. 在线玩家表 / 上下线记录

来源：`dp2/script/Work_Reload.lua`

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/online.lua`。
- 已注册 `Reach_GameWord` / `Leave_GameWord`。
- 已提供 `each/count/find_by_name/find_by_aid/find_by_cid` 查询接口。
- 当前由 `features.enable_online_module` 控制。

状态：`[x] 已迁移`

---

### A2. 全服消息 / 在线广播

来源：`dp2/script/Work_Reload.lua` 的 `sendPacketMessage(message, type)`。

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/broadcast.lua`。
- 依赖 `online.lua`。
- 已加入 `limits.broadcast_rate_per_min` 频率限制。
- 已提供 `send` / `send_to_aid`。
- 当前由 `features.enable_broadcast_module` 控制。

状态：`[x] 已迁移`

---

### A3. 物品查询指令

来源：`dp2/script/Work_Reload.lua` 中 `//viewid`、`//viewname`。

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/item_query.lua`。
- 通过 `GmInput` hook 拦截。
- 当前实现为只读查询，所有玩家可用。
- 当前由 `features.enable_item_query` 控制。
- 已将 hook 透传统一为 `fnext()`。

状态：`[x] 已迁移`

---

## B. 已迁移玩法规则模块

### B1. 配置热加载

来源：旧 `dp2/df_game_r.lua` 的 `Work_Reload.lua` 热加载思路。

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/hot_reload.lua`。
- 当前实现已从 `Work_Reload.lua` 脚本执行改为 **只监听 `/dp2/script/config.lua`**。
- `script/Work_Reload.lua` 已移除。
- `hot_reload.enabled = true`，默认开启。
- 当前仅热应用显式支持的运行时配置：`hot.finish_back_home`。
- `hot.finish_back_home.default_mode=0/5/1` 已实测可实时生效。
- `hot.finish_back_home.equipment_rarities={0,1}` 已实测对 `mode=2/3/4` 生效。
- 异常路径已做代码保护：配置加载失败、返回类型异常或配置应用失败时会保留旧配置并记录 `keep previous config`。
- 错误配置实测为可选项，不阻塞当前安全底板收尾。

状态：`[x] 已迁移，主路径已测试通过`

---

### B2. 经验副本 / 泡点奖励

来源：`dp2/script/Work_Reload.lua`

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/exp_dungeon.lua`。
- 依赖 `online.lua`。
- 已配置副本 ID、等级上限、经验比例、代币数量、执行间隔。
- 当前由 `features.enable_exp_dungeon` 控制。
- 当前配置等级上限为 85。
- 仍需测试服确认副本 `5000` 是否存在。

状态：`[~] 已迁移，待测试服验证`

---

### B3. 持物进图限制

来源：`dp2/script/Work_Reload.lua`

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/dungeon_gate.lua`。
- 使用 `GameEvent` hook。
- 规则由 `config.dungeon_gate.rules` 配置。
- 当前由 `features.enable_dungeon_gate` 控制。
- 当前默认规则表为空，因此不会注册 hook。

状态：`[~] 已迁移，待配置规则后验证`

---

### B4. 等级差限制掉落

来源：`dp2/script/Work_Reload.lua`

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/drop_rules.lua`。
- 注册 `CParty_DropItem` hook。
- 已配置等级差、豁免道具、提示文案。
- 当前由 `features.enable_drop_rules` 控制。

状态：`[~] 已迁移，待测试服验证`

---

### B5. 翻牌后自动回城 / 自动分解 / 自动出售 / 随机点券

来源：`dp2/script/Work_Reload.lua`

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/finish_back_home.lua`。
- 当前由 `features.enable_finish_back_home` 控制。
- 运行时配置位于 `hot.finish_back_home`，支持 config 热更新。
- 已修正 `mode=0`：完全关闭，不发点券、不回城、不分解/出售。
- 已修正 `GameEvent` 流程：副本完成事件只调用一次 `fnext()`。
- 已新增 `mode=5`：仅发放随机点券，不回城、不分解、不出售。
- 当前 `default_mode` 默认为 `5`。
- 已新增 `equipment_rarities` 单一装备品质白名单，分解和出售共用。
- 当前默认 `equipment_rarities = {0, 1}`，对应普通装备和高级装备。
- `mode=0/1/5` 已实测通过。
- `mode=2/3/4` 已实测遵守 `equipment_rarities={0,1}`，高级以上装备会跳过。

状态：`[x] 已迁移，主要模式已测试通过`

---

## C. GM / 经济 / 改库 / 删除相关功能

### C1. GM 聊天指令系统

来源：`dp2/script/Work_Reload.lua`

当前 `dp2.9` 状态：

- 尚未整体迁移聊天指令系统。
- 已有 `script/modules/gm_permissions.lua`，可通过 `user:IsGmMode()` 判断 GM。
- 部分道具券式功能已迁移到 handler，不等同于 GM 指令迁移。

迁移建议：

- 不整体迁移。
- 继续按命令逐个迁移。
- 每个命令必须有配置开关和日志。
- 高风险命令需要专项确认。

状态：`[!] 高风险暂缓`

---

### C2. 每日签到

来源：`dp2/script/Work_Reload.lua` 的 `//qd`。

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/signin.lua`。
- 已接入 `script/bootstrap.lua`。
- 已新增配置：`features.enable_signin` 和 `signin` 配置区。
- 默认关闭：`features.enable_signin = false`。
- 启用后通过 `GmInput` hook 监听 `//qd`。
- 默认奖励保持旧脚本口径：邮件发送 `3340 x1`。
- 默认每日 6 点重置。
- 当前仍使用内存记录签到状态；频道重启后签到记录会重置，保持旧脚本行为。
- 已新增测试清单：`docs/SIGNIN_TEST_CHECKLIST.md`。

状态：`[~] 已迁移，待测试服验证`

---

### C3. 充值 / 发奖 / 发物品 GM 指令

来源：`dp2/script/Work_Reload.lua`

当前 `dp2.9` 状态：

- `//send` 已迁移至 `script/modules/gm_send_item.lua`，默认关闭，仅 GM 可用，待测试服验证。
- `//cz*`（充值点券/代币/胜点/SP/TP/QP）尚未迁移，高风险暂缓。
- `//set*`（修改数据库表）尚未迁移，高风险暂缓。
- `//clearp*`（清理背包）尚未迁移，高风险暂缓。

迁移建议：

- 必须先实现 GM 权限。
- 必须写操作日志。
- 必须默认保守。
- `//cz*`、`//set*`、`//clearp*` 不建议进入安全可部署版。

状态：`[~] //send 已迁移；//cz* / //set* / //clearp* 仍暂缓`

---

### C4. 背包清理 GM 指令

来源：`dp2/script/Work_Reload.lua` 的 `//clearp*`。

当前 `dp2.9` 状态：

- 已有部分道具券触发的清理 handler。
- 尚未迁移聊天指令式清理。

迁移建议：

- 不优先迁移聊天指令式清理。
- 如需迁移，必须只允许 GM 使用。
- 删除类必须受 `risk.enable_delete_handlers` 控制。
- 必须记录日志。

状态：`[!] 高风险暂缓`

---

### C5. 强化 / 增幅保护

来源：`dp2/script/Work_Reload.lua` 的 `MyUpgrade`。

当前 `dp2.9` 状态：

- 尚未迁移。

迁移建议：

- 需要先确认 hook 签名、保护道具、装备槽位和失败回滚方式。
- 影响经济和装备成长，默认保守。

状态：`[ ] 未迁移`

---

### C6. 邮件多附件 / 发奖 API

来源：`dp2/script/Work_Reload.lua` 和相关发奖逻辑。

当前 `dp2.9` 状态：

- 尚未抽象为通用发奖模块。
- `signin.lua` 当前直接使用 `dpx.mail.item` 逐个发放奖励。

迁移建议：

- 后续可建立邮件/发奖封装模块。
- 所有调用必须记录账号、角色、物品、数量、来源。
- 高风险入口默认保守。

状态：`[ ] 未迁移为通用模块`

---

## D. 旧入口 hook / 启动补丁

### D1. 绝望之塔金币提示修复

来源：`dp2/df_game_r.lua`

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/legacy_patches.lua`。
- 由 `features.enable_legacy_patches` 和 `legacy_patches.enable_tower_gold_notice_fix` 控制。
- 默认关闭状态已验证。
- 子功能开启路径已测试服验证通过。

状态：`[x] 已迁移，已测试通过`

---

### D2. 城镇下线卡镇魂修复

来源：`dp2/df_game_r.lua`

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/legacy_patches.lua`。
- 城镇 ID 已配置化。
- 由 `features.enable_legacy_patches` 和 `legacy_patches.enable_save_town_fix` 控制。
- 默认关闭状态已验证。
- 子功能开启路径已测试服验证通过。

状态：`[x] 已迁移，已测试通过`

---

### D3. 开放极限祭坛

来源：`dp2/df_game_r.lua`

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/legacy_patches.lua`。
- 副本 ID 已配置化为 `legacy_patches.open_dungeon_ids`。
- 由 `features.enable_legacy_patches` 和 `legacy_patches.enable_open_extra_dungeons` 控制。
- 默认关闭状态已验证。
- 子功能开启路径已测试服验证通过。

状态：`[x] 已迁移，已测试通过`

---

### D4. `dp.mem.hotfix` 修复小明炸街

来源：`dp2/df_game_r.lua`

当前 `dp2.9` 状态：

- 尚未迁移。

迁移建议：

- 版本强绑定。
- 暂缓迁移。
- 必须记录服务端版本、地址、原值、新值和回滚方式。

状态：`[!] 高风险暂缓`

---

### D5. GM 模式

来源：`dp2/df_game_r.lua`

当前 `dp2.9` 状态：

- 已集中到 `script/config.lua` 的 `dpx_startup.enable_game_master`。
- 仍需确认正式服默认策略。

状态：`[x] 已迁移`

---

## E. JS / Frida 功能

当前策略：

- 已通过 `script/config.lua` 的 `js_features` 写入 `/dp2/frida/frida_config.json`。
- `df_game_r.js` 中已存在的功能不在本清单内重复展开。
- 新迁移 JS/Frida 地址强绑定能力前，必须先记录地址、版本、风险和回滚方式。

当前 `config.lua` 中部分 JS/Frida 功能已按需求默认开启，例如：

- `enable_village_attack`
- `enable_luck_point_drop`
- `enable_user_inout_hook`
- `enable_ranking`
- `enable_hidden_option`
- `enable_drop_announce`
- `enable_vip_login`
- `enable_batch_item_add`

仍需继续索引 / 确认的方向：

- 账号仓库扩展。
- 幸运在线玩家。
- 在线奖励。
- 随机属性继承。
- 自动解封随机属性装备。
- 取消新账号成长契约。

状态：`[~] 按功能逐项确认`
