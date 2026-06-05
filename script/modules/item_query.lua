-- 物品查询指令模块
--
-- 提供 //viewid <名称> 和 //viewname <ID> 聊天指令，
-- 通过 GmInput hook 拦截，使用 dpx.item.query_by_name / query_by_id 查询。
-- //viewid / //viewname 为只读查询，所有玩家均可使用。

local M = {}

local logger = nil
local dpx = nil
local game = nil

-- 按名称查询物品 ID。
local function handle_viewid(user, name)
    local info = dpx.item.query_by_name(name)
    if info then
        user:SendNotiPacketMessage(
            string.format("查询成功 — 名称：【%s】 代码：【%s】", info.name, info.id), 14)
        if logger then
            logger.info("[item_query][viewid] acc=%d chr=%d name=%s result=%s",
                user:GetAccId(), user:GetCharacNo(), name, tostring(info.id))
        end
    else
        user:SendNotiPacketMessage("查询失败 — 未找到此物品或未启用繁体输入法", 14)
        if logger then
            logger.info("[item_query][viewid] acc=%d chr=%d name=%s result=not_found",
                user:GetAccId(), user:GetCharacNo(), name)
        end
    end
end

-- 按 ID 查询物品名称。
local function handle_viewname(user, id)
    local info = dpx.item.query_by_id(id)
    if info then
        user:SendNotiPacketMessage(
            string.format("查询成功 — 代码：【%s】 名称：【%s】", info.id, info.name), 14)
        if logger then
            logger.info("[item_query][viewname] acc=%d chr=%d id=%d result=%s",
                user:GetAccId(), user:GetCharacNo(), id, info.name)
        end
    else
        user:SendNotiPacketMessage("查询失败 — 未找到此代码", 14)
        if logger then
            logger.info("[item_query][viewname] acc=%d chr=%d id=%d result=not_found",
                user:GetAccId(), user:GetCharacNo(), id)
        end
    end
end

-- GmInput hook 回调。
-- 参数签名参考 dp2: function(fnext, _user, input)
local function on_gm_input(fnext, _user, input)
    if not input or type(input) ~= "string" then
        return fnext()
    end

    local user = game.fac.user(_user)
    if not user then
        return fnext()
    end

    -- //viewid <名称>
    local name = string.match(input, "^//viewid%s+(.-)%s*$")
    if name and #name > 0 then
        handle_viewid(user, name)
        return fnext()
    end

    -- //viewname <ID>
    local id_str = string.match(input, "^//viewname%s+(%d+)%s*$")
    if id_str then
        handle_viewname(user, tonumber(id_str))
        return fnext()
    end

    -- //viewname 非数字参数，提示用法
    if string.match(input, "^//viewname%s+") then
        user:SendNotiPacketMessage("用法错误：//viewname <数字ID>", 14)
        return fnext()
    end

    -- 未匹配，传递到下一个 handler
    return fnext()
end

function M.setup(ctx, deps)
    logger = ctx.logger
    dpx = ctx.dpx
    game = ctx.game

    -- 注册 GmInput hook
    dpx.hook(game.HookType.GmInput, on_gm_input)

    if logger then
        logger.info("[item_query] registered GmInput hook")
    end

    return M
end

return M
