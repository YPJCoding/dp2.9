// JS Runtime 配置中心
// 来源：从旧 frida.js 迁移并重构
// 用途：集中管理所有功能开关和参数，不要在 df_game_r.js 或业务模块中硬编码
//
// 为什么需要集中配置：
// 1. 热重载时可以快速关闭某个出问题的模块
// 2. 不同环境（测试服/正式服）可以用不同配置
// 3. 新人接手时不用翻遍代码找开关

const PROJECT_JS_CONFIG = {
  features: {
    // 定时器调度（dispatcher 线程安全）
    // 几乎所有功能都依赖它，必须开启
    timer_dispatcher: true,

    // 数据库初始化（frida 库建表、活动数据加载）
    // 排行榜和怪物攻城依赖此模块
    database: true,

    // 绝望之塔修复：门票/金币/每10层跳过用户APC
    tod_fix: true,

    // 时装徽章镶嵌修复
    emblem_fix: true,

    // 时装潜能（隐藏属性下发）
    hidden_option: true,

    // 勇士归来时间设置
    return_user: true,

    // 战力排行（前三名站街显示）
    ranking: true,

    // 玩家上线/下线处理（排行榜下发、怪物攻城进度通知等）
    user_inout: true,

    // 怪物攻城活动
    village_attack: true,

    // 在线奖励（每5分钟送点券）
    // 默认关闭，因为涉及充值点券操作，过于高风险
    online_reward: false,
  },

  // 绝望之塔配置
  // 来源：从旧 frida.js fix_TOD(true) 迁移
  tod_fix: {
    // 是否跳过每10层的 UserAPC 挑战
    // 设为 true 时，10/20/.../90 层会跳过玩家 APC，直接进入下一层
    skip_user_apc: true,
  },

  // 勇士归来时间配置
  // 来源：从旧 frida.js set_return_user(15) 迁移
  // day: 回归判定天数（距离上次登录超过此天数即为回归勇士）
  return_user: {
    day: 15,
  },

  // 怪物攻城活动配置
  // 来源：从旧 frida.js EVENT_VILLAGEATTACK_* 系列常量迁移
  village_attack: {
    // 每日活动开启时间（UTC 小时，北京时间 = UTC+8）
    // 12 = 北京时间 20:00
    start_hour: 12,

    // 活动总时长（秒）
    total_time: 3600,

    // 各阶段目标 PT 点数
    // 来源：从旧 frida.js EVENT_VILLAGEATTACK_TARGET_SCORE 迁移
    target_score: [100, 200, 300],
  },
};

if (typeof globalThis !== 'undefined') {
  globalThis.PROJECT_JS_CONFIG = PROJECT_JS_CONFIG;
}
