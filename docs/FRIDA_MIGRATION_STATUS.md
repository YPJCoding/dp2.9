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
| Frida 基础入口 | `df_game_r.js` | N/A | `[x]` | 已保留 `rpc.exports.init`、`setup()`、Lua/JS 桥接。 |
| Frida 回调发物品 | `df_game_r.lua` | `js_features.enable_batch_item_add` | `[x]` | Lua 侧已加开关、账号、物品、在线用户校验。 |
| Frida 启动调度辅助 | `script/js/startup_helpers.js` | N/A | `[~]` | 已新增 `safeLoadModule` / `safeFeature` / `safeModuleFeature` / `resolveStartupFunction`，入口待接入。 |
| 已迁移模块集中启动器 | `script/js/startup_modules.js` | `js_features.*` | `[~]` | 已新增 `startMigratedModules(cfg)`，用于集中启动已拆分模块；已补齐 patches 和 account_cargo 调度，入口待接入。 |
| 绝望之塔修复 | `df_game_r.js` / Lua `legacy_patches.lua` | `enable_tod_fix` / `legacy_patches.*` | `[~]` | 金币/门票类入口已迁移；跳过 UserAPC 等细节仍需实测确认。 |
| 时装镶嵌修复 | `script/js/emblem_fix.js` | `enable_emblem_fix` | `[~]` | 已从旧 `fix_use_emblem()` 拆出独立模块，增加重复 hook 保护；入口仍待切换。 |
| 历史日志追踪 | `script/js/history_log.js` | `enable_history_log` | `[~]` | 已从旧 `hook_history_log()` 拆出独立模块，增加重复 hook 保护；入口仍待切换。 |
| 角色使用道具事件 | `script/js/user_use_item_event.js` | `enable_history_log` | `[~]` | 已从旧 `UserUseItemEvent()` 拆出独立模块，仅保留原本实际启用的坐骑变身器返还邮件逻辑；入口仍待切换。 |
| 上下线处理 | `script/js/user_inout.js` | `enable_user_inout_hook=true` | `[~]` | 当前仓库和旧仓库未找到真实 `hook_user_inout_game_world()` 实现；已补兼容桩避免 ReferenceError，不凭空实现业务逻辑。 |
| 在线奖励 | `script/js/online_reward.js` | `enable_online_reward=false` | `[!]` | 已从旧 `enable_online_reward()` 拆出独立模块，增加重复 hook 保护；会发点券，默认关闭，入口仍待切换。 |
| 幸运在线玩家 | `script/js/lucky_online.js` | `enable_lucky_online=false` | `[!]` | 当前仓库和旧仓库未找到真实 `start_event_lucky_online_user()` 实现；已补兼容桩避免 ReferenceError，不凭空实现抽奖/发奖逻辑。 |
| 随机属性继承 / 自动解封 | `script/js/random_option.js` | `enable_random_option_inherit=false` / `enable_auto_unseal=false` | `[~]` | 已从旧 `change_random_option_inherit()` 和 `auto_unseal_random_option_equipment()` 拆出独立模块，增加重复 hook 保护；入口仍待切换。 |
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
| 怪物攻城 | `df_game_r.js` | `enable_village_attack=true` | `[!]` | 大型系统已存在于 `df_game_r.js`，但依赖 DB、timer、UI 包、奖励邮件；详细拆分待办见 `docs/FRIDA_HIGH_RISK_TODO.md`。 |
| 掉落公告 / 掉落奖励 | `script/js/drop_announce.js` | `enable_drop_announce=false` | `[!]` | 已从 `df_game_r.js` 残留 `processing_data(...)` 拆出独立模块，默认关闭；会全服公告并发点券，需专项测试。 |
| 批量物品 UI 通知 | `script/js/batch_item_notify.js` | `enable_batch_item_add=true` | `[~]` | 已从旧 `api_CUser_Add_Item_list()` / `SendItemWindowNotification()` 拆出独立模块；Lua 回调发物品侧已加固，入口仍待切换。 |

## 2. 当前缺口 / 未完成项

