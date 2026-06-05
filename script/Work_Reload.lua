-- 测试服热加载脚本
--
-- hot_reload.lua 默认会同时监听：
-- 1. /dp2/script/config.lua：用于配置热应用，例如 finish_back_home.default_mode。
-- 2. /dp2/script/Work_Reload.lua：用于临时执行测试逻辑。
--
-- 本文件默认保持 no-op。需要临时调试时再写入测试逻辑。

logger.info("[Work_Reload] loaded")

-- 示例：临时热更新 finish_back_home。
-- 推荐优先直接修改 script/config.lua 的 finish_back_home 配置；
-- 只有需要执行额外逻辑时再使用本文件。
--
-- local finish_back_home = require("script.modules.finish_back_home")
--
-- finish_back_home.configure({
--     mode = "1",
--     point_min = 100,
--     point_max = 1000,
-- })
--
-- logger.info("[Work_Reload] finish_back_home configured")
