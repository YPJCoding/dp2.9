-- 低风险帮助菜单模块
--
-- 迁移旧 dp2 中部分 GMInput 帮助入口，但只展示说明文本。
-- 不迁移实际改库、发物品、清任务、shell 等高风险子命令。

local M = {}

local logger = nil
local game = nil
local commands = {}
local is_hook_registered = false

local function send_lines(user, lines)
    for _, line in ipairs(lines) do
        user:SendNotiPacketMessage(line, 14)
    end
end

local help_map = {
    getq = function()
        return {
            "——————————任务相关——————————",
            "旧指令 //getqM 可强制接取任务，存在炸角色风险，当前未开放。",
            "旧指令 //clearq* 可清理任务，当前未开放聊天指令。",
            "如需任务处理，请优先使用已迁移的任务清理道具券。",
        }
    end,

    zhiye = function()
        return {
            "——————————职业相关——————————",
            "旧指令 //job / //grow / //wake 会修改职业、转职、觉醒状态。",
            "这些聊天改库入口当前未开放。",
            "如需职业/觉醒处理，请优先使用已迁移的职业/觉醒道具券。",
        }
    end,

    trans = function()
        return {
            "——————————装备继承——————————",
            "旧聊天指令 //transall / //transua / //transe / //transs 当前未开放。",
            "装备继承功能已迁移为道具券 handler。",
            "请使用装备继承券，并在背包装备栏第 1 / 第 2 格放入正确装备。",
        }
    end,

    pvp = function()
        return {
            "——————————决斗信息——————————",
            "旧指令 //pvpg / //pvpe / //pvpp / //pvpw / //pvpl 会直接修改 PVP 数据。",
            "这些聊天改库入口当前未开放。",
            "PVP 经验书 handler 已迁移，但受 risk.enable_shell_handlers 和 risk.enable_sql_handlers 控制。",
        }
    end,
}

local function normalize_commands(config)
    local input = (config and config.command_help) or {}
    return {
        getq = tostring(input.getq_command or "//getq"),
        zhiye = tostring(input.zhiye_command or "//zhiye"),
        trans = tostring(input.trans_command or "//trans"),
        pvp = tostring(input.pvp_command or "//pvp"),
    }
end

local function on_gm_input(fnext, _user, input)
    if not input or type(input) ~= "string" then
        return fnext()
    end

    local help_key = nil
    for key, command in pairs(commands) do
        if input == command then
            help_key = key
            break
        end
    end

    if not help_key then
        return fnext()
    end

    local user = game.fac.user(_user)
    if not user then
        return fnext()
    end

    local builder = help_map[help_key]
    if builder then
        send_lines(user, builder())
        if logger then
            logger.info("[command_help] show key=%s acc=%d chr=%d", tostring(help_key), user:GetAccId(), user:GetCharacNo())
        end
        return 0
    end

    return fnext()
end

function M.setup(ctx)
    logger = ctx.logger
    game = ctx.game
    commands = normalize_commands(ctx.config or {})

    if not is_hook_registered then
        ctx.dpx.hook(game.HookType.GmInput, on_gm_input)
        is_hook_registered = true
        if logger then
            logger.info(
                "[command_help] registered GmInput hook getq=%s zhiye=%s trans=%s pvp=%s",
                tostring(commands.getq),
                tostring(commands.zhiye),
                tostring(commands.trans),
                tostring(commands.pvp)
            )
        end
    elseif logger then
        logger.info("[command_help] setup skipped hook registration")
    end

    return M
end

return M
