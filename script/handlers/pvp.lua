-- PVP 相关道具 handler
--
-- 当前模块迁移自 df_game_r.lua，已接入 bootstrap 加载链路。
-- PVP 经验书会先执行 shell 生成 SQL，再写入数据库，因此必须同时开启 shell 和 SQL 风险开关。

local handler_utils = require("script.handler_utils")

local M = {}

local function is_shell_handler_enabled(ctx)
    local config = ctx.config or {}
    local risk = config.risk or {}
    return risk.enable_shell_handlers == true
end

local function is_sql_handler_enabled(ctx)
    local config = ctx.config or {}
    local risk = config.risk or {}
    return risk.enable_sql_handlers == true
end

function M.register(item_handler, ctx)
    local dpx = ctx.dpx
    local game = ctx.game
    local logger = ctx.logger

    -- [RISK:HIGH][SHELL][SQL] PVP 经验书：执行外部 shell 脚本生成 SQL 后写库
    item_handler[2541121] = function(user, item_id)
        if not is_shell_handler_enabled(ctx) then
            handler_utils.reject_and_return(ctx, user, item_id, "pvp", "shell", "注意： PVP经验书 shell 功能未开启！", "pvp_exp_shell_disabled")
            return
        end
        if not is_sql_handler_enabled(ctx) then
            handler_utils.reject_and_return(ctx, user, item_id, "pvp", "sql", "注意： PVP经验书 SQL 功能未开启！", "pvp_exp_sql_disabled")
            return
        end

        local charac_no = tonumber(user:GetCharacNo())
        if not charac_no then
            user:SendNotiPacketMessage("注意： 角色编号异常，PVP经验增加失败！")
            dpx.item.add(user.cptr, item_id)
            handler_utils.return_item(ctx, user, item_id, "pvp", "invalid_charac_no")
            if logger then
                logger.error("[useitem][shell][pvp_exp] invalid charac_no acc=%d item_id=%d", user:GetAccId(), item_id)
            end
            return
        end

        local handle = io.popen("sh /dp2/script/pvp_exp_inc.sh " .. charac_no)
        if not handle then
            user:SendNotiPacketMessage("注意： PVP经验脚本执行失败！")
            dpx.item.add(user.cptr, item_id)
            handler_utils.return_item(ctx, user, item_id, "pvp", "pvp_exp_script_open_failed")
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
            handler_utils.return_item(ctx, user, item_id, "pvp", "pvp_exp_empty_sql")
            if logger then
                logger.error("[useitem][shell][pvp_exp] empty sql acc=%d chr=%d item_id=%d", user:GetAccId(), user:GetCharacNo(), item_id)
            end
            return
        end

        dpx.sqlexec(game.DBType.taiwan_cain, sql)
        user:SendNotiPacketMessage("恭喜： 决斗经验增加 成功！ <请切换角色以生效！>")

        if logger then
            logger.info("[useitem][shell][pvp_exp] acc=%d chr=%d item_id=%d sql_len=%d", user:GetAccId(), user:GetCharacNo(), item_id, string.len(sql))
        end
    end
end

return M
