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
});
