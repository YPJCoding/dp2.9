# Frida/JS 模块开发指南

## 与 Lua 侧的关系

`df_game_r.lua` 仅是 DP2 Lua 兼容空壳入口，Frida/JS runtime 不依赖 Lua bootstrap。

## 目标

Frida/JS 侧用于编写运行时 JS 模块。模板只提供入口结构、模块组织方式和编码风格示例，不包含真实地址或真实业务实现。

本文档只说明模板结构和编码规范，不规定真实项目的业务逻辑。

## 当前模板结构

当前模板只提供最小 JS 入口和一个示例模块：

```text
df_game_r.js
script/js/example_module.js
```

## 可选拆分结构

项目变复杂后，可以按需要拆分为以下结构：

```text
df_game_r.js
  -> startProjectJs()
    -> script/js/startup_helpers.js
    -> script/js/startup_modules.js
      -> script/js/runtime_addresses.js
      -> script/js/<feature>.js
```

上面的拆分方式只是结构建议，不要求当前模板必须包含这些文件。

## 文件职责

### `df_game_r.js`

建议只做入口：

- 启动 JS 侧流程。
- 加载启动辅助模块。
- 不直接堆真实业务逻辑。
- 不直接写大量地址。

### `script/js/startup_helpers.js`

可选辅助文件，可以负责：

- 日志函数。
- 模块加载辅助。
- 启动函数调用辅助。
- 配置读取辅助。
- 异常保护。

### `script/js/startup_modules.js`

可选调度文件，可以负责：

- 按项目配置或项目约定启动模块。
- 控制启动顺序。
- 统一输出启动日志。
- 不写具体业务逻辑。

### `script/js/runtime_addresses.js`

可选地址文件，可以集中管理当前项目需要的运行时地址。

建议：

- 每个地址有中文注释。
- 写清楚来源。
- 写清楚适用版本。
- 写清楚用途。
- 避免在多个业务模块中散落裸地址。

示例地址应使用占位值：

```js
var PROJECT_ADDRESSES = {
  // 示例函数地址
  // 来源：待确认
  // 版本：当前项目版本
  // 用途：示例占位，不能直接使用
  example_function: ptr('0x00000000'),
};
```

### `script/js/<feature>.js`

一个相对独立的 JS 功能可以放在一个文件中。

建议：

- 提供 `startXxx()`。
- 有重复 hook 防护。
- 通过参数接收配置和地址。
- 不散落裸地址。
- 不直接读取不属于自己的配置区。

## 示例模块

```js
var g_example_started = false;

function startExampleFeature(cfg, addresses) {
  if (g_example_started) {
    console.log('[example] already started');
    return;
  }

  g_example_started = true;

  if (!addresses || !addresses.example_function) {
    console.log('[example] missing address: example_function');
    return;
  }

  try {
    // Interceptor.attach(addresses.example_function, {
    //   onEnter: function (args) {},
    //   onLeave: function (retval) {},
    // });
    console.log('[example] started');
  } catch (err) {
    console.log('[example] failed: ' + err);
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.startExampleFeature = startExampleFeature;
}
```

## 配置读取示例

JS 配置可以集中管理：

```js
var PROJECT_JS_CONFIG = {
  features: {
    enable_example_feature: false,
  },
};
```

以上内容只是配置读取示例。真实项目可以按自身需要设计配置结构和模块接入方式。

## Hook 编码建议

每个 hook 建议：

- 防重复 attach。
- Hook 前检查地址是否存在。
- Hook 内使用 try/catch。
- Hook 内不要抛异常影响主流程。
- Hook 内避免耗时操作。
- Hook 热路径中避免大量循环。

## JS 语法与代码风格

Frida JS 模块应使用当前运行环境兼容的语法：

- 不使用 ES6+ 语法。
- 不使用 `let`。
- 变量声明优先使用 `const`。
- 只有需要重新赋值时才使用 `var`。
- 使用 2 空格缩进。
- 函数体内保持早返回，减少嵌套层级。

## 命名规范

JS 文件名使用 snake_case：

```text
example_feature.js
runtime_addresses.js
startup_modules.js
```

启动函数使用 `start` + PascalCase：

```js
startExampleFeature()
startRuntimeModules()
```

防重复变量使用：

```js
g_example_feature_started
g_runtime_modules_started
```

## 新增 JS 模块流程

```text
1. 在 script/js/ 新建 <feature>.js
2. 按项目需要增加地址占位或地址文件
3. 按项目需要增加配置项
4. 按项目需要注册模块
5. 在模块中实现 startXxx(cfg, addresses)
6. 增加防重复 hook
7. 增加中文注释
8. 本地运行 node --check
9. 按项目需要补充测试说明
```

## Review 检查清单

- 是否有裸地址散落在多个模块中。
- 是否有重复 hook 防护。
- 是否有 try/catch。
- 是否在 hook 热路径中做了重操作。
- 是否误用了示例地址占位。
- 是否修改了入口文件中的真实业务逻辑。
- 是否影响其他模块启动顺序。