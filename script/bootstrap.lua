-- dp2.9 Lua bootstrap
--
-- 说明：
-- 1. 本文件负责统一加载 config、utils、handler 模块和基础设施模块。
-- 2. df_game_r.lua 调用 M.setup(item_handler, ctx) 完成运行时装配。
-- 3. handler 是否注册由 script/config.lua 控制。
-- 4. 当前默认配置已开启全部 handler 模块；SQL、删除、shell 等高风险能力仍由 risk 开关控制。
-- 5. 基础设施模块按依赖顺序加载：online -> gm_permissions -> broadcast -> item_query -> gameplay modules。

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
    { key = 'signin', module = 'script.modules.signin' },
    { key = 'exp_dungeon', module = 'script.modules.exp_dungeon' },
    { key = 'dungeon_gate', module = 'script.modules.dungeon_gate' },
    { key = 'drop_rules', module = 'script.modules.drop_rules' },
    { key = 'finish_back_home', module = 'script.modules.finish_back_home' },
    { key = 'legacy_patches', module = 'script.modules.legacy_patches' },
    { key = 'hot_reload', module = 'script.modules.hot_reload' },
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

local function is_item_handlers_enabled(ctx)
    local config = ctx.config or {}
    local features = config.features or {}
    return features.enable_item_handlers == true
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

    -- gm_permissions 为工具模块，无副作用，始终加载
    if module_key == 'gm_permissions' then
        return true
    end

    if module_key == 'online' then
        return features.enable_online_module == true
    end
    if module_key == 'broadcast' then
        return features.enable_broadcast_module == true
    end
    if module_key == 'item_query' then
        return features.enable_item_query == true
    end
    if module_key == 'signin' then
        return features.enable_signin == true
    end
    if module_key == 'exp_dungeon' then
        return features.enable_exp_dungeon == true
    end
    if module_key == 'dungeon_gate' then
        return features.enable_dungeon_gate == true
    end
    if module_key == 'drop_rules' then
        return features.enable_drop_rules == true
    end
    if module_key == 'finish_back_home' then
        return features.enable_finish_back_home == true
    end
    if module_key == 'legacy_patches' then
        return features.enable_legacy_patches == true
    end
    if module_key == 'hot_reload' then
        local hot_reload = config.hot_reload or {}
        return hot_reload.enabled == true
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

    if not is_item_handlers_enabled(ctx) then
        if ctx and ctx.logger then
            ctx.logger.info('[bootstrap] item handlers disabled')
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
                local ok, err = pcall(module.setup, ctx, loaded)
                if ok then
                    loaded[module_key] = module
                    if ctx and ctx.logger then
                        ctx.logger.info('[bootstrap] loaded module=%s', module_name)
                    end
                elseif ctx and ctx.logger then
                    ctx.logger.error('[bootstrap] module setup failed: %s err=%s', module_name, tostring(err))
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
            logger.error('[bootstrap] dpx missing, skip startup config')
        end
        return
    end

    if startup.set_level_cap == true then
        local level_cap = tonumber(startup.level_cap) or 85
        dpx.set_max_level(level_cap)
        if logger then logger.info('[dpx_startup] set_max_level=%d', level_cap) end
    end

    if startup.enable_creator == true then
        dpx.enable_creator()
        if logger then logger.info('[dpx_startup] enable_creator') end
    end

    if startup.enable_unlimit_towerofdespair == true then
        dpx.set_unlimit_towerofdespair()
        if logger then logger.info('[dpx_startup] enable_unlimit_towerofdespair') end
    end

    if startup.disable_item_routing == true then
        dpx.disable_item_routing()
        if logger then logger.info('[dpx_startup] disable_item_routing') end
    end

    if startup.disable_security_protection == true then
        dpx.disable_security_protection()
        if logger then logger.info('[dpx_startup] disable_security_protection') end
    end

    if startup.extend_teleport_item == true then
        dpx.extend_teleport_item()
        if logger then logger.info('[dpx_startup] extend_teleport_item') end
    end

    if startup.disable_trade_limit == true then
        dpx.disable_trade_limit()
        if logger then logger.info('[dpx_startup] disable_trade_limit') end
    end

    if startup.set_auction_min_level == true then
        local auction_min_level = tonumber(startup.auction_min_level) or 10
        dpx.set_auction_min_level(auction_min_level)
        if logger then logger.info('[dpx_startup] set_auction_min_level=%d', auction_min_level) end
    end

    if startup.fix_auction_regist_item == true then
        local max_total_price = tonumber(startup.auction_max_total_price) or 200000000
        dpx.fix_auction_regist_item(max_total_price)
        if logger then logger.info('[dpx_startup] fix_auction_regist_item=%d', max_total_price) end
    end

    if startup.liberate_random_option == true then
        dpx.liberate_random_option()
        if logger then logger.info('[dpx_startup] liberate_random_option') end
    end

    if startup.disable_redeem_item == true then
        dpx.disable_redeem_item()
        if logger then logger.info('[dpx_startup] disable_redeem_item') end
    end

    if startup.disable_mobile_rewards == true then
        dpx.disable_mobile_rewards()
        if logger then logger.info('[dpx_startup] disable_mobile_rewards') end
    end

    if startup.set_item_unlock_time == true then
        local unlock_time = tonumber(startup.item_unlock_time) or 1
        dpx.set_item_unlock_time(unlock_time)
        if logger then logger.info('[dpx_startup] set_item_unlock_time=%d', unlock_time) end
    end

    if startup.enable_game_master == true then
        dpx.enable_game_master()
        if logger then logger.info('[dpx_startup] enable_game_master') end
    end

    if startup.disable_giveup_panalty == true then
        dpx.disable_giveup_panalty()
        if logger then logger.info('[dpx_startup] disable_giveup_panalty') end
    end
end

function M.setup(item_handler, ctx)
    ctx = ctx or {}
    ctx.config = ctx.config or M.load_config(ctx.logger)
    ctx.utils = ctx.utils or M.load_utils(ctx.logger)

    M.register_handlers(item_handler, ctx)
    M.register_debug_handlers(item_handler, ctx)
    local modules = M.load_modules(ctx)

    return {
        config = ctx.config,
        utils = ctx.utils,
        modules = modules,
    }
end

return M
