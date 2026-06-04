# dp2 未迁移功能清单

本文档记录 `YPJCoding/dp2` 中尚未迁移到 `dp2.9` 的功能，作为后续逐步迁移的跟踪清单。

迁移原则：

1. `dp2.9` 继续作为主底板，不整包覆盖 `dp2`。
2. 每次只迁移一个明确功能或一个小模块。
3. 所有新功能必须有配置开关。
4. 高风险功能默认关闭。
5. 涉及发物品、改库、删除、shell、经济系统的功能必须有日志。
6. JS/Frida 地址强绑定功能必须先记录版本、地址、风险，再决定是否迁移。

## 状态说明

- `[ ]` 未迁移。
- `[~]` 计划迁移 / 需要设计。
- `[x]` 已迁移。
- `[!]` 高风险，默认暂缓。

## A. 优先迁移：低风险基础能力

### A1. 在线玩家表 / 上下线记录

来源：`dp2/script/Work_Reload.lua`

功能：

- `Reach_GameWord` 时记录玩家在线。
- `Leave_GameWord` 时移除在线状态。
- 记录账号 ID、角色名等信息。
- 可作为全服广播、GM 工具、在线查询的基础模块。

当前 `dp2.9` 状态：

- 已有 `Reach_GameWord` 登录 hook。
- 尚未维护 `online` 表。
- 尚未注册 `Leave_GameWord`。

迁移建议：

- 新增 `script/modules/online.lua`。
- 配置项：`features.enable_online_module=false` 或调试期可开启。
- 提供 API：`online.add(user)`、`online.remove(user)`、`online.each(fn)`、`online.count()`。
- 日志：上线 / 下线 / 异常用户指针。

状态：`[ ] 未迁移`

---

### A2. 全服消息 / 在线广播

来源：`dp2/script/Work_Reload.lua` 的 `sendPacketMessage(message, type)`。

功能：

- 遍历在线玩家。
- 对每个在线玩家调用 `SendNotiPacketMessage`。

当前 `dp2.9` 状态：

- 尚未迁移。

迁移建议：

- 依赖 `online.lua`。
- 新增 `script/modules/broadcast.lua`。
- 必须加入频率限制，避免刷屏。
- 默认只允许内部模块调用，不直接暴露给普通玩家。

状态：`[ ] 未迁移`

---

### A3. 物品查询 GM 指令

来源：`dp2/script/Work_Reload.lua` 中 `//viewid`、`//viewname`。

功能：

- `//viewid名称`：按名称查询物品 ID。
- `//viewnameID`：按 ID 查询物品名称。

当前 `dp2.9` 状态：

- 尚未迁移聊天指令系统。

迁移建议：

- 新增 `script/modules/gm_commands.lua` 或 `script/modules/item_query.lua`。
- 必须先实现 GM 权限判断。
- 默认关闭普通玩家访问。
- 可作为第一个低风险 GM 工具迁移。

状态：`[ ] 未迁移`

---

## B. 可选迁移：玩法规则模块

### B1. 热加载 `Work_Reload.lua` 思路

来源：`dp2/df_game_r.lua`

功能：

- 通过 `lfs.attributes` 检查 `/dp2/script/Work_Reload.lua` 修改时间。
- 使用 `loadfile(filename, "t", new_env)` 热加载脚本。
- `new_env` 暴露 `dp`、`dpx`、`game`、`world`、`logger`、`item_handler` 等上下文。

当前 `dp2.9` 状态：

- 尚未迁移。
- 已在 `docs/DP2_REFERENCE_NOTES.md` 中评估过。

迁移建议：

- 不直接放进主入口。
- 新增 `script/modules/hot_reload.lua`。
- 默认关闭。
- 仅测试服或开发环境启用。
- 热加载失败必须只记录日志，不影响主入口。

状态：`[ ] 未迁移`

---

### B2. 经验副本 / 泡点奖励

来源：`dp2/script/Work_Reload.lua`

功能：

- 定时遍历在线玩家。
- 当玩家位于副本 `5000` 且等级低于 90 时，每分钟增加 1% 经验和 60 代币。

当前 `dp2.9` 状态：

- 尚未迁移。

迁移建议：

- 新增 `script/modules/exp_dungeon.lua`。
- 依赖 `online.lua`。
- 配置化副本 ID、等级上限、经验比例、代币数量、执行间隔。
- 默认关闭。

