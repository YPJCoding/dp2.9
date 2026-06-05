# dp2 未迁移功能清单

本文档记录 `YPJCoding/dp2` 中尚未迁移到 `dp2.9` 的功能，以及已经迁移但仍待测试服验证的功能。

迁移原则：

1. `dp2.9` 继续作为主底板，不整包覆盖 `dp2`。
2. 每次只迁移一个明确功能或一个小模块。
3. 所有新功能必须有配置开关。
4. 高风险功能默认关闭。
5. 涉及发物品、改库、删除、shell、经济系统的功能必须有日志。
6. JS/Frida 地址强绑定功能必须先记录版本、地址、风险，再决定是否迁移。

## 状态说明

- `[ ]` 未迁移。
- `[~]` 已迁移代码，待测试服验证或配置验证。
- `[x]` 已迁移并接入当前分支。
- `[!]` 高风险，默认暂缓。

## A. 低风险基础能力

### A1. 在线玩家表 / 上下线记录

来源：`dp2/script/Work_Reload.lua`

功能：

- `Reach_GameWord` 时记录玩家在线。
- `Leave_GameWord` 时移除在线状态。
- 记录账号 ID、角色名等信息。
- 可作为全服广播、GM 工具、在线查询的基础模块。

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/online.lua`。
- 已注册 `Reach_GameWord` / `Leave_GameWord`。
- 已提供 `each/count/find_by_name/find_by_aid/find_by_cid` 查询接口。
- 当前由 `features.enable_online_module` 控制。

状态：`[x] 已迁移`

---

### A2. 全服消息 / 在线广播

来源：`dp2/script/Work_Reload.lua` 的 `sendPacketMessage(message, type)`。

功能：

- 遍历在线玩家。
- 对每个在线玩家调用 `SendNotiPacketMessage`。

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

功能：

- `//viewid 名称`：按名称查询物品 ID。
- `//viewname ID`：按 ID 查询物品名称。

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/item_query.lua`。
- 通过 `GmInput` hook 拦截。
- 当前实现为只读查询，所有玩家可用。
- 当前由 `features.enable_item_query` 控制。
- 已将 hook 透传统一为 `fnext()`。

状态：`[x] 已迁移`

---

## B. 玩法规则模块

### B1. 热加载 `Work_Reload.lua`

来源：`dp2/df_game_r.lua`

功能：

- 通过 `lfs.attributes` 检查 `/dp2/script/Work_Reload.lua` 修改时间。
- 使用 `loadfile(filename, "t", env)` 热加载脚本。
- `env` 暴露 `dp`、`dpx`、`game`、`world`、`logger`、`item_handler` 等上下文。

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/hot_reload.lua`。
- 已配置 `hot_reload.enabled/filename/start_delay_ms/interval_ms/run_on_start`。
- 默认关闭，仅建议测试服或开发环境启用。
- 文件不存在、编译失败、执行失败均只记录日志，不影响主入口。

状态：`[~] 已迁移，待测试服验证`

---

### B2. 经验副本 / 泡点奖励

来源：`dp2/script/Work_Reload.lua`

功能：

- 定时遍历在线玩家。
- 当玩家位于指定副本且等级低于上限时，按配置增加经验和代币。

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/exp_dungeon.lua`。
- 依赖 `online.lua`。
- 已配置副本 ID、等级上限、经验比例、代币数量、执行间隔。
- 当前由 `features.enable_exp_dungeon` 控制。
- 仍需测试服确认副本 `5000` 是否存在。

状态：`[~] 已迁移，待测试服验证`

---

### B3. 持物进图限制

来源：`dp2/script/Work_Reload.lua`

功能：

- 进入指定副本时检查队伍成员是否持有指定道具。

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

功能：

- 如果角色等级高于副本等级超过阈值，且没有指定道具，则阻止掉落。

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/drop_rules.lua`。
- 注册 `CParty_DropItem` hook。
- 已配置等级差、豁免道具、提示文案。
- 当前由 `features.enable_drop_rules` 控制。

状态：`[~] 已迁移，待测试服验证`

---

### B5. 翻牌后自动回城 / 自动分解 / 自动出售

来源：`dp2/script/Work_Reload.lua`

功能：

- 副本完成后按模式处理：关闭、奖励+回城、奖励+分解+回城、奖励+玩家分解机+回城、奖励+出售+回城。

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/finish_back_home.lua`。
- 当前由 `features.enable_finish_back_home` 控制。
- 已修正 `mode=0`：完全关闭，不发点券、不回城、不分解/出售。
- 已修正 `GameEvent` 流程：副本完成事件只调用一次 `fnext()`。
- `default_mode` 默认为 `0`。

状态：`[~] 已迁移，需复测`

---

## C. 高风险暂缓：GM / 经济 / 改库 / 删除

### C1. GM 聊天指令系统

来源：`dp2/script/Work_Reload.lua`

功能包括但不限于：

- `//指令`
- `//myinfo`
- `//qd`
- `//cz`
- `//view`
- `//send`
- `//setlv`
- `//getq`
- `//clearq`
- `//zhiye`
- `//pvp`
- `//clearp`
- `//moveequ`
- `//trans`
- `//e23rs`
- `//postwn`
- `//weak`
- `//set`
- `//disjoint1`
- `//disjoint2`
- `//sell`
- `//finishBackHomeM`

