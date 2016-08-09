// YOUR CODE HERE:

var app = {};
app.newestMessageDate = null;
app.url = 'https://api.parse.com/1/classes/messages';
app.send = function(message, url) {
  $.ajax({
  // This is the url you should use to communicate with the parse API server.
    url: url,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function(url, cb, data) {
  var data = data || '';
  $.ajax({
    url: url,
    type: 'GET',
    //data: 'where={"createdAt":"2016-08-09T00:14:39.216Z"}',
    data: data,
    dataType: 'json',
    success: cb,
    error: function(e) {
      console.log('error', e);
    }
  });
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.addMessage = function(message) {
  var messageText = message.text || '';
  var regex = '/<(|\/|[^>\/bi]|\/[^>bi]|[^\/>][^>]+|\/[^>][^>]+)>/g';
  var messageText = messageText.replace(regex, '&lt;$1&gt;');
  $('#chats').append('<div class="message" data-objectId="' + message.objectId +
      '" data-roomname="' + message.roomname + '"><span class="username"> ' + 
      message.username + '</span><span class="text"> ' + messageText + 
    '</span><span class="time"> ' + message.createdAt + '</span></div>');
};

app.addRoom = function(room) {
  $('#roomSelect').append('<span class="room">' + room + '</span>');
};

app.addFriend = function() {

};

app.init = function() {
  app.fetch(app.url, function(data) {
    //console.log(data);
    for (var i = 0; i < 10; i++) {
      app.addMessage(data.results[i]);
    }
    console.log(data);
    app.newestMessageDate = data.results[0].createdAt;
  });
};

app.queryNewMessages = function() {
  //var date = '$gt={"createdAt":"' + app.newestMessageDate + '"}';
  var date = 'where={"createdAt":{"$gte":{"__type":"Date","iso":"' + app.newestMessageDate + '"}}}';
  console.log(app.newestMessageDate);
  app.fetch(app.url, function(data) {
    console.log(data.results.length);
  }, date);
};

app.update = function() {

};

app.init();
setInterval(app.queryNewMessages, 2000);
// $(document).ready(function() {
  
// });

