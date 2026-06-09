// clean runtime template JS entry
//
// 这是模板 JS/Frida 入口文件。
// 不包含任何真实地址、真实 hook、真实 patch 或业务逻辑。
//
// 运行方式：
// - df_game_r.js 作为入口文件
// - 通过 dp_load 动态加载 script/js/** 模块
// - template 默认只加载 example_module

function templateLog(message) {
  console.log('[template-js] ' + String(message));
}

function loadTemplateModule(name) {
  if (typeof dp_load !== 'function') {
    templateLog('dp_load not found, cannot load module: ' + String(name));
    return false;
  }

  try {
    var ok = dp_load(name);
    if (ok !== true) {
      templateLog('dp_load returned false: ' + String(name));
      return false;
    }

    templateLog('module loaded: ' + String(name));
    return true;
  } catch (e) {
    templateLog('dp_load exception: ' + String(name) + ', error=' + e);
    return false;
  }
}

function startTemplateJs() {
  templateLog('startTemplateJs called');

  if (!loadTemplateModule('example_module')) {
    templateLog('example_module load failed');
    return;
  }

  if (typeof globalThis.startExampleModule !== 'function') {
    templateLog('startExampleModule not found after loading example_module');
    return;
  }

  globalThis.startExampleModule();
}

setImmediate(function () {
  startTemplateJs();
});
