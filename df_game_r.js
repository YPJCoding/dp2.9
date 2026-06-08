// clean runtime template JS entry
//
// 这是模板 JS/Frida 入口文件。
// 不包含任何真实地址、真实 hook、真实 patch 或业务逻辑。

function templateLog(message) {
    console.log('[template-js] ' + String(message));
}

function loadTemplateModule(name) {
    try {
        var path = '/dp2/frida/script/js/' + name + '.js';
        templateLog('loading module: ' + path);
        // 在真实环境中可替换为项目自己的文件加载函数。
        // 这里保留空实现，避免模板误执行真实逻辑。
        return true;
    } catch (err) {
        templateLog('failed to load module=' + name + ' err=' + err);
        return false;
    }
}

function startTemplateJs() {
    templateLog('startTemplateJs called');
    loadTemplateModule('example_module');
}

setImmediate(function () {
    startTemplateJs();
});
