// 独立修补程序（来源：dp2.9/df_game_r.js）

// 取消新账号送成长契约
function InterSelectMobileAuthReward() {
    var Defptr = ptr(0x08161384);
    var value = Defptr.readU8();
    if (value != 0x0F) {
        Memory.protect(Defptr, 10, 'rwx');
        Defptr.writeShort(0x840F);
    }
    var Inter_DispatchPr = ptr(0x0816132A);
    var Inter_Dispatch = new NativeFunction(Inter_DispatchPr, 'int', ['pointer', 'pointer', 'pointer'], { "abi": "sysv" });
    Interceptor.replace(Inter_DispatchPr, new NativeCallback(function (InterSelectMobileAuthReward, CUser, a3) {
        return 0;
    }));
}

// 解除每日创建角色数量限制
function disable_check_create_character_limit() {
    Memory.protect(ptr(0x8401922), 2, 'rwx');
    ptr(0x8401922).writeUShort(0x01B0);
}

// +13 以上强化券自动刷新物品栏
function DP_Strengthen_SendUpdateItemList() {
    Interceptor.attach(ptr(0x080FC850), {
        onEnter: function (args) {},
        onLeave: function (retval) {
            var user = this.context.ecx;
            CUser_SendUpdateItemList(user);
        }
    });
}

// 黑暗武士技能栏修复
function check_move_comboSkillSlot_force_true() {
    Interceptor.attach(ptr(0x8608C98), {
        onEnter: function (args) {},
        onLeave: function (retval) { retval.replace(1); }
    });
}
