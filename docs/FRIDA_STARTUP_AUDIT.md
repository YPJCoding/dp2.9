# Frida Startup Audit

本文档记录 `df_game_r.js` 的 `start()` 调度现状、已修复问题和后续重构事项。

## 1. 当前问题

`df_game_r.js` 已不再是纯旧调度入口，但仍不是一个干净入口文件：

- `start()` 已加载 `startup_helpers.js` / `startup_modules.js` 并调用 `startMigratedModules(cfg)` 集中启动已拆模块。
- `df_game_r.js` 仍负责读取 `/dp2/frida/frida_config.json`、初始化 DB、保留 native declarations、MySQL/Packet/API/common mail helper 等通用基础设施。
- 文件内仍有少量旧业务残留，例如 `hook_user_inout_game_world()`，其中仍包含幸运点和怪物攻城 UI 通知联动；`user_inout.js` 当前只是兼容桩，不能凭空替代。
- 依赖 DB 的模块已有局部 retry 缓解，但仍需要测试服启动日志确认。

## 2. 已修复/已缓解问题

### 2.1 排行榜 DB 初始化时序

文件：`script/js/ranking.js`

已处理：

- `startRanking()` 在 `mysql_frida` / `mysql_taiwan_cain` 未就绪时不直接失败。
- 增加延迟重试。
- `api_CUser_GetGuildName` 不存在时回退为“未加入公会”。

状态：`[~] 已加固，待实测`

### 2.2 VIP 登录公告

文件：`script/js/vip_login.js`

已处理：

- `startVipLogin()` 增加重复 hook 保护。
- `vip_Login()` 保留为兼容别名。
- 修正拆分模块中的广播函数名为 `api_GameWorld_SendNotiPacketMessage`。
- 增加旧内联代码的小写函数兼容别名：`api_gameWorld_SendNotiPacketMessage`。

状态：`[~] 已加固，待实测`

### 2.3 patches 独立修补模块

文件：`script/js/patches.js`

已处理：

- 创建角色限制、强化券刷新、黑暗武士技能栏、成长契约均增加重复启动保护。
- 强化券刷新恢复旧实现参数口径：从 hook 参数读取 `user` 和装备位置，并调用 `CUser_SendUpdateItemList(user, 1, 0, slot)`。

状态：`[~] 已加固，待实测`

### 2.4 时装潜能 / 回归勇士

文件：

```text
script/js/hidden_option.js
script/js/return_user.js
```

已处理：

- 增加重复 hook / 重复 patch 保护。
- 增加日志。
- 增加旧命名兼容入口：
  - `start_hidden_option()` -> `startHiddenOption()`
  - `set_return_user()` -> `setReturnUser()`

状态：`[~] 已加固，待实测`

### 2.5 缺失实现不再默认开启

文件：`script/config.lua`

已处理：

- `js_features.enable_drop_announce` 已改为 `false`。
- 注释已标记源实现未找到，找到真实实现后再迁移和开启。

状态：`[x] 已处理`

### 2.6 启动调度辅助函数

文件：

```text
script/js/startup_helpers.js
script/js/startup_modules.js
```

已处理：

- `startup_helpers.js` 新增 `safeLoadModule(moduleName)`。
- `startup_helpers.js` 新增 `safeFeature(featureName, enabled, runner)`。
- `startup_helpers.js` 新增 `safeModuleFeature(featureName, enabled, moduleName, functionName, args)`。
- `startup_helpers.js` 新增 `isFeatureEnabled(config, featureName, defaultValue)`。
- `startup_helpers.js` 新增 `resolveStartupFunction(functionName)`，依次尝试 `globalThis`、当前上下文和 `eval(functionName)`，降低 Frida 运行时作用域差异导致的函数误判缺失。
- `startup_helpers.js` 新增 `g_startup_loaded_modules` 加载缓存，避免同一启动流程多次 `dp_load` 同一个模块导致重复执行模块文件。
- `safeModuleFeature(...)` 现在会在模块加载失败时明确失败，不继续误调用缺失函数。
- `startup_modules.js` 新增 `startMigratedModules(cfg)` 集中启动器。
- `startup_modules.js` 已纳入 `patches` 调度：创建角色限制、强化刷新、黑武技能栏、成长契约。
- `startup_modules.js` 已纳入 `account_cargo` 调度，但仍默认关闭。
- `startup_modules.js` 已纳入 `village_attack` 适配启动，并由 `village_attack.js` 等待 DB ready 后再启动活动流程。

用途：

