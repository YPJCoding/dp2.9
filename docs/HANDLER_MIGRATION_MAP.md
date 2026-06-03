# Handler 迁移对照表

本文档用于对照 `df_game_r.lua` 中现有 `item_handler` 与新模块 `script/handlers/*.lua` 的迁移状态。

当前目标：先确认映射关系，再逐步接入 `script/bootstrap.lua`，避免漏迁、重复注册或误删旧逻辑。

## 状态说明

| 状态 | 含义 |
|---|---|
| `drafted` | 已写入目标 handler 模块，但尚未接入运行入口 |
| `pending` | 尚未迁移到目标模块 |
| `blocked` | 暂不迁移，需要确认 API、风险或安全策略 |
| `runtime` | 当前仍由 `df_game_r.lua` 原逻辑运行 |

> 重要：当前所有新模块都尚未接入 `df_game_r.lua`，所以即使状态是 `drafted`，运行时仍以 `df_game_r.lua` 中旧 handler 为准。

## 原始 handler 对照表

| item_id | 原功能 | 原位置/说明 | 目标模块 | 状态 | 风险 | 后续动作 |
|---:|---|---|---|---|---|---|
| `2021458801` | 装备跨界石，背包装备栏第 1 格移动到账号金库 | `df_game_r.lua` 原始 handler | `script/handlers/misc.lua` 或 `inherit.lua` 待定 | `pending` | `MEDIUM` | 需要确认归类，建议单独做 `transfer.lua` 或放 `misc.lua` |
| `2021458802` | 主线任务清理 | 任务清理类 | `script/handlers/quest.lua` | `drafted` | `MEDIUM` | 接入 quest 模块后删除旧 handler |
| `2021458803` | 支线/普通任务清理 | 会影响转职/觉醒任务 | `script/handlers/quest.lua` | `drafted` | `HIGH` | 接入前保留风险提示 |
| `2021458808` | 每日任务清理 | 任务清理类 | `script/handlers/quest.lua` | `drafted` | `MEDIUM` | 接入 quest 模块后删除旧 handler |
| `2021458809` | 成就任务清理 | 任务清理类 | `script/handlers/quest.lua` | `drafted` | `MEDIUM` | 接入 quest 模块后删除旧 handler |
| `2021458807` | 女鬼剑职业转换 | 直接 SQL 修改 `charac_info.job` | `script/handlers/job.lua` | `drafted` | `HIGH` | 需接入 `config.risk.enable_sql_handlers` 后再启用 |
| `2023458801` | 角色出战 | 直接 SQL 修改 `charac_link_bonus` | `script/handlers/misc.lua` | `pending` | `HIGH` | 需确认 SQL 安全策略和是否单独拆 `mercenary.lua` |
| `2023458803` | 装备设计图熟练度提升 | SQL 写入 `item_making_skill_info` | `script/handlers/misc.lua` | `pending` | `HIGH` | 需确认字段、回滚和开关 |
| `10157835` | 一次觉醒完成券 | 修改 grow type | `script/handlers/job.lua` | `drafted` | `MEDIUM` | 接入 job 模块前确认转职状态规则 |
| `10157836` | 二次觉醒完成券 | 修改 grow type | `script/handlers/job.lua` | `drafted` | `MEDIUM` | 接入 job 模块前确认二觉范围规则 |
| `2023458001` | 转职任务获取券，任务 ID：8028/8029/8030/8031/8015 | 转职任务类 | `script/handlers/job.lua` | `drafted` | `MEDIUM` | 接入 job 模块后删除旧 handler |
| `2023458002` | 转职任务获取券，任务 ID：8024/8025/8026/8027/4064 | 转职任务类 | `script/handlers/job.lua` | `drafted` | `MEDIUM` | 接入 job 模块后删除旧 handler |
| `2023458003` | 转职任务获取券，任务 ID：8032/8033/8034/8035 | 转职任务类 | `script/handlers/job.lua` | `drafted` | `MEDIUM` | 接入 job 模块后删除旧 handler |
| `2023629237` | 转职任务获取券，任务 ID：8037/8038/8039/8040 | 转职任务类 | `script/handlers/job.lua` | `drafted` | `MEDIUM` | 接入 job 模块后删除旧 handler |
| `2023458063` | 转职任务获取券，任务 ID：5160 | 转职任务类 | `script/handlers/job.lua` | `drafted` | `MEDIUM` | 接入 job 模块后删除旧 handler |
| `2023458064` | 转职任务获取券，任务 ID：5163 | 转职任务类 | `script/handlers/job.lua` | `drafted` | `MEDIUM` | 接入 job 模块后删除旧 handler |
| `2023629238` | 转职任务获取券，任务 ID：12592 | 转职任务类 | `script/handlers/job.lua` | `drafted` | `MEDIUM` | 接入 job 模块后删除旧 handler |
| `2541121` | PVP 经验书 | 执行 `/dp2/script/pvp_exp_inc.sh` 并写库 | `script/handlers/pvp.lua` | `drafted` | `HIGH` | 必须受 `config.risk.enable_shell_handlers` 控制 |
| `2021458806` | 宠物清理券 | 删除宠物栏前 14 格，并 SQL 删除 `creature_items` | `script/handlers/item_cleanup.lua` | `drafted` | `HIGH` | 必须受 `config.risk.enable_delete_handlers` 控制 |
| `2022110503` | 时装清理券 | 删除时装栏前 14 格，并 SQL 删除 `user_items` | `script/handlers/item_cleanup.lua` | `drafted` | `HIGH` | 必须受 `config.risk.enable_delete_handlers` 控制 |
| `2022110504` | 副职业一键分解券 | 分解装备背包前 16 格 | `script/handlers/item_cleanup.lua` | `drafted` | `HIGH` | 必须受删除/清理类开关控制 |
| `2021458804` | 异界 E2 重置券 | `ResetDimensionInout(0/1/2)` | `script/handlers/misc.lua` | `pending` | `MEDIUM` | 可迁入 `misc.lua`，需保留失败返还策略 |
| `2021458805` | 异界 E3 重置券 | `ResetDimensionInout(3/4/5)` | `script/handlers/misc.lua` | `pending` | `MEDIUM` | 可迁入 `misc.lua`，需保留失败返还策略 |
| `2022110505` | 装备继承券 | 背包装备栏第 1 格继承到第 2 格 | `script/handlers/inherit.lua` | `drafted` | `HIGH` | 接入 inherit 模块前确认 `dpx.item.info` 参数一致性 |

