-- clean runtime template example module
--
-- 示例模块：
-- - 展示 M.setup(ctx) 结构
-- - 展示如何读取 config
-- - 不包含任何真实业务逻辑

local M = {}

function M.setup(ctx)
    local config = ctx.config or {}
    local module_config = config.example_module or {}
    local logger = ctx.logger

    if logger then
        logger.info("[example_module] setup message=%s", tostring(module_config.message))
    end

    return M
end

return M
