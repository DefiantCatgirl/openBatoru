(function( global ) {

    var Lobby = (function() {

        var userList = [];
        var channelList = [];

        function postToChat(message)
        {
            if(Lobby.active) {
                var chat = $("#chat_messages");
                chat.append(message);
                chat.animate({scrollTop: chat.prop("scrollHeight")}, 500);
            }
        }

        function refreshUserList () {
            if(!Lobby.active)
                return;

            userList.sort(function(a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()) });
            var usersBlock = $("#user_list");

            usersBlock.empty();

            for (var i = 0; i < userList.length; i++) {
                usersBlock.append(paragraph(colorizeName(userList[i])));
            }
        }

        function refreshChannelList () {
            if(!Lobby.active)
                return;

            channelList.sort(function(a, b) { return a.toLowerCase().localeCompare(b.toLowerCase()) });
            var channelsBlock = $("#channel_list");

            channelsBlock.empty();

            for (var i = 0; i < channelList.length; i++) {
                channelsBlock.append(paragraph(escapeHtml(channelList[i])));
            }
        }

        return {

            active: true,

            activate: function () {
                Lobby.active = true;
                refreshUserList();
                refreshChannelList();
            },

            deactivate: function() {
                Lobby.active = false;
            },

            handleInput: function (input) {
                var payload = {};
                if(input[0] === "/") {
                    var arguments = input.split(" ");
                    if(arguments[0] === "/join") {
                        console.log(arguments);
                        if(arguments[1] != undefined && arguments[1].length > 0) {
                            payload.type = "join";
                            payload.channel = arguments[1];
                        }
                        else return;
                    }
                    else if(arguments[0] === "/leave") {

                        if(arguments[1] != undefined && arguments[1].length > 0) {
                            payload.type = "leave";
                            payload.channel = arguments[1];
                        }
                        else return;
                    }
                    else return;
                }
                else {

                    payload.type = "chat";
                    payload.text = input;
                }
                console.log(payload);
                sendMessage(payload);
            },

            handleMessage: function (message) {
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
                else if(message.type == "userlist") {
                    userList = message.users;
                    refreshUserList();
                    channelList = message.channels;
                    refreshChannelList();
                }
                else if(message.type == "channel_created") {
                    i = channelList.indexOf(message.channelname);
                    if(i < 0) {
                        channelList.push(message.channelname);
                        refreshChannelList();
                    }
                }
                else if(message.type == "channel_deleted") {
                    i = channelList.indexOf(message.channelname);
                    if(i >= 0) {
                        channelList.splice(i, 1);
                        refreshChannelList();
                    }
                }
            }
        };
    })();

    global.Lobby = Lobby;

})( this );
