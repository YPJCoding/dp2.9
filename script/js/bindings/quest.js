// 任务系统 binding
// 来源：从旧 frida.js quest 相关函数迁移
// 用途：封装任务完成、提交奖励等操作
//
// 风险：直接操作任务状态和奖励领取，错误使用可能导致任务卡死或重复领奖

function createQuestBinding(addr) {
  const _IsClearedQuest = nf(addr.cquestclear_is_cleared_quest, 'int', ['pointer', 'int']);
  const _GetUserQuestInfo = nf(addr.userquest_get_quest_info, 'int', ['pointer', 'pointer']);

  // 检查任务是否已完成
  function isClearedQuest(questClear, questId) {
    return _IsClearedQuest(questClear, questId);
  }

  // 获取用户任务信息并组包发给客户端
  function getUserQuestInfo(userQuest, packetGuard) {
    return _GetUserQuestInfo(userQuest, packetGuard);
  }

  // 无条件完成指定任务并领取奖励
  // 为什么需要这样做：
  // 1. 需要设置 GM 任务模式绕过材料检查
  // 2. 服务端有反作弊机制：任务完成时间间隔不能小于 1 秒，
  //    需要清零上次完成时间才能连续提交
  // 3. 完成后需要关闭 GM 模式避免影响后续正常任务
  //
  // user: CUser 指针
  // questId: 任务 ID
  // userBinding: createUserBinding 返回的对象
  function forceClearQuest(user, questId, userBinding) {
    // 设置 GM 完成任务模式（无条件完成任务）
    userBinding.setGmQuestFlag(user, 1);
    // 接受任务
    userBinding.questAction(user, 33, questId, 0, 0);
    // 完成任务
    userBinding.questAction(user, 35, questId, 0, 0);
    // 领取任务奖励
    // 倒数第二个参数表示领取奖励的编号:
    //   -1=领取不需要选择的奖励, 0=领取可选奖励中的第1个, 1=领取可选奖励中的第2个
    userBinding.questAction(user, 36, questId, -1, 1);

    // 反作弊：将上次任务完成时间清零，允许连续提交任务
    // 偏移 0x79644 来源于游戏逆向分析，记录上次任务完成时间戳
    user.add(0x79644).writeInt(0);

    // 关闭 GM 完成任务模式
    userBinding.setGmQuestFlag(user, 0);
  }

  return {
    isClearedQuest: isClearedQuest,
    getUserQuestInfo: getUserQuestInfo,
    forceClearQuest: forceClearQuest,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createQuestBinding = createQuestBinding;
}
