// 封包操作 binding
// 来源：从旧 frida.js PacketBuf_* 和 InterfacePacketBuf_* 系列迁移
// 用途：客户端封包读取 + 服务器封包组包

function createPacketBinding(addr) {
  // ---- 客户端封包读取 ----

  // 从客户端封包中读取 1 字节（失败会抛异常，调用方必须做异常处理）
  const _getByte = nf(addr.packetbuf_get_byte, 'int', ['pointer', 'pointer']);

  function getByte(packetBuf) {
    const data = Memory.alloc(1);
    if (_getByte(packetBuf, data)) {
      return data.readU8();
    }
    throw new Error('PacketBuf_get_byte Fail!');
  }

  const _getShort = nf(addr.packetbuf_get_short, 'int', ['pointer', 'pointer']);

  function getShort(packetBuf) {
    const data = Memory.alloc(2);
    if (_getShort(packetBuf, data)) {
      return data.readShort();
    }
    throw new Error('PacketBuf_get_short Fail!');
  }

  const _getInt = nf(addr.packetbuf_get_int, 'int', ['pointer', 'pointer']);

  function getInt(packetBuf) {
    const data = Memory.alloc(4);
    if (_getInt(packetBuf, data)) {
      return data.readInt();
    }
    throw new Error('PacketBuf_get_int Fail!');
  }

  const _getBinary = nf(addr.packetbuf_get_binary, 'int', ['pointer', 'pointer', 'int']);

  function getBinary(packetBuf, len) {
    const data = Memory.alloc(len);
    if (_getBinary(packetBuf, data, len)) {
      return data.readByteArray(len);
    }
    throw new Error('PacketBuf_get_binary Fail!');
  }

  // 获取原始封包 buffer 指针地址
  // 来源：从旧 frida.js api_PacketBuf_get_buf 迁移
  function getBuf(packetBuf) {
    return packetBuf.add(20).readPointer().add(13);
  }

  // ---- 服务器组包 ----

  const _PacketGuardConstructor = nf(addr.packetguard_constructor, 'int', ['pointer']);
  const _PutHeader = nf(addr.interfacepacketbuf_put_header, 'int', ['pointer', 'int', 'int']);
  const _PutByte = nf(addr.interfacepacketbuf_put_byte, 'int', ['pointer', 'uint8']);
  const _PutShort = nf(addr.interfacepacketbuf_put_short, 'int', ['pointer', 'uint16']);
  const _PutInt = nf(addr.interfacepacketbuf_put_int, 'int', ['pointer', 'int']);
  const _PutBinary = nf(addr.interfacepacketbuf_put_binary, 'int', ['pointer', 'pointer', 'int']);
  const _Finalize = nf(addr.interfacepacketbuf_finalize, 'int', ['pointer', 'int']);
  const _DestroyPacketGuard = nf(addr.destroy_packetguard, 'int', ['pointer']);

  // 初始化封包对象
  function createPacketGuard() {
    const packetGuard = Memory.alloc(0x20000);
    _PacketGuardConstructor(packetGuard);
    return packetGuard;
  }

  function putHeader(packetGuard, flag, protocolId) {
    _PutHeader(packetGuard, flag, protocolId);
  }

  function putByte(packetGuard, value) {
    _PutByte(packetGuard, value);
  }

  function putShort(packetGuard, value) {
    _PutShort(packetGuard, value);
  }

  function putInt(packetGuard, value) {
    _PutInt(packetGuard, value);
  }

  function putBinary(packetGuard, ptr, len) {
    _PutBinary(packetGuard, ptr, len);
  }

  function finalize(packetGuard, flag) {
    _Finalize(packetGuard, flag);
  }

  function destroyPacketGuard(packetGuard) {
    _DestroyPacketGuard(packetGuard);
  }

  // 向封包写入字符串（协议中字符串格式：4字节长度 + 内容）
  const _strlen = nf(addr.strlen, 'int', ['pointer']);

  function putString(packetGuard, s) {
    const p = Memory.allocUtf8String(s);
    const len = _strlen(p);
    _PutInt(packetGuard, len);
    _PutBinary(packetGuard, p, len);
  }

  return {
    getByte: getByte,
    getShort: getShort,
    getInt: getInt,
    getBinary: getBinary,
    getBuf: getBuf,
    createPacketGuard: createPacketGuard,
    putHeader: putHeader,
    putByte: putByte,
    putShort: putShort,
    putInt: putInt,
    putBinary: putBinary,
    putString: putString,
    finalize: finalize,
    destroyPacketGuard: destroyPacketGuard,
  };
}

if (typeof globalThis !== 'undefined') {
  globalThis.createPacketBinding = createPacketBinding;
}
