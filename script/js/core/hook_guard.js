// Hook 防重复模块
// 来源：新增模块，用于防止热重载时重复 hook 造成逻辑叠加
// 用途：所有 Interceptor.attach 和 Interceptor.replace 都必须走这里
//
// 为什么必须有这一层：
// 1. Frida 热重载时原有的 Interceptor hook 不会被自动清除
// 2. 重复 attach 会导致同一个函数被多次 hook，造成逻辑叠加
// 3. 比如一个扣血 hook 重复 attach 3 次，角色受伤会翻 3 倍
// 4. 统一管理能确保同一个 key 只 hook 一次

var g_hook_attached = {};
var g_hook_replaced = {};

// 防止重复 attach
// key: 唯一标识，同一 key 多次调用只执行一次
// address: hook 的目标地址 (NativePointer)
// callbacks: { onEnter: function(args) {}, onLeave: function(retval) {} }
function attachOnce(key, address, callbacks) {
  if (g_hook_attached[key]) {
    // 已经 attach 过，跳过
    return;
  }

  try {
    Interceptor.attach(address, callbacks);
    g_hook_attached[key] = true;
  } catch (err) {
    console.log('[hook_guard] attach failed, key=' + key + ', error=' + err);
  }
}

// 防止重复 replace
// key: 唯一标识
// address: 要替换的函数地址 (NativePointer)
// callback: 替换后的实现
// retType: 返回值类型
// argTypes: 参数类型数组
function replaceOnce(key, address, callback, retType, argTypes) {
  if (g_hook_replaced[key]) {
    // 已经 replace 过，跳过
    return;
  }

  try {
    Interceptor.replace(address, new NativeCallback(callback, retType, argTypes));
    g_hook_replaced[key] = true;
  } catch (err) {
    console.log('[hook_guard] replace failed, key=' + key + ', error=' + err);
  }
}

// 重置状态（热重载时可能需要调用）
function resetHookGuard() {
  g_hook_attached = {};
  g_hook_replaced = {};
}

if (typeof globalThis !== 'undefined') {
  globalThis.attachOnce = attachOnce;
  globalThis.replaceOnce = replaceOnce;
  globalThis.resetHookGuard = resetHookGuard;
}
