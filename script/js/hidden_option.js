// 时装潜能系统（来源：dp2/frida.js）
//
// 由 df_game_r.js 通过 dp_load('hidden_option') 加载。
// 保持旧实现逻辑，同时增加重复 hook 保护和日志，避免热重载/重复 setup 时重复挂接。

var g_hidden_option_started = false;

function hiddenOptionLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [hidden_option] ' + message);
  } catch (e) {
    console.log('[hidden_option] ' + message);
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function applyHiddenOption() {
  // 关闭系统分配属性。
  Memory.protect(ptr(0x08509D49), 3, 'rwx');
  ptr(0x08509D49).writeByteArray([0xEB]);

  // 下发时装潜能属性，旧口径为 1~63。
  Memory.protect(ptr(0x08509D34), 3, 'rwx');
  ptr(0x08509D34).writeUShort(getRandomInt(1, 64));
}

function startHiddenOption() {
  if (g_hidden_option_started) {
    hiddenOptionLog('already started, skip duplicate hook');
    return;
  }

  Interceptor.attach(ptr(0x08509B9E), {
    onEnter: function (args) { applyHiddenOption(); },
    onLeave: function (retval) {}
  });

  Interceptor.attach(ptr(0x0817EDEC), {
    onEnter: function (args) {},
    onLeave: function (retval) { retval.replace(1); }
  });

  g_hidden_option_started = true;
  hiddenOptionLog('started');
}

// 兼容旧入口命名。
function start_hidden_option() {
  return startHiddenOption();
}
