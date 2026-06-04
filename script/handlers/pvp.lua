-- PVP 相关道具 handler
--
-- 当前模块迁移自 df_game_r.lua，已接入 bootstrap 加载链路。

local M = {}

local function is_shell_handler_enabled(ctx)
    local config = ctx.config or {}
    local risk = config.risk or {}
    return risk.enable_shell_handlers == true
end

local function log_item_return(ctx, user, item_id, reason)
    local logger = ctx.logger
    if logger then
        logger.info(
            "[useitem][return] module=pvp acc=%d chr=%d item_id=%d reason=%s",
            user:GetAccId(),
            user:GetCharacNo(),
            item_id,
            tostring(reason or "unknown")
        )
    end
end

local function reject_shell_disabled(user, item_id, ctx, message, reason)
    local dpx = ctx.dpx
    local logger = ctx.logger
    local log_reason = reason or "shell_disabled"

    if logger then
        logger.info(
            "[useitem][reject] module=pvp risk=shell acc=%d chr=%d item_id=%d reason=%s",
            user:GetAccId(),
            user:GetCharacNo(),
            item_id,
            tostring(log_reason)
        )
    end

    user:SendNotiPacketMessage(message or "注意： 当前 shell 类功能未开启！")
    dpx.item.add(user.cptr, item_id)
    log_item_return(ctx, user, item_id, log_reason)
end

function M.register(item_handler, ctx)
    local dpx = ctx.dpx
    local game = ctx.game
    local logger = ctx.logger

    -- [RISK:HIGH][SHELL][SQL] PVP 经验书：执行外部 shell 脚本生成 SQL 后写库
    item_handler[2541121] = function(user, item_id)
        if not is_shell_handler_enabled(ctx) then
            reject_shell_disabled(user, item_id, ctx, "注意： PVP经验书功能未开启！", "pvp_exp_shell_disabled")
            return
        end

        local handle = io.popen("sh /dp2/script/pvp_exp_inc.sh " .. user:GetCharacNo())
        if not handle then
            user:SendNotiPacketMessage("注意： PVP经验脚本执行失败！")
            dpx.item.add(user.cptr, item_id)
            log_item_return(ctx, user, item_id, "pvp_exp_script_open_failed")
            if logger then
                logger.error("[useitem][shell][pvp_exp] failed to open script acc=%d chr=%d item_id=%d", user:GetAccId(), user:GetCharacNo(), item_id)
            end
            return
        end

        local sql = handle:read("*a")
        handle:close()

        if not sql or sql == "" then
            user:SendNotiPacketMessage("注意： PVP经验脚本没有返回有效 SQL！")
            dpx.item.add(user.cptr, item_id)
            log_item_return(ctx, user, item_id, "pvp_exp_empty_sql")
            if logger then
                logger.error("[useitem][shell][pvp_exp] empty sql acc=%d chr=%d item_id=%d", user:GetAccId(), user:GetCharacNo(), item_id)
            end
            return
        end

        dpx.sqlexec(game.DBType.taiwan_cain, sql)
        user:SendNotiPacketMessage("恭喜： 决斗经验增加 成功！ <请切换角色以生效！>")

        if logger then
            logger.info("[useitem][shell][pvp_exp] acc=%d chr=%d item_id=%d", user:GetAccId(), user:GetCharacNo(), item_id)
        end
    end
end

return M