状态：`[ ] 未迁移`

---

### B3. 持物进图限制

来源：`dp2/script/Work_Reload.lua`

功能：

- 进入指定副本时检查队伍成员是否持有指定道具。
- 示例：进入副本 `5000` 需要持有 `80206`。

当前 `dp2.9` 状态：

- 尚未迁移。

迁移建议：

- 新增 `script/modules/dungeon_gate.lua`。
- 使用 `GameEvent` 或合适 hook。
- 配置化规则：副本 ID、道具 ID、错误提示。
- 默认关闭。

状态：`[ ] 未迁移`

---

### B4. 等级差限制掉落

来源：`dp2/script/Work_Reload.lua`

功能：

- 如果角色等级高于副本等级超过 20 级，且没有指定道具，则阻止掉落。
- 示例豁免道具：`80207`。

当前 `dp2.9` 状态：

- 尚未迁移。

迁移建议：

- 新增 `script/modules/drop_rules.lua`。
- 注册 `CParty_DropItem` hook。
- 配置化等级差、豁免道具、提示文案。
- 默认关闭。

状态：`[ ] 未迁移`

---

### B5. 翻牌后自动回城 / 自动分解 / 自动出售

来源：`dp2/script/Work_Reload.lua`

功能：

- 副本完成后按模式处理：不处理、回城、分解、使用在线玩家分解机、出售装备。
- 通关后随机给点券。

当前 `dp2.9` 状态：

- 尚未迁移。

迁移建议：

- 新增 `script/modules/finish_back_home.lua`。
- 默认关闭。
- 自动分解 / 自动出售必须单独开关。
- 必须记录日志。
- 不建议在安全可部署版中启用。

状态：`[ ] 未迁移`

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

- 尚未迁移聊天指令系统。

迁移建议：

- 不整体迁移。
- 先实现 GM 权限模块。
- 再按命令逐个迁移。
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

功能：

- 强化 / 增幅失败时，检测保护道具。
- 扣除材料后按概率把失败结果改为成功。

当前 `dp2.9` 状态：

- 尚未迁移。

迁移风险：

- 影响装备经济。
- 依赖 `Upgrade` / `UpgradeSeparate` hook。
- 原实现中道具 ID 存在注释与代码不一致风险。

迁移建议：

- 暂缓。
- 先单独设计规则和配置。
- 必须测试服验证。

状态：`[!] 高风险暂缓`

---

### C6. 801xx 系列运营道具

来源：`dp2/script/Work_Reload.lua`

功能分组：

- `80102-80105`：任务清理券。
- `80106-80110`：经验书。
- `80111-80115`：升级券。
- `80116+`：装备回收、宠物回收、宠物装备回收。
- `80171-80175`：点券增加券。
- `80176-80180`：PVP 等级、经验、胜点调整券。
- `80181-80188`：转职、一觉、二觉券。
- `80190+`：角色职业变更类。

当前 `dp2.9` 状态：

- 尚未整体迁移 801xx 系列。
- 部分功能与 `dp2.9` 现有 handler 重叠，但 item_id 和规则不同。

迁移建议：

- 等确认 PVF 是否加入 801xx 系列后再做。
- 按功能分模块迁移：经验券、升级券、回收券、点券券、PVP券、转职券。
- 涉及点券、改库、删除、职业变更的必须默认关闭。

状态：`[ ] 未迁移，等待 PVF 决策`

---

## D. 顶层入口 Hook / Patch 未迁移项

### D1. 修复绝望之塔金币提示异常

来源：`dp2/df_game_r.lua`

功能：

- 注册 `CParty_UseAncientDungeonItems`。
- 副本 ID 在 `11008-11107` 时直接返回 true。

当前 `dp2.9` 状态：

- 尚未迁移该 hook。

迁移建议：

- 可迁。
- 配置项：`startup.enable_fix_tower_gold_notice=false`。
- 默认关闭，测试服验证后再决定。

状态：`[ ] 未迁移`

---

### D2. 城镇下线卡镇魂修复

来源：`dp2/df_game_r.lua`

功能：

- 注册 `CUser_SaveTown`。
- 当下线城镇为 `13` 时改为 `11`。

当前 `dp2.9` 状态：

- 尚未迁移。

迁移建议：

- 可迁。
- 配置项：`startup.enable_fix_save_town=false`。
- 城镇 ID 应配置化。

状态：`[ ] 未迁移`

---

