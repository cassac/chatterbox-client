var app = {
  roomname: null,
  newestMessageDate: null,
  url: 'https://api.parse.com/1/classes/messages'
};

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
  var roomname = message.roomname || 'general';
  var $message = $('<div data-roomname="' + roomname + '" data-objectId="' + 
    message.objectId + '"></div>');
  $message.addClass('chat');
  var $user = $('<span>').addClass('username').text('@' + message.username);
  var $text = $('<span>').addClass('text').text(message.text);
  var $date = $('<span>').addClass('time').text(message.createdAt);
  
  var $roomname = $('<span>').addClass('roomname').text('#' + roomname);
  $('#chats')[addMethod]($message.append($text, $user, $date, $roomname));
};

app.addRoom = function(room) {
  $('#roomSelect').append('<span class="room">' + room + '</span>');
};

app.addFriend = function() {
  console.log('friend');
};

app.init = function() {
  if (app.roomname) {
    var query = 'where={"roomname":"' + app.roomname + '"}';
  }
  app.fetch(app.url, function(data) {
    for (var i = 0; i < data.results.length; i++) {
      app.addMessage(data.results[i], 'append');
    }
    console.log(data);
    app.newestMessageDate = data.results[0].createdAt;
  }, query);
};

app.update = function() {
  if (app.roomname) {
    var query = 'where={"roomname":"' + app.roomname + '","createdAt":{"$gt":{"__type":"Date","iso":"' + app.newestMessageDate + '"}}}';
  } else {
    var query = 'where={"createdAt":{"$gt":{"__type":"Date","iso":"' + app.newestMessageDate + '"}}}';
  }
  app.fetch(app.url, function(data) {
    for (var i = 0; i < data.results.length; i++) {
      app.addMessage(data.results[i], 'prepend');
    }
    if (data.results.length > 0) {
      app.newestMessageDate = data.results[0].createdAt;
    }
  }, query);

};

app.init();
setInterval(app.update, 500);

$(document).on('click', '.roomname', function(event) {
  app.roomname = $(this).text().slice(1);
  app.clearMessages();
  app.init();
});

$(document).on('submit', 'form', function(event) {
  event.preventDefault();
  var username = window.location.search.split('=');
  username = username[username.length - 1];
  var message = {
    username: username,
    text: $('input[name="message"').val(),
    roomname: $('input[name="roomname"').val(),
  };

  app.send(message);
  
});

