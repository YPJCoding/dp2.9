# Frida Startup Audit

本文档记录 `df_game_r.js` 的 `start()` 调度现状、已修复问题和后续重构事项。

## 1. 当前问题

`df_game_r.js` 当前不是一个干净的入口文件：

- `start()` 内部负责读取 `/dp2/frida/frida_config.json` 并按 `features` 开关启动功能。
- `start()` 后半段仍混入了旧功能定义，例如 `set_return_user`、`start_hidden_option`、`start_ranking`、`vip_Login` 等。
- 部分功能已经拆到 `script/js/*.js`，但入口文件内还保留旧实现，存在重复实现和命名不一致风险。
- 部分旧内联实现与拆分模块函数名不同，例如：
  - 拆分模块：`startVipLogin()`。
  - 旧内联入口：`vip_Login()`。
- `init_db()` 当前在部分功能启动之后才调度，可能导致依赖 DB 的功能启动时 DB 句柄尚未准备好。

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

## 3. 当前仍需处理的启动调度问题

### 3.1 `start()` 需要统一安全调用层

建议后续把类似逻辑集中封装：

```js
function safeFeature(name, enabled, fn) {
  if (!enabled) return false;
  if (typeof fn !== 'function') {
    log('[feature] missing ' + name);
    return false;
  }
  try {
    fn();
    log('[feature] started ' + name);
    return true;
  } catch (e) {
    log('[feature] failed ' + name + ': ' + e.message);
    return false;
  }
}
```

目标：

- 函数不存在时只记日志，不中断整个 Frida 启动。
- 某个功能失败时不影响其他功能。
- 每个功能有明确启动日志。

状态：`[ ] 待实现`

### 3.2 `init_db()` 应早于 DB 依赖功能

当前 `start()` 中存在 DB 依赖功能早于 `init_db()` 调度的问题。

已缓解：

- `ranking.js` 已做 DB 未就绪重试。

仍需确认：

- 怪物攻城。
- 幸运在线玩家。
- 在线奖励。
- 其他使用 `mysql_*` 句柄的旧内联功能。

状态：`[~] 部分缓解，待继续梳理`

### 3.3 VIP 登录存在旧内联实现残留

当前 `df_game_r.js` 内仍能看到旧 `vip_Login()` 实现残留，并且旧实现内部曾使用小写广播函数名。

已缓解：

- 拆分模块增加小写广播函数别名。
- 拆分模块自身有重复 hook 保护。

仍需后续处理：

- 入口文件瘦身时删除旧内联 `vip_Login()` 实现，统一使用 `script/js/vip_login.js`。

状态：`[~] 已缓解，待入口瘦身`

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

位置：`df_game_r.js`

原因：

- 大型系统。
- 涉及 DB、timer、UI 包、刷怪、奖励邮件。
- 当前 `enable_village_attack=true`，但未实测。

策略：

- 后续拆分为独立 `script/js/village_attack.js`。
- 再补 DB 初始化检查和重复启动保护。

状态：`[!] 高风险待拆分/待测`

## 5. 后续优先级

1. 给 `df_game_r.js` 的 `start()` 增加统一 `safeFeature` / `safeLoadModule` 调度层。
2. 确认 `start()` 的大括号结构，避免旧功能定义被意外包进 `start()` 内部。
3. 逐步从 `df_game_r.js` 中删除已拆分模块的旧内联实现。
4. 把怪物攻城拆成独立模块。
5. 对高风险默认 true 的 JS 功能逐项决定是否保持开启。
