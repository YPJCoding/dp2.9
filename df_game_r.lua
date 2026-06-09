-- clean runtime Lua entry
--
-- 当前项目 Lua 侧不承载业务逻辑。
-- Frida runtime 由 df_game_r.js 通过 dp_load 动态加载 script/js/** 启动。
--
-- 保留 setup(ctx) 是为了兼容 DP2 Lua 入口调用约定。

local M = {}

function M.setup(ctx)
    return M
end

return M
