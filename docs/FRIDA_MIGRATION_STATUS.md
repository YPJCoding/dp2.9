# Frida / JS Migration Status

本文档记录 `dp2/frida.js` 到 `dp2.9` 的迁移状态。

状态说明：

- `[x]` 已迁移代码并接入开关。
- `[~]` 已迁移代码但仍需测试或存在已知收尾点。
- `[!]` 高风险，已有代码但不建议直接开启。
- `[ ]` 未迁移或未找到源实现。

## 1. 当前已迁移 / 已接入的 JS 功能

| 功能 | dp2.9 文件 | 配置开关 | 状态 | 说明 |
|---|---|---|---|---|
| Frida 基础入口 | `df_game_r.js` | N/A | `[~]` | 已保留 `rpc.exports.init`、`setup()`、Lua/JS 桥接；`start()` 已加载 `startup_helpers` / `startup_modules` 并调用 `startMigratedModules(cfg)`，入口仍保留 native/common 基础设施。 |
| Frida 回调发物品 | `df_game_r.lua` | `js_features.enable_batch_item_add` | `[x]` | Lua 侧已加开关、账号、物品、在线用户校验。 |
| Frida 启动调度辅助 | `script/js/startup_helpers.js` | N/A | `[~]` | 已新增 `safeLoadModule` / `safeFeature` / `safeModuleFeature` / `resolveStartupFunction` 和模块加载缓存；`df_game_r.js start()` 已接入。 |
| 已迁移模块集中启动器 | `script/js/startup_modules.js` | `js_features.*` | `[~]` | 已通过 `startMigratedModules(cfg)` 集中启动已拆分模块，并纳入 patches、account_cargo、village_attack 等调度；仍需测试服验证启动日志。 |
| 绝望之塔修复 | `df_game_r.js` / Lua `legacy_patches.lua` | `enable_tod_fix` / `legacy_patches.*` | `[~]` | 金币/门票类入口已迁移；跳过 UserAPC 等细节仍需实测确认。 |
| 时装镶嵌修复 | `script/js/emblem_fix.js` | `enable_emblem_fix` | `[~]` | 已从旧 `fix_use_emblem()` 拆出独立模块，增加重复 hook 保护，并清理 `df_game_r.js` 旧实现；待实测。 |
| 历史日志追踪 | `script/js/history_log.js` | `enable_history_log` | `[~]` | 已从旧 `hook_history_log()` 拆出独立模块，增加重复 hook 保护；入口仍待切换。 |
| 角色使用道具事件 | `script/js/user_use_item_event.js` | `enable_history_log` | `[~]` | 已从旧 `UserUseItemEvent()` 拆出独立模块，仅保留原本实际启用的坐骑变身器返还邮件逻辑，并清理 `df_game_r.js` 旧实现；待实测。 |
| 上下线处理 | `script/js/user_inout.js` | `enable_user_inout_hook=true` | `[~]` | `user_inout.js` 当前保持兼容桩；`df_game_r.js` 仍有旧 `hook_user_inout_game_world()` 残留（含幸运点与怪物攻城 UI 通知），后续必须找到真实旧来源或专项拆分，不能凭空实现。 |
| 在线奖励 | `script/js/online_reward.js` | `enable_online_reward=false` | `[!]` | 已从旧 `enable_online_reward()` 拆出独立模块，增加重复 hook 保护；会发点券，默认关闭，入口仍待切换。 |
| 幸运在线玩家 | `script/js/lucky_online.js` | `enable_lucky_online=false` | `[!]` | 当前仓库和旧仓库未找到真实 `start_event_lucky_online_user()` 实现；已补兼容桩避免 ReferenceError，不凭空实现抽奖/发奖逻辑。 |
| 随机属性继承 / 自动解封 | `script/js/random_option.js` | `enable_random_option_inherit=false` / `enable_auto_unseal=false` | `[~]` | 已从旧 `change_random_option_inherit()` 和 `auto_unseal_random_option_equipment()` 拆出独立模块，增加重复 hook 保护，并清理 `df_game_r.js` 旧实现；待实测。 |
| 幸运点影响掉落 | `script/js/luck_point_drop.js` | `enable_luck_point_drop=true` | `[!]` | 已从旧 `enable_drop_use_luck_point()` 拆出独立模块，增加重复启动保护；会替换爆率计算函数，高风险，入口仍待切换。 |
| 账号仓库扩展 | `script/js/account_cargo.js` | `enable_account_cargo=false` | `[!]` | 已拆模块，默认关闭；`startup_modules.js` 已纳入调度但仍默认关闭。功能极高风险；详细拆分待办见 `docs/FRIDA_HIGH_RISK_TODO.md`。 |
| 创建角色数量限制 | `script/js/patches.js` | `enable_create_character_unlimit=true` | `[~]` | 已迁移并加重复 hook 保护；`startup_modules.js` 已纳入调度。 |
| +13 强化券刷新 | `script/js/patches.js` | `enable_strengthen_refresh=true` | `[~]` | 已修复参数口径并纳入 `startup_modules.js` 调度。 |
| 黑暗武士技能栏修复 | `script/js/patches.js` | `enable_dark_knight_skill_fix=true` | `[~]` | 已迁移并加重复 hook 保护；`startup_modules.js` 已纳入调度。 |
| 取消新账号成长契约 | `script/js/patches.js` | `enable_mobile_auth=false` | `[~]` | 已迁移并加重复 replace 保护，默认关闭；`startup_modules.js` 已纳入调度。 |
| 战力排行榜 | `script/js/ranking.js` | `enable_ranking=true` | `[~]` | 已拆模块；已修复 DB 初始化时序和 guild name 兜底。 |
| 时装潜能 | `script/js/hidden_option.js` | `enable_hidden_option=true` | `[~]` | 已拆模块；已补重复 hook 保护和旧入口 `start_hidden_option()` 兼容。 |
| 回归勇士 | `script/js/return_user.js` | `enable_return_user=true` | `[~]` | 已拆模块；已补参数校验、重复应用保护和旧入口 `set_return_user()` 兼容。 |
| VIP 登录公告 | `script/js/vip_login.js` | `enable_vip_login=true` | `[~]` | 已拆模块；已修复广播函数名、旧大小写函数名兼容和重复 hook 保护。 |
| 怪物攻城 | `script/js/village_attack*.js` / `df_game_r.js` native/common infra | `enable_village_attack=true` | `[!]` | 业务迁移基本完成：启动适配、state、DB、flow、notify、hook、settlement 和副本回调奖励均已拆出；`df_game_r.js` 仅保留迁移注释、NativeFunction/API/MySQL/Packet/邮件 helper 和 user_inout 残留，需专项实测。 |
| 掉落公告 / 掉落奖励 | `script/js/drop_announce.js` | `enable_drop_announce=false` | `[!]` | 已从 `df_game_r.js` 残留 `processing_data(...)` 拆出独立模块，并清理旧实现；默认关闭，会全服公告并发点券，需专项测试。 |
| 批量物品 UI 通知 | `script/js/batch_item_notify.js` | `enable_batch_item_add=true` | `[~]` | 已从旧 `api_CUser_Add_Item_list()` / `SendItemWindowNotification()` 拆出独立模块并清理 `df_game_r.js` 旧实现；Lua 回调发物品侧已加固，待实测。 |

