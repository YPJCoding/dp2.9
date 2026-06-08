# Feature Recovery: Phase 1 & 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build four infrastructure modules (online, broadcast, gm_permissions, item_query) and verify high-risk handlers on test server.

**Architecture:** Four new Lua modules under `script/modules/` following the existing ctx-passing pattern, loaded by `script/bootstrap.lua` with config gating. Modules have a clear dependency chain: online.lua and gm_permissions.lua are leaf nodes; broadcast.lua depends on online; item_query.lua depends on gm_permissions.

**Tech Stack:** Lua 5.3, DP2/DPX SDK, DNF game server runtime. No test framework available — verification is syntax check + code review + server smoke test.

---

## File Structure

| Action | File | Responsibility |
|---|---|---|
| Create | `script/modules/online.lua` | Online player table, login/logout hooks |
| Create | `script/modules/gm_permissions.lua` | GM permission check |
| Create | `script/modules/broadcast.lua` | Server-wide message broadcast with rate limiting |
| Create | `script/modules/item_query.lua` | `//viewid` / `//viewname` chat commands |
| Modify | `script/config.lua` | Add `features` entries and `gm` section |
| Modify | `script/bootstrap.lua` | Add `load_modules()` for module loading |
| Modify | `docs/CODING_STANDARDS.md` | Add `modules/` to directory structure |

---

### Task 1: Update `script/config.lua` with new entries

**Files:**
- Modify: `script/config.lua`

- [ ] **Step 1: Add new config entries**

Add three entries to the config table in `script/config.lua`:

1. In `features` section, add `enable_online_module`, `enable_broadcast_module`, `enable_item_query`:

```lua
features = {
    enable_item_handlers = true,
    enable_modular_handlers = true,
    -- NEW: infrastructure modules
    enable_online_module = true,
    enable_broadcast_module = false,
    enable_item_query = false,
    modular_handlers = {
        quest = true,
        job = true,
        item_cleanup = true,
        inherit = true,
        pvp = true,
        misc = true,
    },
},
```

2. Add a new `gm` section after `features`:

```lua
gm = {
    admin_accounts = {},
    min_gm_level = 1,
},
```

3. Add `broadcast_rate_per_min` to `limits` section:

```lua
limits = {
    auction_max_total_price = 200000000,
    auction_min_level = 10,
    item_unlock_time = 1,
    broadcast_rate_per_min = 5,
}
```

The full `script/config.lua` after edits:

```lua
local config = {
    debug = {
        enable_debug_log = false,
        enable_debug_hooks = false,

        -- 临时 UseItem 链路测试 handler。
        -- 默认关闭，避免正式环境劫持 1034-1037 等已有道具。
        enable_test_useitem_handler = false,
        test_useitem_ids = {1034, 1035, 1036, 1037},
        test_useitem_return_item = true,

        -- UseItem trace 默认关闭，需要排查道具入口时可临时开启。
        enable_useitem_trace = false,
    },

    features = {
        enable_item_handlers = true,
        enable_modular_handlers = true,
        enable_online_module = true,
        enable_broadcast_module = false,
        enable_item_query = false,
        modular_handlers = {
            quest = true,
            job = true,
            item_cleanup = true,
            inherit = true,
            pvp = true,
            misc = true,
        },
    },

    gm = {
        admin_accounts = {},
        min_gm_level = 1,
    },

    dpx_startup = {
        set_level_cap = true,
        level_cap = 95,
        enable_creator = true,
        enable_unlimit_towerofdespair = true,
        disable_item_routing = true,
        disable_security_protection = true,
        extend_teleport_item = true,
        disable_trade_limit = true,
        set_auction_min_level = true,
        auction_min_level = 10,
        fix_auction_regist_item = true,
        auction_max_total_price = 200000000,
        liberate_random_option = true,
        disable_redeem_item = true,
        disable_mobile_rewards = true,
        set_item_unlock_time = true,
        item_unlock_time = 1,
        enable_game_master = false,
        disable_giveup_panalty = false,
    },

    risk = {
        enable_sql_handlers = false,
        enable_delete_handlers = false,
        enable_security_bypass = false,
        enable_shell_handlers = false,
    },

    limits = {
        auction_max_total_price = 200000000,
        auction_min_level = 10,
        item_unlock_time = 1,
        broadcast_rate_per_min = 5,
    }
}

return config
```

- [ ] **Step 2: Syntax check**

