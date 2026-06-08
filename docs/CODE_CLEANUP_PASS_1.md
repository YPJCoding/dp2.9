# Code Cleanup Pass 1

本文档记录 `audit/code-cleanup-pass-1` 分支的第一批低风险代码清理范围。

## 已处理

### Lua: `script/modules/drop_rules.lua`

- 增加 `game.fac.party(_party)` 返回 nil 时的保护，避免 `party:GetDungeon()` 直接报错。
- 对 `level_gap` 和 `bypass_item_id` 做 `tonumber(...)` 规范化。
- 增加 `is_hook_registered`，避免重复 setup 时重复注册 `CParty_DropItem` hook。

### Lua: `script/modules/exp_dungeon.lua`

- 增加 timer 重复启动保护。
- 增加 `M.stop(ctx)`，方便后续测试服手动停止或扩展热重载控制。
- 对配置项做 `tonumber(...)` 规范化。
- 增加发奖日志，便于测试服确认模块是否真实发放经验/代币。
- 对 `require("luv")` 增加 `pcall` 保护。

### Lua: `script/modules/item_query.lua`

- 命中 `//view`、`//viewid`、`//viewname` 后统一 `return 0`。
- 不再继续透传到后续 `GmInput` hook，避免被后续 GM 指令系统重复处理。
- 增加 `is_hook_registered`，避免重复 setup 时重复注册 `GmInput` hook。
- 注释中明确命中命令后的返回语义。

## 暂未直接修改的 JS 问题

`df_game_r.js` 当前为 2000+ 行大入口文件，且仍包含大量 NativeFunction、旧实现、迁移兼容函数和启动逻辑。为避免通过 GitHub contents API 整文件替换时误伤运行入口，本轮暂不直接改 JS 主文件，以下问题进入下一轮专项处理。

### P0: `api_gameworld_foreach` iterator 未更新

当前逻辑在循环尾部调用：

```js
api_gameworld_user_map_next(it);
```

如果底层函数不原地修改 `it`，会导致 iterator 不前进。建议改为：

```js
let it = api_gameworld_user_map_begin();
...
it = api_gameworld_user_map_next(it);
```

### P0: `api_compress_zip` 对 JS 字符串调用 native `strlen`

当前逻辑：

```js
const input = Memory.allocUtf8String(s);
const alloc_buf_size = 1000 + strlen(s) * 2;
compress_zip(output, output_len, input, strlen(s));
```

`strlen` 的参数应为 pointer，建议改成：

```js
const input = Memory.allocUtf8String(s);
const input_len = strlen(input);
const alloc_buf_size = 1000 + input_len * 2;
compress_zip(output, output_len, input, input_len);
```

### P0: 邮件正文长度计算疑似错误

当前逻辑：

```js
const TxtValueLength = toString(TxtValue).length;
```

建议使用 UTF-8 指针长度：

```js
const TxtValueLength = strlen(TxtValuePr);
```

## 下一轮建议

开新分支 `audit/js-entry-cleanup-pass-1`，只处理 `df_game_r.js` 中 3 个明确问题，不同时删除旧功能。完成后再开 `audit/js-duplicate-cleanup-pass-2` 清理 `hidden_option`、`ranking` 等已迁移但仍残留在主入口中的旧实现。