## 2. 当前缺口 / 未完成项

| 功能 | 状态 | 说明 |
|---|---|---|
| `df_game_r.js start()` 集中启动接入 | `[x]` | `start()` 已加载 `startup_helpers` / `startup_modules`，并调用 `startMigratedModules(cfg)`；旧逐项启动调用已移出入口。 |
| 启动日志实测 | `[~]` | 需在测试服确认 `startup_helpers`、`startup_modules`、`migrated module startup finished`、`set function success` 等日志完整出现。 |
| 时装镶嵌旧实现清理 | `[x]` | `emblem_fix.js` 已保留旧函数名兼容，`startup_modules.js` 已调度，`df_game_r.js` 旧函数已删除。 |
| 历史日志入口切换 | `[~]` | `history_log.js` 已新增，但入口调度仍需切换到 `startup_modules.js`。 |
| 角色使用道具事件旧实现清理 | `[x]` | `user_use_item_event.js` 已保留旧函数名兼容，`df_game_r.js` 旧 `UserUseItemEvent()` 已删除。 |
| 上下线处理真实实现 | `[ ]` | `user_inout.js` 当前只是兼容桩；真实 `hook_user_inout_game_world()` 未在当前仓库或旧仓库中找到。 |
| 在线奖励入口切换 | `[~]` | `online_reward.js` 已新增，但入口调度仍需切换到 `startup_modules.js`。 |
| 幸运在线玩家真实实现 | `[ ]` | `lucky_online.js` 当前只是兼容桩；真实 `start_event_lucky_online_user()` 未在当前仓库或旧仓库中找到。 |
| 随机属性旧实现清理 | `[x]` | `random_option.js` 已保留旧函数名兼容，`startup_modules.js` 已调度，`df_game_r.js` 旧函数已删除。 |
| 幸运点掉落入口切换 | `[~]` | `luck_point_drop.js` 已新增，但入口调度仍需切换到 `startup_modules.js`。 |
| 掉落公告旧实现清理 | `[x]` | `drop_announce.js` 已提供 `processDropAnnounce(...)`，`df_game_r.js` 旧 `processing_data(...)` 已删除；功能默认保持关闭。 |
| 批量物品 UI 通知旧实现清理 | `[x]` | `batch_item_notify.js` 已保留旧函数名兼容，`df_game_r.js` 旧内联函数已删除。 |
| frida 数据库结构完整性 | `[~]` | `init_db()` 会创建/使用 `frida.game_event`，但 `frida.battle` 等表依赖仍需确认。 |
| `df_game_r.js` 入口瘦身 | `[~]` | `start()` 已集中调度，但文件内仍保留 native/common 基础设施、通用 helper 和少量旧业务残留（如 user_inout 旧 hook）。后续应继续小步拆分。 |
| `start()` 调度一致性 | `[~]` | 已切到 `startup_modules` 集中调度；仍需测试服验证 DB-ready retry、默认开关和启动日志。 |
| 高风险 JS 默认开关策略 | `[!]` | 当前部分高风险功能默认为 true，如怪物攻城、幸运点掉落、排行榜、时装潜能、VIP 登录。上线前需按测试结果决定是否保持开启。 |

