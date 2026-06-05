# 动态路线图

本文档用于跟踪 `dp2.9` 当前重构方向，避免 TODO 随着实现变化而偏航。

## 1. 当前结论

当前分支已经从“只做文档和草稿”推进到了“安全可部署底板验证”阶段。

关键事实：

- `df_game_r.lua` 已经瘦身为轻量入口。
- 所有 `item_handler` 旧实现已经从 `df_game_r.lua` 移除。
- 所有 handler 模块已经通过 `script/bootstrap.lua` 接入加载链路。
- `features.enable_item_handlers` 和 `features.enable_modular_handlers` 现在都会影响 handler 注册。
- SQL、删除、shell 类高风险能力仍默认关闭。
- 已完成 handler 日志和组合风险开关收敛。
- DPX 启动配置已集中到 `script/config.lua` 和 `bootstrap.apply_dpx_startup`，等级上限使用 `dpx.set_max_level`。
- 已新增 `script/modules/legacy_patches.lua`，迁移旧 dp2 入口 hook：绝望之塔金币提示修复、城镇下线卡镇魂修复、开放极限祭坛。
- 已新增 `script/modules/hot_reload.lua`，迁移旧 dp2 的 `Work_Reload.lua` 热加载机制。
- `legacy_patches` 和 `hot_reload` 均默认关闭，待测试服逐项开启验证。
- 服务器实测确认普通右键消耗品走 `UseItem1`，并已正式接入 `UseItem1 -> item_handler` 分发。
- `UseItem2` 保留作为兼容入口。
- 1034-1037 临时 debug handler 已关闭。
- 当前 PVF 暂不添加 DP 正式道具，正式道具验证移到最后阶段。

因此，后续 TODO 不能继续只按旧的 P0-P7 文档阶段推进，需要拆成两个目标：

1. 安全可部署版。
2. 完全功能恢复版。

## 2. 目标 A：安全可部署版

目标：服务器能启动，入口链路可用，高风险功能默认关闭；正式 DP 道具因 PVF 暂未添加，放到后置阶段验证。

当前估算进度：约 93%。

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
- [x] `hot_reload` 模块已迁移，默认关闭。
- [x] `finish_back_home` 已修正为 `mode=0` 完全关闭，并避免副本完成事件重复调用 `fnext()`。

还缺：

- [ ] 高风险 handler 默认拒绝并返还道具：真实道具实测（需 PVF 加入道具 ID）。
- [ ] `legacy_patches` 模块加载验证：默认关闭时不注册 hook。
- [ ] `hot_reload` 默认关闭启动验证：确认不会创建 timer。
- [ ] `legacy_patches` 三个子功能测试服逐项开启验证。
- [ ] `hot_reload` 测试服开启验证：文件不存在、编译失败、执行失败、修改后 reload。

完成后可以作为“安全默认底板”部署。

## 3. 目标 B：完全功能恢复版

目标：原 `df_game_r.lua` 中所有道具功能、入口补丁和开发辅助能力都能按预期工作，包括 SQL、删除、shell 类功能。

当前估算进度：约 67%。

还缺：

- [ ] 明确哪些高风险功能允许恢复原行为。
- [ ] 对 SQL 类 handler 做数据库备份和回滚方案。
- [ ] 对删除类 handler 做二次确认或白名单策略。
- [ ] 对 PVP shell handler 确认脚本路径、脚本输出和 SQL 安全性。
- [x] 为 PVP shell 功能补失败保护和日志。
- [x] 将旧入口 hook 迁移为可配置模块：绝望之塔金币提示修复、城镇下线卡镇魂修复、开放极限祭坛。
- [x] 将旧 `Work_Reload.lua` 热加载机制迁移为可配置模块。
- [ ] 在测试服逐项开启风险开关验证。
- [ ] 决定正式服默认是否保持关闭。

完成后才能称为“所有功能完全恢复”。

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

## 4.5 Phase 3 玩法模块验证状态

四个玩法模块已部署到服务器，`finish_back_home` 已做代码级修正，仍需复测。

- [~] `finish_back_home` — 代码已迁移并修正，需复测 mode=0、mode=1~4
- [ ] `exp_dungeon` — 经验副本泡点，需副本 5000 存在（当前 PVF 无此副本）
- [ ] `drop_rules` — 等级差限制掉落，需高级角色 + 低级副本 + 无豁免道具
- [ ] `dungeon_gate` — 持物进图限制，需先配置规则（当前规则表为空）

## 4.6 旧入口补丁验证状态

旧 dp2 入口 hook 已迁移到 `script/modules/legacy_patches.lua`，但默认关闭。

