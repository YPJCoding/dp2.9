// clean runtime template JS example module
//
// 示例 JS 模块。
// 不包含真实 hook 地址，不 attach，不 patch。

function startExampleModule() {
    console.log('[template-js][example_module] started');
}

if (typeof globalThis !== 'undefined') {
    globalThis.startExampleModule = startExampleModule;
}
