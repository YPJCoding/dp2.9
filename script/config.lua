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
        -- 道具 handler 总开关。
        -- false 时不会注册任何 script/handlers/*.lua 中的道具券逻辑。
        enable_item_handlers = true,

        -- 模块化 handler 总开关。
        -- false 时保留 item_handler 表，但不加载模块化 handler。
        enable_modular_handlers = true,

        -- 各 handler 模块独立开关。
        -- 修改后需要重启频道，避免运行中 handler 表残留旧注册。
        modular_handlers = {
            quest = true,         -- 任务清理券：主线/支线/每日/成就任务清理。
            job = true,           -- 职业/觉醒/转职：女鬼剑转换、觉醒券、转职任务券。
            item_cleanup = true,  -- 宠物/时装/装备清理：包含删除类高风险逻辑。
            inherit = true,       -- 装备继承券。
            pvp = true,           -- PVP 经验书：shell + SQL 组合高风险逻辑。
            misc = true,          -- 跨界石、异界重置、角色出战、设计图熟练度等。
        },

        -- 在线玩家表模块。
        -- 注册上线/下线 hook，维护在线角色表，供广播、分解机等模块复用。
        enable_online_module = true,

        -- 全服广播模块。
        -- 依赖 online 模块，提供在线玩家广播能力，并受 limits.broadcast_rate_per_min 限制。
        enable_broadcast_module = true,

        -- 物品查询模块。
        -- 注册 GmInput hook，提供 //view / //viewid / //viewname 只读查询。
        enable_item_query = true,

        -- 玩家个人信息模块。
        -- 注册 GmInput hook，提供 //myinfo 只读查询。
        enable_player_info = true,

        -- 指令菜单模块。
        -- 注册 GmInput hook，提供 //指令 安全菜单。
        enable_command_menu = true,

        -- 低风险帮助菜单模块。
        -- 注册 GmInput hook，提供 //getq / //clearq / //zhiye / //trans / //pvp 说明文本。
        -- 只展示说明，不执行强制接任务、改库、shell 等旧子命令。
        enable_command_help = true,

        -- 每日签到模块。
        -- 注册 GmInput hook，提供 //qd 指令；默认关闭，开启后通过邮件发放奖励。
        enable_signin = false,

        -- 经验副本/泡点模块。
        -- 定时检查在线玩家是否在指定副本，满足条件时发经验和代币。
        enable_exp_dungeon = true,

        -- 持物进图模块。
        -- 根据 dungeon_gate.rules 检查进入指定副本所需道具。
        enable_dungeon_gate = true,

        -- 等级差限制掉落模块。
        -- 高等级角色刷低等级副本时限制掉落，持豁免道具可绕过。
        enable_drop_rules = true,

        -- 翻牌回城模块。
        -- 模块注册需要重启；运行时 mode/点券范围可通过 hot.finish_back_home 热更新。
        enable_finish_back_home = true,

        -- 旧 dp2 入口补丁模块。
        -- 包含绝望之塔金币提示修复、城镇保存修复、开放指定副本。
        -- 默认关闭，测试服逐项确认后再开启。
        enable_legacy_patches = false,
    },

    ------------------------------------------------
    -- [BOOT] 玩法模块参数（多数需要重启）
    ------------------------------------------------
    player_info = {
        -- 玩家个人信息查询指令。
        -- 仅 features.enable_player_info=true 后生效。
        command = "//myinfo",
    },

    command_menu = {
        -- 安全指令菜单。
        -- 仅展示当前已迁移/已开放的低风险命令。
        command = "//指令",
    },

    command_help = {
        -- 低风险帮助菜单，只展示说明文本，不执行子命令。
        getq_command = "//getq",
        clearq_command = "//clearq",
        zhiye_command = "//zhiye",
        trans_command = "//trans",
        pvp_command = "//pvp",
    },

    signin = {
        -- 每日签到指令。
        -- 仅 features.enable_signin=true 后生效。
        command = "//qd",

        -- 每日重置小时，0~23。
        -- 旧脚本口径为每日 6 点重置。
        reset_hour = 6,

        -- 邮件服务器组，旧脚本使用 3。
        server_group = 3,

        -- 签到奖励邮件标题与内容。
        mail_title = "每日签到",
        mail_content = "感谢您的支持",

        -- 签到奖励列表。
        -- 当前使用 dpx.mail.item 逐个发送，每封邮件最多 1 个道具。
        -- 旧脚本默认奖励：3340 x1。
        reward_items = {
            { id = 3340, count = 1 },
        },

        -- 是否限制只有 GM 可签到。
        -- 默认 false，保持旧脚本所有玩家可用的行为。
        require_gm = false,

        -- 是否全服广播签到消息。
        -- 默认 false，避免刷屏；如需保持旧脚本广播行为可改为 true。
        broadcast_enabled = false,
        broadcast_message = "玩家【%s】通过每日签到获得了丰厚的奖励，快来试试吧！聊天框输入//qd",

        -- 玩家提示文案。
        success_message = "——————————每日签到——————————  签到奖励发送至邮箱，若空邮件请小退一下!",
        duplicate_message = "——————————每日签到——————————  您今天已经签到完毕，请勿重复签到！",
    },

    exp_dungeon = {
        -- 经验副本 ID。
        -- 当前 PVF 若不存在该副本，模块不会产生有效奖励。
        dungeon_id = 5000,

        -- 泡点奖励等级上限。
        -- 达到该等级后不再通过泡点获得经验。
        level_cap = 85,

        -- 每次发放的经验比例，例如 0.01 = 1%。
        exp_percent = 0.01,

        -- 每次发放的代币数量。
        token_amount = 60,

        -- 检查间隔，单位毫秒。
        interval_ms = 60000,
    },

    dungeon_gate = {
        -- 持物进图规则。
        -- 为空时 dungeon_gate 模块不会注册 GameEvent hook。
        -- 示例：{dungeon_id = 5000, item_id = 80206, message = "持有特殊凭证才能进入此副本！"}
        rules = {
        },
    },

    drop_rules = {
        -- 等级差阈值。
        -- 角色等级 - 副本等级 > level_gap 时限制掉落。
        level_gap = 20,

        -- 豁免道具 ID。
        -- 背包中持有该道具时不受等级差掉落限制。
        bypass_item_id = 80207,

        -- 掉落被限制时发送给玩家的提示。
        message = "此副本等级过低，掉落物品已被系统收回！",
    },

    legacy_patches = {
        -- 绝望之塔金币提示/卡金币修复。
        -- 对 tower_dungeon_min_id ~ tower_dungeon_max_id 范围内副本的 CParty_UseAncientDungeonItems 直接返回 true。
        enable_tower_gold_notice_fix = false,
        tower_dungeon_min_id = 11008,
        tower_dungeon_max_id = 11107,

        -- 城镇下线卡镇魂修复。
        -- 保存城镇为 save_town_from_id 时改为 save_town_to_id。
        enable_save_town_fix = false,
        save_town_from_id = 13,
        save_town_to_id = 11,

        -- 开放指定副本。
        -- Open_Dungeon 遇到 open_dungeon_ids 中的副本 ID 时返回 true。
        enable_open_extra_dungeons = false,
        open_dungeon_ids = {11007},
    },

    ------------------------------------------------
    -- [BOOT] DPX 启动配置（必须重启）
    ------------------------------------------------
    dpx_startup = {
        -- 当前游戏内容等级上限。
        -- 启动时调用 dpx.set_max_level(level_cap)。当前版本内容为 85 级。
        set_level_cap = true,
        level_cap = 85,

        -- 开启缔造者创建接口。
        enable_creator = true,

        -- 绝望之塔通关后仍可继续挑战，仍需门票。
        enable_unlimit_towerofdespair = true,

        -- 史诗掉落免确认提示框。
        disable_item_routing = true,

        -- [RISK:HIGH] 解除 100 级以上限制。
        -- 会影响服务端安全限制，修改前需确认版本兼容。
        disable_security_protection = true,

        -- 扩展移动药剂可用范围。
        extend_teleport_item = true,

        -- 解除交易限额。
        disable_trade_limit = true,

        -- 设置拍卖行最低使用等级。
        set_auction_min_level = true,
        auction_min_level = 10,

        -- 修复拍卖行消耗品上架最大总价。
        fix_auction_regist_item = true,
        auction_max_total_price = 200000000,

        -- 解除魔法封印合成品级限制。
        liberate_random_option = true,

        -- 关闭 NPC 回购。
        -- 注释保留旧口径：禁用志愿兵相关入口。
        disable_redeem_item = true,

        -- 新创建角色不发送成长契约邮件。
        disable_mobile_rewards = true,

        -- 设置装备解锁时间，单位天。1 = 立即/快速解锁。
        set_item_unlock_time = true,
        item_unlock_time = 1,

        -- [RISK:HIGH] 开启 GM 模式。
        -- 需要将账号 UID 添加到 taiwan_login.gm_manifest 表。
        -- 开启后 GmInput hook、GM 指令等特权功能才有意义。
        enable_game_master = true,

        -- [RISK:HIGH] 退出副本后角色不虚弱。
        disable_giveup_panalty = true,
    },

    ------------------------------------------------
    -- [BOOT] 高风险能力开关（必须重启，默认关闭）
    ------------------------------------------------
    risk = {
        -- [RISK:HIGH][SQL] 允许道具 handler 直接执行 SQL。
        -- 影响：女鬼剑职业转换、角色出战、装备设计图熟练度。
        -- 开启前必须备份数据库并准备回滚方案。
        enable_sql_handlers = false,

        -- [RISK:HIGH][DELETE] 允许道具 handler 删除角色物品。
        -- 影响：宠物清理、时装清理、副职业一键分解。
        -- 宠物/时装清理还需要同时开启 enable_sql_handlers。
        enable_delete_handlers = false,

        -- [RISK:HIGH] 绕过安全限制。
        -- 预留开关，当前不建议开启。
        enable_security_bypass = false,

        -- [RISK:HIGH][SHELL] 允许道具 handler 执行外部 shell 脚本。
        -- 影响：PVP 经验书。PVP 经验书还需要同时开启 enable_sql_handlers。
        enable_shell_handlers = false,
    },

    ------------------------------------------------
    -- [BOOT] 通用数值限制（多数需要重启）
    ------------------------------------------------
    limits = {
        -- 拍卖行最高总价。
        auction_max_total_price = 200000000,

        -- 拍卖行最低使用等级。
        auction_min_level = 10,

        -- 装备解锁时间，单位天。
        item_unlock_time = 1,

        -- 全服广播每分钟最大次数。
        broadcast_rate_per_min = 5,
    },

    ------------------------------------------------
    -- [BOOT] JS/Frida 功能开关（需要重启）
    ------------------------------------------------
    js_features = {
        -- 绝望之塔金币修复。
        enable_tod_fix = true,

        -- 时装镶嵌修复。
        enable_emblem_fix = true,

        -- 历史日志追踪。
        enable_history_log = true,

        -- 解除每日创建角色数量限制。
        enable_create_character_unlimit = true,

        -- +13 以上强化券自动刷新物品栏。
        enable_strengthen_refresh = true,

        -- 黑暗武士技能栏修复。
        enable_dark_knight_skill_fix = true,

        -- [RISK:CRITICAL] 账号仓库扩展至 128 格。
        enable_account_cargo = false,

        -- [RISK:HIGH] 怪物攻城活动。
        enable_village_attack = true,

        -- [RISK:HIGH] 幸运在线玩家。
        enable_lucky_online = false,

        -- [RISK:HIGH] 在线奖励，可能发点券。
        enable_online_reward = false,

        -- [RISK:HIGH] 随机属性继承。
        enable_random_option_inherit = false,

        -- [RISK:HIGH] 自动解封随机属性装备。
        enable_auto_unseal = false,

        -- [RISK:HIGH] 幸运点影响掉落率。
        enable_luck_point_drop = true,

        -- [RISK:HIGH] 取消新账号成长契约。
        enable_mobile_auth = false,

        -- [RISK:HIGH] 上下线处理，涉及幸运点和怪物攻城 UI。
        enable_user_inout_hook = true,

        -- [RISK:HIGH] 战力排行榜系统。
        enable_ranking = true,

        -- [RISK:HIGH] 时装潜能系统。
        enable_hidden_option = true,

        -- [RISK:HIGH] 回归勇士时间设置。
        enable_return_user = true,

        -- [RISK:HIGH] 史诗/传说掉落全服公告和奖励。
        enable_drop_announce = true,

        -- [RISK:HIGH] VIP 等级登录公告。
        enable_vip_login = true,

        -- 批量物品添加 UI 通知。
        enable_batch_item_add = true,
    },
}

------------------------------------------------
-- 兼容字段映射
--
-- 现有模块仍读取 config.finish_back_home。
-- 新结构中热更新配置放在 config.hot.finish_back_home，
-- 这里保持旧字段别名，避免改动所有模块。
------------------------------------------------
config.finish_back_home = config.hot.finish_back_home

return config