- [x] 代码迁移：`CParty_UseAncientDungeonItems` 绝望之塔金币提示修复
- [x] 代码迁移：`CUser_SaveTown` 城镇下线卡镇魂修复
- [x] 代码迁移：`Open_Dungeon` 开放极限祭坛 / 指定副本
- [ ] 默认关闭状态下启动验证：确认不会注册额外 hook
- [ ] 测试服开启 `enable_tower_gold_notice_fix` 验证
- [ ] 测试服开启 `enable_save_town_fix` 验证
- [ ] 测试服开启 `enable_open_extra_dungeons` 验证

## 4.7 热加载模块验证状态

旧 dp2 的 `Work_Reload.lua` 热加载逻辑已迁移到 `script/modules/hot_reload.lua`，但默认关闭。

- [x] 代码迁移：`lfs.attributes` 检测文件修改时间
- [x] 代码迁移：`loadfile(filename, "t", env)` 执行隔离环境脚本
- [x] 代码迁移：注入 `dp/dpx/game/world/logger/item_handler/utils/config`
- [x] 接入 bootstrap：加载模块前注入 `ctx.item_handler`
- [x] 配置化：`hot_reload.enabled/filename/start_delay_ms/interval_ms/run_on_start`
- [ ] 默认关闭状态下启动验证：确认不会创建 timer
- [ ] 文件不存在验证：只记录日志，不影响启动
- [ ] 编译失败验证：记录错误，不更新修改时间
- [ ] 执行失败验证：记录错误，不更新修改时间
- [ ] 修改后 reload 验证：成功执行后更新修改时间

## 5. 当前偏航点

### 5.1 “尽量不改变行为”已经不完全准确

当前重构为了安全，已经把 SQL、删除、shell 类功能默认改为关闭；旧入口补丁和热加载也默认关闭。

这意味着：

- 对安全可部署版，这是正确方向。
- 对完全功能恢复版，还需要后续开启和测试风险开关 / legacy patch 开关 / hot reload 开关。

### 5.2 README TODO 需要继续保留，但不应作为唯一进度依据

README 的 P0-P7 适合记录重构任务；本路线图用于记录部署验收。

后续每完成一步，应同时更新：

- README TODO
- 本路线图
- 必要时更新 CHANGELOG

## 6. 建议接下来的执行顺序

### Step 1：代码自检

- [x] 修正过时注释，例如 `bootstrap.lua` 仍称自己为模板。
- [x] 检查 `script/config.lua` 是否需要恢复说明注释。
- [x] 检查模块注册顺序是否需要固定。
- [x] 检查所有 handler 是否都有日志和失败返还。
- [x] 补充代码自检记录：`docs/CODE_SELF_CHECK.md`。
- [x] 将旧入口 hook 收敛为 `legacy_patches` 模块。
- [x] 将热加载收敛为 `hot_reload` 模块。
- [x] 修复 `features.enable_item_handlers` 未生效问题。
- [x] 修复等级上限误调用 `set_auction_min_level` 问题。
- [x] 修复 `finish_back_home` 重复 `fnext()` 与 mode=0 仍发点券问题。
- [x] 修复 `item_query` GmInput 透传参数口径。
- [x] 同步 `DP2_UNMIGRATED_FEATURES.md` 和 `HANDLER_MIGRATION_MAP.md` 状态。

### Step 2：服务器烟测

- [x] 部署到测试服或普通频道。
- [x] 启动 `df_game_r`。
- [x] 观察 bootstrap 日志。
- [x] 登录角色验证上线提示。
- [x] 验证 `UseItem1` 是普通右键消耗品入口。
- [x] 正式接入 `UseItem1 -> item_handler` 分发。
- [ ] 重启确认 `features.enable_item_handlers=false` 时 handler 不注册。
- [ ] 重启确认等级上限配置调用正常。
- [ ] 重启确认 `legacy_patches` 默认关闭时不会注册额外 hook。
- [ ] 重启确认 `hot_reload` 默认关闭时不会创建 timer。

### Step 3：高风险默认关闭测试

- [ ] SQL 类功能应默认拒绝并返还。
- [ ] 删除类功能应默认拒绝并返还。
- [ ] PVP shell 功能应默认拒绝并返还。

### Step 4：PVF 正式道具验证（最后阶段）

- [ ] 任务清理券。
- [ ] 异界重置券。
- [ ] 继承券。

### Step 5：按需恢复高风险功能

仅在测试服开启：

```lua
risk = {
    enable_sql_handlers = true,
    enable_delete_handlers = true,
    enable_shell_handlers = true,
}
```

逐项验证后再决定正式服默认值。

## 7. 进度口径

后续汇报进度时分两条：

```text
安全可部署版：93%
完全功能恢复版：67%
```

如果只说“总进度”，默认指安全可部署版。
