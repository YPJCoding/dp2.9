-- clean runtime template logger

local M = {}

local function format_message(level, fmt, ...)
    local ok, msg = pcall(string.format, fmt, ...)
    if not ok then
        msg = tostring(fmt)
    end
    return string.format("[template][%s] %s", level, msg)
end

function M.info(fmt, ...)
    print(format_message("INFO", fmt, ...))
end

function M.warn(fmt, ...)
    print(format_message("WARN", fmt, ...))
end

function M.error(fmt, ...)
    print(format_message("ERROR", fmt, ...))
end

return M
