# Handler 迁移对照表

本文档用于对照旧 `df_game_r.lua` 中的 `item_handler` 与新模块 `script/handlers/*.lua` 的迁移状态。

当前状态：`refactor/dp2-9-base` 分支已经接入 `script/bootstrap.lua`，并通过 `bootstrap.setup(item_handler, ctx)` 按配置加载模块化 handler。旧的大段 handler 已从 `df_game_r.lua` 移除，运行时以 `script/handlers/*.lua` 的注册结果为准。

## 状态说明

| 状态 | 含义 |
|---|---|
| `migrated` | 已迁入目标 handler 模块，并通过 bootstrap 接入运行入口 |
| `gated` | 已迁入并接入，但受风险开关控制，默认可能拒绝并返还道具 |
| `pending` | 尚未迁移到目标模块 |
| `blocked` | 暂不迁移，需要确认 API、风险或安全策略 |
| `runtime` | 保留在入口或运行链路中，不作为业务 handler 下沉 |

## 原始 handler 对照表

| item_id | 原功能 | 目标模块 | 状态 | 风险 | 当前说明 / 后续动作 |
|---:|---|---|---|---|---|
| `2021458801` | 装备跨界石，背包装备栏第 1 格移动到账号金库 | `script/handlers/misc.lua` | `migrated` | `MEDIUM` | 已迁入 misc，成功/失败均记录日志，失败返还道具 |
| `2021458802` | 主线任务清理 | `script/handlers/quest.lua` | `migrated` | `MEDIUM` | 已迁入 quest，成功/失败均记录日志，待 PVF 正式道具验证 |
| `2021458803` | 支线/普通任务清理 | `script/handlers/quest.lua` | `migrated` | `HIGH` | 已迁入 quest；会影响转职/觉醒任务，成功/失败均记录日志，待真实道具验证 |
| `2021458808` | 每日任务清理 | `script/handlers/quest.lua` | `migrated` | `MEDIUM` | 已迁入 quest，成功/失败均记录日志，待 PVF 正式道具验证 |
| `2021458809` | 成就任务清理 | `script/handlers/quest.lua` | `migrated` | `MEDIUM` | 已迁入 quest，成功/失败均记录日志，待 PVF 正式道具验证 |
| `2021458807` | 女鬼剑职业转换 | `script/handlers/job.lua` | `gated` | `HIGH` | 已迁入 job；受 `config.risk.enable_sql_handlers` 控制，默认关闭 |
| `2023458801` | 角色出战 | `script/handlers/misc.lua` | `gated` | `HIGH` | 已迁入 misc；受 `config.risk.enable_sql_handlers` 控制，默认关闭 |
| `2023458803` | 装备设计图熟练度提升 | `script/handlers/misc.lua` | `gated` | `HIGH` | 已迁入 misc；受 `config.risk.enable_sql_handlers` 控制，默认关闭 |
| `10157835` | 一次觉醒完成券 | `script/handlers/job.lua` | `migrated` | `MEDIUM` | 已迁入 job，成功/失败均记录日志，待真实道具验证 |
| `10157836` | 二次觉醒完成券 | `script/handlers/job.lua` | `migrated` | `MEDIUM` | 已迁入 job，成功/失败均记录日志，待真实道具验证 |
| `2023458001` | 转职任务获取券，任务 ID：8028/8029/8030/8031/8015 | `script/handlers/job.lua` | `migrated` | `MEDIUM` | 已迁入 job，成功/失败均记录日志，待真实道具验证 |
| `2023458002` | 转职任务获取券，任务 ID：8024/8025/8026/8027/4064 | `script/handlers/job.lua` | `migrated` | `MEDIUM` | 已迁入 job，成功/失败均记录日志，待真实道具验证 |
| `2023458003` | 转职任务获取券，任务 ID：8032/8033/8034/8035 | `script/handlers/job.lua` | `migrated` | `MEDIUM` | 已迁入 job，成功/失败均记录日志，待真实道具验证 |
| `2023629237` | 转职任务获取券，任务 ID：8037/8038/8039/8040 | `script/handlers/job.lua` | `migrated` | `MEDIUM` | 已迁入 job，成功/失败均记录日志，待真实道具验证 |
| `2023458063` | 转职任务获取券，任务 ID：5160 | `script/handlers/job.lua` | `migrated` | `MEDIUM` | 已迁入 job，成功/失败均记录日志，待真实道具验证 |
| `2023458064` | 转职任务获取券，任务 ID：5163 | `script/handlers/job.lua` | `migrated` | `MEDIUM` | 已迁入 job，成功/失败均记录日志，待真实道具验证 |
| `2023629238` | 转职任务获取券，任务 ID：12592 | `script/handlers/job.lua` | `migrated` | `MEDIUM` | 已迁入 job，成功/失败均记录日志，待真实道具验证 |
| `2541121` | PVP 经验书 | `script/handlers/pvp.lua` | `gated` | `HIGH` | 已迁入 pvp；需要同时开启 `enable_shell_handlers` 与 `enable_sql_handlers`，默认关闭 |
| `2021458806` | 宠物清理券 | `script/handlers/item_cleanup.lua` | `gated` | `HIGH` | 已迁入 item_cleanup；需要同时开启 `enable_delete_handlers` 与 `enable_sql_handlers`，默认关闭 |
| `2022110503` | 时装清理券 | `script/handlers/item_cleanup.lua` | `gated` | `HIGH` | 已迁入 item_cleanup；需要同时开启 `enable_delete_handlers` 与 `enable_sql_handlers`，默认关闭 |
| `2022110504` | 副职业一键分解券 | `script/handlers/item_cleanup.lua` | `gated` | `HIGH` | 已迁入 item_cleanup；受 `config.risk.enable_delete_handlers` 控制，默认关闭 |
| `2021458804` | 异界 E2 重置券 | `script/handlers/misc.lua` | `migrated` | `MEDIUM` | 已迁入 misc，成功记录日志，待真实道具验证 |
| `2021458805` | 异界 E3 重置券 | `script/handlers/misc.lua` | `migrated` | `MEDIUM` | 已迁入 misc，成功记录日志，待真实道具验证 |
| `2022110505` | 装备继承券 | `script/handlers/inherit.lua` | `migrated` | `HIGH` | 已迁入 inherit，成功/失败均记录日志，待真实道具验证 |

