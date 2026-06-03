-- dp2.9 Lua bootstrap 模板
--
-- 说明：
-- 1. 当前文件先作为装配模板引入，暂不改变现有业务行为。
-- 2. 后续 df_game_r.lua 可调用 M.setup(ctx) 统一加载 config、utils、handlers。
-- 3. 这里不直接注册现有 handler，避免和 df_game_r.lua 中已有逻辑重复。

local M = {}

local handler_modules = {
    'script.handlers.quest',
    'script.handlers.job',
    'script.handlers.item_cleanup',
    'script.handlers.inherit',
    'script.handlers.pvp',
    'script.handlers.misc',
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

function M.register_handlers(item_handler, ctx)
    if not item_handler then
        if ctx and ctx.logger then
            ctx.logger.error('[bootstrap] invalid item_handler')
        end
        return
    end

    for _, module_name in ipairs(handler_modules) do
        local module = safe_require(module_name, ctx and ctx.logger)
        if module and type(module.register) == 'function' then
            module.register(item_handler, ctx)
            if ctx and ctx.logger then
                ctx.logger.info('[bootstrap] registered handler module=%s', module_name)
            end
        elseif ctx and ctx.logger then
            ctx.logger.error('[bootstrap] handler module missing register function: %s', module_name)
        end
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
    M.register_handlers(item_handler, ctx)
    return ctx
end

return M
