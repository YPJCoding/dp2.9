# dp2.9 架构说明

本文档记录 `dp2.9` 的真实加载链路、文件职责和后续重构边界。

## 1. 真实加载链路

DP 插件实际运行链路如下：

```text
LD_PRELOAD=/dp2/libdp2pre.so
  ↓
/dp2/libdp2.xml
  ↓
/dp2/df_game_r.lua
  ↓ frida.load(...)
/dp2/df_game_r.js
```

`frida.js` 不是 DP 默认加载文件。若仓库中出现 `frida.js`，只能视为外部参考脚本或迁移素材，不能默认认为它参与 DP 运行。

## 2. `libdp2.xml`

`libdp2.xml` 是 DP2 的加载声明，核心职责是：

- 声明目标进程：`df_game_r`
- 加载必要依赖：`libuv.so`、`libffi.so.8`、`liblua53.so`、`luv.so`
- 指定 Lua 入口：`/dp2/df_game_r.lua`
- 指定游戏插件库：`/dp2/lib/libdp2game.so`

后续如果改目录结构，必须先确认 `libdp2.xml` 的路径仍然一致。

## 3. `df_game_r.lua`

`df_game_r.lua` 是主业务入口，适合承载 DPX 层能直接完成的功能。

当前主要职责：

- 初始化 `dp` / `dpx` / `game` / `world` / `logger`
- 加载 `df.frida`
- 定义 `on_frida_call`，提供 JS -> Lua/DP 的回调入口
- 定义 `item_handler`，按 item_id 分发使用道具后的业务逻辑
- 注册 `UseItem2` hook
- 启用 DPX 功能开关

适合放在 Lua 层的功能：

- 道具券逻辑
- 任务清理
- 职业/觉醒/转职任务处理
- 背包、宠物、时装清理
- 装备继承
- DPX 已封装好的补丁开关

不建议继续堆在 Lua 入口里的内容：

- 大量原生地址声明
- 复杂 Frida Hook
- 长篇 SQL 字符串
- 多个活动系统的完整状态机

这些应拆到 `script/` 下的模块或放到 JS 层。

## 4. `df_game_r.js`

`df_game_r.js` 是 DP Frida 侧入口，适合处理必须依赖 JS/Frida 的功能。

适合放在 JS 层的功能：

- 原生函数地址声明
- Interceptor attach/replace
- 需要读取/修改内存的逻辑
- 需要 Hook 原始服务端函数的逻辑
- Lua/DPX 暂时无法覆盖的功能

注意事项：

- 所有地址都和服务端版本强绑定。
- Hook 入口应尽量可开关、可日志追踪。
- 不应把未使用的 NativeFunction 长期堆在主文件里。
- 高风险 Hook 应单独标注功能、版本、风险和关闭方式。

## 5. `script/` 目录建议

后续建议逐步把业务逻辑拆到 `script/` 目录：

```text
script/
  config.lua
  handlers/
    quest.lua
    job.lua
    item_cleanup.lua
    inherit.lua
    pvp.lua
    misc.lua
```

其中：

- `config.lua`：集中配置功能开关。
- `handlers/quest.lua`：主线、普通、每日、成就任务清理。
- `handlers/job.lua`：职业转换、转职任务、觉醒券。
- `handlers/item_cleanup.lua`：宠物、时装、装备清理。
- `handlers/inherit.lua`：装备继承。
- `handlers/pvp.lua`：PVP 经验、胜点等。
- `handlers/misc.lua`：其他低频道具券。

## 6. 从 `dp2` 仓库吸收内容的原则

`YPJCoding/dp2` 可以作为参考仓库，但不能直接覆盖 `dp2.9`。

可吸收：

- README 中的部署说明
- `df_game_r.lua` 中的热加载思路
- `Work_Reload.lua` 中成熟的 GM/运营功能
- `df_game_r.js` 中有用的工具函数或 Hook 思路

不直接吸收：

- 与真实加载链路无关的孤立 `frida.js`
- 未确认版本地址的 Hook
- 未拆分、不可开关的大段业务代码
- 硬编码账号、密码、路径的实现

## 7. 风险分级

高风险功能：

- 直接 SQL 修改角色数据
- 删除宠物、时装、装备
- 修改职业、觉醒、任务完成状态
- 关闭服务端安全机制
- 解除交易、拍卖行限制
- 直接内存写入或函数替换

中风险功能：

- 发奖、发物品、发点券
- 自动完成任务
- 自动分解/清理背包
- 修改副本进入限制

低风险功能：

- 日志输出
- 上线提示
- 查询类命令
- 只读状态检查

## 8. 当前重构目标

短期目标：

1. 建立文档，明确真实加载链路。
2. 给功能加配置开关。
3. 拆分 `item_handler`。
4. 清理 `df_game_r.js` 中未使用或风险不明的内容。

长期目标：

1. `df_game_r.lua` 只做入口和模块装配。
2. 业务逻辑模块化。
3. JS Hook 可配置、可审计、可回滚。
4. 每个高风险功能都有注释和关闭方式。
