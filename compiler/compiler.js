
var T = require('./estransform');

var Node = T.Node;
var Literal = T.Literal;
var Identifier = T.Identifier;
var Expression = T.Expression;
var ArrayExpression = T.ArrayExpression;
var VariableDeclaration = T.VariableDeclaration;
var VariableDeclarator = T.VariableDeclarator;
var MemberDeclarator = T.MemberDeclarator;
var MemberExpression = T.MemberExpression;
var YieldExpression = T.YieldExpression;
var BinaryExpression = T.BinaryExpression;
var SequenceExpression = T.SequenceExpression;
var CallExpression = T.CallExpression;
var AssignmentExpression = T.AssignmentExpression;
var ExpressionStatement = T.ExpressionStatement;
var ReturnStatement = T.ReturnStatement;
var Program = T.Program;
var FunctionDeclaration = T.FunctionDeclaration;
var FunctionExpression = T.FunctionExpression;
var ConditionalExpression = T.ConditionalExpression;
var ObjectExpression = T.ObjectExpression;
var Property = T.Property;
var UnaryExpression = T.UnaryExpression;
var NewExpression = T.NewExpression;
var UpdateExpression = T.UpdateExpression;
var ForStatement = T.ForStatement;
var DebuggerStatement = T.DebuggerStatement;
var BlockStatement = T.BlockStatement;
var TryStatement = T.TryStatement;
var CatchClause = T.CatchClause;
var ThisExpression = T.ThisExpression;

Node.prototype.scan = T.makePass('scan', 'scanNode');
Node.prototype.instrument = T.makePass('instrument', 'instrumentNode');

// scan

Program.prototype.scanNode = function(o) {
    this.body.forEach(function(node) {
        if(node instanceof FunctionDeclaration && node.id) {
            o.exports.push(node.id.name);
        }
    });
};

// instrument

Program.prototype.instrumentNode = function(o) {
    this.body.push(new ExpressionStatement(
        new AssignmentExpression(
            new Identifier('TEST'),
            '=',
            new ObjectExpression(
                o.exports.map(function(name) {
                    return new Property(new Identifier(name), new Identifier(name));
                }).concat([
                    new Property(new Identifier('_src'), new Literal(o.src.toString()))
                ])
            )
        )
    ));
};

FunctionDeclaration.prototype.instrument =
FunctionExpression.prototype.instrument = function(o) {
    this.generator = true;
    this.body = this.body.instrument(o);
    return this;
};

ReturnStatement.prototype.instrumentNode = function() {
    return new ExpressionStatement(
        new YieldExpression(
            new ArrayExpression([
                new Identifier('VM.return'),
                this.argument,
                new Literal(this.range[0]),
                new Literal(this.range[1])
            ])
        )
    );
};

Expression.prototype.instrumentNode = function(o) {
    return new SequenceExpression([new YieldExpression(
        new ArrayExpression([
            new FunctionExpression(
                false,
                [],
                new BlockStatement([
                    new ExpressionStatement(
                        new YieldExpression(
                            new ArrayExpression([
                                new Identifier('VM.giveback'),
                                this
                            ])
                        )
                    )
                ])
            ),
            new Literal(this.range[0]),
            new Literal(this.range[1])
        ])
    )]);
};

DebuggerStatement.prototype.instrumentNode = function() {
    return new ExpressionStatement(
        new SequenceExpression([new YieldExpression(
            new ArrayExpression([
                new Identifier('VM.break'),
                new Literal(this.range[0]),
                new Literal(this.range[1])
            ])
        )])
    );
};

function compile(node, src) {
    var o = { src: src, exports: [] };
    node = T.lift(node);

    // scan
    node.scan(o);

    // instrument
    node = node.instrument(o);

    return T.flatten(node);
}

module.exports = {
    compile: compile
};
