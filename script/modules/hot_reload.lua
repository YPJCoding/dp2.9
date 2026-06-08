-- 测试服配置热加载模块
--
-- 默认只监听 /dp2/script/config.lua。
-- 修改 config.lua 后，本模块会重新加载 script.config，并把支持热应用的配置同步到运行中模块。
--
-- 注意：本模块不会自动重载所有 Lua 文件。原因：require 有缓存，且 dpx.hook/timer
-- 等副作用不能简单重复注册。需要热更新的模块必须提供 M.configure(...) 等安全接口。

local M = {}

local timer = nil
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
            logger.info("[hot_reload] watched config not found file=%s", tostring(filename))
            missing_logged[filename] = true
        end
        return nil
    end

    missing_logged[filename] = false
    return mtime_or_err
end

local function reload_config_module(module_name, logger)
    local old_module = package.loaded[module_name]
    package.loaded[module_name] = nil

    local ok, module_or_err = pcall(require, module_name)
    if not ok then
        package.loaded[module_name] = old_module
        if logger then
            logger.error(
                "[hot_reload] reload config failed module=%s err=%s, keep previous config",
                tostring(module_name),
                tostring(module_or_err)
            )
        end
        return nil
    end

    if type(module_or_err) ~= "table" then
        package.loaded[module_name] = old_module
        if logger then
            logger.error(
                "[hot_reload] reload config returned invalid type module=%s type=%s, keep previous config",
                tostring(module_name),
                type(module_or_err)
            )
        end
        return nil
    end

    return module_or_err
end

local function get_finish_back_home_config(new_config)
    if new_config.hot and new_config.hot.finish_back_home then
        return new_config.hot.finish_back_home
    end
    return new_config.finish_back_home
end

local function apply_hot_config(ctx, new_config)
    local logger = ctx.logger

    if type(new_config) ~= "table" then
        if logger then
            logger.error("[hot_reload] invalid config table, keep previous config")
        end
        return false
    end

    local features = new_config.features or {}
    local fbh_config = get_finish_back_home_config(new_config)

    -- 当前支持安全热应用的模块：finish_back_home。
    -- 只更新模块运行时配置，不重复注册 GameEvent hook。
    if features.enable_finish_back_home == true and fbh_config then
        local ok_require, finish_back_home_or_err = pcall(require, "script.modules.finish_back_home")
        if not ok_require or not finish_back_home_or_err or type(finish_back_home_or_err.configure) ~= "function" then
            if logger then
                logger.error("[hot_reload] finish_back_home hot configure unavailable: %s, keep previous config", tostring(finish_back_home_or_err))
            end
            return false
        end

        local ok_configure, configure_err = pcall(finish_back_home_or_err.configure, fbh_config)
        if not ok_configure then
            if logger then
                logger.error("[hot_reload] finish_back_home hot configure failed: %s, keep previous config", tostring(configure_err))
            end
            return false
        end
    end

    ctx.config = new_config

    if logger then
        logger.info(
            "[hot_reload] config applied finish_back_home_mode=%s point=%s-%s",
            tostring(fbh_config and (fbh_config.default_mode or fbh_config.mode)),
            tostring(fbh_config and fbh_config.point_min),
            tostring(fbh_config and fbh_config.point_max)
        )
    end

    return true
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
        if new_config and apply_hot_config(ctx, new_config) then
            last_config_mtime = mtime
        end
    end
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

    if not apply_hot_config(ctx, new_config) then
        return false
    end

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

    local config_filename = config.config_filename or "/dp2/script/config.lua"
    local config_module = config.config_module or "script.config"
    local start_delay_ms = tonumber(config.start_delay_ms) or 10000
    local interval_ms = tonumber(config.interval_ms) or 5000

    missing_logged = {}
    last_config_mtime = read_mtime(lfs, config_filename, logger)

    timer = luv.new_timer()
    timer:start(start_delay_ms, interval_ms, function()
        check_config_reload(lfs, config_filename, ctx, logger, config_module)
    end)

    if logger then
        logger.info(
            "[hot_reload] watching config=%s module=%s start_delay_ms=%d interval_ms=%d",
            tostring(config_filename),
            tostring(config_module),
            start_delay_ms,
            interval_ms
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
