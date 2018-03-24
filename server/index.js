var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
let moment = require('moment');

let tc = 0;

console.log(moment().format('DD MMM YYYY hh mm ss'));

io.on('connection', function(socket) {
	tc++;

	console.log('connected : ', socket.id);

	socket.emit('question', 'who are you?');
	//io.emit('broadcast', /* */); // emit an event to all connected sockets
	socket.on('answer', function(data) {
		console.log('given answer:', data, ' :', socket.id);
		console.log('tc:', tc);
	});

	socket.on('disconnect', function() {
		console.log('disconnected');
		console.log('tc:', --tc);
	});
});
server.listen(3000);