```bash
cd /Users/YPJCoding/Code/dnf-dp/dp2.9 && lua -e "local c = require('script.config'); assert(c.features.enable_online_module == true); assert(c.gm.admin_accounts ~= nil); assert(c.limits.broadcast_rate_per_min == 5); print('config OK')"
```

Expected: `config OK` (or a require-path error that can be verified on server).

- [ ] **Step 3: Commit**

```bash
cd /Users/YPJCoding/Code/dnf-dp/dp2.9 && git add script/config.lua && git commit -m "feat: add module config entries and gm section"
```

---

### Task 2: Create `script/modules/online.lua`

**Files:**
- Create: `script/modules/online.lua`

- [ ] **Step 1: Create the module file**

Create `script/modules/online.lua`:

```lua
-- 在线玩家表模块
--
-- 维护在线玩家列表，提供查询和遍历接口。
-- 注册 Reach_GameWord / Leave_GameWord hook，
-- 不依赖其他模块。

local M = {}

local online = {}  -- keyed by charac_id (cid)

function M.setup(ctx)
    local world = ctx.world
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
            online[cid] = nil
            if logger then
                logger.info("[online][logout] acc=%d chr=%d count=%d",
                    aid, cid, M.count())
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
```

- [ ] **Step 2: Syntax check**

```bash
cd /Users/YPJCoding/Code/dnf-dp/dp2.9 && luac -p script/modules/online.lua && echo "syntax OK"
```

Expected: `syntax OK`

- [ ] **Step 3: Commit**

```bash
cd /Users/YPJCoding/Code/dnf-dp/dp2.9 && git add script/modules/online.lua && git commit -m "feat: add online player table module"
```

---

### Task 3: Create `script/modules/gm_permissions.lua`

**Files:**
- Create: `script/modules/gm_permissions.lua`

- [ ] **Step 1: Create the module file**

Create `script/modules/gm_permissions.lua`:

```lua
-- GM 权限判断模块
--
-- 提供 is_gm(user) 接口，供其他模块判断用户是否有 GM 权限。
-- 鉴权方式：账号 ID 白名单 > GM 等级检查。

local M = {}

local admin_accounts = {}
local min_gm_level = 1

function M.setup(ctx)
    local config = ctx.config or {}
    local gm_config = config.gm or {}
    local accounts = gm_config.admin_accounts or {}

    admin_accounts = {}
    for _, aid in ipairs(accounts) do
        admin_accounts[aid] = true
    end
    min_gm_level = gm_config.min_gm_level or 1

    if ctx.logger then
        ctx.logger.info("[gm_permissions] initialized, admin_count=%d min_gm_level=%d",
            #accounts, min_gm_level)
    end

    return M
end

-- 判断用户是否为 GM。
-- 先检查账号白名单，再检查游戏内 GM 等级。
function M.is_gm(user)
    if not user then
        return false
    end

    -- 账号 ID 白名单
    local aid = user:GetAccId()
    if admin_accounts[aid] then
        return true
    end

    -- GM 等级检查（预留，待确认 DPX API）
    -- local gm_level = user:GetGmLevel()
    -- if gm_level and gm_level >= min_gm_level then
    --     return true
    -- end

    return false
end

return M
```

- [ ] **Step 2: Syntax check**

```bash
cd /Users/YPJCoding/Code/dnf-dp/dp2.9 && luac -p script/modules/gm_permissions.lua && echo "syntax OK"
```

Expected: `syntax OK`

- [ ] **Step 3: Commit**

```bash
cd /Users/YPJCoding/Code/dnf-dp/dp2.9 && git add script/modules/gm_permissions.lua && git commit -m "feat: add gm permissions module"
```

---

### Task 4: Create `script/modules/broadcast.lua`

**Files:**
- Create: `script/modules/broadcast.lua`

- [ ] **Step 1: Create the module file**

Create `script/modules/broadcast.lua`:

```lua
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
```

- [ ] **Step 2: Syntax check**

```bash
cd /Users/YPJCoding/Code/dnf-dp/dp2.9 && luac -p script/modules/broadcast.lua && echo "syntax OK"
```

Expected: `syntax OK`

- [ ] **Step 3: Commit**

```bash
cd /Users/YPJCoding/Code/dnf-dp/dp2.9 && git add script/modules/broadcast.lua && git commit -m "feat: add broadcast module with rate limiting"
```

---

### Task 5: Create `script/modules/item_query.lua`

