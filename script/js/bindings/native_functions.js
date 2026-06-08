// NativeFunction 工厂与统一管理
// 来源：从旧 frida.js 重构
// 用途：提供统一的 nf() 工厂函数，集中管理所有 NativeFunction 创建
//
// 为什么需要统一工厂：
// 1. 所有 NativeFunction 都使用相同的 abi: 'sysv'
// 2. 统一管理便于后续切换 abi 或添加额外逻辑
// 3. 业务模块通过 ctx.native 调用，不直接创建 NativeFunction

// NativeFunction 工厂函数
// address: ptr 地址
// retType: 返回值类型字符串 (如 'int', 'pointer', 'void', 'bool')
// argTypes: 参数类型数组 (如 ['pointer', 'int'])
//
// 为什么需要地址校验：
// 能在启动阶段暴露地址缺失/为空的问题，避免 hook 时才崩溃
function nf(address, retType, argTypes) {
  if (!address) {
    throw new Error('NativeFunction address is missing (retType=' + retType + ')');
  }
  if (typeof address.isNull === 'function' && address.isNull()) {
    throw new Error('NativeFunction address is null (retType=' + retType + ')');
  }
  return new NativeFunction(address, retType, argTypes || [], { abi: 'sysv' });
}

if (typeof globalThis !== 'undefined') {
  globalThis.nf = nf;
}
