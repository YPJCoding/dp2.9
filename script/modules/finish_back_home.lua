-- 翻牌回城模块
--
-- 副本完成后：随机点券奖励 + 可选的自动回城/分解/出售。
-- 模式通过 //finishBackHome<mode> 指令切换。
-- 依赖 online.lua（模式3查找在线玩家分解机）。

local M = {}

local logger = nil
local game = nil
local online_module = nil
local world = nil
local dpx = nil

-- 当前模式：0=关 1=回城 2=诺顿分解 3=在线玩家分解机 4=出售
local mode = "0"
local point_min = 100
local point_max = 1000

function M.setup(ctx, deps)
    logger = ctx.logger
    game = ctx.game
    online_module = deps and deps.online
    world = ctx.world
    dpx = ctx.dpx

    local config = ctx.config or {}
    local fbh_cfg = config.finish_back_home or {}

    mode = fbh_cfg.default_mode or "0"
    point_min = fbh_cfg.point_min or 100
    point_max = fbh_cfg.point_max or 1000

    ctx.dpx.hook(game.HookType.GameEvent, on_game_event)

    if logger then
        logger.info("[finish_back_home] registered GameEvent hook mode=%s points=%d-%d",
            mode, point_min, point_max)
    end

    return M
end

-- GameEvent hook 回调
local function on_game_event(fnext, event_type, _party, param)
    -- 只处理副本完成事件 PARTY_DUNGEON_FINISH = 7
    if event_type ~= 7 then
        return fnext()
    end

    fnext()

    local party = game.fac.party(_party)
    if not party then
        return fnext()
    end

    -- 随机点券奖励（所有模式都发放）
    party:ForEachMember(function(user, pos)
        local point = math.random(point_min, point_max)
        user:ChargeCera(point)
        user:SendNotiPacketMessage(
            string.format("通关奖励%d点券", point), 14)
        return true
    end)

    -- 模式处理
    if mode == "0" then
        -- 无操作
    elseif mode == "1" then
        party:ReturnToVillage()
    elseif mode == "2" or mode == "3" or mode == "4" then
        party:ForEachMember(function(user, pos)
            if mode == "2" then
                -- 诺顿分解（callee=nil）
                exec_disjoint(user, nil)
            elseif mode == "3" then
                -- 在线玩家分解机
                disjoint_with_player(user)
            elseif mode == "4" then
                -- 出售装备
                sell_equipment(user)
            end
            return true
        end)
        party:ReturnToVillage()
    end

    return fnext()
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
        -- 找不到在线分解机，回退诺顿
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

return M
