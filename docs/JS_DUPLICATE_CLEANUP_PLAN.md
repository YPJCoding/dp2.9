# JS Duplicate Cleanup Plan

本文档记录 `df_game_r.js` 主入口中旧实现与 `script/js/*.js` 模块化实现之间的重复状态。

目标不是立即删除大入口代码，而是先确认：

1. 哪些功能已经有模块化实现。
2. 哪些模块已提供旧函数名兼容别名。
3. 哪些模块具备重复 hook 防护。
4. 哪些旧实现可以进入下一轮删除候选。
5. 哪些功能仍不能删除线索或不能凭空补实现。

## 当前启动链路

`df_game_r.js` 的 `start()` 当前会：

1. 加载 `/dp2/frida/frida_config.json`。
2. 加载 `startup_helpers.js`。
3. 加载 `startup_modules.js`。
4. 调用 `startMigratedModules(cfg)`。

`startup_modules.js` 当前会最早加载 `runtime_hotfixes.js`，然后按配置启动拆分模块。

## 已完成模块化且具备兼容别名

### hidden_option

模块文件：`script/js/hidden_option.js`

当前状态：

- 提供 `startHiddenOption()`。
- 提供旧入口别名 `start_hidden_option()`。
- 使用 `g_hidden_option_started` 防止重复 hook。

删除候选：

- `df_game_r.js` 中旧 `hidden_option()`。
- `df_game_r.js` 中旧 `start_hidden_option()`。
- `df_game_r.js` 中仅服务于旧 hidden option 的重复 `get_random_int()`，但需要先确认其他旧代码没有依赖该函数。

风险：中。该功能默认开启时会 patch 内存和 attach hook，删除前必须确认模块启动日志存在且只 attach 一次。

### ranking

模块文件：`script/js/ranking.js`

当前状态：

- 提供 `startRanking()`。
- 增加 DB ready 检查。
- 增加延迟重试。
- 保留排行榜加载、保存、下发逻辑。

删除候选：

- `df_game_r.js` 中旧 `ranklist`。
- `GetRankNumber()`。
- `GetMyEquInfo()`。
- `SetRanking()`。
- `SendRankLits()`。
- `event_rankinfo_load_from_db()`。
- `event_rankinfo_save_to_db()`。
- `start_ranking()`。

风险：中高。该功能依赖 `frida.battle` 和 `frida.game_event` 数据表，且和用户上下线 hook 有联动。删除前需要测试 `enable_ranking=true` 下启动日志和 DB 加载。

### vip_login

模块文件：`script/js/vip_login.js`

当前状态：

- 提供 `startVipLogin()`。
- 提供旧入口别名 `vip_Login()`。
- 使用 `g_vip_login_started` 防止重复 hook。
- 修正旧实现中的 `api_gameWorld_SendNotiPacketMessage` 大小写兼容问题。

删除候选：

- `df_game_r.js` 中旧 `getQuestIds1()` ~ `getQuestIds5()`。
- `Inspection_tasks()`。
- `vip_Login()`。

风险：中。该功能默认开启时会 attach 登录 hook 并广播消息，删除前需要确认 VIP 任务 ID 8892~8896 仍符合当前 PVF。

### return_user

模块文件：`script/js/return_user.js`

当前状态：

- 提供 `setReturnUser(day)`。
- 提供旧入口别名 `set_return_user(day)`。
- 通过 `g_return_user_applied_days` 避免重复写相同值。

删除候选：

- `df_game_r.js` 中旧 `set_return_user(day)`。

风险：低。属于单点内存 patch，但仍需确认 `enable_return_user=true` 下启动日志存在。

### online_reward

模块文件：`script/js/online_reward.js`

当前状态：

- 提供 `startOnlineReward()`。
- 提供旧入口别名 `enable_online_reward()`。
- 使用 `g_online_reward_started` 防止重复 hook。
- 默认关闭。

删除候选：

- `df_game_r.js` 中旧 `enable_online_reward()` 或同等旧实现。

风险：高。该功能会调用点券充值，属于经济功能。即使只是清理重复实现，也应在配置默认关闭下测试启动。

## 暂不删除或暂不补实现

### lucky_online

模块文件：`script/js/lucky_online.js`

当前状态：

- 当前模块是兼容 stub。
- 仓库中未确认真实旧实现。
- 注释明确：不能凭空实现随机在线玩家发奖逻辑。

处理建议：

- 不删除相关线索。
- 不把 stub 当作完整功能。
- 如果需要恢复，应先从历史仓库或备份中找到真实实现，再单独审计发奖规则。

风险：高。涉及随机在线玩家、发点券/道具/邮件等经济逻辑。

## 下一步删除策略

不要一次性大删 `df_game_r.js`。建议按以下小 PR 逐步处理：

1. `cleanup/js-hidden-option-legacy`
   - 删除 `df_game_r.js` 中 hidden option 旧实现。
   - 保留模块实现。
   - 测试 `enable_hidden_option=true` 启动日志。

2. `cleanup/js-return-user-legacy`
   - 删除 `df_game_r.js` 中 return user 旧实现。
   - 测试 `enable_return_user=true` 启动日志。

3. `cleanup/js-vip-login-legacy`
   - 删除 `df_game_r.js` 中 VIP 登录旧实现。
   - 测试 `enable_vip_login=true` 启动日志。

4. `cleanup/js-ranking-legacy`
   - 删除 ranking 旧实现。
   - 需要 DB ready、排行榜加载、下发验证。

5. `cleanup/js-online-reward-legacy`
   - 只在确认旧实现完全重复且默认关闭稳定后处理。
   - 不开启经济发奖功能做生产验证。

## 测试服确认项

每次删除前后至少确认：

- Frida 启动成功。
- `startup_helpers` 和 `startup_modules` 日志正常。
- 对应模块日志只出现一次。
- 没有 `missing function ...`。
- 没有 `module already loaded` 后仍重复 attach hook 的现象。
- 默认配置下高风险功能仍关闭。
