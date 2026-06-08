// 在线奖励模块
// 来源：从旧 frida.js enable_online_reward() + api_recharge_cash_cera() + api_recharge_cash_cera_point() 迁移
// 用途：在线每 5 分钟发放点券奖励
//
// 风险说明：
// 1. 此功能涉及点券充值，直接调用 billing 库存储过程
// 2. 禁止直接修改 billing 库所有表字段
// 3. 在线时间越长奖励越多，可能影响游戏经济平衡
// 4. 默认关闭，只有明确需要时才启用
// 5. 所有真实地址已迁移到 runtime_addresses.js
//
// 奖励规则：
// - 在线 30 分钟后开始计算
// - 每分钟 0.1 点券
// - 最多奖励 12 小时（半天）

var g_online_reward_started = false;

function startOnlineRewardFeature(ctx) {
  if (g_online_reward_started) {
    console.log('[online_reward] already started');
    return;
  }

  var addr = ctx.addresses;

  try {
    // 点券充值函数（来源：从旧 frida.js api_recharge_cash_cera 迁移）
    // 风险：禁止直接修改 billing 库所有表字段，点券相关操作务必调用数据库存储过程
    var _IPGInput = globalThis.nf(addr.cipghelper_ipg_input, 'int', ['pointer', 'pointer', 'int', 'int', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer', 'pointer']);
    var _IPGQuery = globalThis.nf(addr.cipghelper_ipg_query, 'int', ['pointer', 'pointer']);

    function rechargeCashCera(curUser, amount) {
      // 地址来源：runtime_addresses.js cipghelper_global
      var ipgHelper = addr.cipghelper_global.readPointer();
      // 地址来源：runtime_addresses.js ipg_empty_string
      var emptyString = addr.ipg_empty_string;
      _IPGInput(ipgHelper, curUser, 5, amount, emptyString, emptyString, Memory.allocUtf8String('GM'), ptr(0), ptr(0), ptr(0));
      // 通知客户端充值结果
      _IPGQuery(ipgHelper, curUser);
    }

    // 获取登录时间
    var _GetLoginTick = globalThis.nf(addr.cusercharacinfo_get_login_tick, 'int', ['pointer']);

    // Hook CUser::WorkPerFiveMin
    // 来源：从旧 frida.js enable_online_reward 迁移
    // 为什么 hook 这里：每 5 分钟触发一次，正好用于定期发放在线奖励
    // 风险：这是游戏自身的定时函数，hook 它可能会影响其他 5 分钟逻辑
    globalThis.attachOnce('online_reward_work_per_five_min', addr.cuser_work_per_five_min, {
      onEnter: function (args) {
        var curUser = args[0];

        // 当前系统时间
        var curTime = ctx.time.getCurSec();
        // 本次登录时间
        var loginTick = _GetLoginTick(curUser);

        if (loginTick > 0) {
          // 在线时长（分钟）
          var diffTime = Math.floor((curTime - loginTick) / 60);

          // 在线 30 分钟后才开始计算
          if (diffTime < 30) {
            return;
          }

          // 最多奖励 12 小时
          if (diffTime > 12 * 60) {
            return;
          }

          // 奖励：每分钟 0.1 点券
          var REWARD_CASH_CERA_PER_MIN = 0.1;
          var rewardCashCera = Math.floor(diffTime * REWARD_CASH_CERA_PER_MIN);

          // 发放点券
          rechargeCashCera(curUser, rewardCashCera);

          // 通知客户端奖励已发送
          // 使用 ctx.logger.getTimestamp() 获取时间戳（不要用 ctx.log.getTimestamp()）
          if (ctx.user) {
            ctx.user.sendNotiPacketMessage(
              curUser,
              '[' + ctx.logger.getTimestamp() + '] 在线奖励已发送(当前阶段点券奖励:' + rewardCashCera + ')',
              6
            );
          }
        }
      },
      onLeave: function (retval) {
        // 不影响原函数执行
      }
    });

    g_online_reward_started = true;
    if (ctx.log) ctx.log('[online_reward] started');
  } catch (err) {
    if (ctx.log) ctx.log('[online_reward] failed: ' + err);
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.startOnlineRewardFeature = startOnlineRewardFeature;
}
