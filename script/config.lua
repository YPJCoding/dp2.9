local config = {
    debug = {
        enable_debug_log = false,
        enable_debug_hooks = false,

        -- 临时 UseItem2 链路测试 handler。
        -- 使用 PVF 中已有的可使用道具触发，用于验证 UseItem2 -> item_handler -> 日志/通知。
        enable_test_useitem_handler = true,
        test_useitem_ids = {1034, 1035, 1036, 1037},
        test_useitem_return_item = true,

        -- 临时 UseItem2 trace。
        -- 开启后，任何进入 UseItem2 hook 的道具都会打印实际 item_id 和是否命中 handler。
        enable_useitem_trace = true,
    },

    features = {
        enable_item_handlers = true,
        enable_modular_handlers = true,
        modular_handlers = {
            quest = true,
            job = true,
            item_cleanup = true,
            inherit = true,
            pvp = true,
            misc = true,
        },
    },

    dpx_startup = {
        set_level_cap = true,
        level_cap = 95,
        enable_creator = true,
        enable_unlimit_towerofdespair = true,
        disable_item_routing = true,
        disable_security_protection = true,
        extend_teleport_item = true,
        disable_trade_limit = true,
        set_auction_min_level = true,
        auction_min_level = 10,
        fix_auction_regist_item = true,
        auction_max_total_price = 200000000,
        liberate_random_option = true,
        disable_redeem_item = true,
        disable_mobile_rewards = true,
        set_item_unlock_time = true,
        item_unlock_time = 1,
        enable_game_master = false,
        disable_giveup_panalty = false,
    },

    risk = {
        enable_sql_handlers = false,
        enable_delete_handlers = false,
        enable_security_bypass = false,
        enable_shell_handlers = false,
    },

    limits = {
        auction_max_total_price = 200000000,
        auction_min_level = 10,
        item_unlock_time = 1,
    }
}

return config
