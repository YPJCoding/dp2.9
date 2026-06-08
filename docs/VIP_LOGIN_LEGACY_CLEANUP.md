# VIP Login Legacy Cleanup

## 背景

`df_game_r.js` 主入口中仍保留旧的 VIP 登录公告实现：

- `getQuestIds1()` ~ `getQuestIds5()`
- `Inspection_tasks(user, quest_ids)`
- `vip_Login()`

当前模块化实现已经存在：

```text
script/js/vip_login.js
```

该模块提供：

- `startVipLogin()`：新模块启动函数。
- `vip_Login()`：旧入口兼容别名。
- `g_vip_login_started`：避免重复 hook。
- `api_gameWorld_SendNotiPacketMessage` 大小写兼容处理。

因此，主入口中的旧内联实现属于重复实现，可以进入清理候选。

## 当前分支内容

本分支新增精确 patch 脚本：

```text
tools/patch_df_game_r_vip_login_legacy.py
```

该脚本会：

1. 精确匹配旧 VIP 登录公告代码块。
2. 替换为迁移说明注释。
3. 校验替换后不再存在 `function getQuestIds1()`、`function Inspection_tasks(...)` 和 `function vip_Login()`。
4. 只修改 `df_game_r.js`。

## 使用方式

在本地仓库根目录运行：

```bash
python3 tools/patch_df_game_r_vip_login_legacy.py
```

然后检查差异：

```bash
git diff -- df_game_r.js
```

预期差异只应删除旧 VIP 登录公告实现，并替换为说明注释。

## 测试服确认

清理后需要确认：

- Frida 启动正常。
- `startup_modules.js` 正常加载 `vip_login.js`。
- `enable_vip_login=true` 时日志出现 `[vip_login] started`。
- 不出现 `missing function startVipLogin`。
- 不出现重复 hook 日志或重复 attach 行为。
- 如需验证实际广播，需确认当前 PVF 仍使用任务 ID `8892` ~ `8896` 表示 VIP1 ~ VIP5。

## 风险

中。

该功能会 attach 登录 hook 并广播消息。模块实现已经有重复 hook 防护，并修正了旧实现中的函数大小写兼容问题，但删除主入口旧实现前仍应在测试服确认模块路径正常加载。
