# Runtime Smoke Test Checklist

本文档用于测试服执行 `dp2.9` 运行时烟测，重点覆盖当前收尾阶段剩余验证项。

当前状态：`[x] 已完成，测试服验证通过`

## 1. 测试前准备

确认当前分支：

```text
refactor/dp2-9-base
```

确认默认关键配置：

```lua
hot_reload = {
    enabled = true,
    config_filename = "/dp2/script/config.lua",
    config_module = "script.config",
}

hot = {
    finish_back_home = {
        default_mode = "5",
        point_min = 100,
        point_max = 1000,
        equipment_rarities = {0, 1},
    },
}

dpx_startup = {
    set_level_cap = true,
    level_cap = 85,
    set_auction_min_level = true,
    auction_min_level = 10,
}
```

## 2. handler 总开关烟测

目的：确认 `features.enable_item_handlers=false` 时不会注册任何道具 handler。

### 2.1 修改配置

临时修改：

```lua
features = {
    enable_item_handlers = false,
}
```

### 2.2 重启频道

此项涉及 handler 注册，必须重启频道。

### 2.3 预期日志

应看到：

```text
[bootstrap] item handlers disabled
```

不应看到：

```text
[bootstrap] registered handler module=script.handlers.quest
[bootstrap] registered handler module=script.handlers.job
[bootstrap] registered handler module=script.handlers.inherit
[bootstrap] registered handler module=script.handlers.misc
[bootstrap] registered handler module=script.handlers.item_cleanup
[bootstrap] registered handler module=script.handlers.pvp
```

### 2.4 恢复配置

测试后恢复：

```lua
features = {
    enable_item_handlers = true,
}
```

并重启频道。

状态：`[x] 已通过`

---

## 3. 等级上限 / 拍卖行等级烟测

目的：确认等级上限使用 `dpx.set_max_level(85)`，不会误把拍卖行最低等级设置为 85。

### 3.1 等级上限

测试步骤：

1. 使用接近满级角色，例如 84 级。
2. 获取经验，确认可以升到 85。
3. 85 后继续获取经验，确认不会升到 86。

预期：

```text
角色最高等级为 85
```

### 3.2 拍卖行最低等级

测试步骤：

1. 使用 10 级或 10 级以上但低于 85 的角色。
2. 尝试打开/使用拍卖行。

预期：

```text
10 级以上可以使用拍卖行
不会要求 85 级
```

状态：`[x] 已通过`

---

## 4. hot_reload timer 烟测

目的：确认 `hot_reload.enabled=true` 时会创建 timer 并监听 `config.lua`。

### 4.1 启动日志

重启频道后应看到：

```text
[hot_reload] watching config=/dp2/script/config.lua module=script.config
```

### 4.2 热更新日志

修改 `hot.finish_back_home.default_mode` 并保存 `config.lua`。

应看到：

```text
[hot_reload] detected config change
[finish_back_home] configured
[hot_reload] config applied
```

当前已验证：

- [x] `default_mode=0`
- [x] `default_mode=5`
- [x] `default_mode=1`
- [x] `equipment_rarities={0,1}` 对 `mode=2/3/4` 生效

状态：`[x] 已通过`

### 4.3 可选异常保护验证

不需要在正常测试服故意写错 `config.lua`。

仅在本地副本或临时测试环境中，可选验证：

1. 故意让 `config.lua` 语法错误或返回非 table。
2. 确认日志出现 `keep previous config`。
3. 确认旧配置仍然生效。

状态：`[ ] 可选`

---

## 5. legacy_patches 默认关闭烟测

目的：确认 `features.enable_legacy_patches=false` 时不会注册旧入口 hook。

### 5.1 默认配置

```lua
features = {
    enable_legacy_patches = false,
}
```

### 5.2 重启频道

### 5.3 预期日志

应看到：

```text
[bootstrap] skipped module=script.modules.legacy_patches
```

或：

```text
[legacy_patches] module disabled
```

不应看到：

```text
[legacy_patches] registered tower_gold_notice_fix
[legacy_patches] registered save_town_fix
[legacy_patches] registered open_extra_dungeons
```

状态：`[x] 已通过`

---

## 6. legacy_patches 子功能开启验证

这些测试需要重启频道，因为涉及 hook 注册。

### 6.1 绝望之塔金币提示修复

配置：

```lua
features = {
    enable_legacy_patches = true,
}

legacy_patches = {
    enable_tower_gold_notice_fix = true,
    tower_dungeon_min_id = 11008,
    tower_dungeon_max_id = 11107,
}
```

预期日志：

```text
[legacy_patches] registered tower_gold_notice_fix min_id=11008 max_id=11107
```

预期行为：

```text
绝望之塔 11008~11107 范围副本金币提示/卡金币异常不再出现。
```

状态：`[x] 已通过`

### 6.2 城镇下线卡镇魂修复

配置：

```lua
features = {
    enable_legacy_patches = true,
}

legacy_patches = {
    enable_save_town_fix = true,
    save_town_from_id = 13,
    save_town_to_id = 11,
}
```

预期日志：

```text
[legacy_patches] registered save_town_fix from_town_id=13 to_town_id=11
```

预期行为：

```text
角色保存城镇为 13 时改为 11，避免下线后卡镇魂相关问题。
```

状态：`[x] 已通过`

### 6.3 开放极限祭坛 / 指定副本

配置：

```lua
features = {
    enable_legacy_patches = true,
}

legacy_patches = {
    enable_open_extra_dungeons = true,
    open_dungeon_ids = {11007},
}
```

预期日志：

```text
[legacy_patches] registered open_extra_dungeons count=1
```

预期行为：

```text
副本 11007 可被 Open_Dungeon hook 放行。
```

状态：`[x] 已通过`

---

## 7. 高风险 handler 默认关闭烟测

目的：确认 SQL、删除、shell 类 handler 默认拒绝并返还道具。

默认配置：

```lua
risk = {
    enable_sql_handlers = false,
    enable_delete_handlers = false,
    enable_shell_handlers = false,
}
```

### 7.1 SQL 类 handler

覆盖项：

- `2021458807` 女鬼剑职业转换。
- `2023458801` 角色出战。
- `2023458803` 装备设计图熟练度。

预期：

```text
拒绝执行
返还道具
记录风险开关关闭日志
```

状态：`[x] 已通过`

### 7.2 删除类 handler

覆盖项：

- `2021458806` 宠物清理券。
- `2022110503` 时装清理券。
- `2022110504` 副职业一键分解券。

预期：

```text
拒绝执行
返还道具
记录风险开关关闭日志
```

状态：`[x] 已通过`

### 7.3 Shell 类 handler

覆盖项：

- `2541121` PVP 经验书。

预期：

```text
拒绝执行
返还道具
记录风险开关关闭日志
```

状态：`[x] 已通过`

---

## 8. 测试后恢复要求

完成临时测试后，确认恢复：

```lua
features.enable_item_handlers = true
features.enable_legacy_patches = false
risk.enable_sql_handlers = false
risk.enable_delete_handlers = false
risk.enable_shell_handlers = false
hot.finish_back_home.default_mode = "5"
hot.finish_back_home.equipment_rarities = {0, 1}
```

并重启频道。

状态：`[x] 已恢复`
