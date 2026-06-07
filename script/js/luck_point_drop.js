// 幸运点影响掉落品质（来源：dp2/frida.js / dp2.9/df_game_r.js）
//
// 说明：
// - 旧实现位于 df_game_r.js 的 enable_drop_use_luck_point()。
// - 本模块保持旧算法：杀怪/翻牌期间缓存当前 user，用幸运点影响 CLuckPoint::GetItemRarity 的 roll。
// - 增加重复 attach/replace 保护，避免重复启动后多次 hook 或重复 replace。
// - 该功能会影响爆率与角色幸运点，属于经济高风险功能。

var g_luck_point_drop_started = false;
var g_luck_point_current_user = null;

var MAX_LUCK_POINT = 99999;
var MIN_LUCK_POINT = 1;

function luckPointDropLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [luck_point_drop] ' + message);
  } catch (e) {
    console.log('[luck_point_drop] ' + message);
  }
}

function clampLuckPoint(value) {
  var n = parseInt(value);
  if (!n || n < MIN_LUCK_POINT) {
    return MIN_LUCK_POINT;
  }
  if (n > MAX_LUCK_POINT) {
    return MAX_LUCK_POINT;
  }
  return n;
}

function setCurrentUserLuckPoint(user, newLuckPoint) {
  const value = clampLuckPoint(newLuckPoint);
  CUserCharacInfo_enableSaveCharacStat(user);
  CUserCharacInfo_SetCurCharacLuckPoint(user, value);
  return value;
}

// 保留旧入口名，供旧内联逻辑或其他模块复用。
function api_CUserCharacInfo_SetCurCharacLuckPoint(user, new_luck_point) {
  return setCurrentUserLuckPoint(user, new_luck_point);
}

function changeLuckPointByFortuneCoin(user) {
  const rand = get_random_int(0, 100);
  var newLuckPoint = null;

  if (rand === 0) {
    newLuckPoint = MAX_LUCK_POINT;
  } else if (rand === 1) {
    newLuckPoint = MIN_LUCK_POINT;
  } else if (rand < 51) {
    newLuckPoint = Math.floor(CUserCharacInfo_GetCurCharacLuckPoint(user) * 1.2);
  } else {
    newLuckPoint = Math.floor(CUserCharacInfo_GetCurCharacLuckPoint(user) * 0.8);
  }

  newLuckPoint = setCurrentUserLuckPoint(user, newLuckPoint);
  api_CUser_SendNotiPacketMessage(user, '命运已被改变, 当前幸运点数: ' + newLuckPoint, 0);
  luckPointDropLog('fortune coin changed luck=' + newLuckPoint);
  return newLuckPoint;
}

// 保留旧入口名。
function use_ftcoin_change_luck_point(user) {
  return changeLuckPointByFortuneCoin(user);
}

function attachLuckPointUserScopeHooks() {
  Interceptor.attach(ptr(0x81EB0C4), {
    onEnter: function (args) { g_luck_point_current_user = args[1]; },
    onLeave: function (retval) { g_luck_point_current_user = null; }
  });

  Interceptor.attach(ptr(0x85B2412), {
    onEnter: function (args) { g_luck_point_current_user = args[1]; },
    onLeave: function (retval) { g_luck_point_current_user = null; }
  });
}

function replaceLuckPointRarityCalculator() {
  const CLuckPoint_GetItemRarity_ptr = ptr(0x8550BE4);
  const CLuckPoint_GetItemRarity = new NativeFunction(CLuckPoint_GetItemRarity_ptr, 'int', ['pointer', 'pointer', 'int', 'int'], { 'abi': 'sysv' });

  Interceptor.replace(CLuckPoint_GetItemRarity_ptr, new NativeCallback(function (a1, a2, roll, a4) {
    if (g_luck_point_current_user) {
      const luckPoint = CUserCharacInfo_GetCurCharacLuckPoint(g_luck_point_current_user);
      roll = get_random_int(luckPoint * 10, 1000000);
    }

    const rarity = CLuckPoint_GetItemRarity(a1, a2, roll, a4);

    if (g_luck_point_current_user) {
      var rate = 1.0;
      if (rarity >= 3) {
        rate = 1 - (rarity * 0.01);
      } else {
        rate = 1.01;
      }
      const newLuckPoint = Math.floor(CUserCharacInfo_GetCurCharacLuckPoint(g_luck_point_current_user) * rate);
      setCurrentUserLuckPoint(g_luck_point_current_user, newLuckPoint);
    }

    return rarity;
  }, 'int', ['pointer', 'pointer', 'int', 'int']));
}

function startLuckPointDrop() {
  if (g_luck_point_drop_started) {
    luckPointDropLog('already started, skip duplicate hooks');
    return;
  }

  attachLuckPointUserScopeHooks();
  replaceLuckPointRarityCalculator();
  g_luck_point_drop_started = true;
  luckPointDropLog('started');
}

// 兼容旧入口命名。
function enable_drop_use_luck_point() {
  return startLuckPointDrop();
}
