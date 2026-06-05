// TEST: ES6+ 语法支持测试
var results = [];

// 1. 箭头函数
try {
    var fn = (a, b) => a + b;
    results.push('arrow:OK(' + fn(1, 2) + ')');
} catch(e) { results.push('arrow:FAIL'); }

// 2. let / const
try {
    let x = 10; const y = 20;
    results.push('let/const:OK(' + (x + y) + ')');
} catch(e) { results.push('let/const:FAIL'); }

// 3. 模板字符串
try {
    var name = 'test';
    results.push('template:OK(' + ('hello ' + name) + ')');
} catch(e) { results.push('template:FAIL'); }

// 4. 解构
try {
    var arr = [1, 2]; var a = arr[0]; var b = arr[1];
    results.push('destructure:OK(' + a + ',' + b + ')');
} catch(e) { results.push('destructure:FAIL'); }

// 5. class
try {
    var TestClass = function TestClass(name) { this.name = name; };
    var inst = new TestClass('test');
    results.push('class:OK(' + inst.name + ')');
} catch(e) { results.push('class:FAIL'); }

// 6. Promise
try {
    if (typeof Promise !== 'undefined') {
        results.push('Promise:OK');
    } else {
        results.push('Promise:N/A');
    }
} catch(e) { results.push('Promise:FAIL'); }

console.log('[test_es6] ' + results.join(', '));
