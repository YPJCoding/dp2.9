-- 低风险帮助入口模块
--
-- 迁移旧 Work_Reload.lua 中部分 GM 指令的帮助入口：
-- //getq、//clearq、//zhiye、//trans、//pvp。
--
-- 注意：本模块只展示说明，不执行强制接任务、改库、改职业、shell、发物品等高风险逻辑。

local M = {}

local logger = nil
local game = nil
local commands = {}
local current_config = {}
local is_hook_registered = false

local function send_lines(user, lines)
    for _, line in ipairs(lines) do
        user:SendNotiPacketMessage(line, 14)
    end
end

local help_map = {
    getq = function()
        return {
            "——————————接取任务——————————",
            "旧指令 //getqM 会强制接取任务，当前暂未开放。",
            "原因：强制接取错误任务可能导致角色异常。",
            "当前建议：使用已迁移的任务相关道具券，或等待后续白名单方案。",
        }
    end,

    clearq = function()
        return {
            "——————————清理任务——————————",
            "旧聊天清任务指令 //clearq* 当前暂未开放。",
            "当前已迁移任务清理道具券：主线、支线/普通、每日、成就。",
            "请通过对应道具券触发，避免聊天指令误清任务。",
        }
    end,

    zhiye = function()
        return {
            "——————————职业相关——————————",
            "旧指令 //job / //grow / //wake 会修改职业、转职、觉醒状态。",
            "这些聊天改库入口当前未开放。",
            "当前已迁移职业相关道具券：觉醒券、转职任务券、女鬼剑职业转换券。",
            "SQL 类职业转换仍受 risk.enable_sql_handlers 控制，默认关闭。",
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
        local risk = current_config.risk or {}
        return {
            "——————————决斗信息——————————",
            "旧指令 //pvpg / //pvpe / //pvpp / //pvpw / //pvpl 会直接修改 PVP 数据。",
            "这些聊天改库入口当前未开放。",
            "PVP 经验书 handler 已迁移，但受 shell 与 SQL 风险开关控制。",
            string.format("当前风险开关：shell=%s sql=%s", tostring(risk.enable_shell_handlers == true), tostring(risk.enable_sql_handlers == true)),
            "未完成专项审计前，不建议同时开启 shell 与 SQL 风险开关。",
        }
    end,
}

local function normalize_commands(config)
    local input = (config and config.command_help) or {}
    return {
        getq = tostring(input.getq_command or "//getq"),
        clearq = tostring(input.clearq_command or "//clearq"),
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
    current_config = ctx.config or {}
    commands = normalize_commands(current_config)

    if not is_hook_registered then
        ctx.dpx.hook(game.HookType.GmInput, on_gm_input)
        is_hook_registered = true
        if logger then
            logger.info(
                "[command_help] registered GmInput hook getq=%s clearq=%s zhiye=%s trans=%s pvp=%s",
                tostring(commands.getq),
                tostring(commands.clearq),
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
