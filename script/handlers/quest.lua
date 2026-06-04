-- 任务相关道具 handler
--
-- 当前模块迁移自 df_game_r.lua，已接入 bootstrap 加载链路。

local M = {}

local function clear_quest_by_type(user, item_id, ctx, quest_type, success_label, fail_label)
    local dpx = ctx.dpx
    local quest = dpx.quest
    local lst = quest.all(user.cptr)
    local chr_level = user:GetCharacLevel()
    local q = 0

    for _, id in ipairs(lst) do
        local info = quest.info(user.cptr, id)
        if info then
            if not info.is_cleared and info.type == quest_type and info.min_level <= chr_level then
                quest.clear(user.cptr, id)
                q = q + 1
            end
        end
    end

    if q > 0 then
        quest.update(user.cptr)
        user:SendNotiPacketMessage(string.format("恭喜： %d个%s 成功！", q, success_label))
    else
        user:SendNotiPacketMessage(string.format("注意： %s 失败！", fail_label))
        dpx.item.add(user.cptr, item_id)
    end
end

function M.register(item_handler, ctx)
    local game = ctx.game

    -- [RISK:MEDIUM] 主线任务清理券
    item_handler[2021458802] = function(user, item_id)
        clear_quest_by_type(user, item_id, ctx, game.QuestType.epic, "主线任务清理", "主线任务清理")
    end

    -- [RISK:HIGH] 支线/普通任务清理券；可能影响转职/觉醒任务
    item_handler[2021458803] = function(user, item_id)
        clear_quest_by_type(user, item_id, ctx, game.QuestType.common_unique, "支线/普通任务清理", "支线/普通任务清理")
    end

    -- [RISK:MEDIUM] 每日任务清理券
    item_handler[2021458808] = function(user, item_id)
        clear_quest_by_type(user, item_id, ctx, game.QuestType.daily, "每日任务清理", "每日任务清理")
    end

    -- [RISK:MEDIUM] 成就任务清理券
    item_handler[2021458809] = function(user, item_id)
        clear_quest_by_type(user, item_id, ctx, game.QuestType.achievement, "成就任务清理", "成就任务清理")
    end
end

return M
