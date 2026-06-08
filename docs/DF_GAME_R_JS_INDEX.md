# df_game_r.js 索引草案

本文档是 `df_game_r.js` 的索引草案，用于后续标记函数是否仍在使用、风险等级和迁移方向。

当前阶段不删除代码，只记录分组和处理建议。

## 1. NativeFunction 分组索引

| 分组 | 示例函数 | 风险 | 处理建议 |
|---|---|---|---|
| 时间/环境 | `getCurSec`, `G_CEnvironment`, `CEnvironment_get_file_name`, `CSystemTime_getCurSec` | LOW/MEDIUM | 保留，补版本注释 |
| GameWorld/玩家查找 | `G_GameWorld`, `GameWorld_find_from_world`, `GameWorld_find_user_from_world_byaccid` | MEDIUM | 保留，限制调用范围 |
| 广播/发包 | `GameWorld_send_all`, `GameWorld_send_all_with_state`, `CUser_Send` | HIGH/CRITICAL | 加频率限制和调用说明 |
| 角色状态 | `CUser_*`, `CUserCharacInfo_*` | HIGH | 能用 DPX 的迁回 Lua 层 |
| 背包/道具 | `CInventory_*`, `Inven_Item_*`, `CItem_*` | HIGH | 标记删除、金币、更新背包风险 |
| 邮件/奖励 | `WongWork_CMailBoxHelper_*`, `api_CUser_AddItem` | HIGH/CRITICAL | 发奖必须接配置和日志 |
| 任务 | `CUser_quest_action`, `WongWork_CQuestClear_*`, `UserQuest_*` | HIGH | 业务编排迁回 Lua handler |
| 数据库/MySQL | `DBMgr_GetDBHandle`, `MySQL_*` | HIGH/CRITICAL | 谨慎使用，避免 Hook 线程直接写库 |
| 文件读写 | `fopen`, `fread`, `fclose`, `api_read_file`, `load_config` | MEDIUM | 保留但限制路径和读取大小 |
| 协议组包 | `PacketGuard_*`, `InterfacePacketBuf_*` | HIGH | 只保留必要封装 |
| Hook 替换 | `Interceptor.attach`, `Interceptor.replace` | CRITICAL | 必须有开关、注释和回滚方式 |

## 2. Hook 区域索引

### 2.1 账号仓库相关 Hook

观察到一组账号仓库扩展/替换相关函数，例如：

- `setMaxCAccountCargoSolt`
- `IsExistAccountCargo`
- `DB_SaveAccountCargo_dispatch`
- `DB_LoadAccountCargo_dispatch`
- `ResetSlot`
- `GetSlot`
- `GetSlotRef`
- `MakeItemPacket`
- `DB_SaveAccountCargo_makeRequest`
- `SetStable`
- `SetCapacity`
- `SendItemList`
- `SendNotifyMoney`

特征：

- 大量使用 `Interceptor.replace`。
- 涉及账号仓库容量、金钱、道具结构、压缩/解压、数据库读写、协议组包。
- 包含大量 `console.log` 调试输出。

风险：`[RISK:CRITICAL]`

建议：

1. 不默认启用。
2. 单独加功能开关，例如 `enable_account_cargo_patch`。
3. 补充适配版本说明。
4. 补充回滚方式。
5. 如果暂时不用，后续可整体隔离到独立区域或独立参考文件。

### 2.2 活动相关逻辑

观察到活动类变量和函数，例如：

- `villageAttackEventInfo`
- `on_event_lucky_online_user`
- `start_event_lucky_online_user`

特征：

- 涉及在线玩家遍历。
- 涉及发道具、发点券、世界广播。
- 依赖 `global_config`。

风险：`[RISK:HIGH]` 到 `[RISK:CRITICAL]`

建议：

1. 不直接接入默认启动流程。
2. 必须由配置开关控制。
3. 发奖逻辑必须记录日志。
4. 世界广播必须限制频率。

## 3. 调试代码索引

当前 `df_game_r.js` 中存在大量 `console.log`，特别是在账号仓库相关 Hook 内。

建议规则：

```js
if (config.enableDebugLog) {
  console.log(...);
}
```

后续处理：

- 保留必要错误日志。
- 普通过程日志改为 debug 开关控制。
- 高频 Hook 中禁止默认输出日志。

## 4. JS -> Lua/DP 通信

已观察到 `df_game_r.js` 与 DP Frida bridge 相关符号，例如：

- `dp2_frida_resolver`
- `dp2_lua_call`
- `frida_handler`
- `frida_main`

处理建议：

1. 该部分属于 DP2 核心桥接能力，应保留。
2. 业务调用参数后续建议改成 JSON 格式。
3. Lua 侧统一由 `on_frida_call` 解析并分发。

## 5. 使用状态标记规则

后续给每个函数增加以下状态：

```text
[USED]       当前确认被调用
[UNUSED]     当前未发现调用
[UNKNOWN]    需要人工确认
[EXPERIMENT] 实验/调试用途
```

建议先不要删除 `[UNUSED]`，只移动到低优先级区域或注释中记录。

## 6. 下一步

1. 搜索所有 `Interceptor.attach` 和 `Interceptor.replace`。
2. 搜索所有 `console.log`。
3. 搜索所有 `api_` 前缀函数调用关系。
4. 搜索所有 `NativeFunction` 名称是否被引用。
5. 给 `df_game_r.js` 加分区注释，但不改变执行逻辑。
