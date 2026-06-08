-- 经验副本 / 泡点模块
--
-- 每分钟遍历在线玩家，在指定副本中给予经验和代币奖励。
-- 依赖 online.lua 获取在线玩家列表。

local M = {}

local online_module = nil
local logger = nil
local timer = nil

-- 可配置参数
local dungeon_id = 5000
local level_cap = 90
local exp_percent = 0.01
local token_amount = 60
local interval_ms = 60000

-- 定时器回调：遍历在线玩家，在指定副本中给予奖励
local function on_timer()
    if not online_module then
        return
    end

    online_module.each(function(entry)
        if not entry.user then
            return
        end

        local user = entry.user

        -- 等级上限检查
        if user:GetCharacLevel() >= level_cap then
            return
        end

        -- 副本检查
        local party = user:GetParty()
        if not party then
            return
        end

        local dungeon = party:GetDungeon()
        if not dungeon then
            return
        end

        if dungeon:GetIndex() == dungeon_id then
            user:AddCharacExpPercent(exp_percent)
            user:ChargeCeraPoint(token_amount)
            user:SendNotiPacketMessage(
                string.format("经验增加：%.0f%%  代币增加：%d", exp_percent * 100, token_amount), 14)
            if logger then
                logger.info("[exp_dungeon][reward] acc=%d chr=%d dungeon=%d exp=%.2f%% token=%d",
                    user:GetAccId(), user:GetCharacNo(), dungeon_id, exp_percent * 100, token_amount)
            end
        end
    end)
end

local function stop_timer()
    if not timer then
        return
    end

    local ok, err = pcall(function()
        timer:stop()
        if type(timer.close) == "function" then
            timer:close()
        end
    end)

    if not ok and logger then
        logger.error("[exp_dungeon] failed to stop timer: %s", tostring(err))
    end

    timer = nil
end

function M.setup(ctx, deps)
    online_module = deps and deps.online
    logger = ctx.logger

    local config = ctx.config or {}
    local exp_cfg = config.exp_dungeon or {}

    dungeon_id = tonumber(exp_cfg.dungeon_id) or 5000
    level_cap = tonumber(exp_cfg.level_cap) or 90
    exp_percent = tonumber(exp_cfg.exp_percent) or 0.01
    token_amount = tonumber(exp_cfg.token_amount) or 60
    interval_ms = tonumber(exp_cfg.interval_ms) or 60000

    if not online_module then
        if logger then
            logger.warn("[exp_dungeon] online module not available, timer not started")
        end
        return M
    end

    if timer then
        if logger then
            logger.info("[exp_dungeon] timer already started, keep existing timer dungeon=%d level_cap=%d interval=%dms",
                dungeon_id, level_cap, interval_ms)
        end
        return M
    end

    local ok_luv, luv = pcall(require, "luv")
    if not ok_luv then
        if logger then
            logger.error("[exp_dungeon] luv module not available, timer not started")
        end
        return M
    end

    timer = luv.new_timer()
    timer:start(interval_ms, interval_ms, on_timer)
    if logger then
        logger.info("[exp_dungeon] timer started dungeon=%d level_cap=%d exp=%.2f%% token=%d interval=%dms",
            dungeon_id, level_cap, exp_percent * 100, token_amount, interval_ms)
    end

    return M
end

function M.stop(ctx)
    logger = logger or (ctx and ctx.logger) or nil
    stop_timer()
    if logger then
        logger.info("[exp_dungeon] stopped")
    end
end

return M
