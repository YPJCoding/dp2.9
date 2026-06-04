-- GM 权限判断模块
--
-- 提供 is_gm(user) 接口，供其他模块判断用户是否有 GM 权限。
-- 鉴权方式：账号 ID 白名单 > GM 等级检查。

local M = {}

local admin_accounts = {}
local min_gm_level = 1

function M.setup(ctx)
    local config = ctx.config or {}
    local gm_config = config.gm or {}
    local accounts = gm_config.admin_accounts or {}

    admin_accounts = {}
    for _, aid in ipairs(accounts) do
        admin_accounts[aid] = true
    end
    min_gm_level = gm_config.min_gm_level or 1

    if ctx.logger then
        ctx.logger.info("[gm_permissions] initialized, admin_count=%d min_gm_level=%d",
            #accounts, min_gm_level)
    end

    return M
end

-- 判断用户是否为 GM。
-- 先检查账号白名单，再检查游戏内 GM 等级。
function M.is_gm(user)
    if not user then
        return false
    end

    -- 账号 ID 白名单
    local aid = user:GetAccId()
    if admin_accounts[aid] then
        return true
    end

    -- GM 等级检查（预留，待确认 DPX API）
    -- local gm_level = user:GetGmLevel()
    -- if gm_level and gm_level >= min_gm_level then
    --     return true
    -- end

    return false
end

return M
