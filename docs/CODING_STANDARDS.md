# dp2.9 编码规范

本文档用于约定 `dp2.9` 底板后续开发、重构和迁移时的代码风格、目录边界、风险标记和提交原则。

目标不是一次性重写全部代码，而是先统一模板规范，再逐步迁移、拆分和清理。

## 1. 基本原则

### 1.1 先定边界，再写功能

新增或迁移功能前，先判断它属于哪一层：

- DPX/Lua 能完成的功能，优先放 Lua 层。
- 必须 Hook、读写内存、声明原生地址的功能，放 JS/Frida 层。
- 配置、开关、常量，放配置层。
- 纯文档说明，放 `docs/`。

### 1.2 入口文件保持轻量

`df_game_r.lua` 和 `df_game_r.js` 都是入口文件，不应长期承载大量业务细节。

入口文件只负责：

- 初始化依赖
- 加载配置
- 注册 hook
- 装配模块
- 输出启动日志

业务逻辑应逐步拆到 `script/` 或 JS 模块中。

### 1.3 不直接整包复制

从 `YPJCoding/dp2` 或其他来源吸收功能时，不允许整段无审查覆盖。

迁移前必须确认：

- 是否属于真实加载链路
- 是否依赖特定服务端版本地址
- 是否有硬编码路径、账号、密码、数据库名
- 是否有高风险数据修改
- 是否可以配置开关控制

## 2. 目录规范

建议长期目录结构：

```text
/dp2
  README.md
  libdp2.xml
  df_game_r.lua
  df_game_r.js
  docs/
    ARCHITECTURE.md
    CODING_STANDARDS.md
  script/
    config.lua
    handlers/
      quest.lua
      job.lua
      item_cleanup.lua
      inherit.lua
      pvp.lua
      misc.lua
  lib/
  lua/
```

### 2.1 根目录

根目录只放启动必需文件和入口文件：

- `libdp2.xml`
- `libdp2pre.so`
- `libdp2.so`
- `df_game_r.lua`
- `df_game_r.js`
- `README.md`

不建议在根目录继续堆业务脚本。

### 2.2 `docs/`

放文档和规范：

- 架构说明
- 编码规范
- 风险说明
- 迁移记录
- 使用说明

### 2.3 `script/`

放 Lua 业务模块、配置和辅助脚本。

`script/config.lua` 负责功能开关。

`script/handlers/` 负责道具处理逻辑。

### 2.4 `df_game_r.js`

只放 DP Frida 入口、NativeFunction 声明、Hook 装配和 JS 层工具函数。

不建议把大量活动业务写进 JS 主入口；复杂功能应拆分并明确开关。

## 3. Lua 编码规范

### 3.1 变量命名

Lua 使用 `snake_case`：

```lua
local item_handler = {}
local user_level = user:GetCharacLevel()
local quest_list = dpx.quest.all(user.cptr)
```

不建议混用大小写风格。

### 3.2 函数命名

普通函数使用动词开头：

```lua
local function register_item_handlers()
local function load_config()
local function handle_quest_clear(user, item_id)
```

道具 handler 建议用业务名：

```lua
item_handler[2021458802] = handle_clear_epic_quest
```

### 3.3 模块返回值

后续拆模块时，建议每个 handler 模块返回一个注册函数：

```lua
local M = {}

function M.register(item_handler, ctx)
    item_handler[2021458802] = function(user, item_id)
        -- handler logic
    end
end

return M
```

`ctx` 用于传入公共依赖，例如：

```lua
local ctx = {
    dp = dp,
    dpx = dpx,
    game = game,
    world = world,
    logger = logger,
    config = config,
}
```

### 3.4 道具 handler 规范

每个道具 handler 必须包含：

- 道具用途注释
- 成功提示
- 失败提示
- 失败时是否返还道具的说明
- 风险等级标记

示例：

```lua
-- [RISK:MEDIUM] 主线任务清理券
-- 成功：清理当前等级可完成的主线任务
-- 失败：返还道具
item_handler[2021458802] = function(user, item_id)
    -- logic
end
```

### 3.5 SQL 规范

直接 SQL 必须标记高风险，并说明影响表：

```lua
-- [RISK:HIGH][SQL] 修改 charac_info.job，仅允许 1 级角色使用
```

