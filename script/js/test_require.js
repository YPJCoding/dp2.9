// TEST: 验证 api_read_file + eval 能否加载并执行外部 JS 文件
// 引用 df_game_r.js 中的全局函数 getCurSec 来验证外部代码可访问全局作用域
var ts = typeof getCurSec === 'function' ? getCurSec(null) : -1;
console.log('[test_eval_file] loaded! getCurSec=' + ts);
