// 怪物攻城数据库操作
// 来源：从旧 frida.js event_villageattack_save_to_db/load_from_db 迁移
// 用途：持久化怪物攻城活动状态到 frida.game_event 表
//
// 风险：
// 1. SQL 拼接未做转义，JSON 中包含特殊字符可能导致 SQL 语法错误
// 2. 后续如需转义，方便在此处集中修改

// fridaDb: 绑定 frida 句柄的便捷 DB 对象（ctx.fridaDb）
function createVillageAttackDb(fridaDb) {
  // 保存活动数据到数据库
  // 来源：从旧 frida.js event_villageattack_save_to_db 迁移
  function save(info) {
    try {
      // 风险：JSON.stringify 可能产生包含单引号的字符串，
      // 如果包含会导致 SQL 语法错误
      // TODO: 后续统一使用参数化查询
      var json = JSON.stringify(info);
      fridaDb.exec("replace into game_event (event_id, event_info) values ('villageattack', '" + json + "');");
    } catch (error) {
      console.log('[village_attack_db] save failed: ' + error);
    }
  }

  // 从数据库加载活动数据
  // 来源：从旧 frida.js event_villageattack_load_from_db 迁移
  function load() {
    try {
      if (fridaDb.exec("select event_info from game_event where event_id = 'villageattack';")) {
        if (fridaDb.getNRows() == 1) {
          fridaDb.fetch();
          var info = fridaDb.getStr(0);
          if (info) {
            return JSON.parse(info);
          }
        }
      }
    } catch (error) {
      console.log('[village_attack_db] load failed: ' + error);
    }
    return null;
  }

  return {
    save: save,
    load: load,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createVillageAttackDb = createVillageAttackDb;
}
