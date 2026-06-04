# dp2.9

`dp2.9` 是一个以 DP2/DPX 为核心的 DNF 服务端插件底板。

本仓库当前以 `df_game_r.lua` 作为轻量入口，并通过 DP 的 Frida 加载链路使用 `df_game_r.js`。仓库目标是保留一个相对干净、可维护、可逐步模块化的 DP 插件底板。

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

## 当前进度口径

README 中的 TODO 记录代码与文档重构任务；部署验收进度以 [动态路线图](docs/ROADMAP.md) 为准。

当前拆分为两个目标：

- 安全可部署版：高风险功能默认关闭，先验证服务器能启动和低/中风险功能可用。
- 完全功能恢复版：按需开启 SQL、删除、shell 类功能，并完成测试服验证。

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
    bootstrap.lua
    config.lua
    utils.lua
    handlers/
      quest.lua
      job.lua
      item_cleanup.lua
      inherit.lua
      pvp.lua
      misc.lua
```

## 启动方式

在启动 `df_game_r` 的命令前添加 `LD_PRELOAD`：

```shell
LD_PRELOAD=/dp2/libdp2pre.so ./df_game_r cain01 start &
```

一般只对普通频道加载，PK 频道是否加载按实际需要决定。

部署前请阅读：

- [动态路线图](docs/ROADMAP.md)
- [部署前检查清单](docs/DEPLOYMENT_CHECKLIST.md)
- [FAQ](docs/FAQ.md)

## 主要文件职责

### `libdp2.xml`

DP2 的加载配置，指定：

- 目标进程：`df_game_r`
- 依赖库：`libuv.so`、`libffi.so.8`、`liblua53.so`、`luv.so`
- Lua 入口：`/dp2/df_game_r.lua`
- 插件库：`/dp2/lib/libdp2game.so`

### `df_game_r.lua`

轻量主入口，负责：

- 加载 `dp`、`dpx`、`df.game`、`df.game.mgr.world`、`df.logger`
- 加载 `df.frida`
- 接入 `script/bootstrap.lua`
- 注册 `on_frida_call`，允许 JS 层回调 DP/Lua 逻辑
- 维护 `item_handler` 道具触发表
- 注册 `UseItem1` hook，处理普通右键消耗品
- 保留 `UseItem2` hook，兼容原入口和其他可能走 UseItem2 的道具
- 通过 `script/config.lua` 应用 DPX 启动配置

### `df_game_r.js`

DP Frida 侧入口，负责：

- 声明/封装原生函数地址
- 实现需要 JS/Frida 层处理的 Hook 或工具函数
- 在需要时通过 DP Frida bridge 调用 Lua/DP 能力

### `script/`

存放配置、工具函数、handler 模块和辅助脚本。

## 当前底板原则

1. 以 `dp2.9` 为主底板。
2. `dp2` 仓库只作为功能素材库，不直接整包覆盖。
3. 优先保留 `item_handler[item_id] = function(...)` 的主分发写法。
4. 新功能优先模块化，避免继续把所有逻辑堆在入口文件里。
5. 高风险功能默认关闭，必须通过配置显式开启。
6. 后续优先完成服务器烟测，再继续处理 JS 深度审查或完全功能恢复。

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

### P3：入口模块化与安全默认行为

- [x] 梳理 `df_game_r.lua` 当前结构
- [x] 保留 `item_handler[item_id] = function(...)` 的主分发写法
- [x] 在 `script/config.lua` 中增加模块化 handler 总开关和分模块开关
- [x] 在 `script/bootstrap.lua` 中按配置开关控制模块注册
- [x] 在 `df_game_r.lua` 中接入 `bootstrap.setup(...)`
- [x] 启用 `quest.lua` 模块，覆盖任务类旧 handler
- [x] 启用 `job.lua` 模块，覆盖觉醒/转职类旧 handler；SQL 职业转换默认关闭
- [x] 启用 `inherit.lua` 模块，覆盖装备继承券旧 handler
- [x] 启用 `misc.lua` 模块，覆盖跨界/异界重置/SQL misc；SQL misc 默认关闭
- [x] 启用 `item_cleanup.lua` 模块，覆盖宠物/时装/装备清理；删除类操作默认关闭
- [x] 启用 `pvp.lua` 模块，覆盖 PVP 经验书；shell 操作默认关闭
- [x] 将配置开关从入口逻辑中抽离并接入 `script/config.lua`
- [x] 新增 `script/utils.lua` 工具函数模板
- [x] 在 `script/utils.lua` 中提供旧全局工具函数兼容实现
- [x] 在 `script/bootstrap.lua` 中安装 legacy 工具函数兼容层
- [x] 从 `df_game_r.lua` 删除旧工具函数定义
- [x] 将任务相关 handler 迁移草稿写入 `script/handlers/quest.lua`
- [x] 将职业/转职/觉醒逻辑迁移草稿写入 `script/handlers/job.lua`
- [x] 将宠物/时装/装备清理逻辑迁移草稿写入 `script/handlers/item_cleanup.lua`
- [x] 将装备继承逻辑迁移草稿写入 `script/handlers/inherit.lua`
- [x] 将 PVP 经验逻辑迁移草稿写入 `script/handlers/pvp.lua`
- [x] 将低风险/中风险零散道具券迁入 `script/handlers/misc.lua`
- [x] 将 SQL 类零散道具券以默认关闭方式迁入 `script/handlers/misc.lua`
- [x] 在 `df_game_r.lua` 中统一加载全部 handler 模块
- [x] 从 `df_game_r.lua` 移除已迁移的旧 handler 实现

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
- [x] 建立 `dp2` 未迁移功能跟踪清单

### P6：稳定性与安全整理

- [x] 新增 `docs/RISK_GUIDE.md` 风险治理说明
- [x] 在已迁移的部分 handler 草稿中增加风险注释和开关示例
- [x] 给当前运行中的 `df_game_r.lua` 直接 SQL 操作增加注释和开关
- [x] 给当前运行中的删除类功能增加二次保护或限制条件
- [x] 给发奖/发物品/返还道具功能增加日志
- [x] 给高风险 DPX 开关接入配置并增加代码注释
- [x] 补充常见问题 FAQ
- [x] 补充回滚原则

### P7：最终整理

- [x] 更新 README 的目录结构说明
- [x] 更新 `docs/ARCHITECTURE.md`
- [x] 增加 `CHANGELOG.md`
- [x] 创建 Draft PR
- [ ] 合并 PR 回 `main`

### P8：服务器验收

- [x] 普通频道启动验证
- [x] 确认 bootstrap 日志正常
- [x] 确认 `frida.load` 正常
- [x] 确认 `Reach_GameWord` 登录 hook 正常
- [x] 确认 `UseItem1` 是普通右键消耗品入口
- [x] 在 `df_game_r.lua` 中正式接入 `UseItem1 -> item_handler` 分发
- [x] 保留 `UseItem2` hook 作为兼容入口
- [x] 关闭 1034-1037 临时 debug handler
- [x] 高风险 handler 默认拒绝并返还道具：代码级确认完成
- [ ] 高风险 handler 默认拒绝并返还道具：真实道具实测
- [ ] 根据服务器日志修正 require 路径或 API 差异

### P9：PVF 正式道具验证（后置）

当前 PVF 暂不添加 DP 正式道具，以下功能放到最后阶段验证：

- [ ] 添加并验证 `2021458802` 主线任务清理
- [ ] 添加并验证 `2021458808` 每日任务清理
- [ ] 添加并验证 `2021458809` 成就任务清理
- [ ] 添加并验证 `2021458804` 异界 E2 重置
- [ ] 添加并验证 `2021458805` 异界 E3 重置
- [ ] 添加并验证 `2022110505` 装备继承

### P10：从 dp2 逐步迁移未吸收功能

详见 [dp2 未迁移功能清单](docs/DP2_UNMIGRATED_FEATURES.md)。

优先顺序：

- [ ] `online.lua`：在线玩家表、上线/下线记录
- [ ] `broadcast.lua`：全服消息，带频率限制
- [ ] `gm_permissions.lua`：GM 权限判断
- [ ] `item_query.lua`：物品查询 GM 指令
- [ ] `hot_reload.lua`：测试服热加载，默认关闭
- [ ] `dungeon_gate.lua`：持物进图
- [ ] `drop_rules.lua`：等级差限制掉落
- [ ] `exp_dungeon.lua`：经验副本 / 泡点
- [ ] `finish_back_home.lua`：翻牌回城 / 自动处理
- [ ] 801xx 运营道具系列
- [ ] 高风险 GM / JS 功能

## 文档

- [架构说明](docs/ARCHITECTURE.md)
- [编码规范](docs/CODING_STANDARDS.md)
- [初始代码审查记录](docs/CODE_REVIEW_NOTES.md)
- [P3 重构计划](docs/P3_REFACTOR_PLAN.md)
- [动态路线图](docs/ROADMAP.md)
- [服务器烟测记录](docs/SERVER_SMOKE_TEST.md)
- [dp2 未迁移功能清单](docs/DP2_UNMIGRATED_FEATURES.md)
- [代码自检记录](docs/CODE_SELF_CHECK.md)
- [Handler 迁移对照表](docs/HANDLER_MIGRATION_MAP.md)
- [df_game_r.js 审查记录](docs/DF_GAME_R_JS_AUDIT.md)
- [df_game_r.js 索引草案](docs/DF_GAME_R_JS_INDEX.md)
- [dp2 参考仓库评估](docs/DP2_REFERENCE_NOTES.md)
- [风险治理说明](docs/RISK_GUIDE.md)
- [部署前检查清单](docs/DEPLOYMENT_CHECKLIST.md)
- [FAQ](docs/FAQ.md)
- [更新日志](CHANGELOG.md)
