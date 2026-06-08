# 本地检查

## JS 语法检查

运行：

```bash
bash tools/check_js_syntax.sh
```

检查范围：

- `df_game_r.js`
- `script/js/*.js`

依赖：

- Node.js

## Lua 语法检查

运行：

```bash
bash tools/check_lua_syntax.sh
```

检查范围：

- `df_game_r.lua`
- `script/**/*.lua`

依赖：

- `luac`

如果本地没有 `luac`，需要先安装 Lua 编译器，或在具备 Lua 环境的机器上检查。

## 新功能提交前检查

提交前可以执行：

```bash
bash tools/check_js_syntax.sh
bash tools/check_lua_syntax.sh
```

如果本次只修改 Markdown，可以不运行语法检查，但仍需确认没有误改运行时代码。

## Review 前自查

```bash
git diff --name-only
git diff --stat
```

确认：

- 没有误改入口文件。
- 没有误改不相关模块。
- 没有把真实业务逻辑加入模板分支。
- 没有残留真实运行时地址、真实项目标识或真实业务配置。

## 模板分支检查重点

模板分支只允许保留：

- 示例入口。
- 示例模块。
- 示例 handler。
- 示例配置。
- 开发文档。
- 本地检查脚本。

不应保留任何具体业务模块。