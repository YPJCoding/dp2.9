-- 每日签到模块
--
-- 迁移自旧 dp2 Work_Reload.lua 的 //qd 指令。
-- 默认不启用；启用后通过 GmInput hook 监听配置中的 command。
--
-- 当前保持旧实现的内存冷却行为：频道重启后签到记录会重置。
-- 如需正式服长期使用，建议后续改为数据库或文件持久化。

local M = {}

local logger = nil
local game = nil
local dpx = nil
local broadcast = nil
local gm_permissions = nil

local cfg = {}
local sign_records = {}
local is_hook_registered = false

local function normalize_config(input)
    input = input or {}

    local reward_items = input.reward_items
    if type(reward_items) ~= "table" or #reward_items == 0 then
        reward_items = {
            { id = 3340, count = 1 },
        }
    end

    local normalized = {
        command = tostring(input.command or "//qd"),
        reset_hour = tonumber(input.reset_hour) or 6,
        server_group = tonumber(input.server_group) or 3,
        mail_title = tostring(input.mail_title or "每日签到"),
        mail_content = tostring(input.mail_content or "感谢您的支持"),
        success_message = tostring(input.success_message or "——————————每日签到——————————  签到奖励发送至邮箱，若空邮件请小退一下!"),
        duplicate_message = tostring(input.duplicate_message or "——————————每日签到——————————  您今天已经签到完毕，请勿重复签到！"),
        broadcast_enabled = input.broadcast_enabled == true,
        broadcast_message = tostring(input.broadcast_message or "玩家【%s】通过每日签到获得了丰厚的奖励，快来试试吧！聊天框输入//qd"),
        require_gm = input.require_gm == true,
        reward_items = reward_items,
    }

    if normalized.reset_hour < 0 then
        normalized.reset_hour = 0
    elseif normalized.reset_hour > 23 then
        normalized.reset_hour = 23
    end

    return normalized
end

local function current_reset_key(now, reset_hour)
    local t = os.date("*t", now)
    local today_reset = os.time({
        year = t.year,
        month = t.month,
        day = t.day,
        hour = reset_hour,
        min = 0,
        sec = 0,
    })

    if now < today_reset then
        return os.date("%Y%m%d", today_reset - 24 * 3600)
    end

    return os.date("%Y%m%d", today_reset)
end

local function seconds_until_next_reset(now, reset_hour)
    local t = os.date("*t", now)
    local today_reset = os.time({
        year = t.year,
        month = t.month,
        day = t.day,
        hour = reset_hour,
        min = 0,
        sec = 0,
    })

    local next_reset = today_reset
    if now >= today_reset then
        next_reset = today_reset + 24 * 3600
    end

    return math.max(0, next_reset - now)
end

local function send_rewards(user, reward_items)
    local sent = 0
    for _, reward in ipairs(reward_items) do
        local item_id = tonumber(reward.id)
        local count = tonumber(reward.count) or 1

        if item_id and item_id > 0 and count > 0 then
            local ok = dpx.mail.item(
                user:GetCharacNo(),
                cfg.server_group,
                cfg.mail_title,
                cfg.mail_content,
                item_id,
                count
            )

            if ok then
                sent = sent + 1
                if logger then
                    logger.info("[signin][mail] acc=%d chr=%d item_id=%d count=%d",
                        user:GetAccId(), user:GetCharacNo(), item_id, count)
                end
            elseif logger then
                logger.error("[signin][mail] failed acc=%d chr=%d item_id=%d count=%d",
                    user:GetAccId(), user:GetCharacNo(), item_id, count)
            end
        elseif logger then
            logger.error("[signin][mail] invalid reward item_id=%s count=%s", tostring(reward.id), tostring(reward.count))
        end
    end

    return sent
end

local function handle_signin(user)
    if cfg.require_gm == true and gm_permissions and not gm_permissions.is_gm(user) then
        user:SendNotiPacketMessage("每日签到仅 GM 可用。", 14)
        if logger then
            logger.info("[signin] denied non-gm acc=%d chr=%d", user:GetAccId(), user:GetCharacNo())
        end
        return true
    end

    local now = os.time()
    local reset_key = current_reset_key(now, cfg.reset_hour)
    local charac_no = user:GetCharacNo()
    local record_key = tostring(charac_no)

    if sign_records[record_key] == reset_key then
        local cooldown = seconds_until_next_reset(now, cfg.reset_hour)
        user:SendNotiPacketMessage(string.format("%s 距离下次签到剩余时间：%d秒", cfg.duplicate_message, cooldown), 14)
        if logger then
            logger.info("[signin] duplicate acc=%d chr=%d reset_key=%s cooldown=%d",
                user:GetAccId(), charac_no, tostring(reset_key), cooldown)
        end
        return true
    end

    local sent_count = send_rewards(user, cfg.reward_items)
    if sent_count <= 0 then
        user:SendNotiPacketMessage("每日签到奖励发送失败，请联系管理员。", 14)
        if logger then
            logger.error("[signin] reward failed acc=%d chr=%d reset_key=%s",
                user:GetAccId(), charac_no, tostring(reset_key))
        end
        return true
    end

    sign_records[record_key] = reset_key
    user:SendNotiPacketMessage(cfg.success_message, 14)

    if cfg.broadcast_enabled == true and broadcast and type(broadcast.send) == "function" then
        broadcast.send(string.format(cfg.broadcast_message, user:GetCharacName()), 15)
    end

    if logger then
        logger.info("[signin] success acc=%d chr=%d reset_key=%s rewards=%d",
            user:GetAccId(), charac_no, tostring(reset_key), sent_count)
    end

    return true
end

local function on_gm_input(fnext, _user, input)
    if not input or type(input) ~= "string" then
        return fnext()
    end

    local command = cfg.command or "//qd"
    if input ~= command then
        return fnext()
    end

    local user = game.fac.user(_user)
    if not user then
        return fnext()
    end

    handle_signin(user)
    return 0
end

function M.setup(ctx, deps)
    logger = ctx.logger
    game = ctx.game
    dpx = ctx.dpx
    broadcast = deps and deps.broadcast or nil
    gm_permissions = deps and deps.gm_permissions or nil

    local config = ctx.config or {}
    cfg = normalize_config(config.signin)

    if not is_hook_registered then
        dpx.hook(game.HookType.GmInput, on_gm_input)
        is_hook_registered = true
        if logger then
            logger.info("[signin] registered GmInput hook command=%s reset_hour=%d rewards=%d broadcast=%s require_gm=%s",
                tostring(cfg.command), cfg.reset_hour, #cfg.reward_items, tostring(cfg.broadcast_enabled), tostring(cfg.require_gm))
        end
    elseif logger then
        logger.info("[signin] setup skipped hook registration command=%s", tostring(cfg.command))
    end

    return M
end

function M.get_state()
    return {
        command = cfg.command,
        reset_hour = cfg.reset_hour,
        reward_count = cfg.reward_items and #cfg.reward_items or 0,
        record_count = (function()
            local count = 0
            for _ in pairs(sign_records) do
                count = count + 1
            end
            return count
        end)(),
        is_hook_registered = is_hook_registered,
    }
end

return M
