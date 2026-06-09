# 本地检查

## JS 语法检查

运行：

```bash
bash tools/check_js_syntax.sh
```

检查范围：

- `df_game_r.js`
- `script/js/**/*.js`

依赖：Node.js

## Lua 语法检查

运行：

```bash
bash tools/check_lua_syntax.sh
```

检查范围：`df_game_r.lua`

依赖：`luac`

如果本地没有 `luac`，需要先安装 Lua 编译器，或在具备 Lua 环境的机器上检查。

## 新功能提交前检查

```bash
bash tools/check_js_syntax.sh
bash tools/check_lua_syntax.sh
```

## Review 前自查

```bash
git diff --name-only
git diff --stat
```

确认：

- 没有误改入口文件
- 没有把真实业务逻辑加入模板分支
- 没有残留真实运行时地址、真实项目标识或真实业务配置
