-- 测试服 Lua 热加载模块
--
-- 迁移自旧 dp2/df_game_r.lua 的 Work_Reload.lua 热加载逻辑。
-- 默认关闭，仅建议测试服或开发环境启用。
--
-- 设计目标：
-- 1. 通过 lfs.attributes 轮询脚本修改时间。
-- 2. 使用 loadfile(filename, "t", env) 在隔离环境中执行脚本。
-- 3. 向热加载脚本暴露 dp/dpx/game/world/logger/item_handler 等上下文。
-- 4. 加载失败只记录日志，不影响主入口启动。

local M = {}

local timer = nil
local last_modification_time = nil
local last_missing_logged = false

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
        if logger and not last_missing_logged then
            logger.info("[hot_reload] watched file not found file=%s", tostring(filename))
            last_missing_logged = true
        end
        return nil
    end

    last_missing_logged = false
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

local function run_script(filename, env, logger)
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

local function check_and_reload(lfs, filename, env, logger)
    local mtime = read_mtime(lfs, filename, logger)
    if not mtime then
        return
    end

    if last_modification_time == nil then
        last_modification_time = mtime
        return
    end

    if mtime ~= last_modification_time then
        if logger then
            logger.info("[hot_reload] detected file change file=%s old=%s new=%s", tostring(filename), tostring(last_modification_time), tostring(mtime))
        end

        if run_script(filename, env, logger) then
            last_modification_time = mtime
        end
    end
end

function M.reload_now(ctx)
    local logger = ctx.logger
    local reload_config = get_config(ctx)
    local filename = reload_config.filename or "/dp2/script/Work_Reload.lua"

    local ok_lfs, lfs = pcall(require, "lfs")
    if not ok_lfs then
        if logger then
            logger.error("[hot_reload] lfs module not available, reload skipped")
        end
        return false
    end

    local env = build_env(ctx)
    local ok = run_script(filename, env, logger)
    if ok then
        last_modification_time = read_mtime(lfs, filename, logger)
    end
    return ok
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

    local filename = config.filename or "/dp2/script/Work_Reload.lua"
    local start_delay_ms = tonumber(config.start_delay_ms) or 10000
    local interval_ms = tonumber(config.interval_ms) or 5000
    local run_on_start = config.run_on_start == true
    local env = build_env(ctx)

    last_missing_logged = false
    last_modification_time = read_mtime(lfs, filename, logger)

    if run_on_start then
        run_script(filename, env, logger)
        last_modification_time = read_mtime(lfs, filename, logger)
    end

    timer = luv.new_timer()
    timer:start(start_delay_ms, interval_ms, function()
        check_and_reload(lfs, filename, env, logger)
    end)

    if logger then
        logger.info(
            "[hot_reload] watching file=%s start_delay_ms=%d interval_ms=%d run_on_start=%s",
            tostring(filename),
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
