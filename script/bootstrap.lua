-- clean runtime template bootstrap
--
-- 模板启动器：
-- - 加载 config
-- - 加载 logger
-- - 按配置加载示例模块
-- - 不包含任何真实业务逻辑

local M = {}

local logger = require("script.logger")
local config = require("script.config")

local modules = {
    {
        key = "example_module",
        feature = "enable_example_module",
        module = "script.modules.example_module",
    },
}

local function safe_require(module_name)
    local ok, mod = pcall(require, module_name)
    if not ok then
        logger.error("failed to require module=%s err=%s", module_name, tostring(mod))
        return nil
    end
    return mod
end

function M.setup(ctx)
    ctx = ctx or {}
    ctx.config = ctx.config or config
    ctx.logger = ctx.logger or logger

    local features = ctx.config.features or {}

    for _, item in ipairs(modules) do
        if features[item.feature] == true then
            local mod = safe_require(item.module)
            if mod and type(mod.setup) == "function" then
                local ok, err = pcall(mod.setup, ctx)
                if ok then
                    ctx.logger.info("loaded module=%s", item.module)
                else
                    ctx.logger.error("module setup failed module=%s err=%s", item.module, tostring(err))
                end
            else
                ctx.logger.error("module missing setup function: %s", item.module)
            end
        else
            ctx.logger.info("skipped module=%s", item.module)
        end
    end

    return M
end

return M
