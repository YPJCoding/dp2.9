// 邮件系统 binding
// 来源：从旧 frida.js CMailBoxHelper*/ReqDBSendNewSystemMail* 系列函数迁移
// 用途：封装系统邮件发送操作（多道具、时装、单道具）
//
// 风险：邮件发送会写入数据库，发送前务必确认目标角色存在且在线

function createMailBinding(addr) {
  var _MakeMultiMailPostal = nf(addr.cmailboxhelper_make_system_multi_mail_postal, 'int', ['pointer', 'pointer', 'int']);
  var _SendMultiMail = nf(addr.cmailboxhelper_req_db_send_new_system_multi_mail, 'int', ['pointer', 'pointer', 'int', 'int', 'int', 'pointer', 'int', 'int', 'int', 'int']);
  var _SendAvatarMail = nf(addr.cmailboxhelper_req_db_send_new_avatar_mail, 'pointer', ['pointer', 'int', 'int', 'int', 'int', 'int', 'int', 'pointer', 'int']);
  var _SendSingleMail = nf(addr.req_db_send_new_system_mail, 'int', ['pointer', 'pointer', 'int', 'int', 'pointer', 'int', 'int', 'int', 'char', 'char']);

  // Vector 操作（用于邮件附件列表）
  var _VectorConstructor = nf(addr.std_vector_pair_int_int_constructor, 'pointer', ['pointer']);
  var _VectorClear = nf(addr.std_vector_pair_int_int_clear, 'pointer', ['pointer']);
  var _MakePair = nf(addr.std_make_pair_int_int, 'pointer', ['pointer', 'pointer', 'pointer']);
  var _VectorPushBack = nf(addr.std_vector_pair_int_int_push_back, 'pointer', ['pointer', 'pointer']);

  // 道具构造（用于邮件附件）
  var _InvenItemConstructor = nf(addr.inven_item_constructor, 'pointer', ['pointer']);
  var _GetItemIndex = nf(addr.getitem_index, 'int', ['pointer']);

  // 获取 strlen
  var _strlen = nf(addr.strlen, 'int', ['pointer']);

  // 发送多道具系统邮件
  // targetCharacNo: 目标角色 charac_no
  // title: 邮件标题
  // text: 邮件正文
  // gold: 金币数量
  // itemList: 道具列表 [[item_id, count], ...]
  function sendMultiMail(targetCharacNo, title, text, gold, itemList) {
    // 构造道具附件 vector
    var vector = Memory.alloc(100);
    _VectorConstructor(vector);
    _VectorClear(vector);

    for (var i = 0; i < itemList.length; ++i) {
      var itemId = Memory.alloc(4);
      var itemCnt = Memory.alloc(4);
      itemId.writeInt(itemList[i][0]);
      itemCnt.writeInt(itemList[i][1]);
      var pair = Memory.alloc(100);
      _MakePair(pair, itemId, itemCnt);
      _VectorPushBack(vector, pair);
    }

    // 邮件支持 10 个道具附件格子
    var additionSlots = Memory.alloc(1000);
    for (var i = 0; i < 10; ++i) {
      _InvenItemConstructor(additionSlots.add(i * 61));
    }
    _MakeMultiMailPostal(vector, additionSlots, 10);

    var titlePtr = Memory.allocUtf8String(title);
    var textPtr = Memory.allocUtf8String(text);
    var textLen = _strlen(textPtr);

    _SendMultiMail(titlePtr, additionSlots, itemList.length, gold, targetCharacNo, textPtr, textLen, 0, 99, 1);
  }

  // 发送单道具系统邮件（怪物攻城奖励用）
  // itemType + itemId 需要从 PVF 解析的道具对象构建
  function sendSingleMail(itemPtr, titlePtr, gold, userId, textPtr, textLen, mailDate, serverGroup) {
    return _SendSingleMail(titlePtr, itemPtr, gold, userId, textPtr, textLen, mailDate, serverGroup, 0, 0);
  }

  return {
    sendMultiMail: sendMultiMail,
    sendSingleMail: sendSingleMail,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createMailBinding = createMailBinding;
}
