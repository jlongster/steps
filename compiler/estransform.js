
// Extend as needed.
var lang = exports.lang = {
    Node: {
    },

    Program: {
        parent: "Node",
        fields:  ["@body"]
    },

    Statement: {
        parent: "Node"
    },

    EmptyStatement: {
        parent: "Statement"
    },

    BlockStatement: {
        parent: "Statement",
        fields:  ["@body", "@inline"]
    },

    ExpressionStatement: {
        parent: "Statement",
        fields:  ["@expression"]
    },

    IfStatement: {
        parent: "Statement",
        fields:  ["@test", "@consequent", "@alternate"]
    },

    LabeledStatement: {
        parent: "Statement",
        fields:  ["@label", "@body"]
    },

    BreakStatement: {
        parent: "Statement",
        fields:  ["@label"]
    },

    ContinueStatement: {
        parent: "Statement",
        fields:  ["@label"]
    },

    WithStatement: {
        parent: "Statement",
        fields:  ["@object", "@body"]
    },

    SwitchStatement: {
        parent: "Statement",
        fields:  ["@discriminant", "@cases", "lexical"],
    },

    ReturnStatement: {
        parent: "Statement",
        fields:  ["@argument"]
    },

    ThrowStatement: {
        parent: "Statement",
        fields:  ["@argument"]
    },

    TryStatement: {
        parent: "Statement",
        fields:  ["@block", "@handlers", "@finalizer"]
    },

    WhileStatement: {
        parent: "Statement",
        fields:  ["@test", "@body"]
    },

    DoWhileStatement: {
        parent: "Statement",
        fields:  ["@body", "@test"]
    },

    ForStatement: {
        parent: "Statement",
        fields:  ["@init", "@test", "@update", "@body"]
    },

    ForInStatement: {
        parent: "Statement",
        fields:  ["@left", "@right", "@body", "each"]
    },

    LetStatement: {
        parent: "Statement",
        fields:  ["@head", "@body"]
    },

    DebuggerStatement: {
        parent: "Statement"
    },

    Declaration: {
        parent: "Statement"
    },

    FunctionDeclaration: {
        parent: "Declaration",
        fields:  ["@id", "@modifiers", "@params", "@body", "generator", "expression"]
    },

    VariableDeclaration: {
        parent: "Declaration",
        fields:  ["kind", "@declarations"]
    },

    VariableDeclarator: {
        parent: "Node",
        fields:  ["@id", "@init"]
    },

    Expression: {
        parent: "Pattern"
    },

    ThisExpression: {
        parent: "Expression"
    },

    ArrayExpression: {
        parent: "Expression",
        fields:  ["@elements"]
    },

    ObjectExpression: {
        parent: "Expression",
        fields:  ["@properties"]
    },

    Property: {
        parent: "Node",
        fields:  ["@key", "@value", "kind"],
    },

    FunctionExpression: {
        parent: "Expression",
        fields:  ["@id", "@params", "@body", "@decltype", "generator", "expression"]
    },

    SequenceExpression: {
        parent: "Expression",
        fields:  ["@expressions"]
    },

    UnaryExpression: {
        parent: "Expression",
        fields:  ["operator", "@argument", "prefix"]
    },

    BinaryExpression: {
        parent: "Expression",
        fields:  ["operator", "@left", "@right"]
    },

    AssignmentExpression: {
        parent: "Expression",
        fields:  ["@left", "operator", "@right"]
    },

    UpdateExpression: {
        parent: "Expression",
        fields:  ["operator", "@argument", "prefix"]
    },

    LogicalExpression: {
        parent: "Expression",
        fields:  ["operator", "@left", "@right"]
    },

    ConditionalExpression: {
        parent: "Expression",
        fields:  ["@test", "@consequent", "@alternate"]
    },

    NewExpression: {
        parent: "Expression",
        fields:  ["@callee", "@arguments"]
    },

    CallExpression: {
        parent: "Expression",
        fields:  ["@callee", "@arguments"]
    },

    MemberExpression: {
        parent: "Expression",
        fields:  ["@object", "@property", "computed", "kind"]
    },

    YieldExpression: {
        parent: "Expression",
        fields:  ["@argument"]
    },

    ComprehensionExpression: {
        parent: "Expression",
        fields:  ["@blocks", "@filter"]
    },

    GeneratorExpression: {
        parent: "Expression",
        fields:  ["@blocks", "@filter"]
    },

    LetExpression: {
        parent: "Expression",
        fields:  ["@head", "@body"]
    },

    Pattern: {
        parent: "Node"
    },

    ObjectPattern: {
        parent: "Pattern",
        fields:  ["@properties"]
    },

    ArrayPattern: {
        parent: "Pattern",
        fields:  ["@elements"]
    },

    SwitchCase: {
        parent: "Node",
        fields:  ["@test", "@consequent"]
    },

    CatchClause: {
        parent: "Node",
        fields:  ["@param", "@body"]
    },

    Identifier: {
        parent: "Expression",
        fields:  ["name", "kind"]
    },

    Literal: {
        parent: "Expression",
        fields:  ["value", "forceDouble"]
    }
};

