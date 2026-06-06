# Signin Test Checklist

本文档用于验证 `script/modules/signin.lua` 每日签到模块。

## 1. 当前实现状态

签到模块已迁移为独立模块：

```text
script/modules/signin.lua
```

默认关闭：

```lua
features = {
    enable_signin = false,
}
```

启用后通过 `GmInput` hook 监听：

```lua
signin = {
    command = "//qd",
    reset_hour = 6,
    server_group = 3,
    reward_items = {
        { id = 3340, count = 1 },
    },
}
```

当前实现保持旧脚本行为：

- 使用内存记录签到状态。
- 每日 6 点重置。
- 频道重启后签到记录会重置。
- 默认所有玩家可用。
- 默认不广播，避免刷屏。
- 奖励通过邮件发送。

## 2. 默认关闭验证

### 步骤

1. 确认配置：

```lua
features.enable_signin = false
```

2. 重启频道。
3. 输入：

```text
//qd
```

### 预期

- 不应触发签到奖励。
- 不应发送签到邮件。
- 日志应出现：

```text
[bootstrap] skipped module=script.modules.signin
```

状态：`[ ] 待测`

---

## 3. 启用签到模块

### 配置

```lua
features.enable_signin = true

signin = {
    command = "//qd",
    reset_hour = 6,
    server_group = 3,
    mail_title = "每日签到",
    mail_content = "感谢您的支持",
    reward_items = {
        { id = 3340, count = 1 },
    },
    require_gm = false,
    broadcast_enabled = false,
}
```

### 步骤

1. 修改配置。
2. 重启频道。

### 预期日志

```text
[signin] registered GmInput hook command=//qd reset_hour=6 rewards=1 broadcast=false require_gm=false
[bootstrap] loaded module=script.modules.signin
```

状态：`[ ] 待测`

---

## 4. 首次签到验证

### 步骤

1. 登录任意普通玩家角色。
2. 输入：

```text
//qd
```

### 预期

- 玩家收到提示：

```text
每日签到 签到奖励发送至邮箱
```

- 邮箱收到奖励：

```text
3340 x1
```

- 日志出现：

```text
[signin][mail]
[signin] success
```

状态：`[ ] 待测`

---

## 5. 重复签到验证

### 步骤

1. 同一角色再次输入：

```text
//qd
```

### 预期

- 不再次发送邮件。
- 玩家收到重复签到提示。
- 提示中包含距离下次签到剩余秒数。
- 日志出现：

```text
[signin] duplicate
```

状态：`[ ] 待测`

---

## 6. 广播开关验证

### 配置

```lua
signin.broadcast_enabled = true
```

### 步骤

1. 重启频道。
2. 玩家输入：

```text
//qd
```

### 预期

- 签到成功后向在线玩家广播。
- 广播文案来自：

```lua
signin.broadcast_message
```

状态：`[ ] 待测`

---

## 7. GM 限制验证

### 配置

```lua
signin.require_gm = true
```

### 步骤

1. 普通玩家输入 `//qd`。
2. GM 玩家输入 `//qd`。

### 预期

普通玩家：

```text
每日签到仅 GM 可用。
```

GM 玩家：

```text
可以正常签到并收到邮件奖励。
```

状态：`[ ] 待测`

---

## 8. 测试后恢复建议

如果暂不对外开放签到，测试后恢复：

```lua
features.enable_signin = false
signin.broadcast_enabled = false
signin.require_gm = false
```

并重启频道。
