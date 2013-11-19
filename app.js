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

app.get('/', function(req, res) {
    res.sendfile('terminal.html');
});

var server = http.createServer(app).listen(process.env.PORT, process.env.BIND_IP, function() {
    console.log("Express server listening on port " + process.env.PORT);
});

io = require('socket.io').listen(server);

io.set('transports', ['htmlfile', 'xhr-polling', 'jsonp-polling']);

io.sockets.on('connection', function(socket) {
    var term = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 160,
        rows: 44,
        cwd: process.env.HOME,
        env: process.env
    });

    term.on('data', function(data) {
        socket.emit('data', data);
    });

    socket.on('data', function(data) {
       term.write(data);
    });

    socket.on('disconnect', function() {
        term.destroy();
    });
});
