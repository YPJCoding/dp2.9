-- 装备继承相关道具 handler
--
-- 当前模块迁移自 df_game_r.lua，已接入 bootstrap 加载链路。

local M = {}

local function log_item_return(ctx, user, item_id, reason)
    local logger = ctx.logger
    if logger then
        logger.info(
            "[useitem][return] module=inherit acc=%d chr=%d item_id=%d reason=%s",
            user:GetAccId(),
            user:GetCharacNo(),
            item_id,
            tostring(reason or "unknown")
        )
    end
end

local function reject(user, item_id, ctx, message, reason)
    local dpx = ctx.dpx
    user:SendNotiPacketMessage(message)
    dpx.item.add(user.cptr, item_id)
    log_item_return(ctx, user, item_id, reason)
end

local function get_amplify_type(info)
    if not info or type(info.amplify) ~= "table" then
        return 0
    end
    return tonumber(info.amplify.type) or 0
end

function M.register(item_handler, ctx)
    local dpx = ctx.dpx
    local game = ctx.game
    local logger = ctx.logger

    -- [RISK:HIGH] 装备继承券：将装备背包第 1 格的强化/增幅/附魔/锻造继承到第 2 格
    item_handler[2022110505] = function(user, item_id)
        local mask = game.InheritMask.FLAG_UPGRADE | game.InheritMask.FLAG_AMPLIFY | game.InheritMask.FLAG_ENCHANT | game.InheritMask.FLAG_SEPARATE
        mask = mask | game.InheritMask.FLAG_MOVE_UPGRADE | game.InheritMask.FLAG_MOVE_AMPLIFY | game.InheritMask.FLAG_MOVE_ENCHANT | game.InheritMask.FLAG_MOVE_SEPARATE

        local item1 = dpx.item.info(user.cptr, game.ItemSpace.INVENTORY, 9)
        local item2 = dpx.item.info(user.cptr, game.ItemSpace.INVENTORY, 10)

        if item1 == nil or item2 == nil then
            return reject(user, item_id, ctx, "注意：装备栏1或装备栏2的装备数据无法被识别！", "missing_item")
        elseif item1.type ~= item2.type then
            return reject(user, item_id, ctx, "注意：相同的装备类型才可以继承！", "type_mismatch")
        elseif item1.rarity ~= item2.rarity then
            return reject(user, item_id, ctx, "注意：品级相同才可以继承！", "rarity_mismatch")
        elseif math.abs(item2.usable_level - item1.usable_level) > 10 then
            return reject(user, item_id, ctx, "注意：等级差必须小于等于10级的装备才可以被继承！", "level_gap_too_large")
        elseif item1.usable_level < 50 or item2.usable_level < 50 then
            return reject(user, item_id, ctx, "注意：低于50级的装备不可以继承！", "level_too_low")
        elseif get_amplify_type(item1) == 0 and get_amplify_type(item2) ~= 0 then
            return reject(user, item_id, ctx, "注意：强化装备不可以继承给增幅装备！", "amplify_mismatch")
        elseif dpx.item.inherit(user.cptr, 9, 10, mask) then
            if logger then
                logger.info("[useitem][inherit] acc=%d chr=%d item_id=%d src_slot=9 dst_slot=10", user:GetAccId(), user:GetCharacNo(), item_id)
            end
            return user:SendNotiPacketMessage("恭喜：已经成功继承！")
        else
            return reject(user, item_id, ctx, "注意：未知错误继承失败！", "inherit_failed")
        end
    end
end

return M
