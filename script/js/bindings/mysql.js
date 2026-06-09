// MySQL 数据库操作 binding
// 来源：从旧 frida.js MySQL_* 系列函数迁移
// 用途：封装 MySQL 连接、查询、结果读取
//
// 风险说明：
// 1. 游戏数据库非线程安全，务必在 dispatcher 线程中操作
// 2. SQL 拼接未做转义，后续如需防注入需集中在此处修改
// 3. 直接操作游戏数据库，错误 SQL 可能导致数据损坏

function createMysqlBinding(addr) {
  // MySQL 底层函数
  const _MySQLConstructor = nf(addr.mysql_constructor, 'pointer', ['pointer']);
  const _MySQLInit = nf(addr.mysql_init, 'int', ['pointer']);
  const _MySQLOpen = nf(addr.mysql_open, 'int', ['pointer', 'pointer', 'int', 'pointer', 'pointer', 'pointer']);
  const _MySQLClose = nf(addr.mysql_close, 'int', ['pointer']);
  const _MySQLSetQuery2 = nf(addr.mysql_set_query, 'int', ['pointer', 'pointer']);
  const _MySQLExec = nf(addr.mysql_exec, 'int', ['pointer', 'int']);
  const _MySQLGetNRows = nf(addr.mysql_get_n_rows, 'int', ['pointer']);
  const _MySQLFetch = nf(addr.mysql_fetch, 'int', ['pointer']);
  const _MySQLGetInt = nf(addr.mysql_get_int, 'int', ['pointer', 'int', 'pointer']);
  const _MySQLGetUint = nf(addr.mysql_get_uint, 'int', ['pointer', 'int', 'pointer']);
  const _MySQLGetShort = nf(addr.mysql_get_short, 'int', ['pointer', 'int', 'pointer']);
  const _MySQLGetFloat = nf(addr.mysql_get_float, 'int', ['pointer', 'int', 'pointer']);
  const _MySQLGetBinaryLength = nf(addr.mysql_get_binary_length, 'int', ['pointer', 'int']);
  const _MySQLGetBinary = nf(addr.mysql_get_binary, 'int', ['pointer', 'int', 'pointer', 'int']);

  // 打开数据库连接
  // 来源：从旧 frida.js api_MYSQL_open 迁移
  // 风险：连接失败返回 null，调用方必须检查
  function open(dbName, dbIp, dbPort, dbAccount, dbPassword) {
    const mysql = Memory.alloc(0x80000);
    _MySQLConstructor(mysql);
    _MySQLInit(mysql);

    const dbIpPtr = Memory.allocUtf8String(dbIp);
    const dbNamePtr = Memory.allocUtf8String(dbName);
    const dbAccountPtr = Memory.allocUtf8String(dbAccount);
    const dbPasswordPtr = Memory.allocUtf8String(dbPassword);

    const ret = _MySQLOpen(mysql, dbIpPtr, dbPort, dbNamePtr, dbAccountPtr, dbPasswordPtr);
    if (ret) {
      return mysql;
    }
    return null;
  }

  // 关闭数据库连接
  function close(mysql) {
    if (mysql) {
      _MySQLClose(mysql);
    }
  }

  // 执行 SQL 查询
  // 注意：此处返回底层 MySQLExec 的原始返回值（由游戏引擎封装，非标准 libmysqlclient）。
  // 根据旧 frida.js 实际使用经验，非零值表示成功，零值表示失败。
  // 业务层请使用 ctx.fridaDb.exec(sql)（已封装为布尔语义），不要直接依赖本函数的 raw 返回码。
  function exec(mysql, sql) {
    const sqlPtr = Memory.allocUtf8String(sql);
    _MySQLSetQuery2(mysql, sqlPtr);
    return _MySQLExec(mysql, 1);
  }

  // 获取查询结果行数
  function getNRows(mysql) {
    return _MySQLGetNRows(mysql);
  }

  // 获取下一行
  function fetch(mysql) {
    return _MySQLFetch(mysql);
  }

  // 读取整数字段
  function getInt(mysql, fieldIndex) {
    const v = Memory.alloc(4);
    if (1 == _MySQLGetInt(mysql, fieldIndex, v)) {
      return v.readInt();
    }
    return null;
  }

  function getUint(mysql, fieldIndex) {
    const v = Memory.alloc(4);
    if (1 == _MySQLGetUint(mysql, fieldIndex, v)) {
      return v.readUInt();
    }
    return null;
  }

  function getShort(mysql, fieldIndex) {
    const v = Memory.alloc(4);
    if (1 == _MySQLGetShort(mysql, fieldIndex, v)) {
      return v.readShort();
    }
    return null;
  }

  function getFloat(mysql, fieldIndex) {
    const v = Memory.alloc(4);
    if (1 == _MySQLGetFloat(mysql, fieldIndex, v)) {
      return v.readFloat();
    }
    return null;
  }

  // 读取字符串字段
  function getStr(mysql, fieldIndex) {
    const binaryLength = _MySQLGetBinaryLength(mysql, fieldIndex);
    if (binaryLength > 0) {
      const v = Memory.alloc(binaryLength);
      if (1 == _MySQLGetBinary(mysql, fieldIndex, v, binaryLength)) {
        return v.readUtf8String(binaryLength);
      }
    }
    return null;
  }

  // 读取二进制字段
  function getBinary(mysql, fieldIndex) {
    const binaryLength = _MySQLGetBinaryLength(mysql, fieldIndex);
    if (binaryLength > 0) {
      const v = Memory.alloc(binaryLength);
      if (1 == _MySQLGetBinary(mysql, fieldIndex, v, binaryLength)) {
        return v.readByteArray(binaryLength);
      }
    }
    return null;
  }

  return {
    open: open,
    close: close,
    exec: exec,
    getNRows: getNRows,
    fetch: fetch,
    getInt: getInt,
    getUint: getUint,
    getShort: getShort,
    getFloat: getFloat,
    getStr: getStr,
    getBinary: getBinary,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createMysqlBinding = createMysqlBinding;
}
