var esprima = require('esprima');
var fs = require('fs');
var path = require('path');
var compiler = require('./compiler');
var escodegen = require('escodegen');
var prettyprint = require('./prettyprint');

var file = process.argv[2];

var src = fs.readFileSync(file);
var node = esprima.parse(src, { loc: true, range: true });
node = compiler.compile(node, src);

// console.log(prettyprint.pretty(node));
console.log(escodegen.generate(node, {
    moz: { starlessGenerator: true }
}));
