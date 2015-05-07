(function( global ) {

    var Channel = (function() {

        var channel;

        var userList = [];

        function postToChat(message)
        {
            if(Channel.active) {
                var chat = $("#chat_messages");
                chat.append(message);
                chat.animate({scrollTop: chat.prop("scrollHeight")}, 500);
            }
        }

        function refreshUserList () {
            userList.sort(function(a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()) });
            var usersBlock = $("#user_list");

            usersBlock.empty();

            for (var i = 0; i < userList.length; i++) {
                usersBlock.append(paragraph(colorizeName(userList[i])));
            }
        }

        return {

            active: false,

            activate: function () {
                Channel.active = true;
                refreshUserList();
            },

            deactivate: function() {
                Channel.active = false;
            },


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
                    postToChat(paragraph(colorizeChat(message.username) + escapeHtml(message.text)));
                }
                else if(message.type == "join" && message.username != username) {
                    i = userList.indexOf(message.username);
                    if(i < 0) {
                        postToChat(paragraph(colorizeName(message.username) + " has joined."));
                        userList.push(message.username);
                        refreshUserList();
                    }
                }
                else if(message.type == "leave" && message.username != username) {
                    i = userList.indexOf(message.username);
                    if(i >= 0) {
                        postToChat(paragraph(colorizeName(message.username) + " has left."));
                        userList.splice(i, 1);
                        refreshUserList();
                    }
                }
                else if(message.type == "join" && message.username == username && !Channel.active) {
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
