// 时装潜能系统（来源：dp2/frida.js）

function get_random_int(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function hidden_option() {
  Memory.protect(ptr(0x08509D49), 3, 'rwx');
  ptr(0x08509D49).writeByteArray([0xEB]);
  Memory.protect(ptr(0x08509D34), 3, 'rwx');
  ptr(0x08509D34).writeUShort(get_random_int(1, 64));
}

function start_hidden_option() {
  Interceptor.attach(ptr(0x08509B9E), {
    onEnter: function (args) { hidden_option(); },
    onLeave: function (retval) {}
  });
  Interceptor.attach(ptr(0x0817EDEC), {
    onEnter: function (args) {},
    onLeave: function (retval) { retval.replace(1); }
  });
}
