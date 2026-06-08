# Frida 模块化重构笔记

## 迁移概况

- 源文件：`YPJCoding/dp2/main/frida.js`（~2434 行单文件）
- 目标仓库：`YPJCoding/dp2.9`
- 目标分支：`refactor/frida-runtime-modules`
- 基准分支：`template/clean-runtime-skeleton`

## 模块清单

### 核心模块 (script/js/core/)

| 文件 | 来源 | 说明 |
|------|------|------|
| logger.js | 旧 frida.js `log()` 函数 | 日志模块，支持控制台+文件输出 |
| time.js | 旧 frida.js `api_CSystemTime_getCurSec()` | 获取游戏服务器 UTC 时间 |
| file.js | 旧 frida.js `api_read_file()` / `load_config()` | 文件读写、JSON 配置加载 |
| random.js | 旧 frida.js `get_random_int()` | 统一随机数函数 |
| hook_guard.js | **新增** | 防重复 attach/replace 封装 |
| memory.js | 旧 frida.js `bin2hex()` / Memory.protect 相关 | 内存操作封装 |

### Bindings (script/js/bindings/)

| 文件 | 来源 | 说明 |
|------|------|------|
| native_functions.js | **新增** | `nf()` 工厂函数 |
| packet.js | 旧 frida.js PacketBuf_* / InterfacePacketBuf_* 系列 | 封包读写 |
| mysql.js | 旧 frida.js MySQL_* 系列 | 数据库操作 |
| user.js | 旧 frida.js CUser* 系列 | 角色操作 |
| inventory.js | 旧 frida.js CInventory*/Inven_Item* 系列 | 背包道具操作 |
| item.js | 旧 frida.js CItem*/CStackableItem* 系列 | 道具属性查询 |
| mail.js | 旧 frida.js CMailBoxHelper* 系列 | 邮件发送 |
| game_world.js | 旧 frida.js GameWorld_* 系列 | 世界操作、玩家遍历 |
| timer_dispatcher.js | 旧 frida.js timer_dispatcher_list | 线程安全任务调度 |
| quest.js | 旧 frida.js CUser_quest_action / clear_doing_questEx | 任务系统 |

### 业务功能 (script/js/features/)

| 文件 | 来源 | 说明 |
|------|------|------|
| tod_fix.js | 旧 frida.js `fix_TOD()` | 绝望之塔修复（门票/金币/跳过APC） |
| emblem_fix.js | 旧 frida.js `fix_use_emblem()` | 时装徽章镶嵌 |
| hidden_option.js | 旧 frida.js `hidden_option()` / `start_hidden_option()` | 时装潜能 |
| return_user.js | 旧 frida.js `set_return_user()` | 勇士归来时间设置 |
| user_inout.js | 旧 frida.js `hook_user_inout_game_world()` | 玩家上下线处理 |
| ranking.js | 旧 frida.js ranklist / GetRankNumber / SetRanking 等 | 战力排行榜 |
| online_reward.js | 旧 frida.js `enable_online_reward()` | 在线奖励（默认关闭） |
| village_attack/ | 旧 frida.js 怪物攻城全部逻辑 | 怪物攻城活动（见下表） |

### 怪物攻城子模块

| 文件 | 来源 | 说明 |
|------|------|------|
| constants.js | 旧 frida.js VILLAGEATTACK_STATE_* / EVENT_VILLAGEATTACK_* | 常量 + 奖励表 |
| state.js | 旧 frida.js villageAttackEventInfo | 状态管理（封装读写） |
| db.js | 旧 frida.js event_villageattack_save/load | 数据库持久化 |
| flow.js | 旧 frida.js start/on_start/on_end/timer | 流程控制 |
| hooks.js | 旧 frida.js hook_VillageAttack() 全部 7 个 hook | Hook 集合 |
| notify.js | 旧 frida.js broadcast_diffcult / update_score / notify_score | 通知/广播 |
| reward.js | 旧 frida.js VillageAttackedRewardSendReward() | 挑战奖励 |
| settlement.js | 旧 frida.js on_end_event_villageattack 结算部分 | 活动结算 |

## 设计决策

### 地址集中管理

所有 `ptr(0x...)` 从业务模块中移除，统一放入 `runtime_addresses.js`。
每个地址均有中文注释说明作用、来源、风险。

