-- 在线玩家表模块
--
-- 维护在线玩家列表，提供查询和遍历接口。
-- 注册 Reach_GameWord / Leave_GameWord hook，
-- 不依赖其他模块。

local M = {}

local online = {}  -- keyed by charac_id (cid)

function M.setup(ctx)
    local game = ctx.game
    local dpx = ctx.dpx
    local logger = ctx.logger

    -- 玩家登录 hook
    local function on_login(_user)
        local user = game.fac.user(_user)
        local aid = user:GetAccId()
        local cid = user:GetCharacNo()
        local name = user:GetCharacName()

        online[cid] = {
            aid = aid,
            cid = cid,
            name = name,
            user = user,
            login_time = os.time(),
        }

        if logger then
            logger.info("[online][login] acc=%d chr=%d name=%s count=%d",
                aid, cid, name, M.count())
        end
    end

    -- 玩家登出 hook
    local function on_logout(_user)
        local user = game.fac.user(_user)
        local cid = user:GetCharacNo()

        if online[cid] then
            local aid = user:GetAccId()
            local entry = online[cid]
            local name = entry and entry.name or "unknown"
            online[cid] = nil
            if logger then
                logger.info("[online][logout] acc=%d chr=%d name=%s count=%d",
                    aid, cid, name, M.count())
            end
        end
    end

    dpx.hook(game.HookType.Reach_GameWord, on_login)
    dpx.hook(game.HookType.Leave_GameWord, on_logout)

    if logger then
        logger.info("[online] registered hooks")
    end

    return M
end

-- 遍历所有在线玩家。
-- fn 接收 entry = {aid, cid, name, user, login_time}。
function M.each(fn)
    for _, entry in pairs(online) do
        fn(entry)
    end
end

-- 返回在线玩家总数。
function M.count()
    local n = 0
    for _ in pairs(online) do
        n = n + 1
    end
    return n
end

-- 按角色名查找。
function M.find_by_name(name)
    for _, entry in pairs(online) do
        if entry.name == name then
            return entry
        end
    end
    return nil
end

-- 按账号 ID 查找。
function M.find_by_aid(aid)
    for _, entry in pairs(online) do
        if entry.aid == aid then
            return entry
        end
    end
    return nil
end

-- 按角色 ID 查找。
function M.find_by_cid(cid)
    return online[cid]
end

return M