### D3. 开放极限祭坛

来源：`dp2/df_game_r.lua`

功能：

- 注册 `Open_Dungeon`。
- 对副本 `11007` 返回 true。

当前 `dp2.9` 状态：

- 尚未迁移。

迁移建议：

- 可迁。
- 配置项：`startup.enable_open_extra_dungeons=false`。
- 副本 ID 配置化。

状态：`[ ] 未迁移`

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

功能：

- 调用 `dpx.enable_game_master()`。

当前 `dp2.9` 状态：

- 已有配置项 `dpx_startup.enable_game_master=false`。
- 默认关闭。

迁移建议：

- 已以安全默认方式吸收。
- 不建议默认开启。

状态：`[x] 已迁移为配置项，默认关闭`

---

## E. JS / Frida 未迁移项

### E1. TimerDispatcher 主线程调度队列

来源：`dp2/df_game_r.js`

功能：

- `api_scheduleOnMainThread`
- `api_scheduleOnMainThread_delay`
- `hook_TimerDispatcher_dispatch`

当前 `dp2.9` 状态：

- 尚未迁移。

迁移建议：

- 先完成 `df_game_r.js` 索引。
- 记录地址、版本、调用方。
- 不直接迁。

状态：`[ ] 未迁移`

---

### E2. 系统邮件多附件发送 API

来源：`dp2/df_game_r.js`

功能：

- 封装 `WongWork_CMailBoxHelper_ReqDBSendNewSystemMultiMail`。
- 支持系统邮件多附件。

当前 `dp2.9` 状态：

- 尚未迁移。

迁移建议：

- 高价值，但涉及发奖。
- 必须权限、日志、配置开关。
- 可作为后续发奖模块底层能力。

状态：`[ ] 未迁移`

---

### E3. 压缩 / 解压工具

来源：`dp2/df_game_r.js`

功能：

- `api_compress_zip`
- `api_uncompress_zip`

当前 `dp2.9` 状态：

- 尚未迁移。

迁移建议：

- 只有明确调用场景时再迁。

状态：`[ ] 未迁移`

---

### E4. PacketBuf / MySQL / CItem / CInventory 原生函数封装

来源：`dp2/df_game_r.js`

功能：

- PacketBuf 读取。
- MySQL wrapper。
- CItem 属性读取。
- CInventory 删除 / 时装镶嵌 / 宠物装备等原生能力。

当前 `dp2.9` 状态：

- 尚未迁移大块 JS 封装。

迁移建议：

- 不整体迁移。
- 先建立 `docs/DF_GAME_R_JS_INDEX.md` 完整索引。
- 每次只迁一个明确功能。

状态：`[ ] 未迁移`

---

## 建议迁移路线

### Phase 1：低风险基础模块

- [ ] `online.lua`：在线玩家表、上线/下线记录。
- [ ] `broadcast.lua`：全服消息，带频率限制。
- [ ] `gm_permissions.lua`：GM 权限判断。
- [ ] `item_query.lua`：物品查询 GM 指令。

### Phase 2：开发辅助模块

- [ ] `hot_reload.lua`：测试服热加载，默认关闭。
- [ ] 更新 `docs/DEPLOYMENT_CHECKLIST.md`，说明生产环境是否启用热加载。

### Phase 3：玩法规则模块

- [ ] `dungeon_gate.lua`：持物进图。
- [ ] `drop_rules.lua`：等级差限制掉落。
- [ ] `exp_dungeon.lua`：经验副本 / 泡点。
- [ ] `finish_back_home.lua`：翻牌回城 / 自动处理。

### Phase 4：运营道具模块

- [ ] 801xx 经验券。
- [ ] 801xx 升级券。
- [ ] 801xx 回收券。
- [ ] 801xx 点券券。
- [ ] 801xx PVP 券。
- [ ] 801xx 转职 / 觉醒券。

### Phase 5：高风险 GM / JS 功能

- [ ] GM 充值 / 发物品 / 改库命令。
- [ ] 系统邮件多附件 JS API。
- [ ] 强化 / 增幅保护。
- [ ] 内存 hotfix 类功能。

## 当前建议下一步

先迁移 Phase 1 的基础模块：

1. `online.lua`
2. `broadcast.lua`
3. `gm_permissions.lua`
4. `item_query.lua`

这四个模块风险最低，而且能为后续 GM 指令、广播、签到、热加载等功能提供基础设施。
