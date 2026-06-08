# dp2/frida.js 未迁移功能清单

本文档记录 `YPJCoding/dp2/frida.js` 中尚未迁移到 `dp2.9` 的功能。

注意：`frida.js` **不是 DP 默认加载文件**。DP 默认加载链路仍是：

```text
/ dp2 / df_game_r.lua
  ↓ frida.load(...)
/ dp2 / df_game_r.js
```

因此，`dp2/frida.js` 只能作为 JS/Frida 功能素材库参考，不能直接复制覆盖 `dp2.9/df_game_r.js`。

## 迁移原则

1. JS/Frida 地址强绑定功能必须先确认服务端版本。
2. 每个 NativeFunction / Interceptor 迁移前必须记录地址、用途、风险和开关。
3. 涉及数据库、发奖、点券、邮件、装备、任务、活动状态的功能默认关闭。
4. 不直接迁移 `start()` 整套启动逻辑。
5. 每次只迁一个功能点，并在测试服验证。

## A. 工具与基础设施

### A1. JS 文件日志系统

来源：`dp2/frida.js`

功能：

- `get_timestamp()` 本地时间戳。
- `api_mkdir(path)` 创建日志目录。
- `log(msg)` 写入 `./frida_log/frida_<channel>_<date>.log`。
- 使用 `CEnvironment_get_file_name` 获取频道配置名。

当前 `dp2.9` 状态：

- Lua 层已有 `df.logger` 日志。
- JS 层没有单独迁移该文件日志系统。

建议：

- 暂不迁，优先使用 DP 自带 logger。
- 如后续 JS hook 复杂化，可迁成 `script/js/logging.js`，并配置开关。

状态：`[ ] 未迁移`

---

### A2. 内存 hex 打印 / 文件读取 / JSON 配置加载

来源：`dp2/frida.js`

功能：

- `bin2hex(p, len)` 打印内存十六进制。
- `api_read_file(path, mode, len)` 读取文件。
- `load_config(path)` 读取 `frida_config.json`。

当前 `dp2.9` 状态：

- 尚未迁移。
- `dp2.9` 主要使用 Lua `script/config.lua`。

建议：

- `bin2hex` 可作为 JS 调试工具后置迁移。
- `frida_config.json` 不建议引入第二套配置系统，除非 JS 层确实需要独立配置。

状态：`[ ] 未迁移`

---

### A3. 主线程调度队列

来源：`dp2/frida.js`

功能：

- `api_Guard_Mutex_Guard()` 申请服务器定时器队列锁。
- `timer_dispatcher_list` 保存待执行任务。
- `hook_TimerDispatcher_dispatch()` hook 服务器 dispatcher。
- `api_scheduleOnMainThread(...)` 和 `api_scheduleOnMainThread_delay(...)` 将 JS 任务调度到主线程执行。

当前 `dp2.9` 状态：

- `df_game_r.js` 里已有一些 NativeFunction 壳，但没有迁移这套完整调度机制。

建议：

- 高价值，但版本强绑定。
- 应先归档到 JS 索引，再单独迁移。
- 迁移后供怪物攻城、定时活动、在线奖励等 JS 模块复用。

状态：`[ ] 未迁移`

---

## B. 数据库 / 邮件 / 发奖能力

### B1. 原生 MySQL wrapper

来源：`dp2/frida.js`

功能：

- 打开 `taiwan_cain`、`taiwan_cain_2nd`、`taiwan_billing`、`frida` 数据库。
- 执行 SQL。
- 读取 int / uint / short / float / str / binary 查询结果。
- 创建并使用 `frida.game_event` 表保存活动数据。

当前 `dp2.9` 状态：

- Lua 层使用 `dpx.sqlexec`，未迁移 JS MySQL wrapper。

建议：

- 高风险。
- 仅在 Lua/DPX 无法满足需求时考虑迁移。
- 必须配置开关、数据库连接配置、日志和回滚方案。

状态：`[!] 高风险暂缓`

---

### B2. 系统邮件发奖能力

来源：`dp2/frida.js`

功能：

- `CMailBoxHelperReqDBSendNewSystemMail(user, item_id, item_count)` 给角色发系统邮件奖励。
- 怪物攻城奖励会调用该能力。

当前 `dp2.9` 状态：

- 尚未迁移该 JS 邮件发奖函数。

建议：

- 高价值，但属于发奖能力。
- 迁移前必须先有权限、日志、配置开关。
- 可以作为后续“发奖模块”的底层能力。

状态：`[!] 高风险暂缓`

---

### B3. 点券 / 代币充值 API

来源：`dp2/frida.js`

功能：

