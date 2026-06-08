-- handler 公共工具模块
--
-- 提供道具 handler 中重复的返还/拒绝/日志等公共逻辑。
-- 所有能力通过参数传入，不依赖全局变量。
-- 日志失败不影响业务，dpx/item 不存在时不崩溃。

local M = {}

-- 安全日志调用（避免因日志异常中断业务）
-- logger 可能为 nil，level 可能为 info/warn/error
function M.safe_call_logger(logger, level, fmt, ...)
    if not logger then
        return
    end
    local success, err = pcall(function()
        if level == "info" then
            logger.info(fmt, ...)
        elseif level == "warn" then
            logger.warn(fmt, ...)
        elseif level == "error" then
            logger.error(fmt, ...)
        end
    end)
    -- 日志失败静默忽略，不影响业务
end

-- 返还道具并记录统一日志
-- ctx 或 ctx.dpx 或 ctx.dpx.item 不存在时，只记录 warn，不报错
function M.return_item(ctx, user, item_id, module, reason)
    local dpx = ctx and ctx.dpx
    local logger = ctx and ctx.logger

    -- 记录返还日志
    M.safe_call_logger(logger, "info",
        "[useitem][return] module=%s acc=%d chr=%d item_id=%d reason=%s",
        tostring(module or "unknown"),
        user:GetAccId(),
        user:GetCharacNo(),
        item_id,
        tostring(reason or "unknown")
    )

    -- 返还道具
    if dpx and dpx.item and dpx.item.add and user and user.cptr then
        dpx.item.add(user.cptr, item_id)
    else
        M.safe_call_logger(logger, "warn",
            "[useitem][return] module=%s item_id=%d dpx.item unavailable, cannot return item",
            tostring(module or "unknown"),
            item_id
        )
    end
end

-- 拒绝操作并返还道具：发送提示 + 返还道具 + 记录拒绝日志
-- 不额外执行任何业务逻辑
function M.reject_and_return(ctx, user, item_id, module, risk, message, reason)
    local logger = ctx and ctx.logger

    -- 记录拒绝日志
    M.safe_call_logger(logger, "info",
        "[useitem][reject] module=%s risk=%s acc=%d chr=%d item_id=%d reason=%s",
        tostring(module or "unknown"),
        tostring(risk or "unknown"),
        user:GetAccId(),
        user:GetCharacNo(),
        item_id,
        tostring(reason or "disabled")
    )

    -- 发送提示
    if message then
        user:SendNotiPacketMessage(message)
    end

    -- 返还道具
    M.return_item(ctx, user, item_id, module, reason)
end

return M
