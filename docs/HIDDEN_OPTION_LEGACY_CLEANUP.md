# Hidden Option Legacy Cleanup

## 背景

`df_game_r.js` 主入口中仍保留旧的时装潜能实现：

- `get_random_int(min, max)`
- `hidden_option()`
- `start_hidden_option()`

当前模块化实现已经存在：

```text
script/js/hidden_option.js
```

该模块提供：

- `startHiddenOption()`：新模块启动函数。
- `start_hidden_option()`：旧入口兼容别名。
- `g_hidden_option_started`：避免重复 hook。
- `applyHiddenOption()`：替代旧 `hidden_option()` 的实际逻辑。

因此，主入口中的旧内联实现属于重复实现，可以进入清理候选。

## 当前分支内容

本分支新增精确 patch 脚本：

```text
tools/patch_df_game_r_hidden_option_legacy.py
```

该脚本会：

1. 精确匹配旧 hidden option 代码块。
2. 替换为迁移说明注释。
3. 校验替换后不再存在 `function hidden_option()` 和 `function start_hidden_option()`。
4. 只修改 `df_game_r.js`。

## 使用方式

在本地仓库根目录运行：

```bash
python3 tools/patch_df_game_r_hidden_option_legacy.py
```

然后检查差异：

```bash
git diff -- df_game_r.js
```

预期差异只应删除以下旧实现：

```js
function get_random_int(min, max) { ... }
function hidden_option() { ... }
function start_hidden_option() { ... }
```

并替换为说明注释。

## 测试服确认

清理后需要确认：

- Frida 启动正常。
- `startup_modules.js` 正常加载 `hidden_option.js`。
- `enable_hidden_option=true` 时日志出现 `[hidden_option] started`。
- 不出现 `missing function startHiddenOption`。
- 不出现重复 hook 日志或重复 attach 行为。

## 风险

中。

该功能会 patch 内存并 attach hook。虽然模块已经有重复 hook 防护，但实际删除前仍应在测试服确认模块路径正常加载。