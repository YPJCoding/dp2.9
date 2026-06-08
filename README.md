# DP Runtime Clean Template

这是一个干净的 DP runtime 模板分支。

本分支用于创建新项目底板，只保留最小运行结构、示例模块和开发规范，不包含任何当前业务逻辑。

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

- 不包含真实业务 Lua 模块。
- 不包含真实 JS/Frida hook。
- 不包含真实内存地址。
- 不包含真实 item_id。
- 不包含 SQL。
- 不包含 shell。
- 不包含发奖逻辑。
- 不包含删除逻辑。
- 不包含 GM 经济命令。
- 不包含 ranking / online_reward / lucky_online。

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
  SAFETY_RULES.md
  LOCAL_CHECKS.md
```

## 文档入口

- [总体开发说明](docs/DEVELOPMENT.md)
- [模块开发总览](docs/MODULE_GUIDE.md)
- [Lua 模块开发指南](docs/LUA_MODULE_GUIDE.md)
- [Frida/JS 模块开发指南](docs/FRIDA_MODULE_GUIDE.md)
- [安全规则](docs/SAFETY_RULES.md)
- [本地检查](docs/LOCAL_CHECKS.md)

## 本地检查

```bash
bash tools/check_js_syntax.sh
bash tools/check_lua_syntax.sh
```

`check_lua_syntax.sh` 依赖本机安装 `luac`。

## 使用建议

新项目可以从该分支复制结构，然后按模块逐步新增业务功能。

所有业务功能必须：

1. 默认关闭。
2. 有配置开关。
3. 有日志。
4. 高风险功能必须有独立 risk 开关。
5. 不允许把业务逻辑直接堆进入口文件。

## 新项目初始化建议

1. 从 `template/clean-runtime-skeleton` 拉业务分支。
2. 修改 README 中的项目名称和版本说明。
3. 在 `script/config.lua` 增加项目级配置。
4. 按 `docs/LUA_MODULE_GUIDE.md` 添加 Lua 模块。
5. 按 `docs/FRIDA_MODULE_GUIDE.md` 添加 Frida/JS 模块。
6. 每个业务模块单独提交，便于 review 和回滚。
