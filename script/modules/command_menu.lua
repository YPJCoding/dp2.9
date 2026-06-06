-- 指令菜单模块
--
-- 迁移自旧 dp2 Work_Reload.lua 的 //指令 菜单入口。
-- 新实现只展示当前已迁移/已开放的安全命令，避免误导玩家使用尚未迁移或高风险命令。

local M = {}

local logger = nil
local game = nil
local command = "//指令"
local is_hook_registered = false

local function send_lines(user, lines)
    for _, line in ipairs(lines) do
        user:SendNotiPacketMessage(line, 14)
    end
end

local function build_menu(config)
    local features = config.features or {}
    local player_info = config.player_info or {}
    local signin = config.signin or {}

    local lines = {
        "——————————指令开始——————————",
    }

    if features.enable_player_info == true then
        table.insert(lines, string.format("功能：个人信息  指令：%s", tostring(player_info.command or "//myinfo")))
    end

    if features.enable_item_query == true then
        table.insert(lines, "功能：查询帮助  指令：//view")
        table.insert(lines, "功能：查询物品代码  指令：//viewid <物品名称>")
        table.insert(lines, "功能：查询物品名称  指令：//viewname <物品ID>")
    end

    if features.enable_signin == true then
        table.insert(lines, string.format("功能：每日签到  指令：%s", tostring(signin.command or "//qd")))
    else
        table.insert(lines, "功能：每日签到  状态：暂未开放")
    end

    table.insert(lines, "——————————功能说明——————————")
    table.insert(lines, "任务清理：请使用已迁移的任务清理道具券")
    table.insert(lines, "职业/觉醒/转职：请使用已迁移的职业相关道具券")
    table.insert(lines, "装备继承：请使用已迁移的装备继承道具券")
    table.insert(lines, "PVP 经验：请使用 PVP 经验书，道具受风险开关控制")

    table.insert(lines, "——————————暂未开放——————————")
    table.insert(lines, "充值、发物品、改库、清背包等 GM 指令尚未开放")
    table.insert(lines, "——————————指令结束——————————")

    return lines
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

    local config = M.config or {}
    send_lines(user, build_menu(config))

    if logger then
        logger.info("[command_menu] show acc=%d chr=%d command=%s", user:GetAccId(), user:GetCharacNo(), tostring(command))
    end

    return 0
end

function M.setup(ctx)
    logger = ctx.logger
    game = ctx.game
    M.config = ctx.config or {}

    local menu_config = M.config.command_menu or {}
    command = tostring(menu_config.command or "//指令")

    if not is_hook_registered then
        ctx.dpx.hook(game.HookType.GmInput, on_gm_input)
        is_hook_registered = true
        if logger then
            logger.info("[command_menu] registered GmInput hook command=%s", tostring(command))
        end
    elseif logger then
        logger.info("[command_menu] setup skipped hook registration command=%s", tostring(command))
    end

    return M
end

return M
