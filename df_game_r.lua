-- clean runtime template Lua entry
--
-- 这是模板入口文件，只演示 dp2 Lua 侧的基础装配流程。
-- 不包含真实项目逻辑或真实项目标识。
--
-- 使用方式：
-- 1. 按项目需要调整 script/config.lua。
-- 2. 在 script/modules/ 下新增模块。
-- 3. 在 script/bootstrap.lua 中注册模块。

local bootstrap = require("script.bootstrap")

local M = {}

function M.setup(ctx)
    ctx = ctx or {}
    bootstrap.setup(ctx)
    return M
end

return M