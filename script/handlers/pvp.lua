-- PVP 相关道具 handler 模板
--
-- 当前文件仅提供模块边界，暂不注册任何现有业务逻辑。

local M = {}

function M.register(item_handler, ctx)
    -- 后续迁移：
    -- - PVP 经验书
    -- - 胜点/决斗等级相关功能
    --
    -- 注意：当前 PVP 经验逻辑依赖 io.popen 执行 shell 脚本，属于 [RISK:HIGH]，应受 config.risk.enable_shell_handlers 控制。
end

return M
