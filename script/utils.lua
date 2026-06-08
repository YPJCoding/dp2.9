-- dp2.9 Lua 工具函数
--
-- 说明：
-- 1. 当前文件提供可替代 df_game_r.lua 中旧全局工具函数的实现。
-- 2. 函数名同时保留 snake_case 和旧入口兼容别名，便于小步迁移。

local M = {}

-- 拆分字符串。
-- 兼容 df_game_r.lua 中旧 split(str, reps) 的行为。
function M.split(str, sep)
    local result = {}
    if str == nil or sep == nil then
        return result
    end

    string.gsub(str, '[^' .. sep .. ']+', function(part)
        table.insert(result, part)
    end)

    return result
end

-- 解码 unicode 字符串，例如 '\\u795e\\u8ff9'。
-- 兼容 df_game_r.lua 中旧 decode_unicode(str) 的行为。
function M.decode_unicode(str)
    if str == nil then
        return ''
    end

    return (str:gsub('\\u(%x%x%x%x)', function(code)
        return utf8.char(tonumber(code, 16))
    end))
end

-- 获取指定时间戳当天零点；未传入时使用当前时间。
-- 兼容 df_game_r.lua 中旧 GetCurrentDayZeroTimestamp(_timerStamp) 的行为。
function M.get_current_day_zero_timestamp(timestamp)
    local ts = timestamp or os.time()
    local format_time = os.date('*t', ts)
    format_time.hour = 0
    format_time.min = 0
    format_time.sec = 0
    return os.time(format_time)
end

-- 兼容旧入口全局函数命名，供过渡期使用。
M.GetCurrentDayZeroTimestamp = M.get_current_day_zero_timestamp

-- 将工具函数挂到指定环境中。
-- 后续 df_game_r.lua 可调用 utils.install_legacy_globals(_G)，再逐步替换直接全局调用。
function M.install_legacy_globals(target)
    local env = target or _G
    env.split = env.split or M.split
    env.decode_unicode = env.decode_unicode or M.decode_unicode
    env.GetCurrentDayZeroTimestamp = env.GetCurrentDayZeroTimestamp or M.get_current_day_zero_timestamp
end

return M
