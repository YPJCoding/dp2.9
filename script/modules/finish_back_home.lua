-- 翻牌回城模块
--
-- 副本完成后：按配置模式发放随机点券，并可选自动回城/分解/出售。
-- 模式通过配置控制：0=完全关闭，1=奖励+回城，2=奖励+诺顿分解+回城，3=奖励+玩家分解机+回城，4=奖励+出售+回城，5=仅奖励。
-- 依赖 online.lua（模式3查找在线玩家分解机）。
-- 测试服可通过 hot_reload 监听 config.lua 后调用 M.configure(...) 动态切换模式，无需重复注册 GameEvent hook。

local M = {}

local logger = nil
local game = nil
local online_module = nil
local world = nil
local dpx = nil
local is_hook_registered = false

-- 当前模式：0=关 1=回城 2=诺顿分解 3=在线玩家分解机 4=出售 5=仅奖励
local mode = "0"
local point_min = 100
local point_max = 1000

local function normalize_mode(value)
    local value_str = tostring(value or "0")
    if value_str == "0" or value_str == "1" or value_str == "2" or value_str == "3" or value_str == "4" or value_str == "5" then
        return value_str
    end
    return "0"
end

local function normalize_points(min_value, max_value)
    local min_n = tonumber(min_value) or 100
    local max_n = tonumber(max_value) or 1000

    if min_n < 0 then
        min_n = 0
    end
    if max_n < min_n then
        max_n = min_n
    end

    return math.floor(min_n), math.floor(max_n)
end

-- 执行分解操作（背包槽位 9-56）
local function exec_disjoint(user, callee)
    local q = 0
    for i = 9, 56, 1 do
        local info = dpx.item.info(user.cptr, game.ItemSpace.INVENTORY, i)
        if info then
            user:Disjoint(game.ItemSpace.INVENTORY, i, callee)
            if not dpx.item.info(user.cptr, game.ItemSpace.INVENTORY, i) then
                q = q + 1
            end
        end
    end

    if q > 0 then
        user:SendItemSpace(game.ItemSpace.INVENTORY)
        user:SendNotiPacketMessage(
            string.format("分解成功，%d件装备已分解", q), 14)
        if logger then
            logger.info("[finish_back_home][disjoint] acc=%d chr=%d count=%d",
                user:GetAccId(), user:GetCharacNo(), q)
        end
    end
end

-- 使用在线玩家分解机
local function disjoint_with_player(user)
    if not online_module then
        exec_disjoint(user, nil)
        return
    end

    local found = false
    online_module.each(function(entry)
        if found then return end
        if entry.user then
            local expert_obj = entry.user:GetCurCharacExpertJob()
            if expert_obj then
                exec_disjoint(user, entry.user)
                found = true
            end
        end
    end)

    if not found then
        exec_disjoint(user, nil)
    end
end

-- 出售装备（背包槽位 9-56）
local function sell_equipment(user)
    local q = 0
    for i = 9, 56, 1 do
        local info = dpx.item.info(user.cptr, game.ItemSpace.INVENTORY, i)
        if info then
            user:Sell(game.ItemSpace.INVENTORY, i, 1)
            if not dpx.item.info(user.cptr, game.ItemSpace.INVENTORY, i) then
                q = q + 1
            end
        end
    end

    if q > 0 then
        user:SendItemSpace(game.ItemSpace.INVENTORY)
        user:SendNotiPacketMessage(
            string.format("出售成功，%d件装备已出售", q), 14)
        if logger then
            logger.info("[finish_back_home][sell] acc=%d chr=%d count=%d",
                user:GetAccId(), user:GetCharacNo(), q)
        end
    end
end

local function reward_party(party)
    party:ForEachMember(function(user, pos)
        local point = math.random(point_min, point_max)
        user:ChargeCera(point)
        user:SendNotiPacketMessage(
            string.format("通关奖励%d点券", point), 14)
        if logger then
            logger.info("[finish_back_home][reward] acc=%d chr=%d point=%d mode=%s",
                user:GetAccId(), user:GetCharacNo(), point, tostring(mode))
        end
        return true
    end)
end

-- GameEvent hook 回调
local function on_game_event(fnext, event_type, _party, param)
    -- 只处理副本完成事件 PARTY_DUNGEON_FINISH = 7
    if event_type ~= 7 then
        return fnext()
    end

    -- mode=0 为完全关闭，不发点券、不回城、不分解/出售。
    if mode == "0" then
        return fnext()
    end

    local result = fnext()

    local party = game.fac.party(_party)
    if not party then
        return result
    end

    reward_party(party)

    if mode == "5" then
        return result
    elseif mode == "1" then
        party:ReturnToVillage()
    elseif mode == "2" or mode == "3" or mode == "4" then
        party:ForEachMember(function(user, pos)
            if mode == "2" then
                exec_disjoint(user, nil)
            elseif mode == "3" then
                disjoint_with_player(user)
            elseif mode == "4" then
                sell_equipment(user)
            end
            return true
        end)
        party:ReturnToVillage()
    else
        if logger then
            logger.warn("[finish_back_home] unknown mode=%s", tostring(mode))
        end
    end

    return result
end

function M.configure(cfg)
    cfg = cfg or {}

    local old_mode = mode
    local old_min = point_min
    local old_max = point_max

    mode = normalize_mode(cfg.default_mode or cfg.mode or mode)
    point_min, point_max = normalize_points(cfg.point_min or point_min, cfg.point_max or point_max)

    if logger then
        logger.info(
            "[finish_back_home] configured old_mode=%s new_mode=%s old_points=%d-%d new_points=%d-%d",
            tostring(old_mode),
            tostring(mode),
            old_min,
            old_max,
            point_min,
            point_max
        )
    end

    return {
        mode = mode,
        point_min = point_min,
        point_max = point_max,
    }
end

function M.get_config()
    return {
        mode = mode,
        point_min = point_min,
        point_max = point_max,
        is_hook_registered = is_hook_registered,
    }
end

function M.setup(ctx, deps)
    logger = ctx.logger
    game = ctx.game
    online_module = deps and deps.online
    world = ctx.world
    dpx = ctx.dpx

    local config = ctx.config or {}
    local fbh_cfg = config.finish_back_home or {}

    M.configure(fbh_cfg)

    if not is_hook_registered then
        ctx.dpx.hook(game.HookType.GameEvent, on_game_event)
        is_hook_registered = true

        if logger then
            logger.info("[finish_back_home] registered GameEvent hook mode=%s points=%d-%d",
                mode, point_min, point_max)
        end
    elseif logger then
        logger.info("[finish_back_home] setup skipped hook registration because hook is already registered mode=%s points=%d-%d",
            mode, point_min, point_max)
    end

    return M
end

return M
