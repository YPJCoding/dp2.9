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
| 时装镶嵌修复 | `script/js/emblem_fix.js` | `enable_emblem_fix` | `[~]` | 已从 `df_game_r.js` 旧 `fix_use_emblem()` 拆出独立模块，增加重复 hook 保护；入口仍待切换。 |
| 历史日志追踪 | `script/js/history_log.js` | `enable_history_log` | `[~]` | 已从旧 `hook_history_log()` 拆出独立模块，增加重复 hook 保护；入口仍待切换。 |
| 上下线处理 | `df_game_r.js` | `enable_user_inout_hook` | `[~]` | 旧 `hook_user_inout_game_world()` 已保留，包含排行榜/怪物攻城 UI 相关逻辑，需实测。 |
| 在线奖励 | `script/js/online_reward.js` | `enable_online_reward=false` | `[!]` | 已从旧 `enable_online_reward()` 拆出独立模块，增加重复 hook 保护；会发点券，默认关闭，入口仍待切换。 |
| 随机属性继承 / 自动解封 | `script/js/random_option.js` | `enable_random_option_inherit=false` / `enable_auto_unseal=false` | `[~]` | 已从旧 `change_random_option_inherit()` 和 `auto_unseal_random_option_equipment()` 拆出独立模块，增加重复 hook 保护；入口仍待切换。 |
| 幸运点影响掉落 | `script/js/luck_point_drop.js` | `enable_luck_point_drop=true` | `[!]` | 已从旧 `enable_drop_use_luck_point()` 拆出独立模块，增加重复启动保护；会替换爆率计算函数，高风险，入口仍待切换。 |
| 账号仓库扩展 | `script/js/account_cargo.js` | `enable_account_cargo=false` | `[!]` | 已拆模块，默认关闭。功能极高风险；详细拆分待办见 `docs/FRIDA_HIGH_RISK_TODO.md`。 |
| 创建角色数量限制 | `script/js/patches.js` | `enable_create_character_unlimit=true` | `[~]` | 已迁移并加重复 hook 保护。 |
| +13 强化券刷新 | `script/js/patches.js` | `enable_strengthen_refresh=true` | `[~]` | 已修复参数口径，恢复旧实现的 user/slot 更新方式。 |
| 黑暗武士技能栏修复 | `script/js/patches.js` | `enable_dark_knight_skill_fix=true` | `[~]` | 已迁移并加重复 hook 保护。 |
| 取消新账号成长契约 | `script/js/patches.js` | `enable_mobile_auth=false` | `[~]` | 已迁移并加重复 replace 保护，默认关闭。 |
| 幸运在线玩家 | `df_game_r.js` | `enable_lucky_online=false` | `[!]` | 当前未找到明确旧函数体，默认关闭；详细拆分待办见 `docs/FRIDA_HIGH_RISK_TODO.md`。 |
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
| 在线奖励入口切换 | `[~]` | `online_reward.js` 已新增，但入口调度仍需从旧内联 `enable_online_reward()` 切换为 `dp_load('online_reward'); startOnlineReward()`。 |
| 随机属性入口切换 | `[~]` | `random_option.js` 已新增，但入口调度仍需从旧内联函数切换为 `startRandomOptionInherit()` / `startAutoUnsealRandomOptionEquipment()`。 |
| 幸运点掉落入口切换 | `[~]` | `luck_point_drop.js` 已新增，但入口调度仍需从旧内联 `enable_drop_use_luck_point()` 切换为 `dp_load('luck_point_drop'); startLuckPointDrop()`。 |
| 掉落公告入口接入 | `[~]` | `drop_announce.js` 已新增，但入口调度仍需接入 `js_features.enable_drop_announce`，默认保持关闭。 |
| 批量物品 UI 通知入口切换 | `[~]` | `batch_item_notify.js` 已新增，但入口调度仍需切换旧内联函数。 |
| 幸运在线玩家实现 | `[ ]` | `enable_lucky_online=false` 已保持关闭，但当前仓库和旧仓库未找到明确函数体，需继续确认真实来源。 |
| frida 数据库结构完整性 | `[~]` | `init_db()` 会创建/使用 `frida.game_event`，但 `frida.battle` 等表依赖仍需确认。 |
| `df_game_r.js` 入口瘦身 | `[~]` | 当前 `df_game_r.js` 内仍混有大段旧功能和部分拆分模块的重复代码。后续应继续拆分成 `script/js/*.js`，避免入口文件过大。 |
| `start()` 调度一致性 | `[~]` | 已新增 `docs/FRIDA_STARTUP_AUDIT.md` 记录调度风险和后续方案；当前已先做单点缓解，尚未全量重构入口。 |
| 高风险 JS 默认开关策略 | `[!]` | 当前部分高风险功能默认为 true，如怪物攻城、幸运点掉落、排行榜、时装潜能、VIP 登录。上线前需按测试结果决定是否保持开启。 |

