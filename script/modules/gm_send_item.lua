-- GM 发物品指令模块
--
-- 迁移自旧 dp2 Work_Reload.lua 的 //send 指令。
-- 通过 GmInput hook 拦截 //send 前缀命令，解析旧格式后发放物品到使用者的背包。
--
-- 命令格式（兼容旧 dp2）：
--   //send<id>              发放物品 id，数量 1
--   //send<id>x<count>       发放物品 id，数量 count
--   //send<id>+<level>       发放物品 id，强化等级 level，数量 1
--   //send<id>+<level>x<count> 发放物品 id，强化等级 level，数量 count
--
-- 安全边界：
-- - 默认关闭，需 features.enable_gm_send_item = true
-- - 仅 GM 可用
-- - 数量上限受 gm_send_item.max_count 限制
-- - 强化等级上限受 gm_send_item.max_upgrade_level 限制
-- - 不执行 SQL / shell / delete
-- - 不修改点券/代币/SP/TP/QP
-- - 不向其他玩家发送

local M = {}

local logger = nil
local game = nil
local dpx = nil
local gm_permissions = nil

local cfg = {}
local is_hook_registered = false

-- 规范化配置
local function normalize_config(input)
    input = input or {}
    return {
        command = tostring(input.command or "//send"),
        max_count = tonumber(input.max_count) or 100,
        max_upgrade_level = tonumber(input.max_upgrade_level) or 31,
        server_group = tonumber(input.server_group) or 3,
        mail_title = tostring(input.mail_title or "GM物品发放"),
        mail_content = tostring(input.mail_content or "请查收GM发放的物品。"),
    }
end

-- 记录操作日志
local function log_op(user, item_id, count, upgrade_level, result, detail)
    if not logger then
        return
    end
    logger.info(
        "[gm_send_item] acc=%d chr=%d chr_name=%s item_id=%d count=%d upgrade=%d result=%s detail=%s",
        user:GetAccId(),
        user:GetCharacNo(),
        user:GetCharacName(),
        item_id,
        count,
        upgrade_level or 0,
        tostring(result),
        tostring(detail or "")
    )
end

-- 使用严格 pattern match 解析 //send 的后缀部分
-- 返回 { id, upgrade, count } 或 nil
local function parse_send_args(suffix)
    if not suffix or suffix == "" then
        return nil
    end

    local id_str, upgrade_str, count_str

    -- //send<id>+<level>x<count>
    id_str, upgrade_str, count_str = string.match(suffix, "^(%d+)%+(%d+)x(%d+)$")
    if id_str then
        return {
            id = tonumber(id_str),
            upgrade = tonumber(upgrade_str),
            count = tonumber(count_str),
        }
    end

    -- //send<id>+<level>
    id_str, upgrade_str = string.match(suffix, "^(%d+)%+(%d+)$")
    if id_str then
        return {
            id = tonumber(id_str),
            upgrade = tonumber(upgrade_str),
            count = 1,
        }
    end

    -- //send<id>x<count>
    id_str, count_str = string.match(suffix, "^(%d+)x(%d+)$")
    if id_str then
        return {
            id = tonumber(id_str),
            upgrade = 0,
            count = tonumber(count_str),
        }
    end

    -- //send<id>
    id_str = string.match(suffix, "^(%d+)$")
    if id_str then
        return {
            id = tonumber(id_str),
            upgrade = 0,
            count = 1,
        }
    end

    return nil
end

-- 处理 //send 帮助提示
local function handle_send_help(user)
    user:SendNotiPacketMessage("——————————发放物品——————————", 14)
    user:SendNotiPacketMessage("//send<物品ID>              发放物品,数量1个", 14)
    user:SendNotiPacketMessage("//send<物品ID>x<数量>       发放物品,数量N个", 14)
    user:SendNotiPacketMessage("//send<物品ID>+<强化等级>   发放物品,强化等级N,数量1个", 14)
    user:SendNotiPacketMessage("//send<物品ID>+<强化等级>x<数量> 发放物品,强化等级N,数量N个", 14)
    user:SendNotiPacketMessage(string.format("注意：单次最多发放 %d 个，强化等级 0~%d", cfg.max_count, cfg.max_upgrade_level), 14)

    if logger then
        logger.info("[gm_send_item][help] acc=%d chr=%d", user:GetAccId(), user:GetCharacNo())
    end
end

-- 发放物品到使用者背包
local function give_item(user, item_id, count, upgrade_level)
    local upgrade = upgrade_level or 0
    if upgrade > 0 then
        dpx.item.add(user.cptr, item_id, count, upgrade)
    else
        dpx.item.add(user.cptr, item_id, count)
    end
end

