-- clean runtime template Lua entry
--
-- 这是模板入口文件，只演示 dp2 Lua 侧的基础装配流程。
-- 不包含任何业务逻辑、道具 ID、SQL、发奖、删除或 GM 指令。
--
-- 使用方式：
-- 1. 在 script/config.lua 中开启需要的示例模块。
-- 2. 在 script/modules/ 下新增业务模块。
-- 3. 在 script/bootstrap.lua 中注册模块。
-- 4. 业务代码必须默认关闭，并通过配置显式开启。

local bootstrap = require("script.bootstrap")

local M = {}

function M.setup(ctx)
    ctx = ctx or {}
    bootstrap.setup(ctx)
    return M
end

return M
