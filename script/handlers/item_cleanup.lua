-- 宠物、时装、装备清理相关道具 handler 模板
--
-- 当前文件仅提供模块边界，暂不注册任何现有业务逻辑。

local M = {}

function M.register(item_handler, ctx)
    -- 后续迁移：
    -- - 宠物清理券
    -- - 时装清理券
    -- - 装备分解/清理券
    --
    -- 注意：删除类功能属于 [RISK:HIGH]，应受 config.risk.enable_delete_handlers 控制。
end

return M
