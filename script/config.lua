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
        -- 是否启用道具 handler 分发
        enable_item_handlers = true,

        -- 是否允许创建缔造者
        enable_creator = true,

        -- 是否设置物品免确认
        disable_item_routing = true,

        -- 是否解除交易限额
        disable_trade_limit = true,

        -- 是否修复拍卖行消耗品上架最大总价
        fix_auction_regist_item = true,

        -- 是否扩展移动瞬间药剂 ID
        extend_teleport_item = true,
    },

    risk = {
        -- [RISK:HIGH] 是否允许直接 SQL handler
        enable_sql_handlers = false,

        -- [RISK:HIGH] 是否允许删除宠物/时装/装备类 handler
        enable_delete_handlers = false,

        -- [RISK:HIGH] 是否允许关闭服务端安全限制
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
