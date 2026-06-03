-- PVP 相关道具 handler
--
-- 当前模块迁移自 df_game_r.lua。
-- 注意：文件已包含真实 handler 注册逻辑，但在 df_game_r.lua 接入 bootstrap 前不会改变运行行为。

local M = {}

local function is_shell_handler_enabled(ctx)
    local config = ctx.config or {}
    local risk = config.risk or {}
    return risk.enable_shell_handlers == true
end

function M.register(item_handler, ctx)
    local dpx = ctx.dpx
    local game = ctx.game

    -- [RISK:HIGH][SHELL][SQL] PVP 经验书：执行外部 shell 脚本生成 SQL 后写库
    item_handler[2541121] = function(user, item_id)
        if not is_shell_handler_enabled(ctx) then
            user:SendNotiPacketMessage("注意： PVP经验书功能未开启！")
            dpx.item.add(user.cptr, item_id)
            return
        end

        local handle = io.popen("sh /dp2/script/pvp_exp_inc.sh " .. user:GetCharacNo())
        local sql = handle:read("*a")
        handle:close()

        dpx.sqlexec(game.DBType.taiwan_cain, sql)
        user:SendNotiPacketMessage("恭喜： 决斗经验增加 成功！ <请切换角色以生效！>")
    end
end

return M
