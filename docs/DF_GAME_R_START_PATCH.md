# df_game_r.js start() Patch Runbook

本文档说明如何执行 `tools/patch_df_game_r_start.py`，用于完成 `df_game_r.js` 的 `start()` 最小结构修复与集中启动器接入。

## 1. 目标

该补丁只做最小入口修复：

- 将 `start()` 内旧的逐个功能启动调用收敛为：

```js
dp_load('startup_helpers');
dp_load('startup_modules');
startMigratedModules(cfg);
```

- 保留仍未拆分的大型入口逻辑：

```js
fix_TOD(true);
api_scheduleOnMainThread(init_db, null);
hook_TimerDispatcher_dispatch();
api_scheduleOnMainThread(start_event_villageattack, null);
```

- 在 `set function success` 日志后补上 `start()` 的闭合 `}`。
- 删除 `Bridge: Frida Integration` 前原本用于延迟闭合 `start()` 的孤立 `}`。
- 不删除任何旧业务函数定义。

## 2. 执行前预检

在仓库根目录执行：

```bash
python3 tools/patch_df_game_r_start.py --check
```

预期输出：

```text
check passed: df_game_r.js start() patch can be applied
```

如果输出 `old start() block not found` 或 `old bridge prefix with stray brace not found`，说明当前 `df_game_r.js` 结构已经变化，不能继续执行补丁，需要先人工确认。

## 3. 执行补丁

确认预检通过后执行：

```bash
python3 tools/patch_df_game_r_start.py
```

默认会生成备份：

```text
df_game_r.js.bak
```

预期输出：

```text
backup written: df_game_r.js.bak
patched df_game_r.js start() successfully
next: inspect git diff, then restart/test Frida startup
```

## 4. 检查 diff

执行后查看 diff：

```bash
git diff -- df_game_r.js
```

重点确认：

- `start()` 中已加载 `startup_helpers` 和 `startup_modules`。
- `start()` 中已调用 `startMigratedModules(cfg)`。
- `set function success` 日志后有 `}`。
- `Bridge: Frida Integration` 前不再有孤立 `}`。
- 旧业务函数定义仍保留。

## 5. 回滚方式

如果执行后发现问题，可使用备份回滚：

```bash
cp df_game_r.js.bak df_game_r.js
```

也可以使用 Git 回滚：

```bash
git checkout -- df_game_r.js
```

## 6. 执行后测试建议

建议按顺序测试：

1. Frida 脚本能正常加载。
2. `start()` 能打印 `set function success`。
3. `startup_helpers` 能正常加载。
4. `startup_modules` 能正常加载。
5. `startMigratedModules(cfg)` 能执行，并且单个功能失败不会阻断整体启动。
6. 默认关闭的功能仍保持关闭，例如：
   - `enable_online_reward=false`
   - `enable_lucky_online=false`
   - `enable_account_cargo=false`
   - `enable_drop_announce=false`
7. 默认开启的功能无重复 hook 报错，例如：
   - `enable_ranking=true`
   - `enable_hidden_option=true`
   - `enable_return_user=true`
   - `enable_vip_login=true`
   - `enable_luck_point_drop=true`

## 7. 注意事项

- 该补丁不拆分怪物攻城。
- 该补丁不删除旧函数定义。
- 该补丁不改变 `script/config.lua` 默认开关。
- 该补丁只修 `start()` 作用域和入口调度方式。
- 执行后如遇启动异常，优先查看 `[frida] [startup]` 和 `[frida] [startup_modules]` 日志。
