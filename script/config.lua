-- clean runtime template config
--
-- 模板配置文件。
-- 所有业务功能必须默认关闭。
-- 新功能必须先加 features 开关，再接入 bootstrap。

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
