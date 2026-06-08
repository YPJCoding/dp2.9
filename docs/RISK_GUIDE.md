# 风险治理说明

本文档用于约定 `dp2.9` 中高风险功能的处理方式。

目标：先建立风险边界，再逐步重构和启用功能。

## 1. 风险等级

### LOW

只读查询、日志、提示、状态检查。

示例：

- 输出当前频道名
- 查询角色信息
- 普通日志记录

### MEDIUM

普通业务功能，可能改变角色状态，但影响范围可控。

示例：

- 普通任务清理
- 异界次数重置
- 普通提示类 GM 功能

### HIGH

会直接改变角色数据、背包、任务、职业或数据库。

示例：

- 直接 SQL 修改角色表
- 删除宠物、时装、装备
- 修改职业、转职、觉醒状态
- 执行外部脚本
- 发奖、发物品、发点券

### CRITICAL

影响全服、经济、账号仓库、交易、核心 Hook 或难以回滚的数据。

示例：

- `Interceptor.replace` 替换核心逻辑
- 全服广播或全服发奖
- 账号仓库结构修改
- 掉落、强化、交易、拍卖行核心规则修改

## 2. 直接 SQL 操作规范

直接 SQL 必须满足：

- 标记 `[RISK:HIGH][SQL]`
- 说明影响的数据库和表
- 说明是否可回滚
- 受配置开关控制
- 默认关闭
- 记录账号、角色、操作、参数和结果
- 失败或拒绝执行时返还道具并记录原因

推荐配置开关：

```lua
risk = {
    enable_sql_handlers = false,
}
```

不建议：

- 在 handler 中直接拼接复杂 SQL
- 允许玩家输入任意字段名或表名
- 没有日志的 update/delete
- 没有条件限制的大范围写入

## 3. 删除类功能规范

删除宠物、时装、装备等功能必须满足：

- 标记 `[RISK:HIGH][DELETE]`
- 受 `config.risk.enable_delete_handlers` 控制
- 默认关闭
- 明确删除范围，例如背包类型、槽位范围
- 失败时返还道具
- 成功时刷新对应背包空间
- 成功和失败都记录操作日志

推荐配置开关：

```lua
risk = {
    enable_delete_handlers = false,
}
```

如果删除类功能还会执行 SQL，例如宠物/时装清理需要删除数据库记录，则必须同时满足 `[DELETE]` 和 `[SQL]` 两类开关：

```lua
risk = {
    enable_delete_handlers = true,
    enable_sql_handlers = true,
}
```

## 4. 发奖/发物品/发点券规范

所有发奖类功能必须记录：

- 操作来源
- 账号 ID
- 角色 ID
- 道具 ID 或点券数量
- 数量
- 成功或失败结果

推荐标记：

```text
[RISK:HIGH][REWARD]
[RISK:CRITICAL][ECONOMY]
```

全服发奖、活动发奖、自动发奖默认不应开启。

## 5. 外部命令规范

执行外部 shell 脚本属于高风险。

必须满足：

- 标记 `[RISK:HIGH][SHELL]`
- 受 `config.risk.enable_shell_handlers` 控制
- 默认关闭
- 参数必须白名单化或类型校验
- 不允许拼接未校验的用户输入
- 必须记录执行结果
- 失败或拒绝执行时返还道具并记录原因

推荐配置开关：

```lua
risk = {
    enable_shell_handlers = false,
}
```

如果 shell 输出会继续被作为 SQL 执行，则必须同时满足 `[SHELL]` 和 `[SQL]` 两类开关：

```lua
risk = {
    enable_shell_handlers = true,
    enable_sql_handlers = true,
}
```

## 6. Hook 规范

所有 `Interceptor.attach` / `Interceptor.replace` 必须记录：

- Hook 地址
- 原函数名或推测名
- 触发时机
- 修改内容
- 风险等级
- 是否可关闭
- 回滚方式

默认规则：

- `Interceptor.attach` 至少是 `[RISK:HIGH]`
- `Interceptor.replace` 默认是 `[RISK:CRITICAL]`

## 7. 高风险 DPX 开关说明

以下 DPX 开关需要在 README 或代码注释中说明风险：

- 关闭安全机制
- 解除交易限制
- 拍卖行规则修改
- 物品免确认
- 关闭 NPC 回购
- 新建角色奖励禁用
- GM 模式

建议后续统一从 `script/config.lua` 读取。

## 8. 回滚原则

每次高风险改动都应该能快速回滚：

1. 保留独立 commit。
2. 不混合文档、格式化和业务改动。
3. 配置开关默认保守。
4. 改动前后记录变更说明。
5. 入口文件改动必须小步提交。

## 9. 当前执行策略

当前分支优先做：

- 文档化
- 模块化
- 模块边界建立
- 风险标记
- 安全默认行为收敛

默认不启用：

- SQL handler
- 删除 handler
- Shell handler
- 热加载模块
- 高风险 GM 指令
- 高风险 JS Hook
