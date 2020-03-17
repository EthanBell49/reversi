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

/* set up a static web-server that will delicer file from the dilesystem */
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
var io = require('socket.io').listen(app);
io.sockets.on('connection', function (socket){
  function log(){
    var array = ['*** Server Log Message: '];
    for(var i = 0; i < arguments.length; i++){
      array.push(arguments[i]);
      console.log(arguments[i]);
    }
    socket.emit('log',array);
    socket.broadcast.emit('log',array);
  }
  log('A web site connected to the server');

  socket.on('disconnected',function(socket){
    log('A web site disconnected from the server');
  });

/* join_room command                                */
  socket.on('join_room',function(payLoad){
    log('server received a command','join_room',payLoad);
    if(('undefined' === typeof payLoad) || !payLoad){
      var error_message = 'join_room had no payLoad, command aborted';
      log(error_message);
      socket.emit('join_room_reponse',    {
                                            result: 'fail',
                                            message: error_message
                                          });
      return;
    }

  var room = payLoad.room;
  if(('undefined' === typeof room) || !room){
    var error_message = 'join_room didn\'t specify a room, command aborted';
    log(error_message);
    socket.emit('join_room_reponse',    {
                                          result: 'fail',
                                          message: error_message
                                        });
    return;
  }
  var username = payLoad.username;
  if(('undefined' === typeof username) || !username){
    var error_message = 'join_room didn\'t specify a username, command aborted';
    log(error_message);
    socket.emit('join_room_reponse',    {
                                          result: 'fail',
                                          message: error_message
                                        });
    return;
  }
  socket.join(room);
  var roomObject = io.sockets.adapter.rooms[room];
  if(('undefined' === typeof roomObject) || !roomObject){
    var error_message = 'join_room could\'t create a room (internal error), command aborted';
    log(error_message);
    socket.emit('join_room_reponse',    {
                                          result: 'fail',
                                          message: error_message
                                        });
    return;
  }
  var numClients = roomObject.length;
  var success_data = {
                      result: 'success',
                      room: room,
                      username: username,
                      membership: (numClients + 1)
                    };
  io.sockets.in(room).emit('join_room_reponse', success_data);
  log('Room' + room + 'was just joind by ' + username);
});
/*       send_message command                       */
socket.on('send_message',function(payLoad){
    log('server received a command','send_message',payLoad);
    if(('undefined' === typeof payLoad) || !payLoad){
      var error_message = 'send_message had no payLoad, command aborted';
      log(error_message);
      socket.emit('send_message_response',    {
                                            result: 'fail',
                                            message: error_message
                                          });
      return;
    }

  var room = payLoad.room;
  if(('undefined' === typeof room) || !room){
    var error_message = 'send_message didn\'t specify a room, command aborted';
    log(error_message);
    socket.emit('send_message_response',    {
                                          result: 'fail',
                                          message: error_message
                                        });
    return;
  }
  var username = payLoad.username;
  if(('undefined' === typeof username) || !username){
    var error_message = 'send_message didn\'t specify a username, command aborted';
    log(error_message);
    socket.emit('send_message_response',    {
                                          result: 'fail',
                                          message: error_message
                                        });
    return;
  }
  var message = payLoad.message;
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
