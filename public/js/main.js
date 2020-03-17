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

$('#messages').append('<h4>'+username+'</h4>');
