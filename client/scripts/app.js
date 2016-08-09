var app = {};
app.newestMessageDate = null;
app.url = 'https://api.parse.com/1/classes/messages';
app.send = function(message, url) {
  var url = url || app.url;
  $.ajax({
    url: url,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
      $('input[type="text"]').val('');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function(url, cb, data) {
  var data = data || '';
  $.ajax({
    url: url,
    type: 'GET',
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

app.addMessage = function(message, addMethod) {
  var $message = $('<div data-roomname="' + message.roomname + '" data-objectId="' + 
    message.objectId + '"></div>');
  $message.addClass('message');
  var $user = $('<span>').addClass('username').text(message.username);
  var $text = $('<span>').addClass('text').text(message.text);
  var $date = $('<span>').addClass('time').text(message.createdAt);
  $('#chats')[addMethod]($message.append($user, $text, $date));
};

app.addRoom = function(room) {
  $('#roomSelect').append('<span class="room">' + room + '</span>');
};

app.addFriend = function() {
  console.log('friend');
};

app.init = function() {
  app.fetch(app.url, function(data) {
    for (var i = 0; i < 10; i++) {
      app.addMessage(data.results[i], 'append');
    }
    console.log(data);
    app.newestMessageDate = data.results[0].createdAt;
  });
};

app.queryNewMessages = function() {
  var date = 'where={"createdAt":{"$gt":{"__type":"Date","iso":"' + app.newestMessageDate + '"}}}';
  app.fetch(app.url, function(data) {
    if (data.results.length > 0) {
      $('#newMessageCount').show().text('New Messages: ' + data.results.length);
    }
  }, date);
};

app.update = function() {
  var date = 'where={"createdAt":{"$gt":{"__type":"Date","iso":"' + app.newestMessageDate + '"}}}';
  app.fetch(app.url, function(data) {
    for (var i = 0; i < data.results.length; i++) {
      app.addMessage(data.results[i], 'prepend');
    }
    if (data.results.length) {
      app.newestMessageDate = data.results[0].createdAt;
    }
  }, date);

};

app.init();
setInterval(app.queryNewMessages, 500);
$(document).on('click', '#newMessageCount', function() {
  app.update();
  $('#newMessageCount').hide().text();

});

$(document).on('submit', 'form', function(event) {
  event.preventDefault();
  var message = {
    username: $('input[name="username"').val(),
    text: $('input[name="message"').val(),
    roomname: '4chan'
  };

  app.send(message);
  
});

