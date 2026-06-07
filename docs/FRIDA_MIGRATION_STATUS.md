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
| Frida 启动调度辅助 | `script/js/startup_helpers.js` | N/A | `[~]` | 已新增 `safeLoadModule` / `safeFeature` / `safeModuleFeature`，入口待接入。 |
| 绝望之塔修复 | `df_game_r.js` / Lua `legacy_patches.lua` | `enable_tod_fix` / `legacy_patches.*` | `[~]` | 金币/门票类入口已迁移；跳过 UserAPC 等细节仍需实测确认。 |
| 时装镶嵌修复 | `script/js/emblem_fix.js` | `enable_emblem_fix` | `[~]` | 已从旧 `fix_use_emblem()` 拆出独立模块，增加重复 hook 保护；入口仍待切换。 |
| 历史日志追踪 | `script/js/history_log.js` | `enable_history_log` | `[~]` | 已从旧 `hook_history_log()` 拆出独立模块，增加重复 hook 保护；入口仍待切换。 |
| 角色使用道具事件 | `script/js/user_use_item_event.js` | `enable_history_log` | `[~]` | 已从旧 `UserUseItemEvent()` 拆出独立模块，仅保留原本实际启用的坐骑变身器返还邮件逻辑；入口仍待切换。 |
| 上下线处理 | `script/js/user_inout.js` | `enable_user_inout_hook=true` | `[~]` | 当前仓库和旧仓库未找到真实 `hook_user_inout_game_world()` 实现；已补兼容桩避免 ReferenceError，不凭空实现业务逻辑。 |
| 在线奖励 | `script/js/online_reward.js` | `enable_online_reward=false` | `[!]` | 已从旧 `enable_online_reward()` 拆出独立模块，增加重复 hook 保护；会发点券，默认关闭，入口仍待切换。 |
| 幸运在线玩家 | `script/js/lucky_online.js` | `enable_lucky_online=false` | `[!]` | 当前仓库和旧仓库未找到真实 `start_event_lucky_online_user()` 实现；已补兼容桩避免 ReferenceError，不凭空实现抽奖/发奖逻辑。 |
| 随机属性继承 / 自动解封 | `script/js/random_option.js` | `enable_random_option_inherit=false` / `enable_auto_unseal=false` | `[~]` | 已从旧 `change_random_option_inherit()` 和 `auto_unseal_random_option_equipment()` 拆出独立模块，增加重复 hook 保护；入口仍待切换。 |
| 幸运点影响掉落 | `script/js/luck_point_drop.js` | `enable_luck_point_drop=true` | `[!]` | 已从旧 `enable_drop_use_luck_point()` 拆出独立模块，增加重复启动保护；会替换爆率计算函数，高风险，入口仍待切换。 |
| 账号仓库扩展 | `script/js/account_cargo.js` | `enable_account_cargo=false` | `[!]` | 已拆模块，默认关闭。功能极高风险；详细拆分待办见 `docs/FRIDA_HIGH_RISK_TODO.md`。 |
| 创建角色数量限制 | `script/js/patches.js` | `enable_create_character_unlimit=true` | `[~]` | 已迁移并加重复 hook 保护。 |
| +13 强化券刷新 | `script/js/patches.js` | `enable_strengthen_refresh=true` | `[~]` | 已修复参数口径，恢复旧实现的 user/slot 更新方式。 |
| 黑暗武士技能栏修复 | `script/js/patches.js` | `enable_dark_knight_skill_fix=true` | `[~]` | 已迁移并加重复 hook 保护。 |
| 取消新账号成长契约 | `script/js/patches.js` | `enable_mobile_auth=false` | `[~]` | 已迁移并加重复 replace 保护，默认关闭。 |
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
| 启动辅助接入 | `[~]` | `startup_helpers.js` 已新增，但 `df_game_r.js` 入口尚未使用 `safeModuleFeature(...)`。 |
| 时装镶嵌入口切换 | `[~]` | `emblem_fix.js` 已新增，但入口调度仍需从旧内联 `fix_use_emblem()` 切换为 `dp_load('emblem_fix'); startEmblemFix()`。 |
| 历史日志入口切换 | `[~]` | `history_log.js` 已新增，但入口调度仍需从旧内联 `hook_history_log()` 切换为 `dp_load('history_log'); startHistoryLog()`。 |
| 角色使用道具事件入口切换 | `[~]` | `user_use_item_event.js` 已新增，但入口调度仍需和 `history_log.js` 一起加载。 |
| 上下线处理真实实现 | `[ ]` | `user_inout.js` 当前只是兼容桩；真实 `hook_user_inout_game_world()` 未在当前仓库或旧仓库中找到。 |
| 在线奖励入口切换 | `[~]` | `online_reward.js` 已新增，但入口调度仍需从旧内联 `enable_online_reward()` 切换为 `dp_load('online_reward'); startOnlineReward()`。 |
| 幸运在线玩家真实实现 | `[ ]` | `lucky_online.js` 当前只是兼容桩；真实 `start_event_lucky_online_user()` 未在当前仓库或旧仓库中找到。 |
| 随机属性入口切换 | `[~]` | `random_option.js` 已新增，但入口调度仍需从旧内联函数切换为 `startRandomOptionInherit()` / `startAutoUnsealRandomOptionEquipment()`。 |
| 幸运点掉落入口切换 | `[~]` | `luck_point_drop.js` 已新增，但入口调度仍需从旧内联 `enable_drop_use_luck_point()` 切换为 `dp_load('luck_point_drop'); startLuckPointDrop()`。 |
| 掉落公告入口接入 | `[~]` | `drop_announce.js` 已新增，但入口调度仍需接入 `js_features.enable_drop_announce`，默认保持关闭。 |
| 批量物品 UI 通知入口切换 | `[~]` | `batch_item_notify.js` 已新增，但入口调度仍需切换旧内联函数。 |
| frida 数据库结构完整性 | `[~]` | `init_db()` 会创建/使用 `frida.game_event`，但 `frida.battle` 等表依赖仍需确认。 |
| `df_game_r.js` 入口瘦身 | `[~]` | 当前 `df_game_r.js` 内仍混有大段旧功能和部分拆分模块的重复代码。后续应继续拆分成 `script/js/*.js`，避免入口文件过大。 |
| `start()` 调度一致性 | `[~]` | 已新增 `docs/FRIDA_STARTUP_AUDIT.md` 记录调度风险和后续方案；当前已先做单点缓解，尚未全量重构入口。 |
| 高风险 JS 默认开关策略 | `[!]` | 当前部分高风险功能默认为 true，如怪物攻城、幸运点掉落、排行榜、时装潜能、VIP 登录。上线前需按测试结果决定是否保持开启。 |

