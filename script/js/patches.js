// 独立修补程序（来源：dp2/frida.js / dp2.9/df_game_r.js）
//
// 由 df_game_r.js 通过 dp_load('patches') 加载。

var g_patch_create_char_limit_started = false;
var g_patch_strengthen_refresh_started = false;
var g_patch_combo_skill_started = false;
var g_patch_mobile_auth_started = false;

function patchLog(message) {
  try {
    console.log('[' + get_timestamp() + '] [frida] [patches] ' + message);
  } catch (e) {
    console.log('[patches] ' + message);
  }
}

function disableMobileAuth() {
  if (g_patch_mobile_auth_started) {
    patchLog('disableMobileAuth already started');
    return;
  }

  const defPtr = ptr(0x08161384);
  var value = defPtr.readU8();
  if (value != 0x0F) {
    Memory.protect(defPtr, 10, 'rwx');
    defPtr.writeShort(0x840F);
  }

  const dispatchPr = ptr(0x0816132A);
  Interceptor.replace(dispatchPr, new NativeCallback(function (auth, user, a3) {
    return 0;
  }, 'int', ['pointer', 'pointer', 'pointer']));

  g_patch_mobile_auth_started = true;
  patchLog('disableMobileAuth started');
}

function disableCreateCharLimit() {
  if (g_patch_create_char_limit_started) {
    patchLog('disableCreateCharLimit already started');
    return;
  }

  // DB_CreateCharac::CheckLimitCreateNewCharac
  Interceptor.attach(ptr(0x8401922), {
    onEnter: function (args) {},
    onLeave: function (retval) {
      retval.replace(1);
    }
  });

  g_patch_create_char_limit_started = true;
  patchLog('disableCreateCharLimit started');
}

function enableStrengthenRefresh() {
  if (g_patch_strengthen_refresh_started) {
    patchLog('enableStrengthenRefresh already started');
    return;
  }

  // 与旧 DP_Strengthen_SendUpdateItemList 口径保持一致：
  // args[1] = user，args[2] + 27 = 装备位置。
  Interceptor.attach(ptr(0x080FC850), {
    onEnter: function (args) {
      this.user = args[1];
      this.equiPos = args[2].add(27).readU16();
    },
    onLeave: function (retval) {
      if (!this.user || this.user.isNull()) {
        return;
      }
      CUser_SendUpdateItemList(this.user, 1, 0, this.equiPos);
    }
  });

  g_patch_strengthen_refresh_started = true;
  patchLog('enableStrengthenRefresh started');
}

function enableComboSkillFix() {
  if (g_patch_combo_skill_started) {
    patchLog('enableComboSkillFix already started');
    return;
  }

  Interceptor.attach(ptr(0x8608C98), {
    onEnter: function (args) {},
    onLeave: function (retval) { retval.replace(1); }
  });

  g_patch_combo_skill_started = true;
  patchLog('enableComboSkillFix started');
}
