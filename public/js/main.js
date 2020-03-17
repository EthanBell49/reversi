/* funtion for general use */

function getURLParameters(whichParam)
{
  var pageURL = window.location.search.substring(1);
  var pageURLVariables = pageURL.split('&');
  for(var i = 0; i < pageURLVariables.length; i++){
    var paramterName = pageURLVariables[i].split('=');
    if (paramterName[0] == whichParam) {
      return paramterName[1];
    }
  }
}

var username = getURLParameters('username');
if ('undefined' == typeof username || !username) {
  username = 'Anonymous_'+Math.random();
}

var chat_room = 'One_Room';

/* connect to the socket server*/
var socket = io.connect();

socket.on('log',function(array){
  console.log.apply(console,array);
});

socket.on('join_room_reponse',function(payLoad) {
  if(payLoad.result == 'fail' ){
    alert(payLoad.message);
    return;
  }
  $('#message').append('<p>New user joined the room: ' + payLoad.username,'</p>');
});


$(function(){
  var payLoad = {};
  payLoad.username = username;
  console.log('*** Client Log Message: \'join_room\' payLoad: '+JSON.stringify(payLoad));
  socket.emit('join_room', payLoad);
});
