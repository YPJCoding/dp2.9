# Return User Legacy Cleanup

## 背景

`df_game_r.js` 主入口中仍保留旧的 `set_return_user(day)` 内联实现。

当前模块化实现已经存在：

```text
script/js/return_user.js
```

该模块提供：

- `setReturnUser(day)`：新模块函数。
- `set_return_user(day)`：旧入口兼容别名。
- `g_return_user_applied_days`：避免重复写入相同天数。

因此，主入口中的旧内联实现属于重复实现，可以进入清理候选。

## 当前分支内容

本分支暂不直接替换 `df_game_r.js`，原因：当前可用的 GitHub contents 更新接口需要提交完整文件内容，而 `df_game_r.js` 是 2000+ 行运行时入口文件，手工整文件替换存在误伤风险。

本分支新增精确 patch 脚本：

```text
tools/patch_df_game_r_return_user_legacy.py
```

该脚本会：

1. 精确匹配旧 `set_return_user(day)` 代码块。
2. 替换为迁移说明注释。
3. 校验替换后不再存在 `function set_return_user(day)`。
4. 只修改 `df_game_r.js`。

## 使用方式

在本地仓库根目录运行：

```bash
python3 tools/patch_df_game_r_return_user_legacy.py
```

然后检查差异：

```bash
git diff -- df_game_r.js
```

预期差异只应删除以下旧实现：

```js
function set_return_user(day) {
    const time = day * 86400;
    Memory.protect(ptr(0x84C753D), 32, 'rwx');
    ptr(0x84C753D).writeU32(time);
}
```

并替换为说明注释。

## 测试服确认

清理后需要确认：

- Frida 启动正常。
- `startup_modules.js` 正常加载 `return_user.js`。
- `enable_return_user=true` 时日志出现 `[return_user] applied day=15 seconds=1296000`。
- 不出现 `missing function setReturnUser`。
- 不出现 `missing function set_return_user`。

## 风险

低。

该功能已经由 `script/js/return_user.js` 接管，且模块提供旧函数名兼容别名。本清理只删除主入口中的重复旧实现，不改变默认功能开关。
