-- clean runtime template example handler
--
-- 示例 handler：
-- - 只展示注册结构
-- - 不绑定真实 item_id
-- - 不执行发奖、删物品、SQL、shell

local M = {}

function M.register(item_handler, ctx)
    local logger = ctx and ctx.logger

    if not item_handler then
        if logger then
            logger.error("[example_handler] missing item_handler")
        end
        return
    end

    if logger then
        logger.info("[example_handler] register called, no real item id is bound")
    end
end

return M
