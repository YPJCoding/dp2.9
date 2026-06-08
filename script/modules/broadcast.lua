-- 全服广播模块
--
-- 提供 send / send_to_aid 接口，向在线玩家发送系统消息。
-- 依赖 online.lua，带频率限制防止刷屏。

local M = {}

local broadcast_count = 0
local last_reset_time = 0
local rate_limit = 5
local online_module = nil
local logger = nil

function M.setup(ctx, deps)
    local config = ctx.config or {}
    local limits = config.limits or {}
    rate_limit = limits.broadcast_rate_per_min or 5
    online_module = deps and deps.online
    logger = ctx.logger

    if logger then
        logger.info("[broadcast] initialized, rate_limit=%d", rate_limit)
    end

    return M
end

-- 全服广播，向所有在线玩家发送系统消息。
-- msg_type 默认为 14（系统通知）。
-- 返回 true 和 nil 表示发送成功；返回 false 和 "rate limited" 表示被频率限制拦截。
function M.send(message, msg_type)
    if not message then
        return false, "no message"
    end

    local now = os.time()
    if now - last_reset_time >= 60 then
        broadcast_count = 0
        last_reset_time = now
    end

    if broadcast_count >= rate_limit then
        if logger then
            logger.warn("[broadcast][ratelimit] blocked message=%s", tostring(message))
        end
        return false, "rate limited"
    end

    broadcast_count = broadcast_count + 1
    msg_type = msg_type or 14

    if online_module then
        online_module.each(function(entry)
            if entry.user then
                entry.user:SendNotiPacketMessage(message, msg_type)
            end
        end)
    end

    if logger then
        logger.info("[broadcast][send] count=%d/%d message=%s",
            broadcast_count, rate_limit, tostring(message))
    end

    return true
end

-- 向指定账号发送系统消息。
-- 返回 true 表示发送成功；false 表示玩家不在线。
function M.send_to_aid(aid, message, msg_type)
    if not aid or not message then
        return false
    end

    msg_type = msg_type or 14
    if online_module then
        local entry = online_module.find_by_aid(aid)
        if entry and entry.user then
            entry.user:SendNotiPacketMessage(message, msg_type)
            return true
        end
    end
    return false
end

return M