function allFields(spec) {
    // Make the location a special last field.
    var fields = ["leadingComments", "loc"];
    while (spec) {
        if (spec.fields) {
            fields = spec.fields.concat(fields);
        }
        spec = spec.parent ? lang[spec.parent] : null;
    }
    return fields;
};
exports.allFields = allFields;

function prefixUnderscore(s) {
    return "_" + s;
}

function ensureConstructor(name, spec) {
    if (!exports[name]) {
        // Make a new constructor if it doesn't exist yet.
        var fields = allFields(spec);
        var children = [];
        var body = ["this.type = \"" + name + "\";"];
        for (var i = 0, j = fields.length; i < j; i++) {
            var fname = fields[i];
            if (fname.charAt(0) === "@") {
                fields[i] = fname = fname.substr(1);
                children.push(fname);
            }
            body.push("this." + fname + " = _" + fname + ";");
        }
        // Prefix parameter names with underscores so keywords work.
        var node = new Function(fields.map(prefixUnderscore), body.join("\n"));

        // Hook up the prototypes.
        if (spec.parent) {
            var pnode = ensureConstructor(spec.parent, lang[spec.parent]);
            node.prototype = Object.create(pnode.prototype);
        }

        Object.defineProperty(node.prototype, "_children",
                              { value: children,
                                writable: true,
                                configurable: true,
                                enumerable: false });

        exports[name] = node;
    }
    return exports[name];
}

// Build constructors out of the language spec.
for (var name in lang) {
    ensureConstructor(name, lang[name]);
}

// Make a walk function (map and replace) named |name|. By default it
// walks the ASexports bottom-up. If different behavior is needed for different
// nodes, override the walk function explicitly on those nodes.
//
// Returning null means "delete this null". Any other falsey values means
// identity.
exports.makePass = function makePass(name, prop) {
    return function (o) {
        var trans, arr;
        var child, children = this._children;
        for (var i = 0, j = children.length; i < j; i++) {
            if (!(child = this[children[i]])) {
                continue;
            }

            if (child instanceof Array) {
                arr = this[children[i]] = [];
                for (var k = 0, l = child.length; k < l; k++) {
                    if (!child[k]) {
                        arr.push(child[k]);
                    } else if (typeof child[k][name] === "function") {
                        trans = child[k][name](o);
                        if (trans !== null) {
                            arr.push(trans);
                        }
                    }
                }
            } else if (typeof child[name] === "function") {
                trans = child[name](o);
                if (trans === null) {
                    this[children[i]] = undefined;
                } else {
                    this[children[i]] = trans;
                }
            }
        }

        if (typeof this[prop] === "function") {
            if (o.logger && typeof this.loc !== "undefined") {
                o.logger.push(this);
                trans = this[prop](o);
                o.logger.pop();
            } else {
                trans = this[prop](o);
            }
            if (trans === null) {
                return null;
            }
            return trans ? trans : this;
        }

        return this;
    };
};

exports.lift = function lift(raw) {
    if (!raw) {
        return raw;
    }
    
    if (raw instanceof Array) {
        return raw.map(lift);
    }

    var type = raw.type;
    var Node = exports[type];
    if (!Node) {
        throw new Error("unknown node type `" + type + "'");
    }

    var node = new Node();
    node.loc = raw.loc;
    node.range = raw.range;
    var fields = allFields(lang[type]);
    for (var i = 0, j = fields.length; i < j; i++) {
        var field;
        if (fields[i].charAt(0) === "@") {
            field = fields[i].substr(1);
            if (raw[field]) {
                node[field] = lift(raw[field]);
            }
        } else {
            field = fields[i];
            node[field] = raw[field];
        }
    }

    return node;
};

exports.flatten = function flatten(node) {
    if (!node) {
        return node;
    }
    else if (node instanceof Array) {
        return node.map(flatten);
    }

    var type = node.type;
    var raw = { type: type };
    var fields = allFields(lang[type]);
    for (var i = 0, j = fields.length; i < j; i++) {
        var field;
        if (fields[i].charAt(0) === "@") {
            field = fields[i].substr(1);
            if (node[field]) {
                raw[field] = flatten(node[field]);
            } else {
                raw[field] = null;
            }
        } else {
            field = fields[i];
            raw[field] = node[field];
        }
    }

    return raw;
};
