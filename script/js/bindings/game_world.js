// GameWorld 操作 binding
// 来源：从旧 frida.js G_GameWorld / GameWorld_* 系列函数迁移
// 用途：封装游戏世界操作（全服广播、玩家遍历、查找玩家等）
//
// 风险：
// 1. send_all 是广播类接口，必须限制调用频率，防止 CC 攻击
// 2. 除非必须使用广播，否则建议用 CParty::send_to_party 或 GameWorld::send_to_area

function createGameWorldBinding(addr) {
  var _G_GameWorld = nf(addr.g_gameworld, 'pointer', []);
  var _SendAll = nf(addr.gameworld_send_all, 'int', ['pointer', 'pointer']);
  var _SendAllWithState = nf(addr.gameworld_send_all_with_state, 'int', ['pointer', 'pointer', 'int']);
  var _GetUserCountInWorld = nf(addr.gameworld_get_user_count_in_world, 'int', ['pointer']);
  var _FindUserFromWorldByAccid = nf(addr.gameworld_find_user_from_world_byaccid, 'pointer', ['pointer', 'int']);

  // 在线玩家遍历（底层 std::map 迭代器）
  var _MapBegin = nf(addr.gameworld_user_map_begin, 'int', ['pointer', 'pointer']);
  var _MapEnd = nf(addr.gameworld_user_map_end, 'int', ['pointer', 'pointer']);
  var _MapNotEqual = nf(addr.gameworld_user_map_not_equal, 'bool', ['pointer', 'pointer']);
  var _MapGet = nf(addr.gameworld_user_map_get, 'pointer', ['pointer']);
  var _MapNext = nf(addr.gameworld_user_map_next, 'pointer', ['pointer', 'pointer']);

  // 获取 CUser 状态（用于遍历时筛选已登录角色）
  var _GetState = nf(addr.cuser_get_state, 'int', ['pointer']);

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

  // 获取在线玩家列表遍历起始迭代器
  function mapBegin() {
    var begin = Memory.alloc(4);
    _MapBegin(begin, _G_GameWorld().add(308));
    return begin;
  }

  // 获取在线玩家列表遍历结束迭代器
  function mapEnd() {
    var end = Memory.alloc(4);
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

  // 迭代器前进
  function mapNext(it) {
    var next = Memory.alloc(4);
    _MapNext(next, it);
    return next;
  }

  // 遍历所有在线玩家并执行回调
  // 为什么需要这个函数：多个模块需要遍历在线玩家（怪物攻城发奖、世界广播等）
  // f: 回调函数，参数为 (user, args)
  // args: 传给回调的额外参数
  function forEachUser(f, args) {
    var it = mapBegin();
    var end = mapEnd();

    while (mapNotEqual(it, end)) {
      var user = mapGet(it);

      // 只处理已登录角色 (state >= 3)
      if (_GetState(user) >= 3) {
        f(user, args);
      }
      mapNext(it);
    }
  }

  return {
    getGameWorld: getGameWorld,
    sendAll: sendAll,
    sendAllWithState: sendAllWithState,
    getUserCountInWorld: getUserCountInWorld,
    findUserFromWorldByAccid: findUserFromWorldByAccid,
    forEachUser: forEachUser,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createGameWorldBinding = createGameWorldBinding;
}
