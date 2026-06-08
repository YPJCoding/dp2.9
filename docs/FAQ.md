# FAQ

## 1. `frida.js` 是否需要部署？

不需要。

DP 默认加载链路是：

```text
/dp2/df_game_r.lua
  ↓ frida.load(...)
/dp2/df_game_r.js
```

`frida.js` 只能作为外部参考脚本，不是 DP 默认加载文件。

## 2. 为什么 `df_game_r.lua` 变短了？

因为旧的 `item_handler[...]` 业务逻辑已经迁移到 `script/handlers/*.lua`。

当前 `df_game_r.lua` 只作为轻量入口，主要负责：

- 初始化运行环境
- 加载 bootstrap
- 加载 Frida
- 注册 UseItem2 hook
- 分发 item_handler
- 应用 DPX 启动配置

## 3. 为什么用了道具后提示“功能未开启”？

这是风险开关导致的预期行为。

以下功能默认关闭：

- 直接 SQL 类功能
- 删除宠物、时装、装备
- 外部 shell 脚本

对应配置在：

```text
script/config.lua
```

```lua
risk = {
    enable_sql_handlers = false,
    enable_delete_handlers = false,
    enable_shell_handlers = false,
}
```

## 4. 如何开启 SQL 类道具？

编辑 `script/config.lua`：

```lua
risk = {
    enable_sql_handlers = true,
}
```

注意：开启前必须备份数据库。

受影响功能包括：

- 女鬼剑职业转换
- 角色出战
- 装备设计图熟练度提升

## 5. 如何开启删除类道具？

编辑 `script/config.lua`：

```lua
risk = {
    enable_delete_handlers = true,
}
```

注意：开启前必须确认角色数据和数据库备份。

受影响功能包括：

- 宠物清理券
- 时装清理券
- 副职业一键分解券

## 6. 如何开启 PVP 经验书？

编辑 `script/config.lua`：

```lua
risk = {
    enable_shell_handlers = true,
}
```

同时确认服务器存在脚本：

```text
/dp2/script/pvp_exp_inc.sh
```

## 7. 模块没有生效怎么办？

检查 `script/config.lua`：

```lua
features = {
    enable_modular_handlers = true,
    modular_handlers = {
        quest = true,
        job = true,
        item_cleanup = true,
        inherit = true,
        pvp = true,
        misc = true,
    },
}
```

再检查日志中是否出现：

```text
[bootstrap] registered handler module=script.handlers.xxx
```

## 8. 启动时报 `failed to require module` 怎么办？

通常是文件未部署或 Lua require 路径不一致。

检查：

- `/dp2/script/bootstrap.lua`
- `/dp2/script/config.lua`
- `/dp2/script/utils.lua`
- `/dp2/script/handlers/*.lua`

## 9. 如何快速关闭某个模块？

编辑 `script/config.lua`，把对应模块改成 `false`：

```lua
modular_handlers = {
    item_cleanup = false,
}
```

注意：当前旧 handler 已经从 `df_game_r.lua` 移除，关闭模块后，对应道具不会回退到旧逻辑。

## 10. 为什么保留 DPX 启动 fallback？

为了避免 `bootstrap` 加载失败时导致频道直接启动失败。

正常情况下会执行：

```lua
bootstrap.apply_dpx_startup(bootstrap_ctx)
```

如果失败，会执行 `df_game_r.lua` 里的 fallback DPX 启动逻辑。

## 11. 现在可以合并 main 吗？

还不建议。

合并前至少需要完成：

- 普通频道启动验证
- 低风险 handler 验证
- 高风险 handler 默认拒绝验证
- README 部署说明最终整理
- PR 从 Draft 改为 Ready

## 12. 如何回滚？

最快回滚方式：

1. 恢复旧 `/dp2` 目录备份。
2. 或回滚 Git 分支到 main。
3. 或临时关闭所有模块：

```lua
features = {
    enable_modular_handlers = false,
}
```

但注意：当前 `df_game_r.lua` 已经移除旧 handler，如果关闭所有模块，道具 handler 将不会执行旧逻辑。