当前 `dp2.9` 状态：

- 尚未整体迁移聊天指令系统。
- 已有 `script/modules/gm_permissions.lua`，可通过 `user:IsGmMode()` 判断 GM。
- 部分道具券式功能已迁移到 handler，不等同于 GM 指令迁移。

迁移建议：

- 不整体迁移。
- 继续按命令逐个迁移。
- 每个命令必须有配置开关和日志。
- 默认关闭高风险命令。

状态：`[!] 高风险暂缓`

---

### C2. 每日签到

来源：`dp2/script/Work_Reload.lua` 的 `//qd`。

功能：

- 每日签到。
- 通过邮件发放奖励，例如 `3340 x1`。
- 使用内存表记录签到时间。

当前 `dp2.9` 状态：

- 尚未迁移。

迁移建议：

- 新增 `script/modules/signin.lua`。
- 奖励配置化。
- 签到记录不应只存在内存，至少应支持按日期持久化或数据库记录。
- 默认关闭。

状态：`[ ] 未迁移`

---

### C3. 充值 / 发奖 / 发物品 GM 指令

来源：`dp2/script/Work_Reload.lua`

功能：

- `//czdq` 充值点券。
- `//czdb` 充值代币。
- `//czsd` 充值胜点。
- `//czsp` 修改 SP。
- `//cztp` 修改 TP。
- `//czqp` 修改 QP。
- `//send` 发放物品，支持数量、强化等级、重复发放。

当前 `dp2.9` 状态：

- 尚未迁移。
- 已补充道具返还 / 发物品相关日志规范。

迁移建议：

- 必须先实现 GM 权限。
- 必须写操作日志。
- 必须默认关闭。
- 不建议进入安全可部署版。

状态：`[!] 高风险暂缓`

---

### C4. 背包清理 GM 指令

来源：`dp2/script/Work_Reload.lua` 的 `//clearp*`。

功能：

- 清理装备栏、消耗品栏、材料栏、任务栏、副职业材料栏、徽章栏、装扮栏、宠物栏、宠物装备栏等。

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
- 影响经济和装备成长，默认关闭。

状态：`[ ] 未迁移`

---

### C6. 邮件多附件 / 发奖 API

来源：`dp2/script/Work_Reload.lua` 和相关发奖逻辑。

当前 `dp2.9` 状态：

- 尚未迁移。

迁移建议：

- 先建立邮件/发奖封装模块。
- 所有调用必须记录账号、角色、物品、数量、来源。
- 默认关闭高风险入口。

状态：`[ ] 未迁移`

---

## D. 旧入口 hook / 启动补丁

### D1. 绝望之塔金币提示修复

来源：`dp2/df_game_r.lua`

功能：

- 注册 `CParty_UseAncientDungeonItems`。
- 对绝望之塔副本 `11008`~`11107` 直接返回 true。

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/legacy_patches.lua`。
- 由 `features.enable_legacy_patches` 和 `legacy_patches.enable_tower_gold_notice_fix` 控制。
- 默认关闭。

状态：`[~] 已迁移，待测试服验证`

---

### D2. 城镇下线卡镇魂修复

来源：`dp2/df_game_r.lua`

功能：

- 注册 `CUser_SaveTown`。
- 当下线城镇为 `13` 时改为 `11`。

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/legacy_patches.lua`。
- 城镇 ID 已配置化。
- 由 `features.enable_legacy_patches` 和 `legacy_patches.enable_save_town_fix` 控制。
- 默认关闭。

状态：`[~] 已迁移，待测试服验证`

---

### D3. 开放极限祭坛

来源：`dp2/df_game_r.lua`

功能：

- 注册 `Open_Dungeon`。
- 对副本 `11007` 返回 true。

当前 `dp2.9` 状态：

- 已迁移到 `script/modules/legacy_patches.lua`。
- 副本 ID 已配置化为 `legacy_patches.open_dungeon_ids`。
- 由 `features.enable_legacy_patches` 和 `legacy_patches.enable_open_extra_dungeons` 控制。
- 默认关闭。

状态：`[~] 已迁移，待测试服验证`

---

### D4. `dp.mem.hotfix` 修复小明炸街

来源：`dp2/df_game_r.lua`

功能：

- 调用 `dp.mem.hotfix(dpx.reloc(...))` 修改内存。

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

仍需继续索引 / 确认的方向：

- 账号仓库扩展。
- 怪物攻城活动。
- 幸运在线玩家。
- 在线奖励。
- 随机属性继承。
- 自动解封随机属性装备。
- 幸运点影响掉落率。
- 战力排行榜系统。
- 时装潜能系统。
- 掉落公告 / VIP 登录公告。

状态：`[~] 按功能逐项确认`
