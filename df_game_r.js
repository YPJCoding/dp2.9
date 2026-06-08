// clean runtime template JS entry
//
// 这是模板 JS/Frida 入口文件。
// 不包含任何真实地址、真实 hook、真实 patch 或业务逻辑。

function templateLog(message) {
  console.log('[template-js] ' + String(message));
}

function loadTemplateModule(name) {
  templateLog('module loading is project-specific: ' + String(name));
  return false;
}

function startTemplateJs() {
  templateLog('startTemplateJs called');
  loadTemplateModule('example_module');
}

setImmediate(function () {
  startTemplateJs();
});