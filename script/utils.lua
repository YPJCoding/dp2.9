-- dp2.9 Lua 工具函数模板
--
-- 说明：
-- 1. 当前文件先作为模板引入，暂不改变现有业务行为。
-- 2. 后续重构时，可将 df_game_r.lua 中的 split、decode_unicode 等工具函数迁入这里。

local M = {}

-- 拆分字符串
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

-- 解码 unicode 字符串，例如 '\\u795e\\u8ff9'
function M.decode_unicode(str)
    if str == nil then
        return ''
    end

    return (str:gsub('\\u(%x%x%x%x)', function(code)
        return utf8.char(tonumber(code, 16))
    end))
end

-- 获取指定时间戳当天零点；未传入时使用当前时间
function M.get_current_day_zero_timestamp(timestamp)
    local ts = timestamp or os.time()
    local format_time = os.date('*t', ts)
    format_time.hour = 0
    format_time.min = 0
    format_time.sec = 0
    return os.time(format_time)
end

return M
