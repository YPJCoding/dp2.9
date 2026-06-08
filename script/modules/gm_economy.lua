-- GM 经济命令模块
--
-- 迁移自旧 dp2 Work_Reload.lua 的经济类 GM 指令。
-- 通过 GmInput hook 拦截命令，仅迁移使用现有游戏 API 的命令；
-- 依赖 SQL 的旧命令本轮跳过。
--
-- 已迁移命令（兼容旧 dp2 格式）：
--   //czdq<X>   充值点券 (ChargeCera)
--   //czdb<X>   充值代币 (ChargeCeraPoint)
--   //czsd<X>   充值胜点 (GainWinPoint)
--
-- 暂缓迁移（旧实现依赖 SQL）：
--   //czsp<X>   充值 SP（旧实现：dpx.sqlexec）
--   //cztp<X>   充值 TP（旧实现：dpx.sqlexec）
--   //czqp<X>   充值 QP（旧实现：dpx.sqlexec）
--
-- 安全边界：
-- - 默认关闭，需 features.enable_gm_economy = true
-- - 仅 GM 可用
-- - 数值上限受 gm_economy 配置控制
-- - 不执行 SQL / shell / delete
-- - 不向其他玩家操作

local M = {}

local logger = nil
local game = nil
local dpx = nil
local gm_permissions = nil

local cfg = {}
local is_hook_registered = false

-- 规范化配置
local function normalize_config(input)
    input = input or {}
    return {
        max_cera = tonumber(input.max_cera) or 100000,
        max_point = tonumber(input.max_point) or 100000,
        max_win_point = tonumber(input.max_win_point) or 10000,
    }
end

-- 记录操作日志
local function log_op(user, currency, amount, result, detail)
    if not logger then
        return
    end
    logger.info(
        "[gm_economy] acc=%d chr=%d chr_name=%s currency=%s amount=%d result=%s detail=%s",
        user:GetAccId(),
        user:GetCharacNo(),
        user:GetCharacName(),
        tostring(currency),
        amount,
        tostring(result),
        tostring(detail or "")
    )
end

-- 显示帮助
local function handle_cz_help(user)
    user:SendNotiPacketMessage("——————————充值相关——————————", 14)
    user:SendNotiPacketMessage(string.format("//czdq<数量>  充值点券（最多 %d）", cfg.max_cera), 14)
    user:SendNotiPacketMessage(string.format("//czdb<数量>  充值代币（最多 %d）", cfg.max_point), 14)
    user:SendNotiPacketMessage(string.format("//czsd<数量>  充值胜点（最多 %d）", cfg.max_win_point), 14)
    user:SendNotiPacketMessage("SP/TP/QP 暂未迁移（旧实现依赖 SQL）。", 14)

    if logger then
        logger.info("[gm_economy][help] acc=%d chr=%d", user:GetAccId(), user:GetCharacNo())
    end
end

-- 校验并执行单一货币充值
-- 成功返回 true，失败返回 false 并发送提示
local function charge_currency(user, input, prefix, currency_name, api_func, max_amount)
    local amount_str = string.match(input, "^" .. prefix .. "(%d+)$")
    if not amount_str then
        user:SendNotiPacketMessage(
            string.format("——————————充值失败——————————\n指令格式错误，请输入 //cz 查看帮助。"),
            14)
        log_op(user, currency_name, 0, "invalid_format", "input=" .. tostring(input))
        return false
    end

    local amount = tonumber(amount_str)

    if not amount or amount <= 0 then
        user:SendNotiPacketMessage(
            string.format("——————————充值失败——————————\n数量无效，需为大于 0 的整数。"),
            14)
        log_op(user, currency_name, amount or 0, "invalid_amount", "input=" .. tostring(input))
        return false
    end

    if amount > max_amount then
        user:SendNotiPacketMessage(
            string.format("——————————充值失败——————————\n%s数量超过上限（最多 %d）。", currency_name, max_amount),
            14)
        log_op(user, currency_name, amount, "exceeded", "max=" .. tostring(max_amount))
        return false
    end

    local ok, err = pcall(function()
        api_func(user, amount)
    end)

    if ok then
        user:SendNotiPacketMessage(
            string.format("已充值 %d %s", amount, currency_name), 14)
        log_op(user, currency_name, amount, "success", "input=" .. tostring(input))
        return true
    else
        user:SendNotiPacketMessage(
            string.format("——————————充值失败——————————\n%s充值失败，请联系管理员。", currency_name), 14)
        log_op(user, currency_name, amount, "error", "err=" .. tostring(err or "unknown"))
        return false
    end
end

-- GmInput hook 回调
local function on_gm_input(fnext, _user, input)
    if not input or type(input) ~= "string" then
        return fnext()
    end

    local user = game.fac.user(_user)
    if not user then
        return fnext()
    end

    -- 未命中 //cz 前缀，透传
    if not string.match(input, "^//cz") then
        return fnext()
    end

    -- GM 权限检查
    if not gm_permissions or not gm_permissions.is_gm(user) then
        user:SendNotiPacketMessage("注意：你没有使用此功能的权限。", 14)
        if logger then
            logger.info("[gm_economy][reject] acc=%d chr=%d reason=not_gm input=%s",
                user:GetAccId(), user:GetCharacNo(), tostring(input))
        end
        return 0
    end

    -- //cz 帮助页面
    if input == "//cz" then
        handle_cz_help(user)
        return 0
    end

    -- //czdq<X> 充值点券
    if string.match(input, "^//czdq") then
        charge_currency(user, input, "//czdq", "点券", function(u, a) u:ChargeCera(a) end, cfg.max_cera)
        return 0
    end

    -- //czdb<X> 充值代币
    if string.match(input, "^//czdb") then
        charge_currency(user, input, "//czdb", "代币", function(u, a) u:ChargeCeraPoint(a) end, cfg.max_point)
        return 0
    end

    -- //czsd<X> 充值胜点
    if string.match(input, "^//czsd") then
        charge_currency(user, input, "//czsd", "胜点", function(u, a) u:GainWinPoint(a) end, cfg.max_win_point)
        return 0
    end

    -- //czsp / //cztp / //czqp：旧实现依赖 SQL，本轮不迁移
    if string.match(input, "^//czsp") or string.match(input, "^//cztp") or string.match(input, "^//czqp") then
        user:SendNotiPacketMessage("SP/TP/QP 充值暂未迁移（旧实现依赖 SQL，需评估后处理）。", 14)
        log_op(user, "sp_tp_qp", 0, "not_migrated", "input=" .. tostring(input))
        return 0
    end

    -- 其他 //cz 前缀命令，格式错误提示
    user:SendNotiPacketMessage("——————————充值失败——————————\n未知的充值指令，请输入 //cz 查看帮助。", 14)
    log_op(user, "unknown", 0, "invalid_command", "input=" .. tostring(input))
    return 0
end

function M.setup(ctx, deps)
    logger = ctx.logger
    game = ctx.game
    dpx = ctx.dpx
    gm_permissions = deps and deps.gm_permissions or nil

    local config = ctx.config or {}
    cfg = normalize_config(config.gm_economy)

    if not is_hook_registered then
        dpx.hook(game.HookType.GmInput, on_gm_input)
        is_hook_registered = true
        if logger then
            logger.info("[gm_economy] registered GmInput hook max_cera=%d max_point=%d max_win_point=%d",
                cfg.max_cera, cfg.max_point, cfg.max_win_point)
        end
    elseif logger then
        logger.info("[gm_economy] setup skipped hook registration")
    end

    return M
end

return M
