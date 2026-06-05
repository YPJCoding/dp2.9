-- dp2.9 中心配置文件
-- 所有功能开关、DPX 启动配置、风险控制、数值限制均集中于此。
-- 修改后重启频道生效。

local config = {

    ------------------------------------------------
    -- 调试开关
    ------------------------------------------------
    debug = {
        -- 开启调试日志（输出更多细节）
        enable_debug_log = false,

        -- 开启调试 hook（临时排查用，生产环境不要开）
        enable_debug_hooks = false,

        -- 临时 UseItem 链路测试 handler。
        -- 默认关闭，避免正式环境劫持 1034-1037 等已有道具。
        enable_test_useitem_handler = false,
        test_useitem_ids = {1034, 1035, 1036, 1037},
        test_useitem_return_item = true,

        -- UseItem trace：每次使用道具时打印详细日志。
        -- 需要排查道具入口时可临时开启，平时关闭减少日志量。
        enable_useitem_trace = false,
    },

    ------------------------------------------------
    -- 功能模块开关
    ------------------------------------------------
    features = {
        -- 道具 handler 总开关（关闭后所有道具券失效）
        enable_item_handlers = true,

        -- 模块化 handler 总开关（关闭后不再加载 script/handlers/）
        enable_modular_handlers = true,

        -- 各 handler 模块独立开关，可单独关闭某个模块
        modular_handlers = {
            quest = true,         -- 任务清理券
            job = true,           -- 转职/觉醒券
            item_cleanup = true,  -- 宠物/时装/装备清理券
            inherit = true,       -- 装备继承券
            pvp = true,           -- PVP 经验书
            misc = true,          -- 跨界石/异界重置/出战等
        },

        -- 在线玩家表模块（login/logout 记录、在线查询）
        enable_online_module = true,

        -- 全服广播模块（依赖 online，带频率限制）
        enable_broadcast_module = true,

        -- 物品查询指令模块（//viewid / //viewname，所有人可用）
        enable_item_query = true,

        -- 经验副本/泡点模块（在线玩家在指定副本中每分钟获得经验和代币）
        enable_exp_dungeon = true,

        -- 持物进图模块（进入指定副本需要持有指定道具）
        enable_dungeon_gate = true,

        -- 等级差限制掉落模块（高等级刷低级图不掉落，持豁免道具可绕过）
        enable_drop_rules = true,

        -- 翻牌回城模块（副本完成后随机点券 + 自动回城/分解/出售）
        enable_finish_back_home = true,

        -- 旧 dp2 入口补丁迁移模块。
        -- 默认关闭；测试服逐项确认后再开启子功能。
        enable_legacy_patches = false,
    },

    ------------------------------------------------
    -- 玩法模块参数配置
    ------------------------------------------------
    exp_dungeon = {
        dungeon_id = 5000,      -- 经验副本 ID
        level_cap = 90,         -- 等级上限（达到后不再获得经验）
        exp_percent = 0.01,     -- 每次获得的经验比例（1%）
        token_amount = 60,      -- 每次获得的代币数量
        interval_ms = 60000,    -- 执行间隔（毫秒），60000=每分钟
    },

    dungeon_gate = {
        rules = {
            -- {dungeon_id = 5000, item_id = 80206, message = "持有特殊凭证才能进入此副本！"},
        },
    },

    drop_rules = {
        level_gap = 20,             -- 等级差阈值（角色等级 - 副本等级 > 此值时限制掉落）
        bypass_item_id = 80207,     -- 豁免道具 ID（背包中有此道具时不受限制）
        message = "此副本等级过低，掉落物品已被系统收回！",
    },

    finish_back_home = {
        default_mode = "0",     -- 默认模式：0=关 1=回城 2=诺顿分解+回城 3=玩家分解机+回城 4=出售+回城
        point_min = 100,        -- 随机点券最小值
        point_max = 1000,       -- 随机点券最大值
    },

    legacy_patches = {
        -- 修复绝望之塔卡金币 / 金币提示异常。
        enable_tower_gold_notice_fix = false,
        tower_dungeon_min_id = 11008,
        tower_dungeon_max_id = 11107,

        -- 城镇下线卡镇魂修复：保存城镇 13 时改为 11。
        enable_save_town_fix = false,
        save_town_from_id = 13,
        save_town_to_id = 11,

        -- 开放指定副本，例如 11007 极限祭坛。
        enable_open_extra_dungeons = false,
        open_dungeon_ids = {11007},
    },

    ------------------------------------------------
    -- DPX 启动配置（影响服务端全局行为）
    -- [RISK:HIGH] 标注意味着开启后影响范围大，需确认后果
    ------------------------------------------------
    dpx_startup = {
        -- 等级上限
        set_level_cap = true,
        level_cap = 95,

        -- 开启缔造者创建接口
        enable_creator = true,

        -- 绝望之塔通关后仍可继续挑战（需门票）
        enable_unlimit_towerofdespair = true,

        -- 史诗免确认提示框
        disable_item_routing = true,

        -- [RISK:HIGH] 解除 100 级以上限制
        disable_security_protection = true,

        -- 扩展移动药剂可用范围
        extend_teleport_item = true,

        -- 解除交易限额
        disable_trade_limit = true,

        -- 拍卖行最低使用等级
        set_auction_min_level = true,
        auction_min_level = 10,

        -- 修复拍卖行消耗品上架最大总价
        fix_auction_regist_item = true,
        auction_max_total_price = 200000000,

        -- 解除魔法封印合成品级限制
        liberate_random_option = true,

        -- 关闭 NPC 回购（禁用志愿兵）
        disable_redeem_item = true,

        -- 新创建角色不发送成长契约邮件
        disable_mobile_rewards = true,

        -- 装备解锁时间（天），1=立即解锁
        set_item_unlock_time = true,
        item_unlock_time = 1,

        -- [RISK:HIGH] 开启 GM 模式。
        -- 需要将账号 UID 添加到 taiwan_login.gm_manifest 表。
        -- 开启后 GmInput hook、GM 指令等特权功能生效。
        enable_game_master = true,

        -- [RISK:HIGH] 退出副本后角色不虚弱
        disable_giveup_panalty = false,
    },

    ------------------------------------------------
    -- 高风险能力开关（默认全部关闭）
    -- 逐项在测试服验证后再考虑开启，开启前务必备份数据库
    ------------------------------------------------
    risk = {
        -- [RISK:HIGH][SQL] 允许道具直接执行 SQL（改库操作）
        -- 影响：女鬼剑职业转换、角色出战、装备设计图熟练度
        enable_sql_handlers = false,

        -- [RISK:HIGH][DELETE] 允许道具删除角色物品
        -- 影响：宠物清理、时装清理、副职业一键分解
        enable_delete_handlers = false,

        -- [RISK:HIGH] 绕过安全限制（预留）
        enable_security_bypass = false,

        -- [RISK:HIGH][SHELL] 允许道具执行外部 shell 脚本
        -- 影响：PVP 经验书
        enable_shell_handlers = false,
    },

    ------------------------------------------------
    -- 数值限制
    ------------------------------------------------
    limits = {
        -- 拍卖行最高总价
        auction_max_total_price = 200000000,

        -- 拍卖行最低使用等级
        auction_min_level = 10,

        -- 装备解锁时间（天）
        item_unlock_time = 1,

        -- 全服广播每分钟最大次数
        broadcast_rate_per_min = 5,
    },

    ------------------------------------------------
    -- JS/Frida 功能开关（df_game_r.js setup() 读取）
    -- 修改后重启频道生效
    ------------------------------------------------
    js_features = {
        -- 绝望之塔金币修复（当前启用）
        enable_tod_fix = true,

        -- 时装镶嵌修复（当前启用）
        enable_emblem_fix = true,

        -- 历史日志追踪（当前启用）
        enable_history_log = true,

        -- 解除每日创建角色数量限制（当前启用）
        enable_create_character_unlimit = true,

        -- +13以上强化券自动刷新物品栏（当前启用）
        enable_strengthen_refresh = true,

        -- 黑暗武士技能栏修复（当前启用）
        enable_dark_knight_skill_fix = true,

        -- [RISK:CRITICAL] 账号仓库扩展至128格
        enable_account_cargo = false,

        -- [RISK:HIGH] 怪物攻城活动
        enable_village_attack = false,

        -- [RISK:HIGH] 幸运在线玩家
        enable_lucky_online = false,

        -- [RISK:HIGH] 在线奖励（发点券）
        enable_online_reward = false,

        -- [RISK:HIGH] 随机属性继承
        enable_random_option_inherit = false,

        -- [RISK:HIGH] 自动解封随机属性装备
        enable_auto_unseal = false,

        -- [RISK:HIGH] 幸运点影响掉落率
        enable_luck_point_drop = false,

        -- [RISK:HIGH] 取消新账号成长契约
        enable_mobile_auth = false,

        -- [RISK:HIGH] 上下线处理（幸运点+怪物攻城UI）
        enable_user_inout_hook = false,

        -- [RISK:HIGH] 战力排行榜系统
        enable_ranking = false,

        -- [RISK:HIGH] 时装潜能系统
        enable_hidden_option = false,

        -- [RISK:HIGH] 回归勇士时间设置
        enable_return_user = true,

        -- [RISK:HIGH] 史诗/传说掉落全服公告+奖励
        enable_drop_announce = false,

        -- [RISK:HIGH] VIP 等级登录公告
        enable_vip_login = false,

        -- 批量物品添加 UI 通知
        enable_batch_item_add = false,
    },
}

return config