-- 通知玩家发放结果
local function notify_result(user, item_id, count, upgrade_level, success)
    if success then
        local msg
        if upgrade_level and upgrade_level > 0 then
            msg = string.format(
                "——————————发放成功——————————\n物品代码：【%s】\n强化等级：【%s】\n获得数量：【%s】",
                item_id, upgrade_level, count)
        else
            msg = string.format(
                "——————————发放成功——————————\n物品代码：【%s】\n获得数量：【%s】",
                item_id, count)
        end
        user:SendNotiPacketMessage(msg, 14)
    else
        user:SendNotiPacketMessage("——————————发放失败——————————\n物品发放失败，请检查物品代码是否正确。", 14)
    end
end

-- 处理 //send <params> 实际发放逻辑
local function handle_send(user, input)
    local suffix = string.sub(input, #cfg.command + 1)
    local parsed = parse_send_args(suffix)

    -- 格式无效
    if not parsed then
        user:SendNotiPacketMessage("——————————发放失败——————————\n指令格式错误，请输入 //send 查看帮助。", 14)
        log_op(user, 0, 0, 0, "invalid_format", "input=" .. tostring(input))
        return
    end

    -- 校验物品 ID
    if not parsed.id or parsed.id <= 0 then
        user:SendNotiPacketMessage("——————————发放失败——————————\n物品代码无效，请检查格式。", 14)
        log_op(user, parsed.id or 0, parsed.count, parsed.upgrade, "invalid_id", "input=" .. tostring(input))
        return
    end

    -- 校验强化等级
    if parsed.upgrade < 0 then
        user:SendNotiPacketMessage("——————————发放失败——————————\n强化等级不能为负数。", 14)
        log_op(user, parsed.id, parsed.count, parsed.upgrade, "invalid_upgrade", "input=" .. tostring(input))
        return
    end
    if parsed.upgrade > cfg.max_upgrade_level then
        user:SendNotiPacketMessage(
            string.format("——————————发放失败——————————\n强化等级超过上限（最大 %d）。", cfg.max_upgrade_level), 14)
        log_op(user, parsed.id, parsed.count, parsed.upgrade, "upgrade_exceeded", "max=" .. tostring(cfg.max_upgrade_level))
        return
    end

    -- 校验数量
    if not parsed.count or parsed.count < 1 then
        user:SendNotiPacketMessage("——————————发放失败——————————\n数量无效，需大于 0。", 14)
        log_op(user, parsed.id, parsed.count or 0, parsed.upgrade, "invalid_count", "input=" .. tostring(input))
        return
    end

    -- 校验数量上限
    if parsed.count > cfg.max_count then
        user:SendNotiPacketMessage(
            string.format("——————————发放失败——————————\n数量超过上限（最多 %d 个）。", cfg.max_count), 14)
        log_op(user, parsed.id, parsed.count, parsed.upgrade, "count_exceeded", "max=" .. tostring(cfg.max_count))
        return
    end

    -- 执行发放（dpx.item.add 无可靠返回值，仅用 pcall 捕获异常）
    local ok, err = pcall(function()
        give_item(user, parsed.id, parsed.count, parsed.upgrade)
    end)

    if ok then
        notify_result(user, parsed.id, parsed.count, parsed.upgrade, true)
        log_op(user, parsed.id, parsed.count, parsed.upgrade, "success", "input=" .. tostring(input))
    else
        notify_result(user, parsed.id, parsed.count, parsed.upgrade, false)
        log_op(user, parsed.id, parsed.count, parsed.upgrade, "error", "err=" .. tostring(err or "unknown"))
    end
end

-- GmInput hook 回调
local function on_gm_input(fnext, _user, input)
    if not input or type(input) ~= "string" then
        return fnext()
    end

    local user = game.fac.user(_user)
    if not user then
        return fnext()
    end

    -- 未命中 //send 前缀，透传
    if not string.match(input, "^" .. cfg.command) then
        return fnext()
    end

    -- GM 权限检查
    if not gm_permissions or not gm_permissions.is_gm(user) then
        user:SendNotiPacketMessage("注意：你没有使用此功能的权限。", 14)
        if logger then
            logger.info("[gm_send_item][reject] acc=%d chr=%d reason=not_gm input=%s",
                user:GetAccId(), user:GetCharacNo(), tostring(input))
        end
        return 0
    end

    -- //send 帮助页面
    if input == cfg.command then
        handle_send_help(user)
        return 0
    end

    -- 解析并发放
    handle_send(user, input)
    return 0
end

function M.setup(ctx, deps)
    logger = ctx.logger
    game = ctx.game
    dpx = ctx.dpx
    gm_permissions = deps and deps.gm_permissions or nil

    local config = ctx.config or {}
    cfg = normalize_config(config.gm_send_item)

    if not is_hook_registered then
        dpx.hook(game.HookType.GmInput, on_gm_input)
        is_hook_registered = true
        if logger then
            logger.info("[gm_send_item] registered GmInput hook command=%s max_count=%d max_upgrade=%d",
                tostring(cfg.command), cfg.max_count, cfg.max_upgrade_level)
        end
    elseif logger then
        logger.info("[gm_send_item] setup skipped hook registration command=%s",
            tostring(cfg.command))
    end

    return M
end

return M
