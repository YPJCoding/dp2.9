-- 其他零散道具 handler
--
-- 当前模块只迁移低风险或中风险、无需 SQL 的零散 handler。
-- 直接 SQL 类功能暂不迁移，等待单独风险治理。

local M = {}

function M.register(item_handler, ctx)
    local dpx = ctx.dpx
    local game = ctx.game

    -- [RISK:MEDIUM] 跨界石：将背包装备栏第 1 格移动到账号金库
    item_handler[2021458801] = function(user, item_id)
        if not user:MoveToAccCargo(game.ItemSpace.INVENTORY, 9) then
            user:SendNotiPacketMessage("注意： 装备栏第一格装备跨界 失败！")
            dpx.item.add(user.cptr, item_id)
        else
            user:SendNotiPacketMessage("恭喜： 装备栏第一格装备跨界 成功！")
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
