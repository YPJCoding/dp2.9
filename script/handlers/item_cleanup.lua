-- 宠物、时装、装备清理相关道具 handler
--
-- 当前模块迁移自 df_game_r.lua，已接入 bootstrap 加载链路。
-- 删除类能力受 config.risk.enable_delete_handlers 控制，默认关闭。

local M = {}

local function is_delete_handler_enabled(ctx)
    local config = ctx.config or {}
    local risk = config.risk or {}
    return risk.enable_delete_handlers == true
end

local function log_item_return(ctx, user, item_id, reason)
    local logger = ctx.logger
    if logger then
        logger.info(
            "[useitem][return] module=item_cleanup acc=%d chr=%d item_id=%d reason=%s",
            user:GetAccId(),
            user:GetCharacNo(),
            item_id,
            tostring(reason or "unknown")
        )
    end
end

local function reject_when_disabled(user, item_id, ctx, reason)
    local dpx = ctx.dpx
    local logger = ctx.logger

    if logger then
        logger.info(
            "[useitem][reject] module=item_cleanup risk=delete acc=%d chr=%d item_id=%d reason=%s",
            user:GetAccId(),
            user:GetCharacNo(),
            item_id,
            tostring(reason or "delete_disabled")
        )
    end

    user:SendNotiPacketMessage(reason or "注意： 当前功能未开启！")
    dpx.item.add(user.cptr, item_id)
    log_item_return(ctx, user, item_id, reason or "delete_disabled")
end

function M.register(item_handler, ctx)
    local dpx = ctx.dpx
    local game = ctx.game

    -- [RISK:HIGH][DELETE][SQL] 宠物删除券：删除宠物栏前 14 格并清理 creature_items
    item_handler[2021458806] = function(user, item_id)
        if not is_delete_handler_enabled(ctx) then
            return reject_when_disabled(user, item_id, ctx, "宠物清理功能未开启")
        end

        local q = 0
        for i = 0, 13, 1 do
            local info = dpx.item.info(user.cptr, 7, i)
            if info then
                dpx.item.delete(user.cptr, 7, i, 1)
                dpx.sqlexec(game.DBType.taiwan_cain_2nd, "delete from creature_items where charac_no=" .. user:GetCharacNo() .. " and slot=" .. i .. " and it_id=" .. info.id)
                q = q + 1
            end
        end

        if q > 0 then
            user:SendItemSpace(7)
            user:SendNotiPacketMessage(string.format("恭喜： %d个宠物清理 成功！", q))
        else
            user:SendNotiPacketMessage("注意： 宠物清理 失败！")
            dpx.item.add(user.cptr, item_id)
            log_item_return(ctx, user, item_id, "no_pet_to_cleanup")
        end
    end

    -- [RISK:HIGH][DELETE][SQL] 时装删除券：删除时装栏前 14 格并清理 user_items
    item_handler[2022110503] = function(user, item_id)
        if not is_delete_handler_enabled(ctx) then
            return reject_when_disabled(user, item_id, ctx, "时装清理功能未开启")
        end

        local q = 0
        for i = 0, 13, 1 do
            local info = dpx.item.info(user.cptr, 1, i)
            if info then
                dpx.item.delete(user.cptr, 1, i, 1)
                dpx.sqlexec(game.DBType.taiwan_cain_2nd, "delete from user_items where charac_no=" .. user:GetCharacNo() .. " and slot=" .. (i + 10) .. " and it_id=" .. info.id)
                q = q + 1
            end
        end

        if q > 0 then
            user:SendItemSpace(1)
            user:SendNotiPacketMessage(string.format("恭喜： %d件时装清理 成功！", q))
        else
            user:SendNotiPacketMessage("注意： 时装清理 失败！")
            dpx.item.add(user.cptr, item_id)
            log_item_return(ctx, user, item_id, "no_avatar_to_cleanup")
        end
    end

    -- [RISK:HIGH] 副职业一键分解券：分解装备背包前 16 格
    item_handler[2022110504] = function(user, item_id)
        if not is_delete_handler_enabled(ctx) then
            return reject_when_disabled(user, item_id, ctx, "装备分解功能未开启")
        end

        local q = 0
        for i = 9, 24, 1 do
            local info = dpx.item.info(user.cptr, game.ItemSpace.INVENTORY, i)
            if info then
                user:Disjoint(game.ItemSpace.INVENTORY, i, user)
                if not dpx.item.info(user.cptr, game.ItemSpace.INVENTORY, i) then
                    q = q + 1
                end
            end
        end

        if q > 0 then
            user:SendItemSpace(game.ItemSpace.INVENTORY)
            user:SendNotiPacketMessage(string.format("恭喜： %d件装备分解 成功！", q))
        else
            user:SendNotiPacketMessage("注意： 装备分解 失败！")
            dpx.item.add(user.cptr, item_id)
            log_item_return(ctx, user, item_id, "no_equipment_to_disjoint")
        end
    end
end

return M
