-- dp2.9 功能配置模板
--
-- 说明：
-- 1. 当前文件先作为模板引入，暂不改变现有业务行为。
-- 2. 后续重构 df_game_r.lua 时，再逐步将 DPX 开关、handler 开关迁入这里。
-- 3. 高风险功能应集中放在 risk 分组中，便于统一审查和关闭。

local config = {
    debug = {
        -- 是否输出更详细的调试日志
        enable_debug_log = false,

        -- 是否启用临时调试 Hook
        -- 注意：调试 Hook 不应在正式环境默认开启
        enable_debug_hooks = false,
    },

    features = {
        -- 是否启用原始道具 handler 分发。
        -- 当前 df_game_r.lua 仍使用旧 handler 表，保持 true。
        enable_item_handlers = true,

        -- 是否启用模块化 handler 注册。
        -- 默认 false，避免 df_game_r.lua 接入 bootstrap 后与旧 handler 重复注册。
        enable_modular_handlers = false,

        -- 按模块控制 handler 注册。
        -- 只有 enable_modular_handlers=true 时才会读取这些开关。
        modular_handlers = {
            quest = false,
            job = false,
            item_cleanup = false,
            inherit = false,
            pvp = false,
            misc = false,
        },
    },

    -- DPX 启动开关。
    -- 默认值保持和当前 df_game_r.lua 入口中的实际调用一致，确保后续接入 config 时不改变行为。
    dpx_startup = {
        -- dpx.set_auction_min_level(95)
        set_level_cap = true,
        level_cap = 95,

        -- dpx.enable_creator()
        enable_creator = true,

        -- dpx.set_unlimit_towerofdespair()
        enable_unlimit_towerofdespair = true,

        -- dpx.disable_item_routing()
        disable_item_routing = true,

        -- dpx.disable_security_protection()
        -- [RISK:HIGH] 解除 100 级及以上安全限制，当前入口默认启用，所以这里先保持 true。
        disable_security_protection = true,

        -- dpx.extend_teleport_item()
        extend_teleport_item = true,

        -- dpx.disable_trade_limit()
        -- [RISK:HIGH] 交易限制相关，当前入口默认启用，所以这里先保持 true。
        disable_trade_limit = true,

        -- dpx.set_auction_min_level(10)
        set_auction_min_level = true,
        auction_min_level = 10,

        -- dpx.fix_auction_regist_item(200000000)
        fix_auction_regist_item = true,
        auction_max_total_price = 200000000,

        -- dpx.liberate_random_option()
        liberate_random_option = true,

        -- dpx.disable_redeem_item()
        disable_redeem_item = true,

        -- dpx.disable_mobile_rewards()
        disable_mobile_rewards = true,

        -- dpx.set_item_unlock_time(1)
        set_item_unlock_time = true,
        item_unlock_time = 1,

        -- 当前入口中为注释状态，默认保持关闭。
        enable_game_master = false,
        disable_giveup_panalty = false,
    },

    risk = {
        -- [RISK:HIGH] 是否允许直接 SQL handler
        enable_sql_handlers = false,

        -- [RISK:HIGH] 是否允许删除宠物/时装/装备类 handler
        enable_delete_handlers = false,

        -- [RISK:HIGH] 是否允许关闭服务端安全限制
        -- 注意：DPX 启动阶段的旧行为由 dpx_startup.disable_security_protection 控制。
        enable_security_bypass = false,

        -- [RISK:HIGH] 是否允许执行外部 shell 脚本
        enable_shell_handlers = false,
    },

    limits = {
        -- 拍卖行消耗品最大总价
        auction_max_total_price = 200000000,

        -- 拍卖行最低等级
        auction_min_level = 10,

        -- 装备解锁时间
        item_unlock_time = 1,
    }
}

return config
