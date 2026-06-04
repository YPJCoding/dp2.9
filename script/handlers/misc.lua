-- 其他零散道具 handler
--
-- 当前模块迁移零散 handler。
-- 直接 SQL 类功能必须受 config.risk.enable_sql_handlers 控制，默认关闭。

local M = {}

local function is_sql_handler_enabled(ctx)
    local config = ctx.config or {}
    local risk = config.risk or {}
    return risk.enable_sql_handlers == true
end

local function log_item_return(ctx, user, item_id, reason)
    local logger = ctx.logger
    if logger then
        logger.info(
            "[useitem][return] module=misc acc=%d chr=%d item_id=%d reason=%s",
            user:GetAccId(),
            user:GetCharacNo(),
            item_id,
            tostring(reason or "unknown")
        )
    end
end

local function reject_sql_disabled(user, item_id, ctx, message, reason)
    local dpx = ctx.dpx
    local logger = ctx.logger

    if logger then
        logger.info(
            "[useitem][reject] module=misc risk=sql acc=%d chr=%d item_id=%d reason=%s",
            user:GetAccId(),
            user:GetCharacNo(),
            item_id,
            tostring(reason or "sql_disabled")
        )
    end

    user:SendNotiPacketMessage(message or "注意： 当前 SQL 类功能未开启！")
    dpx.item.add(user.cptr, item_id)
    log_item_return(ctx, user, item_id, reason or "sql_disabled")
end

function M.register(item_handler, ctx)
    local dpx = ctx.dpx
    local game = ctx.game
    local logger = ctx.logger

    -- [RISK:MEDIUM] 跨界石：将背包装备栏第 1 格移动到账号金库
    item_handler[2021458801] = function(user, item_id)
        if not user:MoveToAccCargo(game.ItemSpace.INVENTORY, 9) then
            user:SendNotiPacketMessage("注意： 装备栏第一格装备跨界 失败！")
            dpx.item.add(user.cptr, item_id)
            log_item_return(ctx, user, item_id, "move_to_account_cargo_failed")
        else
            user:SendNotiPacketMessage("恭喜： 装备栏第一格装备跨界 成功！")
        end
    end

    -- [RISK:HIGH][SQL] 角色出战：修改 charac_link_bonus
    item_handler[2023458801] = function(user, item_id)
        if not is_sql_handler_enabled(ctx) then
            return reject_sql_disabled(user, item_id, ctx, "注意： 角色出战功能未开启！", "mercenary_sql_disabled")
        end

        dpx.sqlexec(game.DBType.taiwan_cain, "UPDATE charac_link_bonus SET `exp`=0, gold=0, mercenary_start_time=UNIX_TIMESTAMP(), mercenary_finish_time=UNIX_TIMESTAMP()+21600, mercenary_area=5, mercenary_period=4 WHERE charac_no=" .. user:GetCharacNo())
        user:SendNotiPacketMessage("恭喜： 角色出战 成功！ 6小时后可领取奖励")

        if logger then
            logger.info("[useitem][sql][mercenary] acc=%d chr=%d item_id=%d", user:GetAccId(), user:GetCharacNo(), item_id)
        end
    end

    -- [RISK:HIGH][SQL] 装备设计图熟练度提升：写入 item_making_skill_info
    item_handler[2023458803] = function(user, item_id)
        if not is_sql_handler_enabled(ctx) then
            return reject_sql_disabled(user, item_id, ctx, "注意： 装备设计图熟练度功能未开启！", "design_skill_sql_disabled")
        end

        dpx.sqlexec(game.DBType.taiwan_cain, "INSERT INTO item_making_skill_info (charac_no, weapon, cloth, leather, light_armor, heavy_armor, plate, amulet, wrist, ring, support, magic_stone) VALUES (" .. user:GetCharacNo() .. ", 140, 140, 140, 140, 140, 140, 140, 140, 140, 140, 140) ON DUPLICATE KEY UPDATE weapon = VALUES(weapon),cloth = VALUES(cloth), leather = VALUES(leather), light_armor = VALUES(light_armor), plate = VALUES(plate), amulet = VALUES(amulet), wrist = VALUES(wrist), ring = VALUES(ring), support = VALUES(support), magic_stone = VALUES(magic_stone)")
        user:SendNotiPacketMessage("恭喜： 角色装备设计图熟练度提升成功！")

        if logger then
            logger.info("[useitem][sql][design_skill] acc=%d chr=%d item_id=%d", user:GetAccId(), user:GetCharacNo(), item_id)
        end
    end

    -- [RISK:MEDIUM] 异界 E2 重置券
    item_handler[2021458804] = function(user, item_id)
        user:ResetDimensionInout(0)
        user:ResetDimensionInout(1)
        user:ResetDimensionInout(2)
        user:SendNotiPacketMessage("恭喜： 异界E2重置 成功！")
    end

    -- [RISK:MEDIUM] 异界 E3 重置券
    item_handler[2021458805] = function(user, item_id)
        user:ResetDimensionInout(3)
        user:ResetDimensionInout(4)
        user:ResetDimensionInout(5)
        user:SendNotiPacketMessage("恭喜： 异界E3重置 成功！")
    end
end

return M
