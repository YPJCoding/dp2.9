-- clean runtime template config
--
-- 模板配置文件。
-- 这里仅展示一种配置组织方式，真实项目可以按需要调整。

local config = {
    debug = {
        enable_debug_log = false,
    },

    features = {
        enable_example_module = false,
        enable_example_handler = false,
    },

    example_module = {
        message = "example module is running",
    },
}

return config