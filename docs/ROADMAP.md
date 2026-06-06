# 动态路线图

本文档用于跟踪 `dp2.9` 当前重构方向，避免 TODO 随着实现变化而偏航。

## 1. 当前阶段

当前分支处于：**安全可部署底板验证 + 玩法模块实测收尾阶段**。

当前进度口径：

```text
安全可部署版：约 94%
完全功能恢复版：约 68%
```

关键事实：

- `df_game_r.lua` 已经瘦身为轻量入口。
- 所有 `item_handler` 旧实现已经从 `df_game_r.lua` 移除。
- 所有 handler 模块已经通过 `script/bootstrap.lua` 接入加载链路。
- `features.enable_item_handlers` 和 `features.enable_modular_handlers` 都会影响 handler 注册。
- SQL、删除、shell 类高风险 handler 仍默认关闭。
- DPX 启动配置已集中到 `script/config.lua` 和 `bootstrap.apply_dpx_startup`，等级上限使用 `dpx.set_max_level`，当前内容上限为 85。
- `legacy_patches` 已迁移旧 dp2 入口 hook：绝望之塔金币提示修复、城镇下线卡镇魂修复、开放极限祭坛；模块默认关闭，待测试服逐项开启验证。
- `hot_reload` 已改为 **只监听 `script/config.lua`**，不再使用 `Work_Reload.lua`。
- `hot_reload.enabled = true`，当前只热应用显式支持的运行时配置：`hot.finish_back_home`。
- `hot_reload` 已补强错误保护：配置加载失败、返回类型异常或模块配置失败时会保留旧配置并记录 `keep previous config`。
- `hot.finish_back_home.default_mode` 热更新已实测通过：`0`、`5`、`1` 均可实时生效。
- `finish_back_home` 已支持 mode `0`~`5`，当前默认 `mode=5`，即只发随机点券、不回城、不分解、不出售。
- `finish_back_home.equipment_rarities = {0, 1}` 已实测通过，mode `2`/`3`/`4` 均只处理普通装备和高级装备，高级以上装备会跳过。
- 服务器实测确认普通右键消耗品走 `UseItem1`，并已正式接入 `UseItem1 -> item_handler` 分发。
- `UseItem2` 保留作为兼容入口。
- 当前 PVF 暂不添加 DP 正式道具，正式道具验证移到最后阶段。

## 2. 目标 A：安全可部署版

目标：服务器能启动，入口链路可用，高风险功能默认关闭；正式 DP 道具因 PVF 暂未添加，放到后置阶段验证。

当前估算进度：约 94%。

已完成：

- [x] 服务器普通频道启动验证。
- [x] 确认 `bootstrap` 日志正常。
- [x] 确认 `frida.load` 正常。
- [x] 登录角色验证 `Reach_GameWord` 正常。
- [x] 确认普通右键消耗品走 `UseItem1`。
- [x] 在 `df_game_r.lua` 中正式接入 `UseItem1 -> item_handler` 分发。
- [x] 保留 `UseItem2` 兼容入口。
- [x] 关闭 1034-1037 临时 debug handler。
- [x] 高风险 handler 默认拒绝并返还道具：代码级确认完成。
- [x] Phase 1 基础设施模块：online/broadcast/gm_permissions/item_query 已迁移。
- [x] 配置口径收敛：SQL、删除、shell handler 均默认关闭。
- [x] `features.enable_item_handlers` 已真正接入 handler 总开关。
- [x] `legacy_patches` 模块已迁移，默认关闭。
- [x] `hot_reload` 模块已迁移并改为 config-only 热更新，默认开启。
- [x] `hot_reload` config 热更新实测：`hot.finish_back_home.default_mode=0/5/1` 均可实时生效。
- [x] `hot_reload` 异常路径已做代码保护，语法错误实测为可选项，不阻塞当前收尾。
- [x] `finish_back_home` 已修正为 `mode=0` 完全关闭，并避免副本完成事件重复调用 `fnext()`。
- [x] `finish_back_home` 已支持 `mode=5` 仅发随机点券，并已实测只发点券、不回城。
- [x] `finish_back_home` 已支持 `equipment_rarities` 单一装备品质白名单，并已实测 mode `2`/`3`/`4` 生效。

还缺：

- [ ] 高风险 handler 默认拒绝并返还道具：真实道具实测（需 PVF 加入道具 ID）。
- [ ] `legacy_patches` 三个子功能测试服逐项开启验证。

完成后可以作为“安全默认底板”部署。

## 3. 目标 B：完全功能恢复版

目标：原 `df_game_r.lua` 中所有道具功能、入口补丁、JS/Frida 功能和开发辅助能力都能按预期工作，包括 SQL、删除、shell 类功能。

