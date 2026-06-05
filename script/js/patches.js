// 独立修补程序（来源：dp2.9/df_game_r.js）

function disableMobileAuth() {
  var defPtr = ptr(0x08161384);
  var value = defPtr.readU8();
  if (value != 0x0F) {
    Memory.protect(defPtr, 10, 'rwx');
    defPtr.writeShort(0x840F);
  }
  var dispatchPr = ptr(0x0816132A);
  var dispatchFn = new NativeFunction(dispatchPr, 'int', ['pointer', 'pointer', 'pointer'], { "abi": "sysv" });
  Interceptor.replace(dispatchPr, new NativeCallback(function (auth, user, a3) {
    return 0;
  }));
}

function disableCreateCharLimit() {
  Memory.protect(ptr(0x8401922), 2, 'rwx');
  ptr(0x8401922).writeUShort(0x01B0);
}

function enableStrengthenRefresh() {
  Interceptor.attach(ptr(0x080FC850), {
    onEnter: function (args) {},
    onLeave: function (retval) {
      var user = this.context.ecx;
      CUser_SendUpdateItemList(user);
    }
  });
}

function enableComboSkillFix() {
  Interceptor.attach(ptr(0x8608C98), {
    onEnter: function (args) {},
    onLeave: function (retval) { retval.replace(1); }
  });
}
