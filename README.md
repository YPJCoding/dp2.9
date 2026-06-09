# DP2 Frida Runtime Template

这是 DP2 Frida runtime 的干净模板分支。

## 分支定位

- `template/clean-runtime-skeleton`：干净 runtime 模板，只保留入口、JS 模块加载骨架和本地检查脚本。
- 业务分支应从该 template 拉出，不要把业务逻辑提交回 template。

## 当前 runtime 入口

```text
df_game_r.lua   # DP2 Lua 兼容空壳入口，不承载业务逻辑
df_game_r.js    # Frida JS 入口，通过 dp_load 加载 script/js/**
script/js/**    # Frida runtime 模块
```

## 部署方式

唯一部署方式：

```text
df_game_r.lua
df_game_r.js
script/js/**
```

目标环境必须提供 `dp_load`。

不再依赖：

```text
script/bootstrap.lua
script/config.lua
script/modules/**
script/handlers/**
```

## 文档入口

- [开发说明](docs/DEVELOPMENT.md)
- [Frida/JS 模块开发指南](docs/FRIDA_MODULE_GUIDE.md)
- [本地检查](docs/LOCAL_CHECKS.md)

## 本地检查

```bash
bash tools/check_js_syntax.sh
bash tools/check_lua_syntax.sh
```

`check_lua_syntax.sh` 依赖本机安装 `luac`。
