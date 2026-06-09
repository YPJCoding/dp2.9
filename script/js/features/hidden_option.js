// 时装潜能（隐藏属性）模块
// 来源：从旧 frida.js hidden_option() + start_hidden_option() 迁移
// 用途：修改时装潜能属性下发逻辑
//
// 做了什么：
// 1. 关闭系统分配的默认潜能属性
// 2. 用随机属性值替换（范围 1-63）
// 3. 修改返回值让潜能系统正常工作
//
// 为什么需要这样做：
// 原游戏时装潜能生成机制可能有问题，通过 Frida 直接修改内存
// 中的属性值和跳过分配逻辑来修复

var g_hidden_option_state = { started: false };

function startHiddenOptionFeature(ctx) {
  return RuntimeUtils.startOnce(ctx, g_hidden_option_state, 'hidden_option', function () {
    const addr = ctx.addresses;

    // ---- 内存修改：关闭系统分配 + 写入随机属性 ----
    // 来源：从旧 frida.js hidden_option() 迁移
    function hiddenOption() {
      // 关闭系统分配属性
      // 将指令 nop 掉（写入 0xEB = jmp）
      // 为什么用 nop：跳过系统默认的潜能属性分配逻辑
      // 风险：如果后续版本这段代码结构变化，nop 可能产生错误行为
      Memory.protect(addr.hidden_option_patch_1, 3, 'rwx');
      addr.hidden_option_patch_1.writeByteArray([0xEB]);

      // 下发时装潜能属性
      // 随机写入 1-63 的属性值
      // 为什么范围是 1-63：原游戏时装潜能总共 63 种
      // 风险：属性值随机可能导致客户端显示异常
      Memory.protect(addr.hidden_option_patch_2, 3, 'rwx');
      addr.hidden_option_patch_2.writeUShort(globalThis.getRandomInt(1, 64));
    }

    // ---- Hook 1：时装潜能生成入口 ----
    // 来源：从旧 frida.js start_hidden_option 第一个 hook 迁移
    // 为什么 hook 这里：每次角色进入副本或切换时装时会触发此函数
    // Hook 点：onEnter 时调用 hiddenOption() 修改内存
    attachOnce('hidden_option_entry', addr.hidden_option_entry, {
      onEnter: function (args) {
        hiddenOption();
      },
      onLeave: function (retval) {}
    });

    // ---- Hook 2：跳过系统默认属性分配返回值 ----
    // 来源：从旧 frida.js start_hidden_option 第二个 hook 迁移
    // 为什么 hook 这里：让系统认为属性分配已完成，不再尝试重新分配
    // Hook 点：onLeave 替换返回值为 1
    attachOnce('hidden_option_return_1', addr.hidden_option_return_1, {
      onEnter: function (args) {},
      onLeave: function (retval) {
        retval.replace(1);
      }
    });
  });
}

RuntimeUtils.exposeGlobal('startHiddenOptionFeature', startHiddenOptionFeature);
