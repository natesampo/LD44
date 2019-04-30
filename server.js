var express = require('express');
var fs = require('fs');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
var users = {};
var games = {};
var lobby = [];
var port = 5000;
var gameSpeed = 120;

app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(process.env.PORT || port, function() {
	if (!process.env.PORT) {
		app.set('port', port);
		console.log('Game started on port ' + port + '\n');
	}
});

io.on('connection', function(socket) {
	socket.on('new player', function() {
		users[socket.id] = {
			id: socket.id,
			inGame: null,
			opponent: null
		}

		findMatch(socket);
	});
	socket.on('shoot', function(time) {
		try {
			var game = games[users[socket.id].inGame];

			if(!game.ended) {
				if(new Date(time) - game.startTime >= game.goTime) {
					io.to(socket.id).emit('result', true);
					io.to(users[socket.id].opponent).emit('result', false);
					game.ended = true;
				} else {
					io.to(socket.id).emit('result', false);
					io.to(users[socket.id].opponent).emit('result', true);
					game.ended = true;
				}
			}
		} catch(e) {
			console.log(e);
		}
	});
	socket.on('disconnect', function() {
		if (users[socket.id]) {
			if (users[socket.id].inGame == null) {
				for (var i=0; i<lobby.length; i++) {
					if (lobby[i] == users[socket.id]) {
						lobby.splice(i, 1);
					}
				}
			} else {
				var game = games[users[socket.id].inGame];
				users[game.players[socket.id].opponent].inGame = null;
				findMatch(users[game.players[socket.id].opponent]);

				delete games[users[socket.id].inGame];
			}

			delete users[socket.id];
		}
   	});
});

function findMatch(socket) {
	if (lobby.length > 0) {
    	var firstInLine = lobby.splice(0, 1)[0].id;
    	var gameid = String(firstInLine) + String(socket.id);

    	games[gameid] = {
    		id: gameid,
    		startTime: new Date(),
    		goTime: 2000+Math.floor(Math.random() * 5000),
    		ended: false,
    		players: {}
    	};

    	games[gameid].players[firstInLine] = {
		    id: firstInLine,
		    opponent: socket.id,
		};

		games[gameid].players[socket.id] = {
		    id: socket.id,
		    opponent: firstInLine,
		}

    	users[socket.id].inGame = gameid;
    	users[socket.id].opponent = firstInLine;
    	users[firstInLine].inGame = gameid;
    	users[firstInLine].opponent = socket.id;

    	io.to(socket.id).emit('join', games[gameid].startTime, games[gameid].goTime);
    	io.to(firstInLine).emit('join', games[gameid].startTime, games[gameid].goTime);
    } else {
    	lobby.push(users[socket.id]);
    }
}

setInterval(function() {
	try {
		for (var i in games) {
			game = games[i];
		}
	} catch (e) {
		console.log(e);
	}

}, 1000 / gameSpeed);