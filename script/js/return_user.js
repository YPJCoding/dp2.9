// 回归勇士时间设置（来源：dp2/frida.js）
function set_return_user(day) {
    var time = day * 86400;
    Memory.protect(ptr(0x84C753D), 32, 'rwx');
    ptr(0x84C753D).writeU32(time);
}