## 3. 本轮已修复的迁移断点

- `script/js/startup_helpers.js`
  - 新增 `resolveStartupFunction(functionName)`。
  - `safeModuleFeature(...)` 现在通过 `resolveStartupFunction(...)` 查找启动函数。
  - 函数查找会依次尝试 `globalThis`、当前上下文和 `eval(functionName)`，降低 Frida 运行时作用域差异导致的误判缺失。
  - 新增 `g_startup_loaded_modules` 加载缓存，避免同一启动流程多次 `dp_load` 同一个模块。
  - `safeModuleFeature(...)` 现在会在模块加载失败时明确失败，不继续误调用缺失函数。

- `script/js/startup_modules.js`
  - 新增 `startMigratedModules(cfg)` 集中启动器。
  - 统一调度已拆分模块，后续 `df_game_r.js` 可只调用该入口。
  - 避免在 `df_game_r.js` 中逐个手写模块加载和函数调用。
  - 已纳入 `patches` 的创建角色、强化刷新、黑武技能栏、成长契约调度。
  - 已纳入 `account_cargo` 调度，但仍默认关闭。
  - 已纳入 `village_attack` 适配启动；怪物攻城 NativeFunction/API 基础设施仍留在 `df_game_r.js`。

- `script/js/village_attack*.js`
  - 怪物攻城已拆出 state、DB、flow、notify、hook、settlement 和启动适配模块。
  - `event_villageattack_save_to_db()` / `event_villageattack_load_from_db()` 已迁入 `village_attack_db.js`，并增加 DB-ready/JSON parse 日志保护。
  - `VillageAttackedRewardSendReward(user)` 已迁入 `village_attack_hook.js`，保留旧奖励邮件映射。
  - `df_game_r.js` 中怪物攻城实现函数已清理，只保留对应迁移注释和仍被模块依赖的公共基础设施。

- `tools/check_df_game_r_start.py`
  - 只读检查器用于区分 `pending`、`patched`、`broken/mixed` 三种入口状态。
  - 当前 `refactor/dp2-9-base` 应保持 `patched`：`df_game_r.js start()` 已接入 `startup_helpers` / `startup_modules`。

- 其他已拆模块状态详见上表。

## 4. 后续迁移建议

优先级建议：

1. 重启 Frida 并检查启动日志：`startup_helpers`、`startup_modules`、`migrated module startup finished`、`village_attack_state`、`village_attack_db`、`village_attack_flow`、DB-ready retry、`set function success`。
2. 继续清理 `df_game_r.js` 中其他已拆模块的旧重复实现；native declarations、MySQL/Packet/API/common mail helpers 需先搜索全仓引用，不能一次性删除。
3. 对高风险默认 true 的 JS 功能逐项确认是否应保持开启，尤其 `enable_village_attack`、`enable_luck_point_drop`、`enable_ranking`、`enable_hidden_option`、`enable_vip_login`。
4. `account_cargo`、`online_reward`、`lucky_online`、`drop_announce` 继续默认关闭，找到真实实现并专项测试前不要开启。
5. 最后再做测试服验证和 Bug 修复。
