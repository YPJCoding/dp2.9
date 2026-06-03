-- 职业、转职、觉醒相关道具 handler
--
-- 当前模块迁移自 df_game_r.lua。

local M = {}

local function is_sql_handler_enabled(ctx)
    local config = ctx.config or {}
    local risk = config.risk or {}
    return risk.enable_sql_handlers == true
end

local function accept_quests(user, item_id, ctx, quest_ids, success_message)
    local dpx = ctx.dpx
    local level = user:GetCharacLevel()

    if level > 14 then
        for _, quest_id in ipairs(quest_ids) do
            dpx.quest.accept(user.cptr, quest_id, 1)
        end
        user:SendNotiPacketMessage(success_message or "恭喜： 角色已获取转职任务！")
    else
        user:SendNotiPacketMessage("注意： 角色转职失败！")
        dpx.item.add(user.cptr, item_id)
    end
end

function M.register(item_handler, ctx)
    local dpx = ctx.dpx
    local game = ctx.game
    local logger = ctx.logger

    -- [RISK:HIGH][SQL] 女鬼剑职业转换券：直接修改 charac_info.job
    item_handler[2021458807] = function(user, item_id)
        if not is_sql_handler_enabled(ctx) then
            user:SendNotiPacketMessage("注意： 女鬼剑职业转换功能未开启！")
            dpx.item.add(user.cptr, item_id)
            return
        end

        local level = user:GetCharacLevel()
        if level == 1 then
            dpx.sqlexec(game.DBType.taiwan_cain, "update charac_info set job=10 where charac_no=" .. user:GetCharacNo() .. " and lev=1")
            user:SendNotiPacketMessage("恭喜： 女鬼剑职业转换 成功！ <请切换角色以生效！>")
            if logger then
                logger.info("[useitem][sql][job_convert] acc=%d chr=%d item_id=%d", user:GetAccId(), user:GetCharacNo(), item_id)
            end
        else
            user:SendNotiPacketMessage("注意： 女鬼剑职业转换 失败！")
            dpx.item.add(user.cptr, item_id)
        end
    end

    -- [RISK:MEDIUM] 一次觉醒完成券
    item_handler[10157835] = function(user, item_id)
        local grow_type = user:GetCharacGrowType()
        if grow_type < 7 then
            user:ChangeGrowType(grow_type, 1)
            user:SendNotiPacketMessage("恭喜： 角色已成功完成一次觉醒！")
        else
            user:SendNotiPacketMessage("注意： 角色不满足觉醒要求， 觉醒失败！")
            dpx.item.add(user.cptr, item_id)
        end
    end

    -- [RISK:MEDIUM] 二次觉醒完成券
    item_handler[10157836] = function(user, item_id)
        local grow_type = user:GetCharacGrowType()
        if grow_type > 15 and grow_type < 23 then
            user:ChangeGrowType(grow_type - 16, 2)
            user:SendNotiPacketMessage("恭喜： 角色已成功完成二次觉醒！")
        else
            user:SendNotiPacketMessage("注意： 角色不满足觉醒要求， 觉醒失败！")
            dpx.item.add(user.cptr, item_id)
        end
    end

    -- [RISK:MEDIUM] 转职任务获取券：男鬼剑/女鬼剑等职业组
    item_handler[2023458001] = function(user, item_id)
        accept_quests(user, item_id, ctx, {8028, 8029, 8030, 8031, 8015}, "恭喜： 角色已获取所有转职任务！")
    end

    item_handler[2023458002] = function(user, item_id)
        accept_quests(user, item_id, ctx, {8024, 8025, 8026, 8027, 4064}, "恭喜： 角色已获取所有转职任务！")
    end

    item_handler[2023458003] = function(user, item_id)
        accept_quests(user, item_id, ctx, {8032, 8033, 8034, 8035}, "恭喜： 角色已获取所有转职任务！")
    end

    item_handler[2023629237] = function(user, item_id)
        accept_quests(user, item_id, ctx, {8037, 8038, 8039, 8040}, "恭喜： 角色已获取所有转职任务！")
    end

    item_handler[2023458063] = function(user, item_id)
        accept_quests(user, item_id, ctx, {5160}, "恭喜： 角色已获取转职任务！")
    end

    item_handler[2023458064] = function(user, item_id)
        accept_quests(user, item_id, ctx, {5163}, "恭喜： 角色已获取转职任务！")
    end

    item_handler[2023629238] = function(user, item_id)
        accept_quests(user, item_id, ctx, {12592}, "恭喜： 角色已获取转职任务！")
    end
end

return M
