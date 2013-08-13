
var _src;
var s;

function setSource(src) {
    src = src.replace(/ /g, '&nbsp;').replace(/\n/g, '<br />');
    document.getElementById('src').innerHTML = src;
}

function setPosition(pos) {
    setSource(
        _src.slice(0, pos[0]) +
        '<span>' + _src.slice(pos[0], pos[1]) + '</span>' +
        _src.slice(pos[1])
    );
}

function setStack(stack) {
    document.getElementById('stack').innerHTML = stack.replace(/\n/g, '<br />');
}

_src = TEST._src;
setSource(TEST._src);

document.getElementById('run').addEventListener('click', function() {
    s = VM.stepper(TEST.foo(10), TEST._src);
    var r = s.run();

    if(r !== undefined) {
        console.log(r);
    }
    else {
        setPosition(s.currentPos);
        setStack(s.getStack());
    }
});

document.getElementById('step').addEventListener('click', function() {
    s.step();
    setPosition(s.currentPos);
    setStack(s.getStack());    
});
