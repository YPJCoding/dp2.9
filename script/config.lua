local config = {
    debug = {
        enable_debug_log = false,
        enable_debug_hooks = false,
    },

    features = {
        enable_item_handlers = true,
        enable_modular_handlers = true,
        modular_handlers = {
            quest = true,
            job = true,
            item_cleanup = false,
            inherit = false,
            pvp = false,
            misc = false,
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
