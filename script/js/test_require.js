// 测试模块：验证 Frida require() 是否可用
module.exports = {
    hello: function() {
        console.log('[test_require] Frida require() works!');
        return true;
    }
};
