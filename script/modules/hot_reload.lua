-- 测试服 Lua 热加载模块
--
-- 默认监听两个文件：
-- 1. /dp2/script/config.lua：配置热应用入口，适合切换已支持热配置的模块。
-- 2. /dp2/script/Work_Reload.lua：可选调试脚本入口，适合临时执行测试逻辑。
--
-- 注意：本模块不会自动重载所有 Lua 文件。原因：require 有缓存，且 dpx.hook/timer
-- 等副作用不能简单重复注册。需要热更新的模块应提供 M.configure(...) 等安全接口。

local M = {}

local timer = nil
local last_script_mtime = nil
local last_config_mtime = nil
local missing_logged = {}

local function get_config(ctx)
    local config = ctx.config or {}
    return config.hot_reload or {}
end

local function close_timer(logger)
    if not timer then
        return
    end

    local ok, err = pcall(function()
        timer:stop()
        if type(timer.close) == "function" then
            timer:close()
        end
    end)

    if not ok and logger then
        logger.error("[hot_reload] failed to close old timer: %s", tostring(err))
    end

    timer = nil
end

local function build_env(ctx)
    local env = {}
    setmetatable(env, { __index = _G })

    env.dp = ctx.dp
    env.dpx = ctx.dpx
    env.game = ctx.game
    env.world = ctx.world
    env.logger = ctx.logger
    env.item_handler = ctx.item_handler
    env.utils = ctx.utils
    env.config = ctx.config

    if ctx.frida then
        env.frida = ctx.frida
    end

    return env
end

local function read_mtime(lfs, filename, logger)
    local ok, mtime_or_err = pcall(function()
        return lfs.attributes(filename, "modification")
    end)

    if not ok then
        if logger then
            logger.error("[hot_reload] failed to read file mtime file=%s err=%s", tostring(filename), tostring(mtime_or_err))
        end
        return nil
    end

    if not mtime_or_err then
        if logger and not missing_logged[filename] then
            logger.info("[hot_reload] watched file not found file=%s", tostring(filename))
            missing_logged[filename] = true
        end
        return nil
    end

    missing_logged[filename] = false
    return mtime_or_err
end

local function compile_script(filename, env, logger)
    local ok, chunk_or_err = pcall(function()
        return loadfile(filename, "t", env)
    end)

    if not ok then
        if logger then
            logger.error("[hot_reload] compile failed file=%s err=%s", tostring(filename), tostring(chunk_or_err))
        end
        return nil
    end

    if type(chunk_or_err) ~= "function" then
        if logger then
            logger.error("[hot_reload] compile returned no chunk file=%s", tostring(filename))
        end
        return nil
    end

    return chunk_or_err
end

local function run_script(filename, ctx, logger)
    local env = build_env(ctx)
    local chunk = compile_script(filename, env, logger)
    if not chunk then
        return false
    end

    local ok, err = pcall(chunk)
    if not ok then
        if logger then
            logger.error("[hot_reload] execute failed file=%s err=%s", tostring(filename), tostring(err))
        end
        return false
    end

    if logger then
        logger.info("[hot_reload] execute success file=%s", tostring(filename))
    end

    return true
end

local function reload_config_module(module_name, logger)
    local old_module = package.loaded[module_name]
    package.loaded[module_name] = nil

    local ok, module_or_err = pcall(require, module_name)
    if not ok then
        package.loaded[module_name] = old_module
        if logger then
            logger.error("[hot_reload] reload config failed module=%s err=%s", tostring(module_name), tostring(module_or_err))
        end
        return nil
    end

    return module_or_err
end

local function apply_hot_config(ctx, new_config)
    local logger = ctx.logger
    ctx.config = new_config

    local features = new_config.features or {}

    -- 当前支持安全热应用的模块：finish_back_home。
    -- 只更新模块运行时配置，不重复注册 GameEvent hook。
    if features.enable_finish_back_home == true and new_config.finish_back_home then
        local ok, finish_back_home_or_err = pcall(require, "script.modules.finish_back_home")
        if ok and finish_back_home_or_err and type(finish_back_home_or_err.configure) == "function" then
            finish_back_home_or_err.configure(new_config.finish_back_home)
        elseif logger then
            logger.error("[hot_reload] finish_back_home hot configure failed: %s", tostring(finish_back_home_or_err))
        end
    end

    if logger then
        local hot_cfg = new_config.hot_reload or {}
        logger.info(
            "[hot_reload] config applied level_cap=%s finish_back_home_mode=%s hot_reload_enabled=%s",
            tostring(new_config.dpx_startup and new_config.dpx_startup.level_cap),
            tostring(new_config.finish_back_home and new_config.finish_back_home.default_mode),
            tostring(hot_cfg.enabled)
        )
    end
end

