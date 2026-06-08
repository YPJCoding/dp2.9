// 运行时兼容修复
//
// 本文件只修复 df_game_r.js 中已确认的旧 helper 问题，不改变功能开关和业务流程。
// 通过 startup_modules.js 早期加载，覆盖旧全局函数，避免整文件替换 df_game_r.js。

function runtimeHotfixLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [runtime_hotfixes] ' + message);
  } catch (e) {
    console.log('[runtime_hotfixes] ' + message);
  }
}

function isValidPointer(value) {
  return value && typeof value.isNull === 'function' && !value.isNull();
}

// 修复字符串压缩 helper：native strlen 参数必须是 pointer，不能直接传 JS string。
function api_compress_zip(s) {
  const input = Memory.allocUtf8String(String(s || ''));
  const inputLen = strlen(input);
  const allocBufSize = 1000 + inputLen * 2;
  const output = Memory.alloc(allocBufSize);
  const outputLen = Memory.alloc(4);

  outputLen.writeInt(allocBufSize);
  compress_zip(output, outputLen, input, inputLen);

  return [output, outputLen.readInt()];
}

// 修复全服在线玩家遍历：确保 iterator 递进，避免底层 next 非原地修改时重复处理同一玩家。
function api_gameworld_foreach(f, args) {
  if (typeof f !== 'function') {
    return;
  }

  let it = api_gameworld_user_map_begin();
  const end = api_gameworld_user_map_end();

  while (gameworld_user_map_not_equal(it, end)) {
    const user = api_gameworld_user_map_get(it);

    if (isValidPointer(user) && CUser_get_state(user) >= 3) {
      f(user, args);
    }

    it = api_gameworld_user_map_next(it);
  }
}

// 修复单道具系统邮件 helper：邮件正文长度使用 UTF-8 指针长度，避免 toString(TxtValue).length 误算。
function CMailBoxHelperReqDBSendNewSystemMail(User, item_id, item_count, mail_title, mail_contact) {
  const retitem = find_item(item_id);
  if (!isValidPointer(retitem)) {
    return;
  }

  const invenItem = Memory.alloc(100);
  Inven_Item(invenItem);

  const itemid = GetItem_index(retitem);
  const itemtype = retitem.add(8).readU8();
  invenItem.writeU8(itemtype);
  invenItem.add(2).writeInt(itemid);
  invenItem.add(7).writeInt(item_count);

  const goldValue = 0;
  const titlePtr = Memory.allocUtf8String(String(mail_title || ''));
  const textValue = String(mail_contact || '');
  const userId = GetCurCharacNo(User);
  const textPtr = Memory.allocUtf8String(textValue);
  const textLen = strlen(textPtr);
  const serverGroup = GetServerGroup(User);
  const mailDate = 30;

  ReqDBSendNewSystemMail(titlePtr, invenItem, goldValue, userId, textPtr, textLen, mailDate, serverGroup, 0, 0);
}

runtimeHotfixLog('installed legacy helper hotfixes');
