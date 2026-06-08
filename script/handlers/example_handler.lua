-- clean runtime template example handler
--
-- 示例 handler：
-- - 只展示注册结构
-- - 不绑定真实项目标识
-- - 不包含真实业务逻辑

local M = {}

function M.register(handler_table, ctx)
    local logger = ctx and ctx.logger

    if not handler_table then
        if logger then
            logger.error("[example_handler] missing handler_table")
        end
        return
    end

    if logger then
        logger.info("[example_handler] register called, no real handler is bound")
    end
end

return M