- 后续 `df_game_r.js` 入口瘦身时统一处理模块加载、函数缺失、启动异常。
- 单个功能启动失败时只记录日志，不中断整个 Frida 启动。
- 避免 `startup_modules.js` 反复启动同一个模块时重复 `dp_load`。
- `df_game_r.js` 后续只需加载 `startup_helpers.js` / `startup_modules.js` 并调用 `startMigratedModules(cfg)`，即可集中启动已拆分模块。

状态：`[~] 辅助模块已接入入口，待测试服日志验证`

### 2.7 已拆出并纳入集中启动的模块

这些模块已经从 `df_game_r.js` 或旧 `dp2/frida.js` 中拆出，保留旧入口兼容，并已由 `startup_modules.js` 按开关集中调度；仍需测试服验证：

| 模块 | 旧入口/旧来源 | 新入口 | 状态 |
|---|---|---|---|
| `script/js/history_log.js` | `hook_history_log()` | `startHistoryLog()` | `[~] 已集中调度，待实测` |
| `script/js/user_use_item_event.js` | `UserUseItemEvent()` | `UserUseItemEvent()` / `dispatchUserUseItemEvent()` | `[~] 已集中调度并清理 df_game_r.js 旧实现，待实测` |
| `script/js/user_inout.js` | `hook_user_inout_game_world()` 入口残留 | `startUserInoutHook()` / `hook_user_inout_game_world()` | `[~] 兼容桩，真实实现待确认` |
| `script/js/lucky_online.js` | `start_event_lucky_online_user()` 入口残留 | `startLuckyOnlineUserEvent()` / `start_event_lucky_online_user()` | `[~] 兼容桩，真实实现待确认` |
| `script/js/batch_item_notify.js` | `api_CUser_Add_Item_list()` / `SendItemWindowNotification()` | 旧入口兼容 | `[~] 已集中调度，待实测` |
| `script/js/emblem_fix.js` | `fix_use_emblem()` | `startEmblemFix()` | `[~] 已集中调度，待实测` |
| `script/js/drop_announce.js` | `processing_data(...)` 残留逻辑 | `startDropAnnounce()` | `[~] 已集中调度，默认关闭，待实测` |
| `script/js/luck_point_drop.js` | `enable_drop_use_luck_point()` | `startLuckPointDrop()` | `[~] 已集中调度，待实测` |
| `script/js/random_option.js` | `change_random_option_inherit()` / `auto_unseal_random_option_equipment()` | `startRandomOptionInherit()` / `startAutoUnsealRandomOptionEquipment()` | `[~] 已集中调度并清理 df_game_r.js 旧实现，待实测` |
| `script/js/online_reward.js` | `enable_online_reward()` | `startOnlineReward()` | `[~] 已集中调度，默认关闭，待实测` |
| `script/js/patches.js` | patch 旧入口组 | `disableCreateCharLimit()` / `enableStrengthenRefresh()` / `enableComboSkillFix()` / `disableMobileAuth()` | `[~] 已纳入 startup_modules 调度，待实测` |
| `script/js/account_cargo.js` | `setMaxCAccountCargoSolt(128)` | `setMaxCAccountCargoSolt(128)` | `[!] 已纳入 startup_modules 调度，默认关闭，待专项测试` |

状态：`[~] 模块已拆分并集中调度，待测试服验证`

## 3. 当前仍需处理的启动调度问题

### 3.1 `start()` 集中安全调用层待实测

辅助模块已新增并接入：

```text
script/js/startup_helpers.js
script/js/startup_modules.js
```

当前入口已使用集中启动器：

```js
dp_load('startup_helpers');
dp_load('startup_modules');
startMigratedModules(cfg);
```

`startup_modules.js` 内部已经集中调度：

```js
startModuleFeature('create_character_unlimit', cfg.enable_create_character_unlimit !== false, 'patches', 'disableCreateCharLimit');
startModuleFeature('strengthen_refresh', cfg.enable_strengthen_refresh !== false, 'patches', 'enableStrengthenRefresh');
startModuleFeature('dark_knight_skill_fix', cfg.enable_dark_knight_skill_fix !== false, 'patches', 'enableComboSkillFix');
startModuleFeature('account_cargo', cfg.enable_account_cargo === true, 'account_cargo', 'setMaxCAccountCargoSolt', [128]);
startModuleFeature('history_log', cfg.enable_history_log !== false, 'history_log', 'startHistoryLog');
startModuleFeature('user_inout', cfg.enable_user_inout_hook === true, 'user_inout', 'startUserInoutHook');
startModuleFeature('lucky_online', cfg.enable_lucky_online === true, 'lucky_online', 'startLuckyOnlineUserEvent');
startModuleFeature('online_reward', cfg.enable_online_reward === true, 'online_reward', 'startOnlineReward');
startModuleFeature('luck_point_drop', cfg.enable_luck_point_drop === true, 'luck_point_drop', 'startLuckPointDrop');
```

