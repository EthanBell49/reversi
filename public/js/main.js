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

var chat_room = getURLParameters('game_id');
if('undefined' == typeof chat_room || !chat_room) {
    chat_room = 'lobby';
}

/* connect to the socket server*/
var socket = io.connect();

/* what to do when the server sneds me a log message*/
socket.on('log',function(array){
  console.log.apply(console,array);
});

/* what to do when the sever responds that someone joined a room*/
socket.on('join_room_response',function(payload) {

  if(payload.result == 'fail' ){
    alert(payload.message);
    return;
  }

  /* if we are being notified that we joined the room, then ignore it*/
  if(payload.socket_id == socket.id) {
      return;
  }

/* If someone joined then add a new row to the lobby table */
var dom_elements = $('.socket_'+payload.socket_id);
/* if we don't alredy have an entry for this person */
if(dom_elements.length == 0){

    var nodeA = $('<div A></div>');
    nodeA.addClass('socket_'+payload.socket_id);

    var nodeB = $('<div B></div>');
    nodeB.addClass('socket_'+payload.socket_id);

    var nodeC = $('<div C></div>');
    nodeC.addClass('socket_'+payload.socket_id+'_button');

    nodeA.addClass('w-100');

    nodeB.addClass('col-9 text-right');
    nodeB.append('<h4>'+payload.username+'</h4>');

    nodeC.addClass('col-3 text-left');
    var buttonC = makeInviteButton(payload.socket_id);
    nodeC.append(buttonC);

    nodeA.hide();
    nodeB.hide();
    nodeC.hide();
    $('#players').append(nodeA,nodeB,nodeC);
    nodeA.slideDown(1000);
    nodeB.slideDown(1000);
    nodeC.slideDown(1000);
}
else{
    uninvite(payload.socket_id);
    var buttonC = makeInviteButton(payload.socket_id);
    $('.socket_'+payload.socket_id+'_button').html(buttonC);
    dom_elements.slideDown(1000);
}

/* Manage the message that a new player has joined */
  var newHTML = '<p>'+payload.username+' just entered the labby</p>';
  var newNode = $(newHTML);
  newNode.hide();
  $('#messages').append(newNode);
  newNode.slideDown(1000);
});



/* what to do when the sever says that someone has left a room*/
socket.on('player_disconnected',function(payload) {
  if(payload.result == 'fail' ){
    alert(payload.message);
    return;
  }

  /* if we are being notified that we left the room, then ignore it*/
  if(payload.socket_id == socket.id) {
      return;
  }

/* If someone left the room then animate out all their content */
var dom_elements = $('.socket_'+payload.socket_id);

/* if something exists */
if(dom_elements.length != 0){
    dom_elements.slideUp(1000);
}

/* Manage the message that a new player has left */
  var newHTML = '<p>' +payload.username+' has left the lobby</p>';
  var newNode = $(newHTML);
  newNode.hide();
  $('#messages').append(newNode);
  newNode.slideDown(1000);
});

/* send an invite message to the server*/
function invite(who){
  var payload = {};
  payload.requested_user = who;

  console.log('*** Client Log Message: \'invite\' payload: '+JSON.stringify(payload));
  socket.emit('invite',payload);
}

/* handle a response after sending an invite message to the server*/
socket.on('invite_response',function(payload) {
  if(payload.result == 'fail' ){
    alert(payload.message);
    return;
  }
  var newNode = makeInvitedButton(payload.socket_id);
  $('.socket_'+payload.socket_id+'_button').html(newNode);
});

/* handle a notification that we have been invited*/
socket.on('invited',function(payload) {
  if(payload.result == 'fail' ){
    alert(payload.message);
    return;
  }
  var newNode = makePlayButton(payload.socket_id);
  $('.socket_'+payload.socket_id+'_button').html(newNode);
});


/* send an uninvite message to the server*/
function uninvite(who){
  var payload = {};
  payload.requested_user = who;

  console.log('*** Client Log Message: \'uninvite\' payload: '+JSON.stringify(payload));
  socket.emit('uninvite',payload);
}

/* handle a response after sending an uninvite message to the server*/
socket.on('uninvite_response',function(payload) {
  if(payload.result == 'fail' ){
    alert(payload.message);
    return;
  }
  var newNode = makeInviteButton(payload.socket_id);
  $('.socket_'+payload.socket_id+'_button').html(newNode);
});

/* handle a notification that we have been uninvited*/
socket.on('uninvited',function(payload) {
  if(payload.result == 'fail' ){
    alert(payload.message);
    return;
  }
  var newNode = makeInviteButton(payload.socket_id);
  $('.socket_'+payload.socket_id+'_button').html(newNode);
});


/* send a game_start message to the server*/
function game_start(who){
  var payload = {};
  payload.requested_user = who;

  console.log('*** Client Log Message: \'game_start\' payload: '+JSON.stringify(payload));
  socket.emit('game_start',payload);
}

/* handle a notification that we have been engaged*/
socket.on('game_start_response',function(payload) {
  if(payload.result == 'fail' ){
    alert(payload.message);
    return;
  }
  var newNode = makeEngagedButton(payload.socket_id);
  $('.socket_'+payload.socket_id+'_button').html(newNode);
  var username = getURLParameters('username');
  /* jump to new game*/

  window.location.href ='game.html?username='+username+'&game_id='+payload.game_id;
});


