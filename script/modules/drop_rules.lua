-- 等级差限制掉落模块
--
-- 角色等级高于副本等级超过阈值时禁止掉落，持豁免道具可绕过。
-- 使用 CParty_DropItem hook。

local M = {}

local logger = nil
local game = nil
local level_gap = 20
local bypass_item_id = 80207
local message = "此副本等级过低，掉落物品已被系统收回！"

-- CParty_DropItem hook 回调
-- 签名: function(_party, monster_id) return boolean end
local function on_drop_item(_party, monster_id)
    local party = game.fac.party(_party)
    local dungeon = party:GetDungeon()
    if not dungeon then
        return true
    end

    local dungeon_level = dungeon:GetStandardLevel()
    local allow_drop = true

    party:ForEachMember(function(user, pos)
        local lv = user:GetCharacLevel()

        if lv - dungeon_level > level_gap then
            local inven = user:GetCurCharacInvenR()
            -- CheckItemExist: <0 表示不存在
            if inven:CheckItemExist(bypass_item_id) < 0 then
                user:SendNotiPacketMessage(message, 14)
                allow_drop = false
                return false  -- 停止遍历
            end
        end

        return true
    end)

    if not allow_drop and logger then
        logger.info("[drop_rules][blocked] dungeon=%d dungeon_lv=%d gap=%d",
            dungeon:GetIndex(), dungeon_level, level_gap)
    end

    return allow_drop
end

function M.setup(ctx, deps)
    logger = ctx.logger
    game = ctx.game

    local config = ctx.config or {}
    local drop_cfg = config.drop_rules or {}

    level_gap = drop_cfg.level_gap or 20
    bypass_item_id = drop_cfg.bypass_item_id or 80207
    message = drop_cfg.message or "此副本等级过低，掉落物品已被系统收回！"

    ctx.dpx.hook(game.HookType.CParty_DropItem, on_drop_item)

    if logger then
        logger.info("[drop_rules] registered CParty_DropItem hook gap=%d bypass_item=%d",
            level_gap, bypass_item_id)
    end

    return M
end

return M