## 3. 本轮已修复的迁移断点

- `script/js/startup_helpers.js`
  - 新增启动调度辅助函数。
  - 提供 `safeLoadModule`、`safeFeature`、`safeModuleFeature`、`isFeatureEnabled`。
  - 后续用于 `df_game_r.js` 入口瘦身和安全调度接入。

- `script/js/history_log.js`
  - 从旧 `hook_history_log()` 逻辑拆出独立模块。
  - 增加重复 hook 保护。
  - 保留旧入口 `hook_history_log()` 兼容。
  - 可选联动 `drop_announce.js` 与 `random_option.js`，但仍由入口配置决定是否加载相关模块。

- `script/js/batch_item_notify.js`
  - 从旧 `api_CUser_Add_Item_list()` 和 `SendItemWindowNotification()` 逻辑拆出独立模块。
  - 保留旧入口名兼容。
  - 对非法 item_id/count 做跳过日志。

- `script/js/online_reward.js`
  - 从旧 `enable_online_reward()` 逻辑拆出独立模块。
  - 增加重复 hook 保护。
  - 保留旧入口 `enable_online_reward()` 兼容。
  - 默认通过 `enable_online_reward=false` 保持关闭。

- `script/js/ranking.js`
  - 增加 DB 未就绪重试。
  - 避免 `mysql_frida` / `mysql_taiwan_cain` 为空时报错。
  - `api_CUser_GetGuildName` 缺失时回退为“未加入公会”。

- `script/js/vip_login.js`
  - 修正广播函数名为 `api_GameWorld_SendNotiPacketMessage`。
  - 增加重复 hook 保护。
  - 增加 `vip_Login()` 兼容别名。
  - 增加旧内联实现使用过的 `api_gameWorld_SendNotiPacketMessage` 小写兼容别名。

- `script/js/patches.js`
  - 创建角色限制、强化券刷新、黑暗武士技能栏、成长契约补重复启动保护。
  - 强化券刷新恢复旧实现参数口径：从 hook 参数读取 `user` 和装备位置，并调用 `CUser_SendUpdateItemList(user, 1, 0, slot)`。

- `script/js/hidden_option.js`
  - 增加重复 hook 保护。
  - 增加日志。
  - 增加旧入口 `start_hidden_option()` 兼容。

- `script/js/return_user.js`
  - 增加参数校验。
  - 增加重复应用保护。
  - 增加旧入口 `set_return_user()` 兼容。

- `script/js/drop_announce.js`
  - 从 `df_game_r.js` 残留 `processing_data(...)` 逻辑拆出独立模块。
  - 增加重复 hook 保护。
  - 默认通过 `enable_drop_announce=false` 保持关闭。

- `script/js/emblem_fix.js`
  - 从 `df_game_r.js` 旧 `fix_use_emblem()` 逻辑拆出独立模块。
  - 增加重复 hook 保护。
  - 保留旧入口 `fix_use_emblem()` 兼容。

- `script/js/luck_point_drop.js`
  - 从旧 `enable_drop_use_luck_point()` 逻辑拆出独立模块。
  - 增加重复 attach/replace 保护。
  - 保留旧入口 `enable_drop_use_luck_point()` 和 `use_ftcoin_change_luck_point()` 兼容。

- `script/js/random_option.js`
  - 从旧随机属性继承和自动解封逻辑拆出独立模块。
  - 增加重复 hook 保护。
  - 保留旧入口 `change_random_option_inherit()` 和 `auto_unseal_random_option_equipment()` 兼容。

- `script/config.lua`
  - `enable_drop_announce` 改为默认 `false`。
  - 注释标记该功能源实现未找到，待补齐后再开启。

- `docs/FRIDA_STARTUP_AUDIT.md`
  - 新增 `df_game_r.js` 启动调度审计。
  - 记录当前入口结构风险、已缓解项和后续重构优先级。

- `docs/FRIDA_HIGH_RISK_TODO.md`
  - 新增高风险 Frida 功能拆分待办。
  - 将账号仓库、怪物攻城、幸运点掉落、在线奖励/幸运在线玩家、掉落公告拆开跟踪。

## 4. 后续迁移建议

优先级建议：

1. 接入 `startup_helpers.js` 到 `df_game_r.js`。
2. 继续拆分 `df_game_r.js` 中剩余的大功能到 `script/js/*.js`。
3. 接入 `history_log.js`、`batch_item_notify.js`、`online_reward.js`、`emblem_fix.js`、`random_option.js`、`luck_point_drop.js` 和 `drop_announce.js` 到 `df_game_r.js` 启动调度。
4. 对 `start()` 做统一安全调度封装，避免函数不存在、重复 hook、DB 未初始化导致启动失败。
5. 将高风险默认 true 的 JS 功能逐项确认是否应保持开启。
6. 最后再做测试服验证和 Bug 修复。
