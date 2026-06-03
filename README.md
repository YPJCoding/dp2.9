# dp2.9

`dp2.9` 是一个以 DP2/DPX 为核心的 DNF 服务端插件底板。

本仓库当前以 `df_game_r.lua` 作为主要业务入口，并通过 DP 的 Frida 加载链路使用 `df_game_r.js`。仓库目标是保留一个相对干净、可维护、可逐步模块化的 DP 插件底板。

## 真实加载链路

```text
LD_PRELOAD=/dp2/libdp2pre.so
  ↓
libdp2.xml
  ↓
/ dp2/df_game_r.lua
  ↓ frida.load(...)
/ dp2/df_game_r.js
```

> 注意：`frida.js` 不是 DP 默认加载文件。DP 默认关注的是 `df_game_r.lua` 和 `df_game_r.js`。

## 文件放置

将整个 `dp2` 目录放到服务端根目录，例如：

```text
/dp2
  libdp2.xml
  libdp2pre.so
  libdp2.so
  df_game_r.lua
  df_game_r.js
  lib/
  lua/
  script/
```

## 启动方式

在启动 `df_game_r` 的命令前添加 `LD_PRELOAD`：

```shell
LD_PRELOAD=/dp2/libdp2pre.so ./df_game_r cain01 start &
```

一般只对普通频道加载，PK 频道是否加载按实际需要决定。

## 主要文件职责

### `libdp2.xml`

DP2 的加载配置，指定：

- 目标进程：`df_game_r`
- 依赖库：`libuv.so`、`libffi.so.8`、`liblua53.so`、`luv.so`
- Lua 入口：`/dp2/df_game_r.lua`
- 插件库：`/dp2/lib/libdp2game.so`

### `df_game_r.lua`

主业务入口，负责：

- 加载 `dp`、`dpx`、`df.game`、`df.game.mgr.world`、`df.logger`
- 加载 `df.frida`
- 注册 `on_frida_call`，允许 JS 层回调 DP/Lua 逻辑
- 维护 `item_handler` 道具触发表
- 注册 `UseItem2` hook
- 启用 DPX 补丁开关

### `df_game_r.js`

DP Frida 侧入口，负责：

- 声明/封装原生函数地址
- 实现需要 JS/Frida 层处理的 Hook 或工具函数
- 在需要时通过 DP Frida bridge 调用 Lua/DP 能力

### `script/`

存放辅助脚本，例如 PVP 经验脚本、后续拆分出来的 handler 模块、配置文件等。

## 当前底板原则

1. 以 `dp2.9` 为主底板。
2. `dp2` 仓库只作为功能素材库，不直接整包覆盖。
3. 优先保留 `df_game_r.lua` 中的 `item_handler` 写法。
4. 新功能优先模块化，避免继续把所有逻辑堆在入口文件里。
5. 所有高风险功能必须有清晰注释，后续逐步接入配置开关。

## 后续整理方向

优先级从高到低：

```text
P0：补 README / 架构文档
P1：梳理 df_game_r.lua 结构
P2：拆分 item_handler
P3：增加 script/config.lua 功能开关
P4：审查 df_game_r.js 未使用函数和高风险 Hook
P5：从 dp2 仓库吸收成熟 GM/运营功能
```
