
var lang = require('./estransform').lang;
var allFields = require('./estransform').allFields;

module.exports.pretty = function pretty(node, indent) {
    if (typeof indent === "undefined") {
        indent = "";
    }

    var s = "";

    if (node instanceof Array) {
        for (var i = 0, j = node.length; i < j; i++) {
            s += pretty(node[i], indent);
        }
        return s;
    }

    s += indent + node.type;

    var spec = lang[node.type];
    if (!spec) {
        s += " ???\n";
        return s;
    }

    var fields = allFields(spec);
    var children = [];
    var values = [];
    // We do loc manually.
    fields.pop();
    for (var i = 0, j = fields.length; i < j; i++) {
        var fname = fields[i];
        if (fname.charAt(0) === "@") {
            fname = fname.substr(1);
            if (node[fname]) {
                children.push(pretty(node[fname], indent + "  "));
            }
        } else {
            if (typeof node[fname] !== "undefined") {
                values.push(node[fname]);
            }
        }
    }

    if (values.length) {
        s += " '" + values.join("' '") + "'";
    }

    var loc = node.loc;
    if (loc) {
        s += (" (" + loc.start.line + ":" + loc.start.column + "-" +
              loc.end.line + ":" + loc.end.column + ")");
    }

    s += "\n" + children.join("");
    return s;
}
