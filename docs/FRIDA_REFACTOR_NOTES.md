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
2. `ranking.js` 中 `Object.values` / `findIndex` / `const` 可能存在 ES6+ 兼容性问题，已改为循环实现
3. 线程安全：当前仅 TimerDispatcher 的 schedule 有互斥锁保护，其他直接状态修改需确认都通过 schedule 执行
4. 数据库连接信息硬编码 localhost:3306，生产环境需改为从配置文件读取
5. `lodash` / `setTimeout` 依赖 Frida 运行环境提供，不是所有环境都支持
6. File 对象依赖 Frida 的 File API，部分环境可能不可用

## 第二轮修复 (fix: stabilize modular frida runtime startup)

修复了以下 review 问题：

1. **JS 模块加载链路**：新增 `tools/build_frida_bundle.sh` 和 `tools/build_frida_bundle.js`，按固定依赖顺序拼接所有 JS 模块生成 `dist/df_game_r.bundle.js`。
2. **MySQL binding 接口不一致**：新增 `createBoundMysqlDb()`，区分 `ctx.mysql`（binding）、`ctx.db`（原始句柄）、`ctx.fridaDb`（便捷 DB 对象）。
3. **frida_config.json 读取**：`file.js` 改为自初始化 libc API，不依赖外部 `globalThis.fopen`。
4. **ctx.gw.sendNotiPacketMessage 缺失**：在 `game_world.js` 中实现完整的世界广播消息函数。`settlement.js` 改用 `ctx.va_notify.broadcastMessage()`。
5. **清理裸地址**：`0x941F734` 和 `0x8C7FA20` 迁移到 `runtime_addresses.js`（`cipghelper_global` 和 `ipg_empty_string`）。
6. **ctx.logger / ctx.log**：统一为 `ctx.logger`（完整对象）和 `ctx.log`（便捷函数），`online_reward.js` 改用 `ctx.logger.getTimestamp()`。
7. **forEachUser 迭代器前进**：修复 `it = mapNext(it)` 并增加 guardCount 防死循环。
8. **怪物攻城 hook try/catch**：所有 7 个 hook 均加了 try/catch，replace hook 异常时兜底执行原函数。
9. **nf() 健壮性**：增加地址校验（缺失/空/未定义）。
10. **time.js 裸地址回退**：移除 `ptr('0x941F714')` 回退值。

## 部署说明

推荐使用构建产物：

```bash
bash tools/build_frida_bundle.sh
# 输出：dist/df_game_r.bundle.js
```

部署时使用 `dist/df_game_r.bundle.js` 替代 `df_game_r.js`，因为 Frida 环境下不会自动加载 `script/js/` 下的拆分子模块。

## 检查结果

- JS 语法检查：39 个文件全部通过（含 bundle）
- Lua 语法检查：`luac` 未安装，无法执行
- 裸地址检查：feature/bindings/core/entry 中不再有真实地址
- ctx.log.xxx 误用检查：无实际调用，仅注释
