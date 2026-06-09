-- DP2 Lua compatibility entry
--
-- 当前 template 的 Lua 侧不承载业务逻辑。
-- 实际 runtime 入口是 df_game_r.js，通过 dp_load 动态加载 script/js/**。
--
-- 保留 setup(ctx) 是为了兼容 DP2 Lua 入口调用约定。
-- 不要在这里 require script.bootstrap 或其它 template-only Lua 模块。

local M = {}

function M.setup(ctx)
    return M
end

return M
