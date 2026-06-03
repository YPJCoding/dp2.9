-- 装备继承相关道具 handler 模板
--
-- 当前文件仅提供模块边界，暂不注册任何现有业务逻辑。

local M = {}

function M.register(item_handler, ctx)
    -- 后续迁移：
    -- - 装备继承券
    --
    -- 注意：装备继承会改变装备强化/增幅/附魔/锻造状态，建议标记为 [RISK:MEDIUM] 或 [RISK:HIGH]。
end

return M
