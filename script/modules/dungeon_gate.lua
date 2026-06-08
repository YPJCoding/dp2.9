-- 持物进图模块
--
-- 进入指定副本时检查队伍所有成员是否持有指定道具。
-- 使用 GameEvent hook 拦截 PARTY_DUNGEON_START 事件。

local M = {}

local logger = nil
local game = nil
local is_hook_registered = false
local rules = {}  -- {[dungeon_id] = {item_id, message}}

-- GameEvent hook 回调
-- 签名: function(fnext, type, _party, param) return fnext() end
local function on_game_event(fnext, event_type, _party, param)
    -- 只处理副本开始事件 PARTY_DUNGEON_START = 5
    if event_type ~= 5 then
        return fnext()
    end

    local dungeon_id = param and param.id
    local rule = rules[dungeon_id]
    if not rule then
        return fnext()
    end

    local party = game.fac.party(_party)
    if not party then
        return fnext()
    end

    local blocked = false

    party:ForEachMember(function(user, pos)
        local inven = user:GetCurCharacInvenR()
        if inven:CheckItemExist(rule.item_id) < 0 then
            user:SendNotiPacketMessage(rule.message, 14)
            blocked = true
            return false  -- 停止遍历
        end
        return true
    end)

    if blocked then
        if logger then
            logger.info("[dungeon_gate][blocked] dungeon=%d item=%d",
                dungeon_id, rule.item_id)
        end
        return 14  -- 错误码，阻止进入
    end

    return fnext()
end

function M.setup(ctx, deps)
    logger = ctx.logger
    game = ctx.game

    local config = ctx.config or {}
    local gate_cfg = config.dungeon_gate or {}
    local gate_rules = gate_cfg.rules or {}

    -- 解析规则：{dungeon_id = 5000, item_id = 80206, message = "..."}
    rules = {}
    for _, rule in ipairs(gate_rules) do
        local dungeon_id = tonumber(rule.dungeon_id)
        local item_id = tonumber(rule.item_id)
        if dungeon_id and item_id then
            rules[dungeon_id] = {
                item_id = item_id,
                message = rule.message or "持有特殊凭证才能进入此副本！",
            }
        end
    end

    if next(rules) ~= nil then
        if not is_hook_registered then
            ctx.dpx.hook(game.HookType.GameEvent, on_game_event)
            is_hook_registered = true
            if logger then
                logger.info("[dungeon_gate] registered GameEvent hook, rules=%d",
                    #gate_rules)
            end
        elseif logger then
            logger.info("[dungeon_gate] setup skipped hook registration, rules=%d", #gate_rules)
        end
    elseif logger then
        logger.info("[dungeon_gate] no rules configured, skip hook")
    end

    return M
end

return M
