// GameWorld 操作 binding
// 来源：从旧 frida.js G_GameWorld / GameWorld_* 系列函数迁移
// 用途：封装游戏世界操作（全服广播、玩家遍历、查找玩家等）
//
// 风险：
// 1. send_all 是广播类接口，必须限制调用频率，防止 CC 攻击
// 2. 除非必须使用广播，否则建议用 CParty::send_to_party 或 GameWorld::send_to_area

function createGameWorldBinding(addr) {
  const _G_GameWorld = nf(addr.g_gameworld, 'pointer', []);
  const _SendAll = nf(addr.gameworld_send_all, 'int', ['pointer', 'pointer']);
  const _SendAllWithState = nf(addr.gameworld_send_all_with_state, 'int', ['pointer', 'pointer', 'int']);
  const _GetUserCountInWorld = nf(addr.gameworld_get_user_count_in_world, 'int', ['pointer']);
  const _FindUserFromWorldByAccid = nf(addr.gameworld_find_user_from_world_byaccid, 'pointer', ['pointer', 'int']);

  // 世界广播消息（底层实现）
  // 来源：从旧 frida.js api_GameWorld_SendNotiPacketMessage 迁移
  //
  // 为什么在 gw binding 中提供：
  // notify.js 和 settlement.js 都需要世界广播能力，集中在此处
  // 风险：广播类接口必须限制调用频率，防止刷屏
  const _PacketGuardConstructor = nf(addr.packetguard_constructor, 'int', ['pointer']);
  const _PutHeader = nf(addr.interfacepacketbuf_put_header, 'int', ['pointer', 'int', 'int']);
  const _PutByte = nf(addr.interfacepacketbuf_put_byte, 'int', ['pointer', 'uint8']);
  const _PutShort = nf(addr.interfacepacketbuf_put_short, 'int', ['pointer', 'uint16']);
  const _PutInt = nf(addr.interfacepacketbuf_put_int, 'int', ['pointer', 'int']);
  const _PutBinary = nf(addr.interfacepacketbuf_put_binary, 'int', ['pointer', 'pointer', 'int']);
  const _Finalize = nf(addr.interfacepacketbuf_finalize, 'int', ['pointer', 'int']);
  const _DestroyPacketGuard = nf(addr.destroy_packetguard, 'int', ['pointer']);
  const _Strlen = nf(addr.strlen, 'int', ['pointer']);

  // 在线玩家遍历（底层 std::map 迭代器）
  const _MapBegin = nf(addr.gameworld_user_map_begin, 'int', ['pointer', 'pointer']);
  const _MapEnd = nf(addr.gameworld_user_map_end, 'int', ['pointer', 'pointer']);
  const _MapNotEqual = nf(addr.gameworld_user_map_not_equal, 'bool', ['pointer', 'pointer']);
  const _MapGet = nf(addr.gameworld_user_map_get, 'pointer', ['pointer']);
  const _MapNext = nf(addr.gameworld_user_map_next, 'pointer', ['pointer', 'pointer']);

  // 获取 CUser 状态（用于遍历时筛选已登录角色）
  const _GetState = nf(addr.cuser_get_state, 'int', ['pointer']);

  // 获取 GameWorld 单例
  function getGameWorld() {
    return _G_GameWorld();
  }

  // 向所有在线玩家发包
  // 风险：广播类接口，必须限制调用频率
  function sendAll(gameWorld, packetGuard) {
    return _SendAll(gameWorld, packetGuard);
  }

  // 向指定状态以上的在线玩家发包
  function sendAllWithState(gameWorld, packetGuard, state) {
    return _SendAllWithState(gameWorld, packetGuard, state);
  }

  // 获取在线玩家数量
  function getUserCountInWorld(gameWorld) {
    return _GetUserCountInWorld(gameWorld);
  }

  // 根据账号 ID 查找已登录角色
  function findUserFromWorldByAccid(gameWorld, accountId) {
    return _FindUserFromWorldByAccid(gameWorld, accountId);
  }

  // ---- 世界广播消息 ----
  // 来源：从旧 frida.js api_GameWorld_SendNotiPacketMessage 迁移
  // msg: 消息字符串
  // msgType: 消息类型（14=系统公告）
  function sendNotiPacketMessage(msg, msgType) {
    const packetGuard = Memory.alloc(0x20000);
    _PacketGuardConstructor(packetGuard);

    _PutHeader(packetGuard, 0, 12);
    _PutByte(packetGuard, msgType);
    _PutShort(packetGuard, 0);
    _PutByte(packetGuard, 0);

    // 写入字符串（协议格式：4字节长度 + 内容）
    const p = Memory.allocUtf8String(msg);
    const len = _Strlen(p);
    _PutInt(packetGuard, len);
    _PutBinary(packetGuard, p, len);

    _Finalize(packetGuard, 1);
    _SendAllWithState(_G_GameWorld(), packetGuard, 3); // 只给 state >= 3 的玩家发公告
    _DestroyPacketGuard(packetGuard);
  }

  // ---- 在线玩家遍历 ----

  // 获取在线玩家列表遍历起始迭代器
  function mapBegin() {
    const begin = Memory.alloc(4);
    _MapBegin(begin, _G_GameWorld().add(308));
    return begin;
  }

  // 获取在线玩家列表遍历结束迭代器
  function mapEnd() {
    const end = Memory.alloc(4);
    _MapEnd(end, _G_GameWorld().add(308));
    return end;
  }

  // 获取当前迭代器指向的玩家
  function mapGet(it) {
    return _MapGet(it).add(4).readPointer();
  }

  // 判断迭代器是否未到末尾
  function mapNotEqual(a, b) {
    return _MapNotEqual(a, b);
  }

  // 迭代器前进（返回新的迭代器）
  // 为什么必须用返回值更新 it：
  // 如果底层 mapNext 不是原地修改（即返回新迭代器），
  // 忽略返回值会导致死循环
  function mapNext(it) {
    const next = Memory.alloc(4);
    _MapNext(next, it);
    return next;
  }

  // 遍历所有在线玩家并执行回调
  // 为什么需要这个函数：多个模块需要遍历在线玩家（怪物攻城发奖、世界广播等）
  // f: 回调函数，参数为 (user, args)
  // args: 传给回调的额外参数
  //
  // 为什么有 guardCount 保护：
  // 如果迭代器逻辑异常或在线玩家数异常增长，避免无限循环
  function forEachUser(f, args) {
    var it = mapBegin();
    const end = mapEnd();
    var guardCount = 0;
    const maxCount = 10000;

    while (mapNotEqual(it, end) && guardCount < maxCount) {
      guardCount++;
      const user = mapGet(it);

      // 只处理已登录角色 (state >= 3)
      if (_GetState(user) >= 3) {
        f(user, args);
      }
      // 必须更新迭代器，否则可能死循环
      it = mapNext(it);
    }

    if (guardCount >= maxCount) {
      console.log('[game_world] forEachUser 因 guardCount 上限停止, 遍历了 ' + guardCount + ' 个在线玩家');
    }
  }

  return {
    getGameWorld: getGameWorld,
    sendAll: sendAll,
    sendAllWithState: sendAllWithState,
    getUserCountInWorld: getUserCountInWorld,
    findUserFromWorldByAccid: findUserFromWorldByAccid,
    sendNotiPacketMessage: sendNotiPacketMessage,
    forEachUser: forEachUser,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createGameWorldBinding = createGameWorldBinding;
}
