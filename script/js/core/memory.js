// 内存操作模块
// 来源：从旧 frida.js 迁移
// 用途：封装 Memory.protect 和 patch 字节写入等内存操作
// 风险：内存 patch 直接修改进程代码段，错误操作可能导致崩溃

// 内存十六进制打印（调试用）
// p: NativePointer
// len: 字节长度
function bin2hex(p, len) {
  var hex = '';
  for (var i = 0; i < len; i++) {
    var s = p.add(i).readU8().toString(16);
    if (s.length == 1) {
      s = '0' + s;
    }
    hex += s;
    if (i != len - 1) {
      hex += ' ';
    }
  }
  return hex;
}

// 安全写入内存
// 用途：修改内存保护属性后写入数据，写入后可选恢复保护
// 风险：修改代码段内存容易导致崩溃，务必确认地址正确
function protectAndWrite(address, size, data, restoreProtection) {
  try {
    // 修改内存保护属性为可读可写可执行
    Memory.protect(address, size, 'rwx');

    if (typeof data === 'number') {
      if (size == 1) {
        address.writeU8(data);
      } else if (size == 2) {
        address.writeUShort(data);
      } else if (size == 4) {
        address.writeU32(data);
      } else {
        address.writeInt(data);
      }
    } else if (data instanceof Array) {
      // byte array
      address.writeByteArray(data);
    }
  } catch (err) {
    console.log('[memory] protectAndWrite failed: ' + err);
  }
}

if (typeof globalThis !== 'undefined') {
  globalThis.bin2hex = bin2hex;
  globalThis.memoryProtectAndWrite = protectAndWrite;
}