**Files:**
- Create: `script/modules/item_query.lua`

- [ ] **Step 1: Create the module file**

Create `script/modules/item_query.lua`:

```lua
-- 物品查询指令模块
--
-- 提供 //viewid <名称> 和 //viewname <ID> 聊天指令，
-- 通过 GmInput hook 拦截，使用 dpx.item.query_by_name / query_by_id 查询。
-- 依赖 gm_permissions.lua 进行权限检查。

local M = {}

local gm_module = nil
local logger = nil
local dpx = nil
local game = nil

function M.setup(ctx, deps)
    gm_module = deps and deps.gm_permissions
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

-- GmInput hook 回调。
-- 参数签名参考 dp2: function(fnext, _user, input)
local function on_gm_input(fnext, _user, input)
    if not gm_module then
        return fnext(_user, input)
    end

    local user = game.fac.user(_user)

    -- 权限检查：非 GM 不响应
    if not gm_module.is_gm(user) then
        return fnext(_user, input)
    end

    if not input or type(input) ~= "string" then
        return fnext(_user, input)
    end

    -- //viewid <名称>
    if string.match(input, "^//viewid") and string.len(input) > 8 then
        local name = string.sub(input, 9)
        handle_viewid(user, name)
        return fnext(_user, input)
    end

    -- //viewname <ID>
    if string.match(input, "^//viewname") and string.len(input) > 10 then
        local id = tonumber(string.sub(input, 11))
        if id then
            handle_viewname(user, id)
        end
        return fnext(_user, input)
    end

    -- 未匹配，传递到下一个 handler
    return fnext(_user, input)
end

-- 按名称查询物品 ID。
function handle_viewid(user, name)
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
function handle_viewname(user, id)
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

return M
```

- [ ] **Step 2: Syntax check**

```bash
cd /Users/YPJCoding/Code/dnf-dp/dp2.9 && luac -p script/modules/item_query.lua && echo "syntax OK"
```

Expected: `syntax OK`

- [ ] **Step 3: Commit**

```bash
cd /Users/YPJCoding/Code/dnf-dp/dp2.9 && git add script/modules/item_query.lua && git commit -m "feat: add item query commands module"
```

---

### Task 6: Update `script/bootstrap.lua` to load modules

**Files:**
- Modify: `script/bootstrap.lua`

The bootstrap currently loads config, utils, and handler modules. We add `M.load_modules(ctx)` to load the infrastructure modules in dependency order.

- [ ] **Step 1: Add module loading to bootstrap.lua**

Add the module loading logic after `M.register_handlers` and before `M.setup`.

Add the module list near the top (after `handler_modules`):

```lua
local infra_modules = {
    { key = 'online', module = 'script.modules.online' },
    { key = 'gm_permissions', module = 'script.modules.gm_permissions' },
    { key = 'broadcast', module = 'script.modules.broadcast' },
    { key = 'item_query', module = 'script.modules.item_query' },
}
```

Add the `M.load_modules` function:

```lua
local function is_module_enabled(ctx, module_key)
    local config = ctx.config or {}
    local features = config.features or {}

    -- online module 有独立开关
    if module_key == 'online' then
        return features.enable_online_module == true
    end
    -- broadcast module 有独立开关
    if module_key == 'broadcast' then
        return features.enable_broadcast_module == true
    end
    -- item_query module 有独立开关
    if module_key == 'item_query' then
        return features.enable_item_query == true
    end
    -- gm_permissions 默认开启（仅权限判断，无副作用）
    if module_key == 'gm_permissions' then
        return true
    end
    return false
end

function M.load_modules(ctx)
    local loaded = {}

    for _, item in ipairs(infra_modules) do
        local module_key = item.key
        local module_name = item.module

        if not is_module_enabled(ctx, module_key) then
            if ctx and ctx.logger then
                ctx.logger.info('[bootstrap] skipped module=%s', module_name)
            end
        else
            local module = safe_require(module_name, ctx and ctx.logger)
            if module and type(module.setup) == 'function' then
                module.setup(ctx, loaded)
                loaded[module_key] = module
                if ctx and ctx.logger then
                    ctx.logger.info('[bootstrap] loaded module=%s', module_name)
                end
            elseif ctx and ctx.logger then
                ctx.logger.error('[bootstrap] module missing setup function: %s', module_name)
            end
        end
    end

    return loaded
end
```

Update `M.setup` to call `M.load_modules`:

