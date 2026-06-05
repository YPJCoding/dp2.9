// TEST: let 关键字支持
var ok = false;
try {
    eval('let x = 1; var r = x;');
    ok = true;
} catch(e) {}
console.log('[test_es6] let=' + (ok ? 'OK' : 'FAIL'));