- `api_recharge_cash_cera(user, amount)` 调用 IPG 充值点券。
- `api_recharge_cash_cera_point(user, amount)` 调用 IPG 充值代币。

当前 `dp2.9` 状态：

- 未迁移 JS 充值 API。

建议：

- 极高风险，影响经济系统。
- 不进入安全可部署版。
- 必须 GM 权限、日志、限额、审计。

状态：`[!] 高风险暂缓`

---

## C. 角色 / 背包 / 任务 / 发包原生封装

### C1. 角色属性与状态读取 / 修改

来源：`dp2/frida.js`

功能包括：

- 角色状态、账号 ID、角色 ID、等级、名字、登录时间。
- 角色经验、疲劳、转职、职业、PVP 等级、公会等信息。
- 设置角色属性脏标记，避免下线回档。

当前 `dp2.9` 状态：

- Lua/DPX 层已有一部分用户对象 API。
- JS 侧这些 NativeFunction 未完整迁移。

建议：

- 只在 Lua API 不足时按需迁移。
- 迁移前先完成 `df_game_r.js` NativeFunction 索引。

状态：`[ ] 未迁移`

---

### C2. 背包 / 道具 / 时装 / 宠物装备 NativeFunction

来源：`dp2/frida.js`

功能包括：

- 获取背包槽位道具。
- 判断装备 / 消耗品。
- 获取装备等级、品级、group name。
- 获取时装插槽数据。
- 删除道具。
- 通知客户端更新道具。

当前 `dp2.9` 状态：

- Lua 层已有 `dpx.item.info`、`dpx.item.add`、`dpx.item.delete` 等部分能力。
- JS 侧完整背包封装未迁移。

建议：

- 不整体迁移。
- 与具体功能绑定迁移，例如时装镶嵌修复时再迁相关函数。

状态：`[ ] 未迁移`

---

### C3. 任务强制完成与任务包刷新

来源：`dp2/frida.js`

功能：

- `api_force_clear_quest(user, quest_id)` 设置 GM 任务模式，接受任务、完成任务、领奖。
- 清零任务完成时间，绕过连续提交限制。
- 更新已完成任务列表和任务列表包。

当前 `dp2.9` 状态：

- 已有 Lua 层任务清理 handler，但没有迁移 JS 强制完成并领奖逻辑。

建议：

- 高风险。
- 可能影响任务奖励和经济系统。
- 暂缓迁移；如迁移必须单独开关并测试。

状态：`[!] 高风险暂缓`

---

### C4. PacketGuard / PacketBuf / 世界广播发包

来源：`dp2/frida.js`

功能：

- 创建服务器包。
- 读取客户端包 byte / short / int / binary。
- 给单个玩家发包。
- 给全频道在线玩家发公告。

当前 `dp2.9` 状态：

- 尚未迁移完整发包工具。

建议：

- 高价值基础设施，但版本强绑定。
- 应先做 JS 索引和最小化封装。
- 广播能力必须限频。

状态：`[ ] 未迁移`

---

## D. 活动 / 玩法功能

### D1. 怪物攻城活动系统

来源：`dp2/frida.js`

功能：

- 定时开启怪物攻城活动。
- 维护活动状态：阶段、PT、难度、世界 BOSS、GBL 主教数量、玩家个人 PT。
- 持久化到 `frida.game_event`。
- 广播活动进度。
- 修改攻城副本怪物刷新和难度。
- 通关后发个人奖励和全服奖励。

当前 `dp2.9` 状态：

- 尚未迁移。

建议：

- 大型玩法系统，不能直接迁。
- 需要拆分：配置、状态、DB、发包、奖励、hook。
- 必须默认关闭，只能测试服验证。

状态：`[!] 高风险暂缓`

---

### D2. 在线奖励

来源：`dp2/frida.js`

功能：

- hook `CUser::WorkPerFiveMin`。
- 在线 30 分钟后按在线时长发点券。
- 最多发半天。

当前 `dp2.9` 状态：

- 尚未迁移。

建议：

- 经济相关，高风险。
- 不进入安全可部署版。
- 如需要，优先用 Lua 定时器 + 配置实现，而不是直接迁 JS hook。

状态：`[!] 高风险暂缓`

---

### D3. 战力榜前三站街 / 排行榜下发

来源：`dp2/frida.js`

功能：

- 维护 `ranklist`。
- 登录时全体下发排行榜站街包。
- 退出时更新角色战力榜数据。
- 将排行数据保存到 `frida.game_event`。

当前 `dp2.9` 状态：

- 尚未迁移。

建议：