## 非 item_handler 但相关的运行逻辑

| 逻辑 | 当前实现位置 | 状态 | 风险 | 说明 |
|---|---|---|---|---|
| `UseItem1` 分发 | `df_game_r.lua` | `runtime` | `MEDIUM` | 普通右键消耗品实测入口，调用统一 `dispatch_useitem` |
| `UseItem2` 分发 | `df_game_r.lua` | `runtime` | `MEDIUM` | 兼容旧逻辑和其他可能走 UseItem2 的道具 |
| `GetCurrentDayZeroTimestamp` | `script/utils.lua` + legacy globals | `migrated` | `LOW` | 通过 bootstrap 安装兼容全局函数 |
| `split` | `script/utils.lua` + fallback | `migrated` | `LOW` | `on_frida_call` 已通过 utils 调用 |
| `decode_unicode` | `script/utils.lua` + fallback | `migrated` | `LOW` | 上线提示已通过 utils 调用 |
| DPX 启动开关 | `script/config.lua` + `bootstrap.apply_dpx_startup` | `migrated` | `HIGH` | 全局行为集中配置；等级上限使用 `dpx.set_max_level` |
| `CParty_UseAncientDungeonItems` | `script/modules/legacy_patches.lua` | `migrated` | `MEDIUM` | 绝望之塔金币提示修复，默认关闭，待测试服验证 |
| `CUser_SaveTown` | `script/modules/legacy_patches.lua` | `migrated` | `MEDIUM` | 城镇下线卡镇魂修复，默认关闭，待测试服验证 |
| `Open_Dungeon` | `script/modules/legacy_patches.lua` | `migrated` | `MEDIUM` | 开放极限祭坛/指定副本，默认关闭，待测试服验证 |
| `Work_Reload.lua` 热加载 | `script/modules/hot_reload.lua` | `migrated` | `MEDIUM` | 测试服热加载，默认关闭，待测试服验证 |

## 已迁移模块差异摘要

### `quest.lua`

- 合并重复任务清理逻辑为统一清理函数。
- 覆盖主线、支线/普通、每日、成就任务清理。
- 成功会记录清理任务类型和数量；失败会返还道具并记录原因。
- 支线/普通任务清理仍标记为高风险，因为可能影响转职/觉醒任务。

### `job.lua`

- 迁移女鬼剑转换、一次觉醒、二次觉醒、转职任务获取。
- SQL 类女鬼剑转换受 `config.risk.enable_sql_handlers` 控制，默认关闭。
- 非 SQL 职业/觉醒/转职任务功能成功和失败都会记录业务级日志。

### `item_cleanup.lua`

- 迁移宠物清理、时装清理、一键分解。
- 宠物/时装清理属于 `[DELETE][SQL]` 组合风险，需要同时开启 `enable_delete_handlers` 与 `enable_sql_handlers`。
- 一键分解属于删除/清理类风险，受 `enable_delete_handlers` 控制。
- 成功/失败均记录日志，失败返还道具。

### `inherit.lua`

- 迁移装备继承券。
- 成功记录源槽位和目标槽位；失败返还道具并记录原因。
- 仍需真实道具验证装备槽位、参数、失败返还逻辑。

### `pvp.lua`

- 迁移 PVP 经验书。
- 该 handler 属于 `[SHELL][SQL]` 组合风险，需要同时开启 `enable_shell_handlers` 与 `enable_sql_handlers`。
- 已增加 shell 失败保护、空 SQL 保护、角色编号校验和日志。

### `misc.lua`

- 迁移跨界石、角色出战、装备设计图熟练度、异界 E2/E3 重置。
- SQL 类能力受 `config.risk.enable_sql_handlers` 控制，默认关闭。
- 跨界和异界重置成功会记录业务级日志，失败返还道具并记录原因。

## 下一步检查清单

- [ ] 高风险 handler 默认拒绝并返还：真实道具实测。
- [ ] 低/中风险正式 DP 道具：PVF 加入后逐项验证。
- [ ] SQL 类 handler：测试服开启前准备数据库备份和回滚方案。
- [ ] 删除类 handler：测试服开启前确认二次保护或白名单策略。
- [ ] Shell 类 handler：确认脚本路径、输出 SQL 和失败保护。
- [ ] `legacy_patches` / `hot_reload`：测试服开关验证。
- [ ] 每次完成真实验证后同步 README、ROADMAP、CHANGELOG。
