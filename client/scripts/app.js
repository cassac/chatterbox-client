var app = {
  roomname: null,
  newestMessageDate: null,
  lastBotQuery: '2016-07-10T00:22:08.728Z',
  botroom: 'urbandictionary',
  botname: 'urbanBot',
  boturl: 'https://mashape-community-urban-dictionary.p.mashape.com/define',
  url: 'https://api.parse.com/1/classes/messages',
  botQueries: {}
};

app.send = function(message, url, headers) {
  var url = url || app.url;
  var headers = headers || parseHeaders;
  $.ajax({
    url: url,
    headers: headers,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      $('input[name="message"]').val('');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function(url, cb, data, headers) {
  var data = data || '';
  var headers = headers || parseHeaders;
  $.ajax({
    url: url,
    headers: headers,
    type: 'GET',
    data: data,
    dataType: 'json',
    success: cb,
    error: function(error) {
      console.log('Failed to fetch:', error);
    }
  });
};

app.clearMessages = function() {
  $('#chats').empty();
};

app.addMessage = function(message, addMethod, startBot) {
  var startBot = startBot || false;
  var roomname = message.roomname || 'general';
  var text = message.text || '';
  var $message = $('<div data-roomname="' + roomname + '" data-objectId="' + 
    message.objectId + '"></div>');
  $message.addClass('chat');

  var $user = $('<span>').addClass('username').text('@' + message.username);
  if (JSON.parse(localStorage.friends).indexOf(message.username) >= 0) { $user.addClass('myFriend'); }
  var $text = $('<span>').addClass('text').text(text.slice(0, 300));
  var $date = $('<span>').addClass('time').text(message.createdAt);
  var $roomname = $('<span>').addClass('roomname').text('#' + roomname.slice(0, 25));
  if (startBot && message.roomname === app.botroom && message.username !== app.botname) {
    app.parseBotQueries(message);
  }
  $('#chats')[addMethod]($message.append($text, $user, $date, $roomname));
};

app.addRoom = function(room) {
  $('#roomSelect').append('<span class="room">' + room + '</span>');
};

app.addFriend = function() {
  var friends = JSON.parse(window.localStorage.friends);
  var username = $(this).text().slice(1);
  var index = friends.indexOf(username);
  if (index === -1) {
    friends.push(username);
  } else {
    friends.splice(index, 1);
  }
  window.localStorage.friends = JSON.stringify(friends);
};

app.init = function() {
  if (app.roomname) {
    var query = 'where={"roomname":"' + app.roomname + '"}';
  }
  app.fetch(app.url, function(data) {
    for (var i = 0; i < data.results.length; i++) {
      app.addMessage(data.results[i], 'append');
    }
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
      app.addMessage(data.results[i], 'prepend', true);
    }
    if (data.results.length > 0) {
      app.newestMessageDate = data.results[0].createdAt;
    }
  }, query);

};

app.parseBotQueries = function(message) {
  var valid = message.text.indexOf('#') !== -1;
  if (valid) {
    var query = message.text.slice(1).trim();
    var term = 'term=' + query;
    app.fetch(app.boturl, function(data) {
      app.sendResponse(data.list[0].definition, query, message.username);
    }, term, botHeaders);
  }
};

app.sendResponse = function(definition, term, username) {
  var text = username + "'s query for " + term + ' - ' + definition +
    '. Submit message to "urbandictionary" chat room with this formatting "#mywordtolookup"!';
  var message = {
    username: app.botname,
    text: text,
    roomname: app.botroom
  };
  app.send(message, app.url);
};

app.init();
setInterval(app.update, 3000);
$(document).on('click', '.username', function() {
  app.addFriend.call(this);
  var friends = JSON.parse(localStorage.friends);
  var username = $(this).text().slice(1);
  $('.username').each(function(i, e) {
    var otherUser = $(e).text().slice(1);
    if (username === otherUser) {
      $(e).toggleClass('myFriend');
    }
  });
});

$(document).on('click', '.roomname', function(event) {
  app.roomname = $(this).text().slice(1);
  $('#currentRoom').text(app.roomname);
  $('input[name="roomname"').val(app.roomname);
  app.clearMessages();
  app.init();
});

$(document).on('click', '#homeSpan', function(event) {
  app.clearMessages();
  app.roomname = null;
  app.init();
  $('#currentRoom').text('General');
  $('input[name="roomname"').val('');
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




