var express = require('express'),
    http = require('http'),
    pty = require('pty.js'),
    term = require('term.js'),
    path = require('path');

var app = express();

app.configure(function() {
    app.use(app.router);
    app.use(term.middleware());
    app.use(express.static(path.join(__dirname, 'public')));
});

var server = http.createServer(app).listen(3000, '0.0.0.0', function() {
    console.log("Express server listening on port 3000");
});

io = require('socket.io').listen(server);

var term = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
});

io.sockets.on('connection', function(socket) {
    socket.on('data', function(data) {
       term.write(data);
    });
    term.on('data', function(data) {
        socket.emit('data', data);
    });
});
