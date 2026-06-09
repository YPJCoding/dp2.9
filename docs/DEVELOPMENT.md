# 开发说明

## Runtime 入口

### df_game_r.lua

`df_game_r.lua` 仅作为 DP2 Lua 兼容入口存在：

- 不承载业务逻辑
- 不加载 `script.bootstrap`
- 不加载 Lua 模块
- 只保留 `setup(ctx)`，兼容 DP2 Lua 入口调用约定

### df_game_r.js

`df_game_r.js` 是 Frida JS runtime 入口：

- 通过 `dp_load` 加载 `script/js/**`
- 不写业务逻辑
- 不写真实地址
- 不直接创建 NativeFunction

### template 默认 JS 启动流程

```text
df_game_r.js
  -> dp_load('example_module')
  -> globalThis.startExampleModule()
```

该流程只是验证 template 的 `dp_load` 加载骨架可用，不代表真实业务启动顺序。

真实项目可以在派生分支中替换为：

```text
df_game_r.js
  -> dp_load('startup_helpers')
  -> dp_load('startup_modules')
  -> startRuntimeModules()
```

但 template 分支不内置真实 runtime 地址、binding 或 feature。

## 部署方式

```text
df_game_r.lua
df_game_r.js
script/js/**
```

## 本地检查

```bash
bash tools/check_js_syntax.sh
bash tools/check_lua_syntax.sh
```

## 模板分支边界

- 不在入口文件写真实业务逻辑
- 不在模板分支保留具体业务模块
- 不在模板分支保留真实运行时地址
- 不在模板文档中规定具体业务功能的启用方式