function send_message(){
  var payload = {};
  payload.room = chat_room;
  payload.message = $('#send_message_holder').val();
  console.log('*** Client Log Message: \'send message\' payload: '+JSON.stringify(payload));
  socket.emit('send_message', payload);
}

socket.on('send_message_response',function(payload) {
    if(payload.result == 'fail' ){
      alert(payload.message);
      return;
    }
    var newHTML = '<p><b>'+payload.username+' says:</b> '+payload.message+'</p>';
    var newNode = $(newHTML);
    newNode.hide();
  $('#messages').append(newNode);
  newNode.slideDown(1000);
});

function makeInviteButton(socket_id){
    var newHTML = '<button type=\'button\' class=\'btn btn-outline-primary\'>Invite</button>';
    var newNode = $(newHTML);
    newNode.click(function(){
      invite(socket_id);
    });
    return(newNode);
}

function makeInvitedButton(socket_id){
    var newHTML = '<button type=\'button\' class=\'btn btn-primary\'>Invited</button>';
    var newNode = $(newHTML);
    newNode.click(function(){
      uninvite(socket_id);
    });
    return(newNode);
}

function makePlayButton(socket_id){
    var newHTML = '<button type=\'button\' class=\'btn btn-success\'>Play</button>';
    var newNode = $(newHTML);
    newNode.click(function(){
      game_start(socket_id);
    });
    return(newNode);
}

function makeEngagedButton(){
    var newHTML = '<button type=\'button\' class=\'btn btn-danger\'>Engaged</button>';
    var newNode = $(newHTML);
    return(newNode);
}


$(function(){
  var payload = {};
  payload.room = chat_room;
  payload.username = username;

  console.log('*** Client Log Message: \'join_room\' payload: '+JSON.stringify(payload));
  socket.emit('join_room', payload);
});

var old_board = [
                  ['?','?','?','?','?','?','?','?'],
                  ['?','?','?','?','?','?','?','?'],
                  ['?','?','?','?','?','?','?','?'],
                  ['?','?','?','?','?','?','?','?'],
                  ['?','?','?','?','?','?','?','?'],
                  ['?','?','?','?','?','?','?','?'],
                  ['?','?','?','?','?','?','?','?'],
                  ['?','?','?','?','?','?','?','?']
                ];

socket.on('game_update', function(payload){

    console.log('*** Client Log Message: \'game_update\'\n\tpayload: '+JSON.stringify(payload));
    /* check for a good bord update*/
    if(payload.result == 'fail'){
        console.log(payload.message);
        window.location.href = 'lobby.html?username='+username;
        return;
    }
    /*check for a good board in the payload*/
    var board = payload.game.board;
    if('undefined' == typeof board || !board){
      console.log('internal error: received a malformed board update from the server');
    }
    /*update color */

    /*animate canges to the board */

    var row,column;
    for(row = 0; row < 8; row++){
      for(column = 0; column < 8; column++){
        /* if a board space has changed */
        if(old_board[row][column] != board [row][column]){
          if(old_board[row][column] == '?' && board [row][column] == ' '){
            $('#'+row+'_'+column).html('<img src="assets/images/empty.gif" alt="empty square"/>');
          }
          /*empty_to_black/white*/
          else if(old_board[row][column] == '?' && board [row][column] == 'w'){
            $('#'+row+'_'+column).html('<img src="assets/images/empty_to_white.gif" alt="white square"/>');
          }
          else if(old_board[row][column] == '?' && board [row][column] == 'b'){
            $('#'+row+'_'+column).html('<img src="assets/images/empty_to_black.gif" alt="black square"/>');
          }
          else if(old_board[row][column] == ' ' && board [row][column] == 'w'){
            $('#'+row+'_'+column).html('<img src="assets/images/empty_to_white.gif" alt="white square"/>');
          }
          else if(old_board[row][column] == ' ' && board [row][column] == 'b'){
            $('#'+row+'_'+column).html('<img src="assets/images/empty_to_black.gif" alt="black square"/>');
          }
          /*black/white_to_empty*/
          else if(old_board[row][column] == 'w' && board [row][column] == ' '){
            $('#'+row+'_'+column).html('<img src="assets/images/white_to_empty.gif" alt="empty square"/>');
          }
          else if(old_board[row][column] == 'b' && board [row][column] == ' '){
            $('#'+row+'_'+column).html('<img src="assets/images/black_to_empty.gif" alt="empty square"/>');
          }
          /* black_to_white/white_to_black */
          else if(old_board[row][column] == 'w' && board [row][column] == 'b'){
            $('#'+row+'_'+column).html('<img src="assets/images/white_to_black.gif" alt="black square"/>');
          }
          else if(old_board[row][column] == 'b' && board [row][column] == 'w'){
            $('#'+row+'_'+column).html('<img src="assets/images/black_to_white.gif" alt="white square"/>');
          }
          else {
            $('#'+row+'_'+column).html('<img src="assets/images/error.gif" alt="error"/>');
          }
        }
      }
    }
    old_board = board;
});