## 3. 本轮已修复的迁移断点

- `script/js/lucky_online.js`
  - 新增 `start_event_lucky_online_user()` 兼容入口。
  - 当前仓库和旧仓库均未找到真实实现，因此只做保守兼容桩。
  - 避免 `enable_lucky_online=true` 时入口因为函数不存在直接报错。
  - 不凭空实现随机在线玩家抽取、发点券、发道具或邮件等经济逻辑。

- `script/js/user_inout.js`
  - 新增 `hook_user_inout_game_world()` 兼容入口。
  - 当前仓库和旧仓库均未找到真实实现，因此只做保守兼容桩。
  - 避免 `enable_user_inout_hook=true` 时入口因为函数不存在直接报错。
  - 不凭空实现排行榜刷新、怪物攻城 UI、幸运点等业务逻辑。

- `script/js/history_log.js`
  - 从旧 `hook_history_log()` 逻辑拆出独立模块。
  - 增加重复 hook 保护。
  - 保留旧入口 `hook_history_log()` 兼容。
  - 可选联动 `drop_announce.js` 与 `random_option.js`，但仍由入口配置决定是否加载相关模块。

- `script/js/user_use_item_event.js`
  - 从旧 `UserUseItemEvent()` 逻辑拆出独立模块。
  - 仅保留原本实际启用的坐骑变身器返还邮件逻辑。
  - 旧命运硬币、辅助装备任务完成券、魔法石任务完成券分支保持不启用。

- `script/js/batch_item_notify.js`
  - 从旧 `api_CUser_Add_Item_list()` 和 `SendItemWindowNotification()` 逻辑拆出独立模块。
  - 保留旧入口名兼容。
  - 对非法 item_id/count 做跳过日志。

- `script/js/online_reward.js`
  - 从旧 `enable_online_reward()` 逻辑拆出独立模块。
  - 增加重复 hook 保护。
  - 保留旧入口 `enable_online_reward()` 兼容。
  - 默认通过 `enable_online_reward=false` 保持关闭。

- 其他已拆模块状态详见上表。

## 4. 后续迁移建议

优先级建议：

1. 接入 `startup_helpers.js` 到 `df_game_r.js`。
2. 继续拆分 `df_game_r.js` 中剩余的大功能到 `script/js/*.js`。
3. 接入 `history_log.js`、`user_use_item_event.js`、`user_inout.js`、`lucky_online.js`、`batch_item_notify.js`、`online_reward.js`、`emblem_fix.js`、`random_option.js`、`luck_point_drop.js` 和 `drop_announce.js` 到 `df_game_r.js` 启动调度。
4. 对 `start()` 做统一安全调度封装，避免函数不存在、重复 hook、DB 未初始化导致启动失败。
5. 将高风险默认 true 的 JS 功能逐项确认是否应保持开启。
6. 最后再做测试服验证和 Bug 修复。