```lua
function M.setup(item_handler, base_ctx)
    local ctx = M.build_ctx(base_ctx)
    M.install_utils(ctx)
    M.load_modules(ctx)
    M.register_handlers(item_handler, ctx)
    M.register_debug_handlers(item_handler, ctx)
    return ctx
end
```

The full `script/bootstrap.lua` after all edits:

```lua
-- dp2.9 Lua bootstrap
--
-- 说明：
-- 1. 本文件负责统一加载 config、utils、handler 模块和基础设施模块。
-- 2. df_game_r.lua 调用 M.setup(item_handler, ctx) 完成运行时装配。
-- 3. handler 是否注册由 script/config.lua 控制。
-- 4. 当前默认配置已开启全部 handler 模块；SQL、删除、shell 等高风险能力仍由 risk 开关控制。
-- 5. 基础设施模块按依赖顺序加载：online -> broadcast, gm_permissions -> item_query。

local M = {}

local handler_modules = {
    { key = 'quest', module = 'script.handlers.quest' },
    { key = 'job', module = 'script.handlers.job' },
    { key = 'inherit', module = 'script.handlers.inherit' },
    { key = 'misc', module = 'script.handlers.misc' },
    { key = 'item_cleanup', module = 'script.handlers.item_cleanup' },
    { key = 'pvp', module = 'script.handlers.pvp' },
}

local infra_modules = {
    { key = 'online', module = 'script.modules.online' },
    { key = 'gm_permissions', module = 'script.modules.gm_permissions' },
    { key = 'broadcast', module = 'script.modules.broadcast' },
    { key = 'item_query', module = 'script.modules.item_query' },
}

local function safe_require(module_name, logger)
    local ok, module = pcall(require, module_name)
    if not ok then
        if logger then
            logger.error('[bootstrap] failed to require module=%s err=%s', module_name, tostring(module))
        end
        return nil
    end
    return module
end

function M.load_config(logger)
    local config = safe_require('script.config', logger)
    if not config then
        if logger then
            logger.error('[bootstrap] failed to load config, fallback to empty config')
        end
        return {}
    end
    return config
end

function M.load_utils(logger)
    local utils = safe_require('script.utils', logger)
    if not utils then
        if logger then
            logger.error('[bootstrap] failed to load utils, fallback to empty utils')
        end
        return {}
    end
    return utils
end

local function is_modular_handlers_enabled(ctx)
    local config = ctx.config or {}
    local features = config.features or {}
    return features.enable_modular_handlers == true
end

local function is_handler_module_enabled(ctx, module_key)
    local config = ctx.config or {}
    local features = config.features or {}
    local modules = features.modular_handlers or {}
    return modules[module_key] == true
end

local function is_module_enabled(ctx, module_key)
    local config = ctx.config or {}
    local features = config.features or {}

    if module_key == 'online' then
        return features.enable_online_module == true
    end
    if module_key == 'broadcast' then
        return features.enable_broadcast_module == true
    end
    if module_key == 'item_query' then
        return features.enable_item_query == true
    end
    if module_key == 'gm_permissions' then
        return true
    end
    return false
end

function M.register_handlers(item_handler, ctx)
    if not item_handler then
        if ctx and ctx.logger then
            ctx.logger.error('[bootstrap] invalid item_handler')
        end
        return
    end

    if not is_modular_handlers_enabled(ctx) then
        if ctx and ctx.logger then
            ctx.logger.info('[bootstrap] modular handlers disabled')
        end
        return
    end

    for _, item in ipairs(handler_modules) do
        local module_key = item.key
        local module_name = item.module
        if is_handler_module_enabled(ctx, module_key) then
            local module = safe_require(module_name, ctx and ctx.logger)
            if module and type(module.register) == 'function' then
                module.register(item_handler, ctx)
                if ctx and ctx.logger then
                    ctx.logger.info('[bootstrap] registered handler module=%s', module_name)
                end
            elseif ctx and ctx.logger then
                ctx.logger.error('[bootstrap] handler module missing register function: %s', module_name)
            end
        elseif ctx and ctx.logger then
            ctx.logger.info('[bootstrap] skipped handler module=%s', module_name)
        end
    end
end

function M.load_modules(ctx)
    local loaded = {}

    for _, item in ipairs(infra_modules) do
        local module_key = item.key
        local module_name = item.module

        if not is_module_enabled(ctx, module_key) then
            if ctx and ctx.logger then
                ctx.logger.info('[bootstrap] skipped module=%s', module_name)
            end
        else
            local module = safe_require(module_name, ctx and ctx.logger)
            if module and type(module.setup) == 'function' then
                module.setup(ctx, loaded)
                loaded[module_key] = module
                if ctx and ctx.logger then
                    ctx.logger.info('[bootstrap] loaded module=%s', module_name)
                end
            elseif ctx and ctx.logger then
                ctx.logger.error('[bootstrap] module missing setup function: %s', module_name)
            end
        end
    end

    return loaded
end

local function collect_debug_useitem_ids(debug)
    local ids = {}

    if type(debug.test_useitem_ids) == 'table' then
        for _, item_id in ipairs(debug.test_useitem_ids) do
            local id = tonumber(item_id)
            if id then
                table.insert(ids, id)
            end
        end
    end

    local single_id = tonumber(debug.test_useitem_id)
    if single_id then
        table.insert(ids, single_id)
    end

    return ids
end

function M.register_debug_handlers(item_handler, ctx)
    local config = ctx.config or {}
    local debug = config.debug or {}
    local dpx = ctx.dpx
    local logger = ctx.logger

    if debug.enable_test_useitem_handler ~= true then
        return
    end

    local test_item_ids = collect_debug_useitem_ids(debug)
    if #test_item_ids == 0 then
        if logger then
            logger.error('[bootstrap] invalid debug test useitem ids')
        end
        return
    end

    for _, test_item_id in ipairs(test_item_ids) do
        item_handler[test_item_id] = function(user, item_id)
            user:SendNotiPacketMessage('DP2 测试 handler 执行成功！')

            if debug.test_useitem_return_item == true and dpx and dpx.item then
                dpx.item.add(user.cptr, item_id)
            end

            if logger then
                logger.info('[useitem][test] acc=%d chr=%d item_id=%d', user:GetAccId(), user:GetCharacNo(), item_id)
            end
        end

        if logger then
            logger.info('[bootstrap] registered debug useitem handler item_id=%d', test_item_id)
        end
    end
end

function M.apply_dpx_startup(ctx)
    local config = ctx.config or {}
    local startup = config.dpx_startup or {}
    local dpx = ctx.dpx
    local logger = ctx.logger

    if not dpx then
        if logger then
            logger.error('[bootstrap] missing dpx, skip startup config')
        end
        return
    end

    if startup.set_level_cap then
        dpx.set_auction_min_level(startup.level_cap or 95)
    end

    if startup.enable_creator then
        dpx.enable_creator()
    end

    if startup.enable_unlimit_towerofdespair then
        dpx.set_unlimit_towerofdespair()
    end

    if startup.disable_item_routing then
        dpx.disable_item_routing()
    end

    if startup.disable_security_protection then
        dpx.disable_security_protection()
    end

    if startup.extend_teleport_item then
        dpx.extend_teleport_item()
    end

    if startup.disable_trade_limit then
        dpx.disable_trade_limit()
    end

    if startup.set_auction_min_level then
        dpx.set_auction_min_level(startup.auction_min_level or 10)
    end

    if startup.fix_auction_regist_item then
        dpx.fix_auction_regist_item(startup.auction_max_total_price or 200000000)
    end

    if startup.liberate_random_option then
        dpx.liberate_random_option()
    end

    if startup.disable_redeem_item then
        dpx.disable_redeem_item()
    end

    if startup.disable_mobile_rewards then
        dpx.disable_mobile_rewards()
    end

    if startup.enable_game_master then
        dpx.enable_game_master()
    end

    if startup.disable_giveup_panalty then
        dpx.disable_giveup_panalty()
    end

    if startup.set_item_unlock_time then
        dpx.set_item_unlock_time(startup.item_unlock_time or 1)
    end

    if logger then
        logger.info('[bootstrap] applied dpx startup config')
    end
end

function M.install_utils(ctx)
    local utils = ctx and ctx.utils
    if utils and type(utils.install_legacy_globals) == 'function' then
        utils.install_legacy_globals(_G)
        if ctx.logger then
            ctx.logger.info('[bootstrap] installed legacy utils')
        end
    elseif ctx and ctx.logger then
        ctx.logger.error('[bootstrap] utils.install_legacy_globals missing')
    end
end

function M.build_ctx(base_ctx)
    local ctx = base_ctx or {}
    ctx.config = ctx.config or M.load_config(ctx.logger)
    ctx.utils = ctx.utils or M.load_utils(ctx.logger)
    return ctx
end

function M.setup(item_handler, base_ctx)
    local ctx = M.build_ctx(base_ctx)
    M.install_utils(ctx)
    M.load_modules(ctx)
    M.register_handlers(item_handler, ctx)
    M.register_debug_handlers(item_handler, ctx)
    return ctx
end

return M
```

