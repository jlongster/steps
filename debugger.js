
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

function finish(res) {
    setSource(_src);
    document.getElementById('res').innerHTML = res;
    setStack(s.getStack());
}

function updateUI() {
    setPosition(s.currentPos);
    setStack(s.getStack());

    if(s.finished) {
        finish(s.currentValue);
    }
}

_src = TEST._src;
setSource(TEST._src);
s = VM.stepper(TEST.foo(3), TEST._src);

document.getElementById('run').addEventListener('click', function() {
    var r = s.run();

    if(r !== undefined) {
        finish(r);
    }
    else {
        setPosition(s.currentPos);
        setStack(s.getStack());
    }
});

document.getElementById('step-over').addEventListener('click', function() {
    s.stepOver();
    updateUI();
});

document.getElementById('step-into').addEventListener('click', function() {
    s.step();
    updateUI();
});

document.getElementById('eval').addEventListener('click', function() {
    alert(s.eval(document.getElementById('eval-txt').value));
});
