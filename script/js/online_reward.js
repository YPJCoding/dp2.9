// 在线奖励（来源：dp2/frida.js）
//
// 说明：
// - 旧实现为 enable_online_reward()，hook CUser::WorkPerFiveMin。
// - 在线满 30 分钟后，每 5 分钟按在线时长发放点券。
// - 最多奖励半天在线时长。
// - 属于经济高风险功能，默认由 js_features.enable_online_reward=false 保持关闭。

var g_online_reward_started = false;

function onlineRewardLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [online_reward] ' + message);
  } catch (e) {
    console.log('[online_reward] ' + message);
  }
}

function getOnlineRewardSeconds() {
  if (typeof api_CSystemTime_getCurSec === 'function') {
    return api_CSystemTime_getCurSec();
  }
  return Math.floor(Date.now() / 1000);
}

function calcOnlineRewardCera(user) {
  const curTime = getOnlineRewardSeconds();
  const loginTick = CUserCharacInfo_GetLoginTick(user);
  if (!loginTick || loginTick <= 0) {
    return 0;
  }

  const diffMinutes = Math.floor((curTime - loginTick) / 60);

  // 旧逻辑：在线 30min 后开始计算。
  if (diffMinutes < 30) {
    return 0;
  }

  // 旧逻辑：在线奖励最多发送半天。
  if (diffMinutes > 12 * 60) {
    return 0;
  }

  // 旧逻辑：每分钟 0.1 点券。
  return Math.floor(diffMinutes * 0.1);
}

function grantOnlineReward(user) {
  if (!user || user.isNull()) {
    return false;
  }

  const rewardCera = calcOnlineRewardCera(user);
  if (rewardCera <= 0) {
    return false;
  }

  api_recharge_cash_cera(user, rewardCera);
  api_CUser_SendNotiPacketMessage(user, '[' + get_timestamp() + '] 在线奖励已发送(当前阶段点券奖励:' + rewardCera + ')', 6);
  onlineRewardLog('grant cera=' + rewardCera + ' user=' + api_CUserCharacInfo_getCurCharacName(user));
  return true;
}

function startOnlineReward() {
  if (g_online_reward_started) {
    onlineRewardLog('already started, skip duplicate hook');
    return;
  }

  // CUser::WorkPerFiveMin
  Interceptor.attach(ptr(0x8652F0C), {
    onEnter: function (args) {
      try {
        grantOnlineReward(args[0]);
      } catch (e) {
        onlineRewardLog('grant failed: ' + e.message);
      }
    },
    onLeave: function (retval) {}
  });

  g_online_reward_started = true;
  onlineRewardLog('started');
}

// 兼容旧入口命名。
function enable_online_reward() {
  return startOnlineReward();
}
