# DP2 Frida Runtime

当前分支：`refactor/frida-runtime-modules`

Frida runtime 已从旧 `frida.js` 模块化重构，拆分到 `script/js/**` 目录。

## 部署

唯一部署方式：`df_game_r.js` + `dp_load` 动态加载 `script/js/**`

```text
部署文件：df_game_r.js
加载方式：dp_load 动态加载 script/js 模块
```

`df_game_r.js` 通过 `dp_load` 加载 `runtime_addresses`、`runtime_config`、`startup_modules` 等引导模块。
`startup_modules.js` 的 `loadRuntimeDependencies()` 加载其余所有子模块。

## Lua 入口说明

`df_game_r.lua` 当前仅作为 DP2 Lua 侧兼容入口存在，不承载业务逻辑，不再加载 `script.bootstrap`。

实际业务 runtime 入口是 `df_game_r.js + dp_load + script/js/**`。

部署时需确保：

- `df_game_r.lua` 已更新为安全空壳入口
- `df_game_r.js` 已部署
- `script/js/**` 已部署
- 目标环境提供 `dp_load`

## 目录结构

```text
df_game_r.lua          # Lua 兼容空壳入口
df_game_r.js           # Frida/JS 入口（dp_load 加载 script/js/）

script/
  js/                  # Frida/JS 模块
    core/              # 基础工具模块
    bindings/          # 游戏 API 封装
    features/          # 业务功能模块
      village_attack/  # 怪物攻城活动

tools/
  check_js_syntax.sh
  check_lua_syntax.sh

docs/
  DEVELOPMENT.md
  FRIDA_MODULE_GUIDE.md
  FRIDA_REFACTOR_NOTES.md
```

## 文档入口

- [总体开发说明](docs/DEVELOPMENT.md)
- [Frida/JS 模块开发指南](docs/FRIDA_MODULE_GUIDE.md)
- [Frida 重构笔记](docs/FRIDA_REFACTOR_NOTES.md)

## 本地检查

```bash
bash tools/check_js_syntax.sh
bash tools/check_lua_syntax.sh
```

`check_lua_syntax.sh` 依赖本机安装 `luac`。