| 功能 | 状态 | 说明 |
|---|---|---|
| 启动辅助接入 | `[~]` | `startup_helpers.js` 和 `startup_modules.js` 已新增，但 `df_game_r.js` 入口尚未调用 `startMigratedModules(cfg)`。 |
| 时装镶嵌入口切换 | `[~]` | `emblem_fix.js` 已新增，但入口调度仍需切换到 `startup_modules.js`。 |
| 历史日志入口切换 | `[~]` | `history_log.js` 已新增，但入口调度仍需切换到 `startup_modules.js`。 |
| 角色使用道具事件入口切换 | `[~]` | `user_use_item_event.js` 已新增，但入口调度仍需和 `history_log.js` 一起加载。 |
| 上下线处理真实实现 | `[ ]` | `user_inout.js` 当前只是兼容桩；真实 `hook_user_inout_game_world()` 未在当前仓库或旧仓库中找到。 |
| 在线奖励入口切换 | `[~]` | `online_reward.js` 已新增，但入口调度仍需切换到 `startup_modules.js`。 |
| 幸运在线玩家真实实现 | `[ ]` | `lucky_online.js` 当前只是兼容桩；真实 `start_event_lucky_online_user()` 未在当前仓库或旧仓库中找到。 |
| 随机属性入口切换 | `[~]` | `random_option.js` 已新增，但入口调度仍需切换到 `startup_modules.js`。 |
| 幸运点掉落入口切换 | `[~]` | `luck_point_drop.js` 已新增，但入口调度仍需切换到 `startup_modules.js`。 |
| 掉落公告入口接入 | `[~]` | `drop_announce.js` 已新增，但入口调度仍需切换到 `startup_modules.js`，默认保持关闭。 |
| 批量物品 UI 通知入口切换 | `[~]` | `batch_item_notify.js` 已新增，但入口调度仍需切换旧内联函数。 |
| frida 数据库结构完整性 | `[~]` | `init_db()` 会创建/使用 `frida.game_event`，但 `frida.battle` 等表依赖仍需确认。 |
| `df_game_r.js` 入口瘦身 | `[~]` | 当前 `df_game_r.js` 内仍混有大段旧功能和部分拆分模块的重复代码。后续应继续拆分成 `script/js/*.js`，避免入口文件过大。 |
| `start()` 调度一致性 | `[~]` | 已新增 `docs/FRIDA_STARTUP_AUDIT.md` 记录调度风险和后续方案；当前已先做单点缓解，尚未全量重构入口。 |
| 高风险 JS 默认开关策略 | `[!]` | 当前部分高风险功能默认为 true，如怪物攻城、幸运点掉落、排行榜、时装潜能、VIP 登录。上线前需按测试结果决定是否保持开启。 |

## 3. 本轮已修复的迁移断点

- `script/js/startup_helpers.js`
  - 新增 `resolveStartupFunction(functionName)`。
  - `safeModuleFeature(...)` 现在通过 `resolveStartupFunction(...)` 查找启动函数。
  - 函数查找会依次尝试 `globalThis`、当前上下文和 `eval(functionName)`，降低 Frida 运行时作用域差异导致的误判缺失。

- `script/js/startup_modules.js`
  - 新增 `startMigratedModules(cfg)` 集中启动器。
  - 统一调度已拆分模块，后续 `df_game_r.js` 可只调用该入口。
  - 避免在 `df_game_r.js` 中逐个手写模块加载和函数调用。
  - 已纳入 `patches` 的创建角色、强化刷新、黑武技能栏、成长契约调度。
  - 已纳入 `account_cargo` 调度，但仍默认关闭。
  - 不处理仍留在 `df_game_r.js` 的怪物攻城、TOD 等大型旧逻辑。

- 其他已拆模块状态详见上表。

## 4. 后续迁移建议

优先级建议：

1. 接入 `startup_helpers.js` 和 `startup_modules.js` 到 `df_game_r.js`。
2. 修复 `df_game_r.js` 的 `start()` 大括号结构。
3. 继续拆分 `df_game_r.js` 中剩余的大功能到 `script/js/*.js`。
4. 对 `start()` 做统一安全调度封装，避免函数不存在、重复 hook、DB 未初始化导致启动失败。
5. 将高风险默认 true 的 JS 功能逐项确认是否应保持开启。
6. 最后再做测试服验证和 Bug 修复。