### NativeFunction 统一管理

所有 NativeFunction 通过 `nf()` 工厂创建，在 bindings 中组织。
业务模块通过 `ctx.user`、`ctx.inventory` 等访问，不直接创建 NativeFunction。

### Hook 防重复

新增 `attachOnce` / `replaceOnce`，确保热重载时不会重复 hook。

### 配置驱动

所有模块通过 `runtime_config.js` 中的 feature flag 控制启用/禁用。

### 模块间解耦

通过 ctx 对象传递依赖，模块之间不相互直接引用。
`user_inout` 通过 ctx 回调与 `ranking` 和 `village_attack` 通信，不直接调用对方函数。

## TODO

1. SQL 拼接未做转义，高风险场景需改为参数化查询。当前仅数字类型安全的查询使用拼接
2. 线程安全：当前仅 TimerDispatcher 的 schedule 有互斥锁保护，其他直接状态修改需确认都通过 schedule 执行
3. 数据库连接信息硬编码 localhost:3306，生产环境需改为从配置文件读取
4. `setTimeout` 依赖 Frida 运行环境提供，不是所有环境都支持

## 第四轮修复 (fix: add startup fallback for failed early hook)

修复了以下问题：

1. **hook_guard 返回 boolean**：`attachOnce()` 和 `replaceOnce()` 现在返回 `true`（成功/已注册）或 `false`（失败），调用方可感知 hook 注册结果。
2. **df_game_r.js early hook 失败兜底**：`attachOnce('runtime_check_argv', ...)` 返回 `false` 时兜底调用 `start()`，避免 runtime 静默不启动。
3. **误部署检测**：`start()` 中 `startRuntimeModules` 不存在时输出 `请确认部署的是 dist/df_game_r.bundle.js`，不再误打印 `frida started`。

修复了以下问题：

1. **Node 构建脚本输出路径错误**：`tools/build_frida_bundle.js` 输出路径从 `dist/dist/df_game_r.bundle.js` 修正为 `dist/df_game_r.bundle.js`。
2. **ranking.js DB 不可用时崩溃**：`getRankNumber()` 增加 `!fridaDb` 返回 0 的防御；`onUserLeaveRanking()` 增加 curUser 空检查和 fridaDb 空检查，并输出中文日志。
3. **MySQL exec() 语义统一**：`createBoundMysqlDb()` 中 `exec(sql)` 返回布尔值（true=成功），新增 `execRaw(sql)` 返回底层原始码。`mysql.js` 注释修正为「底层非零=成功」。
4. **df_game_r.js early hook**：改用 `attachOnce('runtime_check_argv', ...)` 注册，增加 `attachOnce` 不存在的降级处理。
5. **文档过期 TODO 清理**：移除已解决的「File API 依赖」、「ES6+兼容性」等过期条目；补充 `exec/execRaw` 语义和 DB 不可用时行为说明。

## 部署说明

两种构建方式等效，输出同一个文件：

```bash
bash tools/build_frida_bundle.sh   # shell 版本
node tools/build_frida_bundle.js   # Node 版本
# 输出：dist/df_game_r.bundle.js
```

部署时使用 `dist/df_game_r.bundle.js` 替代 `df_game_r.js`。

## DB 不可用时的模块行为

- ranking：可下发默认榜单，不更新排名、不持久化（日志提示 `fridaDb 不存在，跳过排行榜更新`）
- village_attack：可正常运行，但活动状态无法持久化（日志提示 `数据库未初始化，活动数据将无法持久化`）

## MySQL 接口说明

- `ctx.fridaDb.exec(sql)` — 业务层布尔语义，返回 `true` 表示 SQL 执行成功
- `ctx.fridaDb.execRaw(sql)` — 底层原始返回码（非零=成功，零=失败）
- `ctx.mysql` — MySQL binding 对象，用于 `open()` / `close()` 等操作
- `ctx.db` — 原始数据库句柄集合 `{ taiwanCain, taiwanCain2nd, taiwanBilling, frida }`

## 检查结果

- JS 语法检查：39 个文件全部通过（含 bundle）
- Lua 语法检查：`luac` 未安装，无法执行
- 裸地址检查：feature/bindings/core/entry 中不再有真实地址
- ctx.log.xxx 误用检查：无实际调用，仅注释
