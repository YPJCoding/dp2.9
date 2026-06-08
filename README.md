# DP Runtime Clean Template

这是一个干净的 DP runtime 模板分支。

本分支用于创建新项目底板，只保留最小运行结构、示例模块和开发说明。

## 分支定位

- `main`：业务项目主线。
- `template/clean-runtime-skeleton`：干净模板底板。
- 新业务项目建议从 template 分支拉新分支开发，不要把 template 分支合并回业务主线。

## 保留内容

- 最小 Lua 入口。
- 最小 JS/Frida 入口。
- 示例配置。
- 示例 Lua 模块。
- 示例 Lua handler。
- 示例 JS 模块。
- 本地语法检查脚本。
- 开发说明文档。

## 不包含

- 真实业务逻辑。
- 真实业务配置。
- 真实运行时地址。
- 真实 item_id。

## 目录结构

```text
df_game_r.lua

df_game_r.js

script/
  config.lua
  logger.lua
  bootstrap.lua
  modules/
    example_module.lua
  handlers/
    example_handler.lua
  js/
    example_module.js

tools/
  check_js_syntax.sh
  check_lua_syntax.sh

docs/
  DEVELOPMENT.md
  MODULE_GUIDE.md
  LUA_MODULE_GUIDE.md
  FRIDA_MODULE_GUIDE.md
  LOCAL_CHECKS.md
```

## 文档入口

- [总体开发说明](docs/DEVELOPMENT.md)
- [模块开发总览](docs/MODULE_GUIDE.md)
- [Lua 模块开发指南](docs/LUA_MODULE_GUIDE.md)
- [Frida/JS 模块开发指南](docs/FRIDA_MODULE_GUIDE.md)
- [本地检查](docs/LOCAL_CHECKS.md)

## 本地检查

```bash
bash tools/check_js_syntax.sh
bash tools/check_lua_syntax.sh
```

`check_lua_syntax.sh` 依赖本机安装 `luac`。

## 使用方式

1. 从 `template/clean-runtime-skeleton` 拉业务分支。
2. 修改 README 中的项目名称和版本说明。
3. 在 `script/config.lua` 增加项目配置。
4. 按模块新增业务功能。
5. 每个业务模块单独提交，便于 review。