local function check_script_reload(lfs, filename, ctx, logger)
    if not filename or filename == "" then
        return
    end

    local mtime = read_mtime(lfs, filename, logger)
    if not mtime then
        return
    end

    if last_script_mtime == nil then
        last_script_mtime = mtime
        return
    end

    if mtime ~= last_script_mtime then
        if logger then
            logger.info("[hot_reload] detected script change file=%s old=%s new=%s", tostring(filename), tostring(last_script_mtime), tostring(mtime))
        end

        if run_script(filename, ctx, logger) then
            last_script_mtime = mtime
        end
    end
end

local function check_config_reload(lfs, filename, ctx, logger, module_name)
    if not filename or filename == "" then
        return
    end

    local mtime = read_mtime(lfs, filename, logger)
    if not mtime then
        return
    end

    if last_config_mtime == nil then
        last_config_mtime = mtime
        return
    end

    if mtime ~= last_config_mtime then
        if logger then
            logger.info("[hot_reload] detected config change file=%s old=%s new=%s", tostring(filename), tostring(last_config_mtime), tostring(mtime))
        end

        local new_config = reload_config_module(module_name, logger)
        if new_config then
            apply_hot_config(ctx, new_config)
            last_config_mtime = mtime
        end
    end
end

function M.reload_now(ctx)
    local logger = ctx.logger
    local reload_config = get_config(ctx)
    local script_filename = reload_config.filename or "/dp2/script/Work_Reload.lua"

    local ok_lfs, lfs = pcall(require, "lfs")
    if not ok_lfs then
        if logger then
            logger.error("[hot_reload] lfs module not available, reload skipped")
        end
        return false
    end

    local ok = run_script(script_filename, ctx, logger)
    if ok then
        last_script_mtime = read_mtime(lfs, script_filename, logger)
    end
    return ok
end

function M.reload_config_now(ctx)
    local logger = ctx.logger
    local reload_config = get_config(ctx)
    local module_name = reload_config.config_module or "script.config"
    local config_filename = reload_config.config_filename or "/dp2/script/config.lua"

    local ok_lfs, lfs = pcall(require, "lfs")
    if not ok_lfs then
        if logger then
            logger.error("[hot_reload] lfs module not available, config reload skipped")
        end
        return false
    end

    local new_config = reload_config_module(module_name, logger)
    if not new_config then
        return false
    end

    apply_hot_config(ctx, new_config)
    last_config_mtime = read_mtime(lfs, config_filename, logger)
    return true
end

function M.setup(ctx)
    local logger = ctx.logger
    local config = get_config(ctx)

    if config.enabled ~= true then
        if logger then
            logger.info("[hot_reload] disabled")
        end
        return M
    end

    local ok_lfs, lfs = pcall(require, "lfs")
    if not ok_lfs then
        if logger then
            logger.error("[hot_reload] lfs module not available, module disabled")
        end
        return M
    end

    local ok_luv, luv = pcall(require, "luv")
    if not ok_luv then
        if logger then
            logger.error("[hot_reload] luv module not available, module disabled")
        end
        return M
    end

    close_timer(logger)

    local script_filename = config.filename or "/dp2/script/Work_Reload.lua"
    local config_filename = config.config_filename or "/dp2/script/config.lua"
    local config_module = config.config_module or "script.config"
    local watch_script = config.watch_script ~= false
    local watch_config = config.watch_config ~= false
    local start_delay_ms = tonumber(config.start_delay_ms) or 10000
    local interval_ms = tonumber(config.interval_ms) or 5000
    local run_on_start = config.run_on_start == true

    missing_logged = {}
    last_script_mtime = read_mtime(lfs, script_filename, logger)
    last_config_mtime = read_mtime(lfs, config_filename, logger)

    if run_on_start and watch_script then
        run_script(script_filename, ctx, logger)
        last_script_mtime = read_mtime(lfs, script_filename, logger)
    end

    timer = luv.new_timer()
    timer:start(start_delay_ms, interval_ms, function()
        if watch_config then
            check_config_reload(lfs, config_filename, ctx, logger, config_module)
        end
        if watch_script then
            check_script_reload(lfs, script_filename, ctx, logger)
        end
    end)

    if logger then
        logger.info(
            "[hot_reload] watching config=%s script=%s watch_config=%s watch_script=%s start_delay_ms=%d interval_ms=%d run_on_start=%s",
            tostring(config_filename),
            tostring(script_filename),
            tostring(watch_config),
            tostring(watch_script),
            start_delay_ms,
            interval_ms,
            tostring(run_on_start)
        )
    end

    return M
end

function M.stop(ctx)
    local logger = ctx and ctx.logger or nil
    close_timer(logger)
    if logger then
        logger.info("[hot_reload] stopped")
    end
end

return M
