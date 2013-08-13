
function bar(x) {
    debugger;
    return foo(x - 1) + 1;
}

function foo(x) {
    if(x > 0) {
        return 3 + bar(x);
    }
    return 0;
}