- [ ] **Step 2: Syntax check**

```bash
cd /Users/YPJCoding/Code/dnf-dp/dp2.9 && luac -p script/bootstrap.lua && echo "syntax OK"
```

Expected: `syntax OK`

- [ ] **Step 3: Commit**

```bash
cd /Users/YPJCoding/Code/dnf-dp/dp2.9 && git add script/bootstrap.lua && git commit -m "feat: add infrastructure module loading to bootstrap"
```

---

### Task 7: Update `docs/CODING_STANDARDS.md`

**Files:**
- Modify: `docs/CODING_STANDARDS.md`

- [ ] **Step 1: Add `modules/` to directory structure**

In `docs/CODING_STANDARDS.md`, section 2 "目录规范", add `modules/` under `script/`:

```text
  script/
    config.lua
    handlers/
      quest.lua
      job.lua
      item_cleanup.lua
      inherit.lua
      pvp.lua
      misc.lua
    modules/
      online.lua
      broadcast.lua
      gm_permissions.lua
      item_query.lua
```

- [ ] **Step 2: Verify change**

```bash
grep -A 15 "script/" /Users/YPJCoding/Code/dnf-dp/dp2.9/docs/CODING_STANDARDS.md | grep modules
```

Expected: should find a line with `modules/`.

- [ ] **Step 3: Commit**

