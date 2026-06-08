// 怪物攻城活动常量
// 来源：从旧 frida.js VILLAGEATTACK_STATE_* / EVENT_VILLAGEATTACK_* 常量迁移
// 用途：定义怪物攻城活动的所有常量，供模块内各文件共享

var VILLAGE_ATTACK_CONSTANTS = {
  // 活动阶段
  // 来源：从旧 frida.js 迁移
  STATE_P1: 0,  // 一阶段：小镇周围刷新怪物，击杀牛头统帅提升难度
  STATE_P2: 1,  // 二阶段：城镇出现 GBL 主教，持续扣 PT
  STATE_P3: 2,  // 三阶段：刷新世界 BOSS 机械牛
  STATE_END: 3, // 活动已结束

  // 关键怪物 ID
  // 来源：从旧 frida.js 迁移
  MONSTER_TAU_CAPTAIN: 50071, // 牛头统帅（P1 阶段机制怪，击杀可提升难度）
  MONSTER_GBL_POPE: 262,      // GBL 教主教（P2/P3 城镇怪物，存活时持续扣 PT）
  MONSTER_TAU_META_COW: 17,   // 机械牛（P3 阶段世界 BOSS）

  // 默认配置（可通过 runtime_config.js 覆盖）
  // 来源：从旧 frida.js EVENT_VILLAGEATTACK_* 迁移
  DEFAULT_START_HOUR: 12,     // 每日北京时间 20 点开启（UTC 12 点）
  DEFAULT_TOTAL_TIME: 3600,   // 活动总时长（秒）
  DEFAULT_TARGET_SCORE: [100, 200, 300], // 各阶段目标 PT

  // 奖励表（来源：从旧 frida.js VillageAttackedRewardSendReward 的 switch 迁移）
  // 挑战次数 -> [item_id, count]
  REWARD_TABLE: {
    1: [3037, 5],
    2: [3037, 5],
    3: [3037, 5],
    4: [1085, 2],
    5: [1085, 5],
    6: [1085, 2],
    7: [8, 2],
    8: [8, 5],
    9: [8, 2],
    10: [36, 1],
    11: [36, 1],
    12: [15, 1],
    13: [15, 1],
    14: [3037, 10],
    15: [3262, 2],
    16: [3262, 3],
    17: [2600261, 1],
    18: [2600261, 1],
    19: [3037, 5],
    20: [1031, 2],
    21: [8, 2],
    22: [1085, 2],
    23: [8, 5],
    24: [15, 1],
    25: [15, 2],
    26: [3262, 5],
    27: [3262, 2],
    28: [8, 5],
    29: [1085, 2],
    30: [10000160, 1],
    31: [3037, 5],
    32: [3037, 5],
    33: [8, 2],
    34: [1085, 2],
    35: [2600261, 1],
    36: [10000161, 1],
  },

  // 防守成功奖励道具列表
  // 来源：从旧 frida.js on_end_event_villageattack 防御成功奖励迁移
  DEFEND_SUCCESS_REWARD_ITEMS: [
    [7745, 5],         // 士气冲天
    [2600028, 5],      // 天堂痊愈
    [42, 5],           // 复活币
    [3314, 1],         // 绝望之塔通关奖章
  ],
};

if (typeof globalThis !== 'undefined') {
  globalThis.VILLAGE_ATTACK_CONSTANTS = VILLAGE_ATTACK_CONSTANTS;
}
