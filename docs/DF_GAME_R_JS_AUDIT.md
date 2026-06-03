# df_game_r.js 审查记录

本文档记录 `df_game_r.js` 的初始审查结论。当前阶段只做分类和风险标记，不直接改运行逻辑。

## 1. 总体判断

`df_game_r.js` 当前主要承担两个职责：

1. 声明大量 NativeFunction 地址。
2. 实现部分必须依赖 Frida/Interceptor 的底层逻辑。

它目前更像一个“大型地址表 + Hook/工具函数集合”，不适合继续无限堆业务逻辑。

## 2. 已观察到的主要分组

### 2.1 环境与时间

包括：

- `getCurSec`
- `G_CEnvironment`
- `CEnvironment_get_file_name`
- `CSystemTime_getCurSec`
- `GlobalData_s_systemTime_`

用途：获取当前时间、频道配置名、系统时间。

风险：低到中。主要风险来自地址强绑定。

### 2.2 GameWorld / 在线玩家 / 广播

包括：

- `G_GameWorld`
- `GameWorld_find_from_world`
- `GameWorld_find_user_from_world_byaccid`
- `GameWorld_get_UserCount_InWorld`
- `GameWorld_send_all`
- `GameWorld_send_all_with_state`
- `gameworld_user_map_*`

用途：查找在线玩家、遍历在线玩家、世界广播。

风险：中到高。

注意：广播类接口必须限制调用频率，避免被误用成全服刷屏或压力源。

### 2.3 CUser / 角色状态

包括：

- 等级、经验、SP、疲劳、职业、转职、觉醒
- 角色信息同步
- 返回选择角色界面
- 任务状态更新

用途：角色状态读取和修改。

风险：中到高。

注意：修改角色状态类函数应优先看 Lua/DPX 是否已有封装。能放 Lua 层的业务逻辑不要放 JS 层。

### 2.4 CInventory / 道具 / 金币

包括：

- 背包槽读取
- 道具插入、删除、更新
- 金币增加/减少
- 道具锁定检查
- 时装镶嵌相关函数

用途：道具、背包、金币、时装处理。

风险：高。

注意：删除道具、修改金币、更新背包都必须加开关、日志和回滚说明。

### 2.5 邮件与奖励

包括：

- `WongWork_CMailBoxHelper_ReqDBSendNewSystemMail`
- `WongWork_CMailBoxHelper_ReqDBSendNewSystemMultiMail`
- `WongWork_CMailBoxHelper_ReqDBSendNewAvatarMail`
- `api_CUser_AddItem`
- 点券/代币相关充值函数

用途：发邮件、发道具、发点券或代币。

风险：高到关键。

注意：所有发奖、发点券逻辑应由配置控制，并记录账号、角色、道具、数量、来源。

### 2.6 任务相关

包括：

- `CDataManager_find_quest`
- `CUser_quest_action`
- `CUser_setGmQuestFlag`
- `WongWork_CQuestClear_setClearedQuest`
- `WongWork_CQuestClear_resetClearedQuests`
- `UserQuest_finish_quest`
- `UserQuest_reset`

用途：任务接受、完成、重置、GM 完成任务模式。

风险：高。

注意：任务类业务优先迁到 Lua handler；JS 层只保留必要底层封装。

### 2.7 数据库 / MySQL / 文件读写

包括：

- `fopen` / `fread` / `fclose`
- `DBMgr_GetDBHandle`
- `MySQL_*`
- `load_config`
- `api_read_file`

用途：读取本地配置、执行数据库操作。

风险：高。

注意：游戏中已打开的数据库句柄可能非线程安全，应避免在任意 Hook 线程中直接操作。

### 2.8 Hook / Interceptor 替换

包括：

- `Interceptor.attach`
- `Interceptor.replace`
- 账号仓库扩容相关函数组
- 活动相关函数组

用途：替换或增强服务端原逻辑。

风险：关键。

注意：所有 Hook 必须标注目标地址、触发时机、影响范围、是否可关闭。

## 3. 当前维护问题

1. NativeFunction 声明缺少统一分组。
2. 很多地址没有版本说明。
3. 无法快速判断某个 NativeFunction 是否被实际调用。
4. Hook 和工具函数混在一起。
5. 调试日志较多，部分函数看起来像临时调试或实验代码。
6. 部分功能可能已经能由 Lua/DPX 完成，不需要继续留在 JS 业务层。

## 4. 建议整理顺序

### Step 1：建立索引，不删代码

先建立表格：

```text
函数名 | 地址 | 分组 | 是否被调用 | 风险等级 | 备注
```

### Step 2：按区域加注释

在 `df_game_r.js` 中先加分区注释，不移动函数：

```js
// ===== Native: User =====
// ===== Native: Inventory =====
// ===== Native: Quest =====
// ===== Native: Mail =====
// ===== Native: Database =====
// ===== Hooks: Account Cargo =====
```

### Step 3：隔离调试 Hook

调试类 Hook 必须受配置控制，不能默认启用。

### Step 4：迁回 Lua 层

满足以下条件的逻辑应迁回 Lua：

- 只是业务编排。
- DPX 已有封装。
- 不需要读取/修改内存。
- 不需要 Interceptor。

### Step 5：再考虑拆 JS 文件

只有确认 DP Frida 加载器支持多文件加载后，才拆 JS 文件。否则先保留单文件，只做分区注释。

## 5. 风险等级建议

- `[RISK:LOW]`：只读查询、日志、时间、环境名。
- `[RISK:MEDIUM]`：角色状态读取、普通通知、非核心封装。
- `[RISK:HIGH]`：道具、金币、任务、职业、邮件、数据库。
- `[RISK:CRITICAL]`：Interceptor.replace、全服广播、全服经济、账号仓库、点券/代币。

## 6. 当前结论

P4 阶段不建议直接删除或重排 `df_game_r.js`。

更合理的路线是：

1. 先建立审查文档。
2. 再标记分区和风险。
3. 再统计调用关系。
4. 最后决定迁回 Lua、保留 JS 或删除。