SQL 字符串尽量集中封装，不要散落在 handler 中。

禁止写入：

- 数据库账号密码
- 私有 IP
- 生产环境路径
- 不可回滚的大范围 update/delete

### 3.6 日志规范

关键操作必须记录日志：

```lua
logger.info("[useitem] acc=%d chr=%d item_id=%d action=%s", user:GetAccId(), user:GetCharacNo(), item_id, "clear_epic_quest")
```

日志建议包含：

- acc id
- charac no
- item id
- action
- result

## 4. JavaScript / Frida 编码规范

### 4.1 命名规范

JS 普通函数使用 `camelCase`：

```js
function getCurSec() {}
function sendNotiPacketMessage(user, msg, type) {}
```

原生函数变量可保留原始符号名，但要统一注释：

```js
// CUser::SendNotiPacketMessage(user, msg, msg_type)
const CUser_SendNotiPacketMessage = new NativeFunction(ptr(0x86886CE), 'int', ['pointer', 'pointer', 'int'], { abi: 'sysv' });
```

### 4.2 地址声明规范

每个 NativeFunction 应包含：

- 原函数名或推测名
- 地址
- 参数说明
- 返回值说明
- 适配版本说明，如果已知

示例：

```js
// [ADDR][df_game_r:unknown-version]
// CUser::SendNotiPacketMessage(user, msg, msg_type) -> int
const CUser_SendNotiPacketMessage = new NativeFunction(
  ptr(0x86886CE),
  'int',
  ['pointer', 'pointer', 'int'],
  { abi: 'sysv' }
);
```

### 4.3 Hook 规范

每个 Hook 必须有风险标记：

```js
// [RISK:HIGH][HOOK] 替换原始函数，影响全服逻辑
```

Hook 函数必须说明：

- Hook 目标
- 触发时机
- 修改了什么
- 失败/异常时是否回落原逻辑
- 是否可通过配置关闭

### 4.4 调试代码规范

临时调试 Hook 不允许默认启用。

必须放到 debug 开关下：

```js
if (config.enableDebugHooks) {
  hookEncryptDebug();
}
```

### 4.5 JS 与 Lua 通信规范

JS 调 Lua 时，参数建议统一为 JSON 字符串，避免用临时逗号分隔格式继续扩散。

推荐格式：

```json
{"action":"add_item","account_id":10001,"item_id":3037,"count":1}
```

Lua 侧再统一解析并分发。

## 5. 风险等级标记

统一使用以下标记：

```text
[RISK:LOW]
[RISK:MEDIUM]
[RISK:HIGH]
[RISK:CRITICAL]
```

### LOW

只读查询、提示、日志、状态检查。

### MEDIUM

发普通奖励、清理非关键状态、普通道具处理。

### HIGH

直接改数据库、删除物品、修改职业/任务/觉醒、关闭安全限制、改变交易/拍卖规则。

### CRITICAL

影响全服经济、掉落、交易、资金、核心 Hook 替换、无法回滚的数据修改。

## 6. 配置开关规范

后续新增 `script/config.lua`，建议格式：

```lua
return {
    debug = {
        enable_debug_log = false,
        enable_debug_hooks = false,
    },
    features = {
        enable_item_handlers = true,
        enable_creator = true,
        disable_trade_limit = true,
        disable_item_routing = true,
    },
    risk = {
        enable_sql_handlers = false,
        enable_delete_handlers = false,
        enable_security_bypass = false,
    }
}
```

高风险功能默认应尽量关闭，或者至少集中在 `risk` 分组中。

## 7. 重构顺序规范

推荐顺序：

1. 文档和规范先行。
2. 不改变行为，只整理结构。
3. 添加配置开关。
4. 拆分 handler。
5. 最后再改业务逻辑。

每次提交尽量只做一类事情：

- `docs:` 文档
- `refactor:` 不改变行为的重构
- `feat:` 新功能
- `fix:` 修复问题
- `chore:` 维护类变更

## 8. 当前模板开发约定

从 `refactor/dp2-9-base` 分支开始：

1. 先建立编码规范。
2. 再整理 README TODO。
3. 再重构 `df_game_r.lua`。
4. 重构时优先保持现有行为不变。
5. 每完成一项 TODO，就在 README 中勾选。
