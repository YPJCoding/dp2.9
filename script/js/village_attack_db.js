// 怪物攻城 DB 存档模块
//
// 迁移范围：
// - event_villageattack_save_to_db()
// - event_villageattack_load_from_db()
//
// 说明：
// - init_db()/uninit_db() 会直接调用这两个函数。
// - startup_modules.js 必须无条件加载本模块，不能受 enable_village_attack 开关影响。
// - 本模块只负责 frida.game_event 中 villageattack 记录的保存/读取。

function villageAttackDbLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [village_attack_db] ' + message);
  } catch (e) {
    console.log('[village_attack_db] ' + message);
  }
}

function ensureVillageAttackDbStateModule() {
  try {
    if (typeof safeLoadModule === 'function') {
      return safeLoadModule('village_attack_state');
    }
    dp_load('village_attack_state');
    return true;
  } catch (e) {
    villageAttackDbLog('load village_attack_state failed: ' + e.message);
    return false;
  }
}

function isVillageAttackDbHandleReady() {
  try {
    return !(typeof mysql_frida === 'undefined' || mysql_frida == null);
  } catch (e) {
    return false;
  }
}

// 怪物攻城活动数据存档。
function event_villageattack_save_to_db() {
  ensureVillageAttackEventInfo();

  if (!isVillageAttackDbHandleReady()) {
    villageAttackDbLog('skip save: mysql_frida not ready');
    return false;
  }

  api_MySQL_exec(mysql_frida, "replace into game_event (event_id, event_info) values ('villageattack', '" + JSON.stringify(villageAttackEventInfo) + "');");
  return true;
}

// 从数据库载入怪物攻城活动数据。
function event_villageattack_load_from_db() {
  ensureVillageAttackEventInfo();

  if (!isVillageAttackDbHandleReady()) {
    villageAttackDbLog('skip load: mysql_frida not ready');
    return false;
  }

  if (api_MySQL_exec(mysql_frida, "select event_info from game_event where event_id = 'villageattack';")) {
    if (MySQL_get_n_rows(mysql_frida) == 1) {
      MySQL_fetch(mysql_frida);
      var info = api_MySQL_get_str(mysql_frida, 0);
      if (info) {
        try {
          villageAttackEventInfo = JSON.parse(info);
          villageAttackDbLog('loaded villageattack state from db');
          return true;
        } catch (e) {
          villageAttackDbLog('load parse failed: ' + e.message);
          return false;
        }
      }
    }
  }
  return false;
}

ensureVillageAttackDbStateModule();
villageAttackDbLog('db helpers loaded');
