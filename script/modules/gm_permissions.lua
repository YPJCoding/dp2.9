-- GM 权限判断模块
--
-- 提供 is_gm(user) 接口，通过游戏内置 CUser::IsGmMode() 自动判断 GM 权限。
-- 无需手动维护白名单。

local M = {}

function M.setup(ctx)
    if ctx.logger then
        ctx.logger.info("[gm_permissions] initialized (auto-detect via CUser::IsGmMode)")
    end
    return M
end

-- 判断用户是否为 GM。
-- 使用游戏内置的 CUser::IsGmMode()，由服务端 GM 数据库自动决定。
function M.is_gm(user)
    if not user then
        return false
    end
    return user:IsGmMode() == true
end

return M
