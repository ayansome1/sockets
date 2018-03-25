let express = require('express');
let http = require('http');
let app = express();
let server = http.createServer(app);
let io = require('socket.io')(server);
let moment = require('moment');
let connInfo = config.sqlconn;
connInfo.multipleStatements = true;

if (!process.env.NODE_ENV) {
    app.use(require('morgan')('dev'));
}

function checkIfAccessTokenValid(accessToken) {
	let deferred = q.defer();
	let connection = mysql.createConnection(connInfo);
    let query = "Select * from users where access_token = ? ;";
    connection.query(query, [accessToken], (err, result) => {
        if (err) {
            deferred.reject(err);
        }
        
        else if (_.isEmpty(result)) {

            deferred.resolve({isValidUser: false});
        }
        else{
            deferred.resolve({user: result[0], isValidUser: true});

        }

    });

    connection.end();
    return deferred.promise;
}

function auth(req,res,next) {

	let accessToken = req.get('access-token');
	if(accessToken) {
		checkIfAccessTokenValid(accessToken).then(function(data){


			if(data.isValidUser){
				req.user = data.user;

				next();				
			}
			else{
				res.status(401).send();
			}
		},function(err){
            winston.error(" Error in checking accessToken validity" +  err);
	        return res.status(500).send();
		});
	}
	else{
		res.status(401).send();
	}


}






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
