local config = {
    debug = {
        enable_debug_log = false,
        enable_debug_hooks = false,

        -- 临时 UseItem 链路测试 handler。
        -- 默认关闭，避免正式环境劫持 1034-1037 等已有道具。
        enable_test_useitem_handler = false,
        test_useitem_ids = {1034, 1035, 1036, 1037},
        test_useitem_return_item = true,

        -- UseItem trace 默认关闭，需要排查道具入口时可临时开启。
        enable_useitem_trace = false,
    },

    features = {
        enable_item_handlers = true,
        enable_modular_handlers = true,
        enable_online_module = true,
        enable_broadcast_module = false,
        enable_item_query = false,
        modular_handlers = {
            quest = true,
            job = true,
            item_cleanup = true,
            inherit = true,
            pvp = true,
            misc = true,
        },
    },

    gm = {
        admin_accounts = {},  -- account UIDs with GM access
        min_gm_level = 1,
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
        broadcast_rate_per_min = 5,
    },
}

return config
