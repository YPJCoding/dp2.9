-- 宠物、时装、装备清理相关道具 handler
--
-- 当前模块迁移自 df_game_r.lua，已接入 bootstrap 加载链路。
-- 删除类能力受 config.risk.enable_delete_handlers 控制，默认关闭。
-- 其中宠物/时装清理还会执行 SQL 删除记录，也必须同时开启 enable_sql_handlers。

local handler_utils = require("script.handler_utils")

local M = {}

local function is_delete_handler_enabled(ctx)
    local config = ctx.config or {}
    local risk = config.risk or {}
    return risk.enable_delete_handlers == true
end

local function is_sql_handler_enabled(ctx)
    local config = ctx.config or {}
    local risk = config.risk or {}
    return risk.enable_sql_handlers == true
end

local function log_success(ctx, user, item_id, action, count)
    local logger = ctx.logger
    if logger then
        logger.info(
            "[useitem][cleanup] action=%s acc=%d chr=%d item_id=%d count=%d",
            tostring(action),
            user:GetAccId(),
            user:GetCharacNo(),
            item_id,
            count or 0
        )
    end
end

function M.register(item_handler, ctx)
    local dpx = ctx.dpx
    local game = ctx.game

    -- [RISK:HIGH][DELETE][SQL] 宠物删除券：删除宠物栏前 14 格并清理 creature_items
    item_handler[2021458806] = function(user, item_id)
        if not is_delete_handler_enabled(ctx) then
            return handler_utils.reject_and_return(ctx, user, item_id, "item_cleanup", "delete", "注意： 宠物清理功能未开启！", "pet_cleanup_delete_disabled")
        end
        if not is_sql_handler_enabled(ctx) then
            return handler_utils.reject_and_return(ctx, user, item_id, "item_cleanup", "sql", "注意： 宠物清理依赖 SQL 功能，当前未开启！", "pet_cleanup_sql_disabled")
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
            log_success(ctx, user, item_id, "pet_cleanup", q)
        else
            user:SendNotiPacketMessage("注意： 宠物清理 失败！")
            dpx.item.add(user.cptr, item_id)
            handler_utils.return_item(ctx, user, item_id, "item_cleanup", "no_pet_to_cleanup")
        end
    end

    -- [RISK:HIGH][DELETE][SQL] 时装删除券：删除时装栏前 14 格并清理 user_items
    item_handler[2022110503] = function(user, item_id)
        if not is_delete_handler_enabled(ctx) then
            return handler_utils.reject_and_return(ctx, user, item_id, "item_cleanup", "delete", "注意： 时装清理功能未开启！", "avatar_cleanup_delete_disabled")
        end
        if not is_sql_handler_enabled(ctx) then
            return handler_utils.reject_and_return(ctx, user, item_id, "item_cleanup", "sql", "注意： 时装清理依赖 SQL 功能，当前未开启！", "avatar_cleanup_sql_disabled")
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
            log_success(ctx, user, item_id, "avatar_cleanup", q)
        else
            user:SendNotiPacketMessage("注意： 时装清理 失败！")
            dpx.item.add(user.cptr, item_id)
            handler_utils.return_item(ctx, user, item_id, "item_cleanup", "no_avatar_to_cleanup")
        end
    end

    -- [RISK:HIGH][DELETE] 副职业一键分解券：分解装备背包前 16 格
    item_handler[2022110504] = function(user, item_id)
        if not is_delete_handler_enabled(ctx) then
            return handler_utils.reject_and_return(ctx, user, item_id, "item_cleanup", "delete", "注意： 装备分解功能未开启！", "equipment_disjoint_delete_disabled")
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
            log_success(ctx, user, item_id, "equipment_disjoint", q)
        else
            user:SendNotiPacketMessage("注意： 装备分解 失败！")
            dpx.item.add(user.cptr, item_id)
            handler_utils.return_item(ctx, user, item_id, "item_cleanup", "no_equipment_to_disjoint")
        end
    end
end

return M
