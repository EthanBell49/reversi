/****************************************************************************/
/*    set up the static file server      */
/* include the static file webserver libary */
var static = require('node-static');

/* include the http server libary */
var http = require('http');

/* assum that we are runing on heroku */
var port = process.env.PORT;
var directory = __dirname + '/public';

/* if we arn't on heroku, then we need to readjust the port and directory information and we know that becuse port won't be set */
if(typeof port == 'undefined' || !port){
   directory = './public';
   port = 8080;
}

/* set up a static web-server that will deliver file from the filesystem */
var file = new static.Server(directory);

/* construct an http server that gets file fom thefile server */
var app = http.createServer(
	function(request,response){
	   request.addListener('end',
		function(){
		    file.serve(request,response);
		}
	   ).resume();
	}
    ).listen(port);

console.log('The server is running');
/***************************************************************/
/*           set up the web socket server                   */

/* a registry of socket_ids and player information*/
var players = [];

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket){
  log('Client connection by '+socket.id);
  function log(){
    var array = ['*** Server Log Message: '];
    for(var i = 0; i < arguments.length; i++){
      array.push(arguments[i]);
      console.log(arguments[i]);
    }
    socket.emit('log',array);
    socket.broadcast.emit('log',array);
  }

/* join_room command                                */
  socket.on('join_room',function(payload){
    log('\'join_room\' command'+JSON.stringify(payload));

    /* check that the client sent a payload*/
    if(('undefined' === typeof payload) || !payload){
      var error_message = 'join_room had no payload, command aborted';
      log(error_message);
      socket.emit('join_room_reponse',    {
                                            result: 'fail',
                                            message: error_message
                                          });
      return;
    }

  /* check that the payload has a room to join*/
  var room = payload.room;
  if(('undefined' === typeof room) || !room){
    var error_message = 'join_room didn\'t specify a room, command aborted';
    log(error_message);
    socket.emit('join_room_reponse',    {
                                          result: 'fail',
                                          message: error_message
                                        });
    return;
  }

  /* check that the username has been provided*/
  var username = payload.username;
  if(('undefined' === typeof username) || !username){
    var error_message = 'join_room didn\'t specify a username, command aborted';
    log(error_message);
    socket.emit('join_room_reponse',    {
                                          result: 'fail',
                                          message: error_message
                                        });
    return;
  }
  /* store information about the new player */
  players[socket.id] = {};
  players[socket.id].username = username;
  players[socket.id].room = room;

  /* Actually have the user join the room*/
  socket.join(room);

  /* Get the toom object*/
  var roomObject = io.sockets.adapter.rooms[room];

  /* Tell everyone that is already in the room that someone just joined*/
  var numClients = roomObject.length;
  var success_data = {
                      result: 'success',
                      room: room,
                      username: username,
                      socket_id: socket.id,
                      membership: numClients
                    };
  io.sockets.in(room).emit('join_room_reponse', success_data);

  for(var socket_in_room in roomObject.sockets){
    var success_data = {
                        result: 'success',
                        room: room,
                        username: players[socket_in_room].username,
                        socket_id: socket_in_room,
                        membership: numClients
                      };
    socket.emit('join_room_reponse',success_data);
  }

  log('join_room success');
});

socket.on('disconnected',function(socket){
  log('Client disconnected '+JSON.stringify(players[socket.id]));

  if('undefined' !== typeof players[socket.id] && players[socket.id]) {
      var username = players[socket.id].username;
      var room = players[socket.id].room;
      var payload = {
                      username: username,
                      socket_id: socket.id
                    };
      delete players[socket.id];
      io.in(room).emit('player_disconnected', payload);
  }

});

/*       send_message command                       */
socket.on('send_message',function(payload){
    log('server received a command','send_message',payload);
    if(('undefined' === typeof payload) || !payload){
      var error_message = 'send_message had no payload, command aborted';
      log(error_message);
      socket.emit('send_message_response',    {
                                            result: 'fail',
                                            message: error_message
                                          });
      return;
    }

  var room = payload.room;
  if(('undefined' === typeof room) || !room){
    var error_message = 'send_message didn\'t specify a room, command aborted';
    log(error_message);
    socket.emit('send_message_response',    {
                                          result: 'fail',
                                          message: error_message
                                        });
    return;
  }
  var username = payload.username;
  if(('undefined' === typeof username) || !username){
    var error_message = 'send_message didn\'t specify a username, command aborted';
    log(error_message);
    socket.emit('send_message_response',    {
                                          result: 'fail',
                                          message: error_message
                                        });
    return;
  }
  var message = payload.message;
  if(('undefined' === typeof message) || !message){
    var error_message = 'send_message didn\'t specify a message, command aborted';
    log(error_message);
    socket.emit('send_message_response',    {
                                          result: 'fail',
                                          message: error_message
                                        });
    return;
  }
  var success_data = {
                      result: 'success',
                      room: room,
                      username: username,
                      message: message
                    };
  io.sockets.in(room).emit('send_message_response',success_data);
  log('Message send to room '+ room + ' by '+ username);
  });
});
