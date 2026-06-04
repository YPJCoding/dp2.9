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
}

return config