## 非 item_handler 但相关的运行逻辑

| 逻辑 | 当前位置 | 目标位置 | 状态 | 风险 | 说明 |
|---|---|---|---|---|---|
| `my_useitem2` | `df_game_r.lua` | 入口保留 | `runtime` | `MEDIUM` | 通用 UseItem2 分发入口，建议保留在入口文件 |
| `GetCurrentDayZeroTimestamp` | `df_game_r.lua` | `script/utils.lua` | `pending` | `LOW` | `utils.lua` 已有模板，但入口未接入 |
| `split` | `df_game_r.lua` | `script/utils.lua` | `pending` | `LOW` | `on_frida_call` 当前仍调用全局 `split` |
| `decode_unicode` | `df_game_r.lua` | `script/utils.lua` | `pending` | `LOW` | 上线提示当前仍调用全局 `decode_unicode` |
| DPX 启动开关 | `df_game_r.lua` 底部 | `script/config.lua` + 入口装配 | `pending` | `HIGH` | 例如安全机制、交易限制、拍卖行、回购等 |
| `MyUseAncientDungeonItems` | `df_game_r.lua` | 可保留或移入 `script/patches/tod.lua` | `pending` | `MEDIUM` | 当前 hook 调用是注释状态 |

## 已迁移草稿与原逻辑差异

### `quest.lua`

- 已合并重复任务清理逻辑为 `clear_quest_by_type`。
- 功能范围覆盖主线、支线/普通、每日、成就。
- 风险：支线/普通任务清理会影响转职/觉醒任务，接入时必须保留提示。

### `job.lua`

- 已迁移女鬼剑转换、一次觉醒、二次觉醒、转职任务获取。
- 风险：女鬼剑转换仍是 SQL 修改，接入前必须受 SQL 风险开关控制。

### `item_cleanup.lua`

- 已迁移宠物清理、时装清理、一键分解。
- 新草稿中加入 `enable_delete_handlers` 开关。
- 风险：当前运行入口尚未接入该开关，所以旧 handler 仍是无开关版本。

### `inherit.lua`

- 已迁移装备继承券。
- 需要复核新模块中 `dpx.item.info(user, ...)` 与原入口调用是否完全一致。

### `pvp.lua`

- 已迁移 PVP 经验书。
- 新草稿中加入 `enable_shell_handlers` 开关。
- 风险：当前运行入口尚未接入该开关，所以旧 handler 仍会直接执行 shell。

### `misc.lua`

- 仍是模板。
- 未迁移：跨界石、角色出战、装备设计图熟练度、异界 E2/E3 重置。

## 建议接入顺序

### Step 1：只接入 `config` 和 `utils`

目标：确认 require 路径和工具函数替换，不注册新 handler。

### Step 2：接入 `bootstrap`，但默认不注册 handler

建议先增加配置项：

```lua
features = {
    enable_modular_handlers = false,
}
```

### Step 3：只开启 `quest.lua`

原因：任务类相对独立，风险低于删除、SQL、shell。

### Step 4：逐组接入并删除旧 handler

建议顺序：

1. `quest.lua`
2. `job.lua` 中非 SQL 部分
3. `inherit.lua`
4. `misc.lua` 中低风险部分
5. `item_cleanup.lua`
6. `pvp.lua`
7. `job.lua` 中 SQL 部分

## 接入前检查清单

- [ ] 确认新模块中 item_id 与旧入口完全一致。
- [ ] 确认成功提示和失败提示一致或有意调整。
- [ ] 确认失败时是否返还道具。
- [ ] 确认高风险功能是否有配置开关。
- [ ] 确认旧 handler 删除后不会漏注册。
- [ ] 每次只接入一组 handler。
- [ ] 接入后更新 README TODO。