```bash
cd /Users/YPJCoding/Code/dnf-dp/dp2.9 && git add docs/CODING_STANDARDS.md && git commit -m "docs: add modules directory to coding standards"
```

---

### Task 8: Final Phase 1 syntax verification

**Files:**
- All Phase 1 files

- [ ] **Step 1: Syntax check all new and modified files**

```bash
cd /Users/YPJCoding/Code/dnf-dp/dp2.9 && \
  luac -p script/config.lua && echo "config.lua OK" && \
  luac -p script/bootstrap.lua && echo "bootstrap.lua OK" && \
  luac -p script/modules/online.lua && echo "online.lua OK" && \
  luac -p script/modules/gm_permissions.lua && echo "gm_permissions.lua OK" && \
  luac -p script/modules/broadcast.lua && echo "broadcast.lua OK" && \
  luac -p script/modules/item_query.lua && echo "item_query.lua OK"
```

Expected: all files report `OK`.

- [ ] **Step 2: Review expected startup log output**

After deployment, the log should show (in order):

```
[bootstrap] installed legacy utils
[online][login] ...           (on player login)
[online] registered hooks
[gm_permissions] initialized, admin_count=0 min_gm_level=1
[bootstrap] loaded module=script.modules.online
[bootstrap] loaded module=script.modules.gm_permissions
[bootstrap] skipped module=script.modules.broadcast    (enable_broadcast_module=false)
[bootstrap] skipped module=script.modules.item_query   (enable_item_query=false)
[bootstrap] registered handler module=script.handlers.quest
[bootstrap] registered handler module=script.handlers.job
[bootstrap] registered handler module=script.handlers.inherit
[bootstrap] registered handler module=script.handlers.misc
[bootstrap] registered handler module=script.handlers.item_cleanup
[bootstrap] registered handler module=script.handlers.pvp
[bootstrap] applied dpx startup config
```

- [ ] **Step 3: Commit Phase 1 README update**

```bash
cd /Users/YPJCoding/Code/dnf-dp/dp2.9 && git add README.md && git commit -m "docs: update README with Phase 1 module status"
```

---

### Task 9: Phase 2 — SQL handler verification (test server)

**Prerequisites:** Database backup confirmed. All Phase 1 code deployed to test server.

- [ ] **Step 1: Enable SQL handlers**

Edit `script/config.lua` on test server:

```lua
risk = {
    enable_sql_handlers = true,
    enable_delete_handlers = false,
    enable_security_bypass = false,
    enable_shell_handlers = false,
}
```

Restart the channel.

- [ ] **Step 2: Test item `2021458807` — Female slayer job change**

