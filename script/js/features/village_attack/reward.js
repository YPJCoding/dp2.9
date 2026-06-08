// 怪物攻城挑战奖励模块
// 来源：从旧 frida.js VillageAttackedRewardSendReward() 迁移
// 用途：根据挑战次数发放对应的邮件奖励
//
// 奖励表来源：旧 frida.js 的 switch 语句，36 个 case 每个对应不同的奖励
// 已将 switch 改为数据表（见 constants.js REWARD_TABLE）

function createVillageAttackReward(ctx) {
  var C = globalThis.VILLAGE_ATTACK_CONSTANTS;

  // 发送单道具系统邮件
  // 来源：从旧 frida.js CMailBoxHelperReqDBSendNewSystemMail 迁移
  // 用途：怪物攻城每次挑战成功后发送对应奖励
  function sendChallengeReward(curUser) {
    var VAttackCount = ctx.user.getCurVAttackCount(curUser);
    var reward = C.REWARD_TABLE[VAttackCount];

    if (!reward) {
      // 超出奖励表范围的挑战次数，给默认奖励
      reward = [3037, 5];
    }

    var itemId = reward[0];
    var itemCount = reward[1];

    // 查询道具 PVF 数据
    var retitem = globalThis.nf(ctx.addresses.cdata_manager_find_item, 'pointer', ['pointer', 'int'])(
      globalThis.nf(ctx.addresses.g_cdata_manager, 'pointer', [])(), itemId
    );

    if (!retitem || retitem.isNull()) {
      return;
    }

    // 构造道具对象用于邮件发送
    var InvenItemConstructor = globalThis.nf(ctx.addresses.inven_item_constructor, 'pointer', ['pointer']);
    var GetItemIndex = globalThis.nf(ctx.addresses.getitem_index, 'int', ['pointer']);
    var ReqDBSendNewSystemMail = globalThis.nf(ctx.addresses.req_db_send_new_system_mail, 'int', ['pointer', 'pointer', 'int', 'int', 'pointer', 'int', 'int', 'int', 'char', 'char']);

    var InvenItemPr = Memory.alloc(100);
    InvenItemConstructor(InvenItemPr);

    var itemid = GetItemIndex(retitem);
    var itemtype = retitem.add(8).readU8();
    InvenItemPr.writeU8(itemtype);
    InvenItemPr.add(2).writeInt(itemid);
    InvenItemPr.add(7).writeInt(itemCount);

    var GoldValue = 0;
    var TitlePr = Memory.allocUtf8String('居民代表');
    var TxtValue = '击杀怪物奖励：';
    var UserID = ctx.user.getCurCharacNo(curUser);
    var TxtValuePr = Memory.allocUtf8String(TxtValue);
    var TxtValueLength = TxtValue.length;
    var ServerGroup = ctx.user.getServerGroup(curUser);
    var MailDate = 30;

    ReqDBSendNewSystemMail(TitlePr, InvenItemPr, GoldValue, UserID, TxtValuePr, TxtValueLength, MailDate, ServerGroup, 0, 0);
  }

  return {
    sendChallengeReward: sendChallengeReward,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createVillageAttackReward = createVillageAttackReward;
}