当前估算进度：约 68%。

还缺：

- [ ] 明确哪些高风险 Lua handler 允许恢复原行为。
- [ ] 对 SQL 类 handler 做数据库备份和回滚方案。
- [ ] 对删除类 handler 做二次确认或白名单策略。
- [ ] 对 PVP shell handler 确认脚本路径、脚本输出和 SQL 安全性。
- [x] 为 PVP shell 功能补失败保护和日志。
- [x] 将旧入口 hook 迁移为可配置模块：绝望之塔金币提示修复、城镇下线卡镇魂修复、开放极限祭坛。
- [x] 将热加载收敛为 `script/config.lua` 配置热应用。
- [ ] 在测试服逐项开启风险开关验证。
- [ ] 决定正式服默认是否保持关闭。

## 4. 后置：PVF 正式道具验证

当前 PVF 暂不添加 DP 正式道具，以下 ALL handler item 放到最后阶段验证。

### 4.1 低/中风险道具（无需风险开关）

- [ ] `2021458802` 主线任务清理（quest.lua）
- [ ] `2021458803` 支线/普通任务清理（quest.lua）[RISK:HIGH — 影响转职]
- [ ] `2021458808` 每日任务清理（quest.lua）
- [ ] `2021458809` 成就任务清理（quest.lua）
- [ ] `2021458804` 异界 E2 重置（misc.lua）
- [ ] `2021458805` 异界 E3 重置（misc.lua）
- [ ] `2022110505` 装备继承（inherit.lua）
- [ ] `2021458801` 跨界石（misc.lua）
- [ ] `10157835` 一次觉醒完成券（job.lua）
- [ ] `10157836` 二次觉醒完成券（job.lua）
- [ ] `2023458001`~`2023458003` 转职任务获取券（job.lua）
- [ ] `2023629237`、`2023458063`、`2023458064`、`2023629238` 转职任务获取券（job.lua）

### 4.2 SQL 类道具（需 enable_sql_handlers，当前默认关闭）

- [ ] `2021458807` 女鬼剑职业转换（job.lua）— 需 1 级角色
- [ ] `2023458801` 角色出战（misc.lua）
- [ ] `2023458803` 装备设计图熟练度（misc.lua）

### 4.3 删除类道具（需 enable_delete_handlers，当前默认关闭）

- [ ] `2021458806` 宠物清理券（item_cleanup.lua）
- [ ] `2022110503` 时装清理券（item_cleanup.lua）
- [ ] `2022110504` 副职业一键分解券（item_cleanup.lua）

### 4.4 Shell 类道具（需 enable_shell_handlers，当前默认关闭）

- [ ] `2541121` PVP 经验书（pvp.lua）

这些不再阻塞当前“安全可部署版”的启动链路验收。

## 5. 玩法模块验证状态

### 5.1 `finish_back_home`

代码已迁移并修正，当前主要模式已经测试通过。

当前配置默认值：

```lua
hot = {
    finish_back_home = {
        default_mode = "5",
        point_min = 100,
        point_max = 1000,
        equipment_rarities = {0, 1},
    },
}
```

模式说明：

| mode | 行为 | 是否热更新 | 验证状态 |
|---|---|---|---|
| `0` | 完全关闭：不发点券、不回城、不分解、不出售 | 是 | 已通过 |
| `1` | 发随机点券 + 回城 | 是 | 已通过 |
| `2` | 发随机点券 + 诺顿分解 + 回城 | 是 | 已通过 |
| `3` | 发随机点券 + 在线玩家分解机 + 回城 | 是 | 已通过 |
| `4` | 发随机点券 + 出售装备 + 回城 | 是 | 已通过 |
| `5` | 仅发随机点券，不回城、不分解、不出售 | 是 | 已通过 |

测试清单：

- [x] 修改 `hot.finish_back_home.default_mode = "0"`，保存 `config.lua`，确认热更新日志出现，并确认通关后无奖励、无回城、无分解/出售。
- [x] 修改 `hot.finish_back_home.default_mode = "5"`，确认热更新日志出现，并确认通关后只发点券、不回城。
- [x] 修改 `hot.finish_back_home.default_mode = "1"`，确认热更新日志出现，并确认通关后发点券 + 回城。
- [x] 修改 `hot.finish_back_home.default_mode = "2"`，放入普通/高级/稀有以上装备，确认仅分解 `equipment_rarities={0,1}` 命中的装备，高级以上被跳过并记录 skip 日志。
- [x] 修改 `hot.finish_back_home.default_mode = "3"`，确认在线玩家分解机路径同样遵守 `equipment_rarities={0,1}`。
- [x] 修改 `hot.finish_back_home.default_mode = "4"`，确认仅出售 `equipment_rarities={0,1}` 命中的装备，高级以上被跳过并记录 skip 日志。

