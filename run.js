// server

var http = require('http');
var connect = require('connect');
var WebSocketServer = require('ws').Server;

var app = connect();
app.use(connect.static('static'));

var server = http.createServer(app);
server.listen(4000);

var wsserver = new WebSocketServer({ server: server });
var sockets = [];

wsserver.on('connection', function(socket) {
    sockets.push(socket);

    socket.on('close', function() {
        sockets.splice(sockets.indexOf(socket), 1);
    });

    socket.send(JSON.stringify({ src: targetModule._src }));

    run();
});

function broadcast(msg) {
    sockets.forEach(function(s) {
        s.send(JSON.stringify(msg));
    });
}

// input

var stdin = process.stdin;
stdin.setRawMode(true);
stdin.resume();
stdin.on('data', function(key) {
    if(key == "\u0003") {
        process.exit();
    }
    else if(key == 'n') {
        s.step();
        broadcast({ pos: s.currentPos, stack: s.getStack() });
    }
});

// stepper

var targetModule = require('./test_');
var method = targetModule.foo;

var stepper = require('./vm').stepper;
var s;

function run() {
    s = stepper(method(10), targetModule._src);
    var r = s.run();

    if(r !== undefined) {
        console.log(r);
    }
    else {
        broadcast({ pos: s.currentPos, stack: s.getStack() });
    }
}

//var foo = require('./test').foo;
//console.log(foo(2));
