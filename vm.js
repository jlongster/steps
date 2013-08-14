(function() {
    function isGeneratorInstance(f) {
        return f.toString().indexOf('Generator') !== -1;
    }

    var BREAK = new Object();
    var RETURN = new Object();
    var GIVEBACK = new Object();

    // stepper

    function Stepper(gen, src) {
        this.stack = new Array(100000);
        this.stackIdx = -1;
        this.exprStatus = [];
        this.src = src;
        this.currentValue = undefined;
        this.currentExpr = null;
        this.stepping = false;
        this.finished = false;
        this.depth = 0;

        this.pushStack(gen, '<global>');
    }

    Stepper.prototype._step = function() {
        if(this.finished) return;

        var res = undefined;
        var gen = this.stack[this.stackIdx].gen;

        try {
            res = gen.send(this.currentValue);
        }
        catch(e) {
            console.log(e.message);
            throw e;
        }

        if(res[0] === RETURN) {
            this.popStack();
            this.currentValue = res[1];

            if(this.stackIdx < 0) {
                this.finished = true;
            }
        }
        else if(res[0] === BREAK) {
            this.stepping = true;
            this.currentPos = res.slice(1);
        }
        else if(res[0] === GIVEBACK) {
            var r = res[1];
            this.currentValue = r;
            this.popStack();
            this.exprIdx--;

            if(isGeneratorInstance(r)) {
                this.pushStack(r, '&lt;calling&gt;', [0, 0], true);
                this._step();
            }
        }
        else {
            var pos = res.slice(1);
            this.pushStack(res[0](),
                           pos,
                           this.src.slice(pos[0], pos[1]));
        }
    };

    Stepper.prototype.step = function() {
        this._step();
    };

    Stepper.prototype.stepOver = function() {
        this._step();

        while(!this.finished && !this.stack[this.stackIdx - 1].topLevel) {
            this._step();
        }
    };

    Stepper.prototype.run = function() {
        this.stepping = false;

        while(!this.stepping && !this.finished) {
            this.step();
        }

        if(this.stepping) {
            console.log('BREAK');
        }
        else {
            return this.currentValue;
        }
    };

    Stepper.prototype.pushStack = function(gen, pos, expr, topLevel) {
        this.currentValue = undefined;
        this.stackIdx++;
        this.stack[this.stackIdx] = { gen: gen, 
                                      expr: expr,
                                      pos: pos,
                                      topLevel: topLevel };
        this.currentPos = pos;
    };

    Stepper.prototype.popStack = function() {
        this.stack[this.stackIdx] = null;
        this.stackIdx--;
        this.currentPos = this.stack[this.stackIdx].pos;
    };

    Stepper.prototype.getStack = function() {
        var exprs = [];
        for(var i=0; i<=this.stackIdx; i++) {
            exprs.push(this.stack[i].expr + ' (' + this.stack[i].topLevel + ')');
        }
        return exprs.join('\n');
    };

    window.VM = {
        stepper: function(gen, src) {
            return new Stepper(gen, src);
        },

        break: BREAK,
        return: RETURN,
        giveback: GIVEBACK
    };
})();
