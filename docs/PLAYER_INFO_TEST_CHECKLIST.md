# Player Info Test Checklist

本文档用于验证 `script/modules/player_info.lua` 玩家个人信息查询模块。

## 1. 当前实现状态

玩家个人信息模块已迁移为独立模块：

```text
script/modules/player_info.lua
```

默认开启：

```lua
features = {
    enable_player_info = true,
}
```

启用后通过 `GmInput` hook 监听：

```lua
player_info = {
    command = "//myinfo",
}
```

当前实现只读取当前角色信息，不修改数据库、不发放奖励、不执行 shell。

## 2. 启动加载验证

### 步骤

1. 确认配置：

```lua
features.enable_player_info = true
```

2. 重启频道。

### 预期日志

```text
[player_info] registered GmInput hook command=//myinfo
[bootstrap] loaded module=script.modules.player_info
```

状态：`[ ] 待测`

---

## 3. 查询个人信息验证

### 步骤

1. 登录任意角色。
2. 输入：

```text
//myinfo
```

### 预期

玩家收到个人信息提示，包含：

```text
账号编号
角色编号
角色姓名
角色等级
职业编号
转职编号
副职编号
已用疲劳
```

日志出现：

```text
[player_info][myinfo]
```

状态：`[ ] 待测`

---

## 4. 关闭开关验证

### 配置

```lua
features.enable_player_info = false
```

### 步骤

1. 修改配置。
2. 重启频道。
3. 输入：

```text
//myinfo
```

### 预期

- 不应触发玩家信息提示。
- 日志应出现：

```text
[bootstrap] skipped module=script.modules.player_info
```

状态：`[ ] 待测`

---

## 5. 测试后恢复建议

如果希望保留旧脚本的 `//myinfo` 体验，测试后恢复：

```lua
features.enable_player_info = true
player_info.command = "//myinfo"
```

并重启频道。
