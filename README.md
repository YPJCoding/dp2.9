# dp2.9

`dp2.9` 是一个以 DP2/DPX 为核心的 DNF 服务端插件底板。

本仓库当前以 `df_game_r.lua` 作为主要业务入口，并通过 DP 的 Frida 加载链路使用 `df_game_r.js`。仓库目标是保留一个相对干净、可维护、可逐步模块化的 DP 插件底板。

## 真实加载链路

```text
LD_PRELOAD=/dp2/libdp2pre.so
  ↓
libdp2.xml
  ↓
/dp2/df_game_r.lua
  ↓ frida.load(...)
/dp2/df_game_r.js
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
6. 先定编码规范和模块边界，再重构业务代码。

## TODO

### P0：底板规范与文档

- [x] 新建重构分支 `refactor/dp2-9-base`
- [x] 补充 `README.md`
- [x] 补充 `docs/ARCHITECTURE.md`
- [x] 补充 `docs/CODING_STANDARDS.md`
- [x] 修正 README 中真实加载链路的路径格式
- [x] 明确：DP 默认加载 `df_game_r.lua` 和 `df_game_r.js`，不加载 `frida.js`
- [ ] 审核编码规范是否需要调整

### P1：审查现有代码位置与职责

- [x] 审查 `df_game_r.lua` 中每段代码的位置是否合理
- [x] 审查 `df_game_r.js` 中每段代码的位置是否合理
- [x] 区分入口初始化、配置、工具函数、handler、hook、临时调试代码
- [x] 标记应保留在 Lua 层的逻辑
- [x] 标记应保留在 JS/Frida 层的逻辑
- [x] 标记应迁入配置文件的开关
- [x] 标记应拆成独立模块的业务逻辑

### P2：建立模板代码结构

- [x] 新增 `script/config.lua` 配置模板
- [x] 新增 `script/utils.lua` 工具函数模板
- [x] 新增 `script/bootstrap.lua` 装配模板
- [x] 新增 `script/handlers/` 目录结构
- [x] 新增 handler 模块模板
- [x] 定义 handler 注册约定
- [x] 定义 Lua 模块上下文 `ctx` 传参约定
- [x] 定义风险标记注释模板
- [x] 定义日志格式模板

### P3：重构 `df_game_r.lua`，尽量不改变行为

- [x] 梳理 `df_game_r.lua` 当前结构
- [x] 保留 `item_handler[item_id] = function(...)` 的主分发写法
- [x] 在 `script/config.lua` 中增加模块化 handler 总开关和分模块开关
- [x] 在 `script/bootstrap.lua` 中按配置开关控制模块注册，默认不注册新 handler
- [x] 在 `df_game_r.lua` 中安全接入 `bootstrap.setup(...)`，默认不注册新 handler
- [ ] 将配置开关从入口逻辑中抽离并接入 `script/config.lua`
- [x] 新增 `script/utils.lua` 工具函数模板
- [ ] 从 `df_game_r.lua` 移动工具函数到 `script/utils.lua` 并接入
- [x] 将任务相关 handler 迁移草稿写入 `script/handlers/quest.lua`
- [x] 将职业/转职/觉醒逻辑迁移草稿写入 `script/handlers/job.lua`
- [x] 将宠物/时装/装备清理逻辑迁移草稿写入 `script/handlers/item_cleanup.lua`
- [x] 将装备继承逻辑迁移草稿写入 `script/handlers/inherit.lua`
- [x] 将 PVP 经验逻辑迁移草稿写入 `script/handlers/pvp.lua`
- [ ] 将其他零散道具券逻辑拆到 `script/handlers/misc.lua`
- [ ] 在 `df_game_r.lua` 中统一加载 handler 模块
- [ ] 从 `df_game_r.lua` 移除已迁移的旧 handler 实现

### P4：审查和整理 `df_game_r.js`

- [x] 建立 `df_game_r.js` 初始审查和分组文档
- [ ] 梳理所有 NativeFunction 并生成逐函数索引
- [ ] 标记已使用 / 未使用函数
- [x] 标记版本强绑定风险
- [x] 标记高风险 Hook 区域
- [ ] 隔离临时调试代码
- [ ] 整理 JS -> Lua/DP 回调逻辑
- [x] 判断哪些 JS 功能可以迁回 Lua/DPX 层

### P5：从 `dp2` 仓库吸收可用经验

- [x] 对比 `dp2` 的 README 部署说明
- [x] 评估 `dp2` 的 Lua 热加载机制是否迁入 `dp2.9`
- [x] 评估 `Work_Reload.lua` 中可复用的 GM/运营功能
- [x] 评估 `dp2` 的 `df_game_r.js` 中可复用 Hook/工具函数
- [x] 明确 `frida.js` 仅作为参考，不作为 DP 默认加载文件

### P6：稳定性与安全整理

- [x] 新增 `docs/RISK_GUIDE.md` 风险治理说明
- [x] 在已迁移的部分 handler 草稿中增加风险注释和开关示例
- [ ] 给当前运行中的 `df_game_r.lua` 直接 SQL 操作增加注释和开关
- [ ] 给当前运行中的删除类功能增加二次保护或限制条件
- [ ] 给发奖/发物品功能增加日志
- [ ] 给高风险 DPX 开关接入配置并增加代码注释
- [ ] 补充常见问题 FAQ
- [x] 补充回滚原则

### P7：最终整理

- [ ] 更新 README 的目录结构说明
- [x] 更新 `docs/ARCHITECTURE.md`
- [x] 增加 `CHANGELOG.md`
- [x] 创建 Draft PR
- [ ] 合并 PR 回 `main`

## 文档

- [架构说明](docs/ARCHITECTURE.md)
- [编码规范](docs/CODING_STANDARDS.md)
- [初始代码审查记录](docs/CODE_REVIEW_NOTES.md)
- [P3 重构计划](docs/P3_REFACTOR_PLAN.md)
- [Handler 迁移对照表](docs/HANDLER_MIGRATION_MAP.md)
- [df_game_r.js 审查记录](docs/DF_GAME_R_JS_AUDIT.md)
- [df_game_r.js 索引草案](docs/DF_GAME_R_JS_INDEX.md)
- [dp2 参考仓库评估](docs/DP2_REFERENCE_NOTES.md)
- [风险治理说明](docs/RISK_GUIDE.md)
- [更新日志](CHANGELOG.md)