预期日志关键字：

```text
[hot_reload] detected config change
[hot_reload] config applied
[finish_back_home] configured
[finish_back_home][reward]
[finish_back_home][disjoint][skip]
[finish_back_home][sell][skip]
```

### 5.2 其他玩法模块

- [ ] `exp_dungeon` — 经验副本泡点，需副本 5000 存在（当前 PVF 无此副本）。
- [ ] `drop_rules` — 等级差限制掉落，需高级角色 + 低级副本 + 无豁免道具。
- [ ] `dungeon_gate` — 持物进图限制，需先配置规则（当前规则表为空）。

## 6. 旧入口补丁验证状态

旧 dp2 入口 hook 已迁移到 `script/modules/legacy_patches.lua`，但默认关闭。

- [x] 代码迁移：`CParty_UseAncientDungeonItems` 绝望之塔金币提示修复
- [x] 代码迁移：`CUser_SaveTown` 城镇下线卡镇魂修复
- [x] 代码迁移：`Open_Dungeon` 开放极限祭坛 / 指定副本
- [ ] 测试服开启 `enable_tower_gold_notice_fix` 验证
- [ ] 测试服开启 `enable_save_town_fix` 验证
- [ ] 测试服开启 `enable_open_extra_dungeons` 验证

## 7. 热加载模块验证状态

`hot_reload` 当前定位：**config-only 热更新**。

- [x] 监听 `/dp2/script/config.lua` 修改时间。
- [x] 重新加载 `script.config`。
- [x] 热应用 `hot.finish_back_home`。
- [x] 移除 `Work_Reload.lua` 脚本执行入口。
- [x] 默认开启 `hot_reload.enabled = true`。
- [x] 实测修改 `default_mode=0/5/1` 可实时生效。
- [x] 实测 `equipment_rarities={0,1}` 对 mode `2`/`3`/`4` 生效。
- [x] 异常路径已做代码保护：加载失败、返回类型异常或配置应用失败时保留旧配置并记录 `keep previous config`。
- [ ] 可选：仅在本地副本或临时测试环境验证配置错误时是否保留旧配置；不需要在正常测试服故意写错 `config.lua`。

当前不支持自动热更新：

- handler/module 注册开关。
- DPX 启动开关。
- risk 高风险能力开关。
- legacy_patches hook 注册。
- JS/Frida 配置写入。
- 其他尚未提供 `configure(...)` 的玩法模块。

## 8. 当前偏航点

### 8.1 “尽量不改变行为”已经不完全准确

当前重构为了安全，已经把 SQL、删除、shell 类功能默认改为关闭；旧入口补丁默认关闭。

这意味着：

- 对安全可部署版，这是正确方向。
- 对完全功能恢复版，还需要后续开启和测试风险开关 / legacy patch 开关。

### 8.2 README TODO 需要继续保留，但不应作为唯一进度依据

README 的 P0-P7 适合记录重构任务；本路线图用于记录部署验收。

后续每完成一步，应同时更新：

- README TODO
- 本路线图
- 必要时更新 CHANGELOG

## 9. 建议接下来的执行顺序

### Step 1：当前收尾

- [x] 同步 `ROADMAP.md` 中 hot_reload 与 finish_back_home 最新状态。
- [x] 同步 `CHANGELOG.md` 与 `DP2_UNMIGRATED_FEATURES.md`。
- [x] 测试 config 热更新：修改 `default_mode=0/5/1` 是否实时生效。
- [x] 测试 finish_back_home mode=5：只发点券，不回城。
- [x] 测试 mode=2/3/4 的 `equipment_rarities={0,1}` 是否正确跳过高级以上装备。
- [x] 补强 hot_reload 异常保护；错误配置实测改为可选，不阻塞收尾。

### Step 2：服务器烟测补充

- [ ] 重启确认 `features.enable_item_handlers=false` 时 handler 不注册。
- [ ] 重启确认等级上限配置调用正常。
- [ ] 确认 `hot_reload.enabled=true` 时会创建 timer 并监听 config。

### Step 3：高风险默认关闭测试

- [ ] SQL 类功能应默认拒绝并返还。
- [ ] 删除类功能应默认拒绝并返还。
- [ ] PVP shell 功能应默认拒绝并返还。

### Step 4：PVF 正式道具验证（最后阶段）

- [ ] 任务清理券。
- [ ] 异界重置券。
- [ ] 继承券。

### Step 5：下一批迁移决策

当前 `finish_back_home` 主要模式已完成验证。下一步可在以下两个方向中选择：

- 继续迁 `signin.lua`；或
- 开始迁 GM 指令模块。
