(function() {
    function isGeneratorInstance(f) {
        return f.toString().indexOf('Generator') !== -1;
    }

    var BREAK = new Object();
    var RETURN = new Object();

    // stepper

    function Stepper(gen, src) {
        this.stack = new Array(100000);
        this.stackIdx = -1;
        this.src = src;
        this.currentValue = undefined;
        this.currentExpr = null;
        this.stepping = false;
        this.finished = false;

        this.pushStack(gen, '<global>');
    }

    Stepper.prototype.step = function() {
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
        else if(isGeneratorInstance(res[0])) {
            this.pushStack(res[0],
                           this.src.slice(res[1], res[2]));

            //if(this.stepping) {
                this.currentPos = res.slice(1);
            //}

            res = undefined;
        }
        else {
            this.currentValue = res[0];

            //if(this.stepping) {
                this.currentPos = res.slice(1);
            //}
        }
    };

    Stepper.prototype.run = function() {
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

    Stepper.prototype.pushStack = function(gen, expr) {
        this.currentValue = undefined;
        this.stackIdx++;
        this.stack[this.stackIdx] = { gen: gen, expr: expr };
    };

    Stepper.prototype.popStack = function() {
        this.stack[this.stackIdx] = null;
        this.stackIdx--;
    };

    Stepper.prototype.getStack = function() {
        var exprs = [];
        for(var i=0; i<=this.stackIdx; i++) {
            exprs.push(this.stack[i].expr);
        }
        return exprs.join('\n');
    };

    window.VM = {
        stepper: function(gen, src) {
            return new Stepper(gen, src);
        },

        break: BREAK,
        return: RETURN
    };
})();