目标：

- 函数不存在时只记日志，不中断整个 Frida 启动。
- 某个功能失败时不影响其他功能。
- 每个功能有明确启动日志。
- 减少 `df_game_r.js` 中逐个手写模块加载和函数调用。

状态：`[~] df_game_r.js 入口已接入，待测试服启动日志验证`

### 3.2 `init_db()` 应早于 DB 依赖功能

当前 `start()` 已集中调度，但 DB 依赖功能仍需按模块确认 DB-ready 行为。

已缓解：

- `ranking.js` 已做 DB 未就绪重试。
- `village_attack.js` 已在 `mysql_taiwan_cain` / `mysql_frida` 未就绪时等待重试，再启动怪物攻城流程。
- `village_attack_db.js` 已在 save/load helper 内增加 `mysql_frida` 未就绪保护。

仍需确认：

- 幸运在线玩家（当前为兼容桩，默认关闭）。
- 在线奖励（默认关闭）。
- 其他使用 `mysql_*` 句柄的旧内联功能。

状态：`[~] 已部分缓解，待测试服启动日志确认`

### 3.3 已拆模块的旧实现残留

已处理：

- `vip_login.js` 已接入集中启动，并保留 `vip_Login()` 兼容入口、小写广播函数别名和重复 hook 保护。
- `df_game_r.js start()` 大括号结构已修复，`set function success` 后入口作用域已闭合。
- 怪物攻城业务迁移基本完成；状态、启动流程、通知、hook、settlement、DB helper 和副本回调奖励函数体已移出 `df_game_r.js`，文件内仅保留迁移注释和公共基础设施。
- 随机属性旧实现已从 `df_game_r.js` 移出，旧函数名由 `script/js/random_option.js` 提供。
- `UserUseItemEvent()` 旧实现已从 `df_game_r.js` 移出，旧函数名由 `script/js/user_use_item_event.js` 提供。
- 批量物品 UI 通知旧实现已从 `df_game_r.js` 移出，旧函数名由 `script/js/batch_item_notify.js` 提供。
- `script/js/account_cargo.js` 已补齐文件末尾函数闭合，全量 `script/js/*.js` 可通过 Node 语法检查。

仍需后续处理：

- `df_game_r.js` 仍有通用 native/API/MySQL/Packet/mail helper，后续拆基础设施必须先搜索全仓引用。
- `hook_user_inout_game_world()` 仍保留旧残留，且 `user_inout.js` 当前只是兼容桩；不能凭空实现缺失业务。

状态：`[~] 入口作用域已修复，剩余残留待小步拆分`

## 4. 不建议现在直接大改的部分

### 4.1 账号仓库扩展

文件：`script/js/account_cargo.js`

原因：

- 代码量大。
- 地址强绑定多。
- 会替换大量账号仓库相关函数。
- 默认关闭。

策略：

- 暂不盲改。
- 后续做专项测试前再处理。

状态：`[!] 高风险暂缓`

### 4.2 怪物攻城

位置：`script/js/village_attack*.js` / `df_game_r.js`

原因：

- 大型系统，业务逻辑虽已拆出但仍涉及 DB、timer、UI 包、刷怪、奖励邮件。
- 当前 `enable_village_attack=true`，但未完成测试服端到端实测。
- `df_game_r.js` 仍保留被模块依赖的 NativeFunction/API/MySQL/Packet/mail 公共基础设施。

策略：

- 不再继续改怪物攻城业务规则。
- 优先验证启动日志、DB-ready retry 和端到端活动流程。
- 后续公共基础设施拆分必须先搜索全仓引用。

状态：`[!] 业务迁移基本完成，高风险待测`

## 5. 后续优先级

1. 重启 Frida 并验证 `startup_helpers`、`startup_modules`、`village_attack_*`、DB-ready retry 和 `set function success` 启动日志。
2. 逐步从 `df_game_r.js` 中删除其他已拆分模块的旧重复实现。
3. 对高风险默认 true 的 JS 功能逐项决定是否保持开启。
4. 最后再拆 `native_bindings`、`db_helpers`、`packet_helpers`、`common_api` 等公共基础设施，并且必须先搜索全仓引用。
