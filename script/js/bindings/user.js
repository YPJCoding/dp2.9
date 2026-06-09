// 角色操作 binding
// 来源：从旧 frida.js CUser* 系列函数迁移
// 用途：封装角色状态、属性、数据相关操作
//
// 风险：这些函数直接操作角色对象，参数需确保是有效的 CUser 指针

function createUserBinding(addr) {
  const _GetState = nf(addr.cuser_get_state, 'int', ['pointer']);
  const _GetAccId = nf(addr.cuser_get_acc_id, 'int', ['pointer']);
  const _GetCurCharacNo = nf(addr.cusercharacinfo_get_cur_charac_no, 'int', ['pointer']);
  const _GetCharacLevel = nf(addr.cusercharacinfo_get_charac_level, 'int', ['pointer']);
  const _GetCurCharacName = nf(addr.cusercharacinfo_get_cur_charac_name, 'pointer', ['pointer']);
  const _GetLevelUpExp = nf(addr.cusercharacinfo_get_level_up_exp, 'int', ['pointer', 'int']);
  const _GetCurCharacInvenW = nf(addr.cusercharacinfo_get_cur_charac_inven_w, 'pointer', ['pointer']);
  const _GetCharacJob = nf(addr.cusercharacinfo_get_charac_job, 'int', ['pointer']);
  const _GetCurCharacGrowType = nf(addr.cusercharacinfo_get_cur_charac_grow_type, 'int', ['pointer']);
  const _GetCharacGuildkey = nf(addr.cusercharacinfo_get_charac_guildkey, 'int', ['pointer']);
  const _GetGuildName = nf(addr.cuser_get_guild_name, 'pointer', ['pointer']);
  const _GetLoginTick = nf(addr.cusercharacinfo_get_login_tick, 'int', ['pointer']);
  const _GetParty = nf(addr.cuser_get_party, 'pointer', ['pointer']);
  const _GetCharacExpandData = nf(addr.cuser_get_charac_expand_data, 'pointer', ['pointer', 'int']);
  const _GetCera = nf(addr.cuser_get_cera, 'int', ['pointer']);
  const _GetCurCharacQuestW = nf(addr.cuser_get_cur_charac_quest_w, 'pointer', ['pointer']);
  const _CheckItemLock = nf(addr.cuser_check_item_lock, 'int', ['pointer', 'int', 'int']);
  const _Send = nf(addr.cuser_send, 'int', ['pointer', 'pointer']);
  const _SendNotiPacketMessage = nf(addr.cuser_send_noti_packet_message, 'int', ['pointer', 'pointer', 'int']);
  const _SendUpdateItemList = nf(addr.cuser_send_update_item_list, 'int', ['pointer', 'int', 'int', 'int']);
  const _SendClearQuestList = nf(addr.cuser_send_clear_quest_list, 'int', ['pointer']);
  const _QuestAction = nf(addr.cuser_quest_action, 'int', ['pointer', 'int', 'int', 'int', 'int']);
  const _SetGmQuestFlag = nf(addr.cuser_set_gm_quest_flag, 'int', ['pointer', 'int']);
  const _GainExpSp = nf(addr.cuser_gain_exp_sp, 'int', ['pointer', 'int', 'pointer', 'pointer', 'int', 'int', 'int']);
  const _SendNotiPacket = nf(addr.cuser_send_noti_packet, 'int', ['pointer', 'int', 'int', 'int']);
  const _GetServerGroup = nf(addr.cuser_get_server_group, 'int', ['pointer']);
  const _GetCurVAttackCount = nf(addr.cuser_get_cur_vattack_count, 'int', ['pointer']);
  const _EnableSaveCharacStat = nf(addr.cusercharacinfo_enable_save_charac_stat, 'int', ['pointer']);

  // 获取角色状态
  // 返回：0=未登录, 1=创建角色, 2=选择角色, 3=已进入游戏
  function getState(user) {
    return _GetState(user);
  }

  // 获取账号 ID
  function getAccId(user) {
    return _GetAccId(user);
  }

  // 获取当前角色 ID (charac_no)
  function getCurCharacNo(user) {
    return _GetCurCharacNo(user);
  }

  // 获取角色等级
  function getCharacLevel(user) {
    return _GetCharacLevel(user);
  }

  // 获取角色名字
  function getCurCharacName(user) {
    const p = _GetCurCharacName(user);
    if (p.isNull()) {
      return '';
    }
    return p.readUtf8String(-1);
  }

  // 获取当前等级升级所需经验
  function getLevelUpExp(user, level) {
    return _GetLevelUpExp(user, level);
  }

  // 获取角色背包指针
  function getCurCharacInvenW(user) {
    return _GetCurCharacInvenW(user);
  }

  // 获取角色职业
  function getCharacJob(user) {
    return _GetCharacJob(user);
  }

  // 获取 PVP 段位
  function getCurCharacGrowType(user) {
    return _GetCurCharacGrowType(user);
  }

  // 获取角色公会 ID
  function getCharacGuildkey(user) {
    return _GetCharacGuildkey(user);
  }

  // 获取角色公会名称
  function getGuildName(user) {
    const p = _GetGuildName(user);
    if (p.isNull()) {
      return '';
    }
    return p.readUtf8String(-1);
  }

  // 获取本次登录时间
  function getLoginTick(user) {
    return _GetLoginTick(user);
  }

  // 获取角色所在队伍
  function getParty(user) {
    return _GetParty(user);
  }

  // 获取角色扩展数据
  function getCharacExpandData(user, expandType) {
    return _GetCharacExpandData(user, expandType);
  }

  // 获取角色点券余额
  function getCera(user) {
    return _GetCera(user);
  }

  // 获取角色任务信息
  function getCurCharacQuestW(user) {
    return _GetCurCharacQuestW(user);
  }

  // 检查道具是否被锁定
  function checkItemLock(user, invenType, slot) {
    return _CheckItemLock(user, invenType, slot);
  }

  // 发包给客户端
  function send(user, packetGuard) {
    return _Send(user, packetGuard);
  }

  // 给角色发消息
  function sendNotiPacketMessage(user, msg, msgType) {
    const p = Memory.allocUtf8String(msg);
    _SendNotiPacketMessage(user, p, msgType);
  }

  // 通知客户端道具更新
  function sendUpdateItemList(user, notifyType, itemSpace, slot) {
    return _SendUpdateItemList(user, notifyType, itemSpace, slot);
  }

  // 通知客户端更新已完成任务列表
  function sendClearQuestList(user) {
    return _SendClearQuestList(user);
  }

  // 任务操作
  // action: 33=接受任务, 34=放弃任务, 35=任务完成条件已满足, 36=提交任务领取奖励
  function questAction(user, action, questId, arg3, arg4) {
    return _QuestAction(user, action, questId, arg3, arg4);
  }

  // 设置 GM 完成任务模式（无条件完成任务）
  function setGmQuestFlag(user, flag) {
    return _SetGmQuestFlag(user, flag);
  }

  // 给角色增加经验
  function gainExpSp(user, exp) {
    const a2 = Memory.alloc(4);
    const a3 = Memory.alloc(4);
    return _GainExpSp(user, exp, a2, a3, 0, 0, 0);
  }

  // 通知客户端更新角色身上装备
  function sendNotiPacket(user, notifyType, arg2, arg3) {
    return _SendNotiPacket(user, notifyType, arg2, arg3);
  }

  // 获取角色服务器组编号
  function getServerGroup(user) {
    return _GetServerGroup(user);
  }

  // 获取角色本次怪物攻城挑战次数
  function getCurVAttackCount(user) {
    return _GetCurVAttackCount(user);
  }

  // 设置角色属性改变脏标记
  // 为什么需要：角色上线时属性从 DB 缓存到内存，只有设置了脏标记，
  // 下线时才能正确存档到数据库，否则变动的属性下线后可能回档
  function enableSaveCharacStat(user) {
    return _EnableSaveCharacStat(user);
  }

  return {
    getState: getState,
    getAccId: getAccId,
    getCurCharacNo: getCurCharacNo,
    getCharacLevel: getCharacLevel,
    getCurCharacName: getCurCharacName,
    getLevelUpExp: getLevelUpExp,
    getCurCharacInvenW: getCurCharacInvenW,
    getCharacJob: getCharacJob,
    getCurCharacGrowType: getCurCharacGrowType,
    getCharacGuildkey: getCharacGuildkey,
    getGuildName: getGuildName,
    getLoginTick: getLoginTick,
    getParty: getParty,
    getCharacExpandData: getCharacExpandData,
    getCera: getCera,
    getCurCharacQuestW: getCurCharacQuestW,
    checkItemLock: checkItemLock,
    send: send,
    sendNotiPacketMessage: sendNotiPacketMessage,
    sendUpdateItemList: sendUpdateItemList,
    sendClearQuestList: sendClearQuestList,
    questAction: questAction,
    setGmQuestFlag: setGmQuestFlag,
    gainExpSp: gainExpSp,
    sendNotiPacket: sendNotiPacket,
    getServerGroup: getServerGroup,
    getCurVAttackCount: getCurVAttackCount,
    enableSaveCharacStat: enableSaveCharacStat,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createUserBinding = createUserBinding;
}
