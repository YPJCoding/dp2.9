# Frida/JS 模块开发指南

## 目标

Frida/JS 侧负责 hook、patch、运行时桥接和客户端/服务端行为观察。模板默认不包含任何真实地址、真实 hook 或真实 patch。

真实业务开发时必须把入口、加载器、地址和业务模块拆开。

## 推荐结构

```text
df_game_r.js
  -> startProjectJs()
    -> script/js/startup_helpers.js
    -> script/js/startup_modules.js
      -> script/js/runtime_addresses.js
      -> script/js/<feature>.js
```

## 文件职责

### `df_game_r.js`

只做入口：

- 启动 JS 侧流程。
- 加载启动辅助模块。
- 不直接堆业务 hook。
- 不直接写大量地址。
- 不直接写内存 patch。

### `script/js/startup_helpers.js`

建议负责：

- 日志函数。
- 安全加载模块。
- 安全调用启动函数。
- 配置读取辅助。
- 异常保护。

### `script/js/startup_modules.js`

建议负责：

- 按配置启动模块。
- 控制启动顺序。
- 统一输出启动日志。
- 不写具体业务 hook。

### `script/js/runtime_addresses.js`

建议负责集中管理当前版本地址。

要求：

- 每个地址必须有中文注释。
- 写清楚来源。
- 写清楚适用服务端版本。
- 写清楚用途。
- 写清楚风险。
- 禁止在业务模块中散落裸地址。

示例地址必须使用占位值：

```js
var PROJECT_ADDRESSES = {
    // 示例函数地址
    // 来源：待逆向确认
    // 版本：当前项目版本
    // 风险：示例占位，不能直接使用
    example_function: ptr('0x00000000'),
};
```

### `script/js/<feature>.js`

一个业务功能一个文件。

要求：

- 提供 `startXxx()`。
- 有重复 hook 防护。
- 默认关闭。
- 通过配置启用。
- 不散落裸地址。
- 不直接读取不属于自己的配置。

## 示例模块

```js
var g_example_started = false;

function startExampleFeature(cfg, addresses) {
    if (g_example_started) {
        console.log('[example] already started');
        return;
    }

    if (!cfg || cfg.enabled !== true) {
        console.log('[example] disabled');
        return;
    }

    g_example_started = true;

    if (!addresses || !addresses.example_function) {
        console.log('[example] missing address: example_function');
        return;
    }

    try {
        // Interceptor.attach(addresses.example_function, {
        //     onEnter: function (args) {},
        //     onLeave: function (retval) {},
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

## 配置规范

JS 配置建议集中管理：

```js
var PROJECT_JS_CONFIG = {
    features: {
        enable_example_feature: false,
    },
    risk: {
        enable_memory_patch: false,
    },
};
```

要求：

- 所有功能默认关闭。
- 高风险 hook / patch 需要 risk 二级开关。
- 不允许默认开启内存 patch。
- 不允许默认开启经济类、清包类、GM 类功能。

## Hook 安全规范

每个 hook 必须：

- 防重复 attach。
- Hook 前检查地址是否存在。
- Hook 内使用 try/catch。
- Hook 内不要抛异常影响主流程。
- Hook 内不要执行耗时操作。
- Hook 内不要直接拼 SQL。
- Hook 内不要做大量循环。

高风险 patch 必须：

- 单独模块。
- 单独开关。
- 单独 risk 开关。
- 单独文档。
- 测试服验证。

## 命名规范

JS 文件名使用 snake_case：

```text
drop_announce.js
user_inout.js
runtime_addresses.js
```

启动函数使用 `start` + PascalCase：

```js
startDropAnnounce()
startUserInout()
```

防重复变量使用：

```js
g_drop_announce_started
g_user_inout_started
```

## 新增业务模块流程

```text
1. 在 script/js/ 新建 <feature>.js
2. 在 runtime_addresses.js 增加需要的地址
3. 在 JS 配置中增加 enable_<feature> = false
4. 在 startup_modules.js 注册模块
5. 在模块中实现 startXxx(cfg, addresses)
6. 增加防重复 hook
7. 增加中文注释
8. 本地运行 node --check
9. 写测试清单
```

## Review 检查清单

- 是否有裸地址散落在业务模块。
- 是否默认关闭。
- 是否有重复 hook 防护。
- 是否有 try/catch。
- 是否在 hook 热路径中做了重操作。
- 是否误用了真实地址占位。
- 是否修改了入口文件业务逻辑。
- 是否影响其他模块启动顺序。
