-- dp2.9 中心配置文件
--
-- 本文件按“是否支持热更新”分区：
--
-- 1. hot：支持热更新的运行时配置。
--    hot_reload 会监听 /dp2/script/config.lua，配置变更后自动应用到支持热配置的模块。
--    当前支持热应用的模块：finish_back_home。
--
-- 2. boot：必须重启频道才会生效的配置。
--    包括 handler/module 注册、DPX 启动开关、风险开关、JS/Frida 配置写入等。
--
-- 3. 为兼容现有模块，文件末尾会把 boot/hot 中的配置映射到旧字段名。

local config = {

    ------------------------------------------------
    -- [HOT] 支持热更新的运行时配置
    ------------------------------------------------
    hot = {
        finish_back_home = {
            -- 副本完成后的自动处理模式。
            -- 修改后由 hot_reload 自动调用 finish_back_home.configure(...) 生效，无需重启。
            -- 0 = 完全关闭：不发点券、不回城、不分解、不出售。
            -- 1 = 发放随机点券 + 回城。
            -- 2 = 发放随机点券 + 使用诺顿分解装备 + 回城。
            -- 3 = 发放随机点券 + 尝试使用在线玩家分解机 + 回城。
            -- 4 = 发放随机点券 + 出售装备 + 回城。
            -- 5 = 仅发放随机点券：不回城、不分解、不出售。
            default_mode = "5",

            -- 副本完成后随机点券下限。
            -- 仅在 default_mode 不为 0 时生效。
            point_min = 100,

            -- 副本完成后随机点券上限。
            -- 仅在 default_mode 不为 0 时生效。
            point_max = 1000,

            -- 装备处理品质白名单。
            -- mode=2 / mode=3 分解装备、mode=4 出售装备时共用。
            -- 为空或 nil 表示不限制品质；配置后只处理 rarity 命中的装备。
            -- 0 = 普通装备，1 = 高级装备。
            equipment_rarities = {0, 1},
        },
    },

    ------------------------------------------------
    -- [BOOT] 调试与热加载开关（多数需要重启）
    ------------------------------------------------
    debug = {
        -- 输出更详细的调试日志。
        -- 当前仅作为统一调试开关预留，具体模块是否读取该开关取决于模块实现。
        enable_debug_log = false,

        -- 临时调试 hook 总开关。
        -- 生产环境不要开启。
        enable_debug_hooks = false,

        -- 临时 UseItem 链路测试 handler。
        -- 开启后会注册 test_useitem_ids 中的道具 ID，用于确认 UseItem1/UseItem2 入口是否可用。
        -- 默认关闭，避免正式环境劫持 1034-1037 等已有道具。
        enable_test_useitem_handler = false,

        -- 临时测试道具 ID 列表。
        -- 仅 enable_test_useitem_handler=true 时生效。
        test_useitem_ids = {1034, 1035, 1036, 1037},

        -- 测试 handler 执行后是否返还测试道具。
        test_useitem_return_item = true,

        -- UseItem trace 日志。
        -- 开启后每次使用道具都会打印 item_id、slot、是否命中 handler。
        -- 排查道具入口时临时开启，平时关闭减少日志量。
        enable_useitem_trace = false,
    },

    hot_reload = {
        -- 配置热加载模块总开关。
        -- true = 启动后监听 config.lua 修改时间，并热应用支持的运行时配置。
        -- false = 不创建热加载 timer。
        enabled = true,

        -- 被监听的配置文件路径。
        config_filename = "/dp2/script/config.lua",

        -- 被重新 require 的配置模块名。
        -- 通常不需要修改。
        config_module = "script.config",

        -- 启动后首次开始检查前的延迟，单位毫秒。
        start_delay_ms = 10000,

        -- 检查 config.lua 修改时间的间隔，单位毫秒。
        interval_ms = 5000,
    },

    ------------------------------------------------
    -- [BOOT] 模块/handler 注册开关（需要重启）
    ------------------------------------------------
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
        enable_online_module = true,
        enable_broadcast_module = true,
        enable_item_query = true,
        enable_player_info = true,
        enable_command_menu = true,
        enable_command_help = true,
        enable_signin = false,
        enable_exp_dungeon = true,
        enable_dungeon_gate = true,
        enable_drop_rules = true,
        enable_finish_back_home = true,
        enable_legacy_patches = false,
    },

    ------------------------------------------------
    -- [BOOT] 玩法模块参数（多数需要重启）
    ------------------------------------------------
    player_info = {
        command = "//myinfo",
    },

    command_menu = {
        command = "//指令",
    },

    command_help = {
        -- 低风险帮助菜单，只展示说明文本，不执行子命令。
        getq_command = "//getq",
        zhiye_command = "//zhiye",
        trans_command = "//trans",
        pvp_command = "//pvp",
    },

    signin = {
        command = "//qd",
        reset_hour = 6,
        server_group = 3,
        mail_title = "每日签到",
        mail_content = "感谢您的支持",
        reward_items = {
            { id = 3340, count = 1 },
        },
        require_gm = false,
        broadcast_enabled = false,
        broadcast_message = "玩家【%s】通过每日签到获得了丰厚的奖励，快来试试吧！聊天框输入//qd",
        success_message = "——————————每日签到——————————  签到奖励发送至邮箱，若空邮件请小退一下!",
        duplicate_message = "——————————每日签到——————————  您今天已经签到完毕，请勿重复签到！",
    },

    exp_dungeon = {
        dungeon_id = 5000,
        level_cap = 85,
        exp_percent = 0.01,
        token_amount = 60,
        interval_ms = 60000,
    },

    dungeon_gate = {
        rules = {
        },
    },

    drop_rules = {
        level_gap = 20,
        bypass_item_id = 80207,
        message = "此副本等级过低，掉落物品已被系统收回！",
    },

    legacy_patches = {
        enable_tower_gold_notice_fix = false,
        tower_dungeon_min_id = 11008,
        tower_dungeon_max_id = 11107,
        enable_save_town_fix = false,
        save_town_from_id = 13,
        save_town_to_id = 11,
        enable_open_extra_dungeons = false,
        open_dungeon_ids = {11007},
    },

    ------------------------------------------------
    -- [BOOT] DPX 启动配置（必须重启）
    ------------------------------------------------
    dpx_startup = {
        set_level_cap = true,
        level_cap = 85,
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
        enable_game_master = true,
        disable_giveup_panalty = true,
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

    js_features = {
        enable_tod_fix = true,
        enable_emblem_fix = true,
        enable_history_log = true,
        enable_create_character_unlimit = true,
        enable_strengthen_refresh = true,
        enable_dark_knight_skill_fix = true,
        enable_account_cargo = false,
        enable_village_attack = true,
        enable_lucky_online = false,
        enable_online_reward = false,
        enable_random_option_inherit = false,
        enable_auto_unseal = false,
        enable_luck_point_drop = true,
        enable_mobile_auth = false,
        enable_user_inout_hook = true,
        enable_ranking = true,
        enable_hidden_option = true,
        enable_return_user = true,
        enable_drop_announce = true,
        enable_vip_login = true,
        enable_batch_item_add = true,
    },
}

config.finish_back_home = config.hot.finish_back_home

return config
