-- 玩家个人信息指令模块
--
-- 迁移自旧 dp2 Work_Reload.lua 的 //myinfo 指令。
-- 只读取当前角色信息，不修改数据，不发放奖励。

local M = {}

local logger = nil
local game = nil
local command = "//myinfo"
local is_hook_registered = false

local function safe_call(fn, fallback)
    local ok, result = pcall(fn)
    if ok then
        return result
    end
    return fallback
end

local function handle_myinfo(user)
    local acc_id = safe_call(function() return user:GetAccId() end, "未知")
    local charac_no = safe_call(function() return user:GetCharacNo() end, "未知")
    local charac_name = safe_call(function() return user:GetCharacName() end, "未知")
    local level = safe_call(function() return user:GetCharacLevel() end, "未知")
    local job = safe_call(function() return user:GetCharacJob() end, "未知")
    local grow_type = safe_call(function() return user:GetCharacGrowType() end, "未知")
    local expert_job = safe_call(function() return user:GetCurCharacExpertJobType() end, "未知")
    local fatigue = safe_call(function() return user:GetFatigue() end, "未知")

    user:SendNotiPacketMessage(string.format(
        "——————————个人信息——————————\n账号编号：%s\n角色编号：%s\n角色姓名：%s\n角色等级：%s\n职业编号：%s\n转职编号：%s\n副职编号：%s\n已用疲劳：%s",
        tostring(acc_id),
        tostring(charac_no),
        tostring(charac_name),
        tostring(level),
        tostring(job),
        tostring(grow_type),
        tostring(expert_job),
        tostring(fatigue)
    ), 14)

    if logger then
        logger.info("[player_info][myinfo] acc=%s chr=%s name=%s level=%s job=%s grow=%s expert=%s fatigue=%s",
            tostring(acc_id),
            tostring(charac_no),
            tostring(charac_name),
            tostring(level),
            tostring(job),
            tostring(grow_type),
            tostring(expert_job),
            tostring(fatigue)
        )
    end
end

local function on_gm_input(fnext, _user, input)
    if not input or type(input) ~= "string" then
        return fnext()
    end

    if input ~= command then
        return fnext()
    end

    local user = game.fac.user(_user)
    if not user then
        return fnext()
    end

    handle_myinfo(user)
    return 0
end

function M.setup(ctx)
    logger = ctx.logger
    game = ctx.game

    local config = ctx.config or {}
    local info_config = config.player_info or {}
    command = tostring(info_config.command or "//myinfo")

    if not is_hook_registered then
        ctx.dpx.hook(game.HookType.GmInput, on_gm_input)
        is_hook_registered = true
        if logger then
            logger.info("[player_info] registered GmInput hook command=%s", tostring(command))
        end
    elseif logger then
        logger.info("[player_info] setup skipped hook registration command=%s", tostring(command))
    end

    return M
end

return M
