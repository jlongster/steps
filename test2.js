
function foo() {
    var y = 5;
    yield function(str) { return eval(str); };

    yield y + 1;
}


var g = foo();
var f = g.next();
alert(f("y"));
f("y = 10");
alert(f("y"));
alert(g.next());