1. Create or use a level 1 female slayer character
2. Use item `2021458807` (female slayer job change)
3. Verify: system message says "女鬼剑职业转换 成功！<请切换角色以生效！>"
4. Switch character and verify job field changed
5. Test with level > 1 character: should fail with "女鬼剑职业转换 失败！" and item returned

Log expected:
```
[useitem][sql][job_convert] acc=... chr=... item_id=2021458807
```

- [ ] **Step 3: Test item `2023458801` — Mercenary deployment**

1. Use item `2023458801`
2. Verify: system message says "角色出战 成功！6小时后可领取奖励"
3. Check `charac_link_bonus` table for changes

Log expected:
```
[useitem][sql][mercenary] acc=... chr=... item_id=2023458801
```

- [ ] **Step 4: Test item `2023458803` — Design skill boost**

1. Use item `2023458803`
2. Verify: system message says "角色装备设计图熟练度提升成功！"
3. Check `item_making_skill_info` table

Log expected:
```
[useitem][sql][design_skill] acc=... chr=... item_id=2023458803
```

- [ ] **Step 5: Record verification results**

Append to `docs/RISK_VERIFICATION.md`:

```markdown
## SQL Handler Verification

Date: [date]
Tester: [name]
Server: [channel]
Config: enable_sql_handlers=true

| Item ID | Function | Happy Path | Edge Case 1 | Edge Case 2 | Log Complete | Notes |
|---|---|---|---|---|---|---|
| 2021458807 | Job change | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | |
| 2023458801 | Mercenary | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | |
| 2023458803 | Design skill | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | [PASS/FAIL] | |
```

- [ ] **Step 6: Commit verification results**

```bash
git add docs/RISK_VERIFICATION.md && git commit -m "docs: record SQL handler verification results"
```

---

### Task 10: Phase 2 — Delete handler verification (test server)

**Prerequisites:** SQL verification complete. Database backup confirmed.

- [ ] **Step 1: Enable delete handlers**

Edit `script/config.lua` on test server:

```lua
risk = {
    enable_sql_handlers = true,
    enable_delete_handlers = true,
    enable_security_bypass = false,
    enable_shell_handlers = false,
}
```

Restart the channel.

- [ ] **Step 2: Test item `2021458806` — Pet cleanup**

1. Have a character with pets in creature slots 0-13
2. Use item `2021458806`
3. Verify: pets deleted, `creature_items` table cleaned
4. Test with no pets: verify item returned with appropriate message

- [ ] **Step 3: Test item `2022110503` — Avatar cleanup**

1. Have a character with avatars in avatar slots 10-23
2. Use item `2022110503`
3. Verify: avatars deleted, `user_items` table cleaned
4. Test with no avatars: verify item returned

- [ ] **Step 4: Test item `2022110504` — Equipment disjoint**

1. Have a character with equipment in inventory slots 9-24
2. Use item `2022110504`
3. Verify: equipment disassembled
4. Test with no equipment: verify item returned

- [ ] **Step 5: Record and commit verification results**

Same format as Task 9 Step 5. Commit to `docs/RISK_VERIFICATION.md`.

---

### Task 11: Phase 2 — Shell handler verification (test server)

**Prerequisites:** Delete verification complete.

- [ ] **Step 1: Enable shell handlers**

Edit `script/config.lua` on test server:

```lua
risk = {
    enable_sql_handlers = true,
    enable_delete_handlers = true,
    enable_security_bypass = false,
    enable_shell_handlers = true,
}
```

Verify `script/pvp_exp_inc.sh` exists on server and has execute permissions.

- [ ] **Step 2: Test item `2541121` — PVP experience book**

1. Use item `2541121`
2. Verify: shell script executes, PVP exp changes
3. Test with nil handle (rename script temporarily): verify item returned
4. Test with empty SQL result: verify item returned

- [ ] **Step 3: Record and commit verification results**

Same format. Commit to `docs/RISK_VERIFICATION.md`.

---

### Task 12: Update ROADMAP.md

**Files:**
- Modify: `docs/ROADMAP.md`

- [ ] **Step 1: Update progress after Phase 1 & 2 completion**

Update the checklist in ROADMAP.md:

```markdown
安全可部署版：约 95%
完全功能恢复版：约 75%
```

Add completed items to the checklist and update the "还缺" sections.

- [ ] **Step 2: Commit**

```bash
git add docs/ROADMAP.md && git commit -m "docs: update roadmap after Phase 1 & 2"
```
