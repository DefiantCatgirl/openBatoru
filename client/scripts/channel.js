(function( global ) {

    var Channel = (function() {

        var channel;

        var userList = [];

        function refreshUserList () {
            userList.sort(function(a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()) });
            var usersBlock = $("#user_list");

            usersBlock.empty();

            for (var i = 0; i < userList.length; i++) {
                usersBlock.append(paragraph(colorizeName(userList[i])));
            }
        }

        return {

            active: true,

            handleInput: function(input) {
                    var payload = {};
                    if(input[0] === "/") {
                        var arguments = input.split(" ");
                        if(arguments[0] === "/leave") {
                            payload.type = "leave";
                            payload.channel = channel;
                        }
                        else return;
                    }
                    else {
                        payload.type = "chat";
                        payload.channel = channel;
                        payload.text = input;
                    }
                    console.log(payload);
                    sendMessage(payload);
            },

            handleMessage: function(message) {
                var chat;
                var i;
                if(message.type == "chat") {
                    if(Channel.active) {
                        chat = $("#chat_messages");
                        chat.append(paragraph(colorizeChat(message.username) + escapeHtml(message.text)));
                        chat.animate({scrollTop: chat.prop("scrollHeight")}, 500);
                    }
                }
                else if(message.type == "join" && message.username != username) {
                    i = userList.indexOf(message.username);
                    if(i < 0) {
                        if(Channel.active) {
                            chat = $("#chat_messages");
                            chat.append(paragraph(colorizeName(message.username) + " has joined."));
                            chat.animate({scrollTop: chat.prop("scrollHeight")}, 500);
                        }

                        userList.push(message.username);
                        refreshUserList();
                    }
                }
                else if(message.type == "leave" && message.username != username) {
                    i = userList.indexOf(message.username);
                    if(i >= 0) {
                        if(Channel.active) {
                            chat = $("#chat_messages");
                            chat.append(paragraph(colorizeName(message.username) + " has left."));
                            chat.animate({scrollTop: chat.prop("scrollHeight")}, 500);
                        }

                        userList.splice(i, 1);
                        refreshUserList();
                    }
                }
                else if(message.type == "join" && message.username != username && !Channel.active) {
                    this.setChannel(message.channel);
                    joinChannel(channel);
                }
                else if(message.type == "leave" && message.username == username && Channel.active) {
                    leaveChannel(channel);
                }
                else if(message.type == "userlist") {
                    userList = message.users;
                    refreshUserList();
                }
            },

            setChannel: function(channelName) {
                channel = channelName;
            },

            getChannel: function() {
                return channel;
            }
        };
    })();

    global.Channel = Channel;

})( this );
