-- dp2.9 Lua bootstrap
--
-- 说明：
-- 1. 本文件负责统一加载 config、utils 和 handler 模块。
-- 2. df_game_r.lua 调用 M.setup(item_handler, ctx) 完成运行时装配。
-- 3. handler 是否注册由 script/config.lua 控制。
-- 4. 当前默认配置已开启全部 handler 模块；SQL、删除、shell 等高风险能力仍由 risk 开关控制。

local M = {}

local handler_modules = {
    { key = 'quest', module = 'script.handlers.quest' },
    { key = 'job', module = 'script.handlers.job' },
    { key = 'inherit', module = 'script.handlers.inherit' },
    { key = 'misc', module = 'script.handlers.misc' },
    { key = 'item_cleanup', module = 'script.handlers.item_cleanup' },
    { key = 'pvp', module = 'script.handlers.pvp' },
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
    M.register_handlers(item_handler, ctx)
    M.register_debug_handlers(item_handler, ctx)
    return ctx
end

return M
