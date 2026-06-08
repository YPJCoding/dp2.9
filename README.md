# DP Runtime Clean Template

这是一个干净的 DP runtime 模板分支。

本分支只保留：

- 最小 Lua 入口
- 最小 JS/Frida 入口
- 示例配置
- 示例 Lua 模块
- 示例 Lua handler
- 示例 JS 模块
- 本地语法检查脚本
- 开发说明文档

本分支不包含任何业务逻辑。

## 不包含

- 不包含真实业务 Lua 模块
- 不包含真实 JS/Frida hook
- 不包含真实内存地址
- 不包含真实 item_id
- 不包含 SQL
- 不包含 shell
- 不包含发奖逻辑
- 不包含删除逻辑
- 不包含 GM 经济命令
- 不包含 ranking / online_reward / lucky_online

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
  SAFETY_RULES.md
```

## 本地检查

```bash
bash tools/check_js_syntax.sh
bash tools/check_lua_syntax.sh
```

## 使用建议

新项目可以从该分支复制结构，然后按模块逐步新增业务功能。

所有业务功能必须：

1. 默认关闭。
2. 有配置开关。
3. 有日志。
4. 高风险功能必须有独立 risk 开关。
5. 不允许把业务逻辑直接堆进入口文件。
