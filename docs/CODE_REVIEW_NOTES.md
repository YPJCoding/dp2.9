# 初始代码审查记录

本文档记录 `df_game_r.lua` 和 `df_game_r.js` 的初始职责审查结果。当前阶段只做结构和维护性判断，不直接改变业务行为。

## 1. 总体判断

`dp2.9` 当前适合作为主底板，原因是 `df_game_r.lua` 的业务入口相对集中，`item_handler` 分发模式清晰，适合后续模块化。

但当前代码也存在几个维护问题：

- 入口文件承载了过多业务细节。
- 配置开关直接散落在入口底部。
- 高风险功能缺少统一风险标记和开关。
- Lua 与 JS 职责边界还不够清晰。
- JS 文件目前更像 NativeFunction 地址集合，缺少使用状态和风险标注。

## 2. `df_game_r.lua` 职责审查

### 2.1 当前结构

当前 `df_game_r.lua` 大致包含：

1. 依赖加载：`dp`、`dpx`、`luv`、`game`、`world`、`logger`。
2. Frida 加载和 `on_frida_call`。
3. 上线提示 hook。
4. 大量 `item_handler` 道具券逻辑。
5. `UseItem2` 通用道具分发 hook。
6. 工具函数：`GetCurrentDayZeroTimestamp`、`split`、`decode_unicode`。
7. DPX 功能开关启动区。

### 2.2 位置合理的逻辑

以下逻辑适合保留在 Lua/DPX 层：

- `item_handler` 分发表。
- 任务清理类功能。
- 转职、觉醒、职业转换类功能。
- 宠物、时装、装备清理类功能。
- 装备继承类功能。
- DPX 已提供封装的补丁开关。
- `UseItem2` hook 的统一分发入口。

### 2.3 位置不够合理的逻辑

以下逻辑建议迁移或重组：

- 所有 `item_handler` 不应长期堆在入口文件里，应拆到 `script/handlers/`。
- `split`、`decode_unicode` 等工具函数应移到 `script/utils.lua` 或保留在入口顶部的工具区。
- DPX 开关应由 `script/config.lua` 控制，入口只负责读取配置和应用。
- 直接 SQL 操作应封装到专门函数，并标记 `[RISK:HIGH][SQL]`。
- 删除宠物、时装、装备类逻辑应加配置开关或二次保护。
- PVP 经验脚本通过 `io.popen` 执行 shell，风险较高，应单独封装并默认可关闭。

### 2.4 重点风险点

#### 直接 SQL 修改

当前存在直接 SQL：

- 修改 `charac_info.job`。
- 更新 `charac_link_bonus`。
- 插入或更新 `item_making_skill_info`。
- 删除 `creature_items`。
- 删除 `user_items`。
- 执行外部脚本生成的 SQL。

建议：全部标记为 `[RISK:HIGH][SQL]`，并迁入可关闭的 handler 模块。

#### 删除类功能

当前存在删除类逻辑：

- 删除宠物栏物品。
- 删除时装栏物品。
- 分解背包装备。

建议：迁入 `item_cleanup.lua`，统一受 `config.risk.enable_delete_handlers` 控制。

#### 外部命令执行

PVP 经验书通过：

```lua
io.popen("sh /dp2/script/pvp_exp_inc.sh " .. user:GetCharacNo())
```

执行外部 shell 脚本。

建议：迁入 `pvp.lua`，默认由配置开关控制，并记录日志。

### 2.5 建议拆分目标

建议拆分为：

```text
script/
  config.lua
  utils.lua
  handlers/
    quest.lua
    job.lua
    item_cleanup.lua
    inherit.lua
    pvp.lua
    misc.lua
```

## 3. `df_game_r.js` 职责审查

### 3.1 当前结构

当前 `df_game_r.js` 主要是大量 NativeFunction 声明，覆盖：

- 时间、环境、频道信息。
- GameWorld、CUser、CInventory、CAccountCargo。
- 角色属性、经验、疲劳、职业、技能。
- 邮件、背包、仓库、任务、金币。
- 公会、PVP、战场、活动相关函数。

### 3.2 位置合理的逻辑

以下内容适合保留在 JS/Frida 层：

- 必须依赖原生地址的 NativeFunction 声明。
- 必须通过 Frida Hook 或内存访问完成的功能。
- Lua/DPX 没有封装但确实需要的底层能力。

### 3.3 位置不够合理的逻辑

当前问题：

- NativeFunction 声明太集中，缺少模块分组。
- 无法快速判断哪些函数被使用。
- 缺少版本标记。
- 缺少风险标记。
- 部分函数名、注释和真实用途可能需要二次确认。

建议：后续先做索引表，不急着删除。

### 3.4 建议整理方式

第一阶段不删除 JS 函数，只增加文档索引：

```text
函数名 | 地址 | 分组 | 是否已使用 | 风险等级 | 备注
```

第二阶段再按使用情况拆分：

```text
js/
  native/
    user.js
    inventory.js
    quest.js
    mail.js
    world.js
  hooks/
  bridge.js
```

实际是否拆 JS 文件，要确认 DP Frida 加载器是否支持多文件或 require 机制。如果不支持，则先保留单文件，只做分区注释。

## 4. Lua 与 JS 边界建议

### 4.1 应放 Lua 层

- 业务编排。
- 道具券分发。
- DPX 已封装能力。
- 配置开关。
- 日志和提示。

### 4.2 应放 JS 层

- NativeFunction 声明。
- 原生 Hook。
- 内存读写。
- 必须依赖地址的功能。
- JS -> Lua bridge。

### 4.3 不建议

- 在 JS 里堆大量业务规则。
- 在 Lua 里拼接大量高风险 SQL。
- 在入口文件里继续增长 handler 数量。
- 默认启用调试 Hook。

## 5. 下一步建议

优先做 P2：建立模板代码结构，但不迁移业务逻辑。

建议提交顺序：

1. 新增 `script/config.lua`。
2. 新增 `script/utils.lua`。
3. 新增 `script/handlers/README.md`。
4. 新增各 handler 模块空模板。
5. 更新 README TODO。

这样先把目录边界确定下来，再开始迁移 `df_game_r.lua` 中的 handler。