- 需要明确客户端协议和数据结构。
- 依赖 PacketGuard、DB、角色装备数据读取。
- 暂缓迁移。

状态：`[!] 高风险暂缓`

---

### D4. 勇士归来时间设置

来源：`dp2/frida.js`

功能：

- `set_return_user(day)` 修改内存地址设置回归勇士时间。

当前 `dp2.9` 状态：

- 尚未迁移。

建议：

- 内存 patch，版本强绑定。
- 暂缓迁移。

状态：`[!] 高风险暂缓`

---

### D5. 时装潜能

来源：`dp2/frida.js`

功能：

- patch 系统分配属性。
- 下发随机时装潜能属性。
- hook 相关函数使功能生效。

当前 `dp2.9` 状态：

- 尚未迁移。

建议：

- 版本强绑定，且影响装备/时装属性。
- 暂缓迁移。

状态：`[!] 高风险暂缓`

---

## E. 修复类功能

### E1. 绝望之塔修复增强版

来源：`dp2/frida.js`

功能：

- 允许挑战成功后继续使用门票挑战。
- 可跳过每 10 层玩家 APC。
- 修复绝望之塔扣金币 / 门票逻辑。

当前 `dp2.9` 状态：

- Lua/DPX 启动配置中已有 `set_unlimit_towerofdespair`。
- 没有迁移 JS 版 `fix_TOD(skip_user_apc)` 的完整逻辑。

建议：

- 部分功能可能已被 DPX 覆盖。
- 跳过玩家 APC、金币门票修复需单独验证。
- 可作为小型修复模块迁移，但必须默认关闭。

状态：`[ ] 部分覆盖，完整 JS 版未迁移`

---

### E2. 时装镶嵌修复

来源：`dp2/frida.js`

功能：

- hook `Dispatcher_UseJewel::dispatch_sig`。
- 手动解析客户端镶嵌包。
- 校验时装、徽章、插槽颜色。
- 删除徽章。
- 写入时装插槽数据并存档。
- 通知客户端更新并避免踢线。

当前 `dp2.9` 状态：

- 尚未迁移。

建议：

- 有实际修复价值，但风险高。
- 需要单独测试服验证。
- 迁移前先建立最小 JS 工具层：PacketBuf、Inventory、AvatarSocket、SendUpdate。

状态：`[ ] 未迁移`

---

## F. 当前 `start()` 启动逻辑未迁移项

`dp2/frida.js` 的 `start()` 当前会一次性启用：

- `fix_TOD(true)`：绝望之塔修复。
- `fix_use_emblem()`：时装镶嵌修复。
- `start_hidden_option()`：装扮潜能。
- `hook_user_inout_game_world()`：怪物攻城、上下线处理、战力榜站街。
- `set_return_user(15)`：勇士归来时间设置。
- `load_config('frida_config.json')`：加载 JS 配置。
- `init_db`：初始化 JS 侧数据库。
- `hook_TimerDispatcher_dispatch()`：挂接主线程调度。
- `start_event_villageattack`：开启怪物攻城活动。

当前 `dp2.9` 状态：

- 没有迁移该 `start()` 整体启动逻辑。
- 不建议整体迁移。

状态：`[!] 整体启动逻辑暂缓迁移`

## 建议迁移顺序

### Phase F1：只做索引，不迁运行逻辑

- [ ] 把 `dp2/frida.js` 的 NativeFunction 全部加入 `docs/DF_GAME_R_JS_INDEX.md`。
- [ ] 给每个地址标记用途、是否已在 `dp2.9/df_game_r.js` 存在、风险等级。
- [ ] 标记 `start()` 中所有默认启用的高风险功能。

### Phase F2：低风险工具层

- [ ] `bin2hex` 调试工具。
- [ ] JS 日志封装，默认关闭。
- [ ] PacketBuf 读取工具，先不挂业务 hook。

### Phase F3：小型修复功能

- [ ] 绝望之塔增强修复，默认关闭。
- [ ] 时装镶嵌修复，默认关闭。

### Phase F4：大型玩法 / 高风险功能

- [ ] 怪物攻城活动。
- [ ] 战力榜站街。
- [ ] 时装潜能。
- [ ] 在线奖励。
- [ ] 系统邮件 / 点券充值类功能。

## 当前建议

下一步不要直接迁 `frida.js` 里的业务功能。

优先做：

1. 完成 `df_game_r.js` NativeFunction 索引。
2. 对比 `dp2/frida.js` 和 `dp2.9/df_game_r.js` 已有地址。
3. 只迁低风险工具函数。
4. 等 JS 工具层稳定后，再考虑 `fix_TOD` 或 `fix_use_emblem`。
