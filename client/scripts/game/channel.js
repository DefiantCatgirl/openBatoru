(function( global ) {

    var Channel = (function() {

        var channel;
        var seat1;
        var seat2;

        var inGame = false;

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

        function refreshSeats() {
            var seatsBlock = $("#control_buttons");
            seatsBlock.empty();

            if(seat1 == null)
                seatsBlock.append("[ 1 - vacant ]");
            else
                seatsBlock.append(colorizeName(seat1))

            seatsBlock.append(" VS ");

            if(seat2 == null)
                seatsBlock.append("[ 2 - vacant ]");
            else
                seatsBlock.append(colorizeName(seat2))
        }

        return {

            active: false,

            activate: function () {
                Channel.active = true;
                refreshUserList();
                refreshSeats();
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
                        } else if (arguments[0] === "/take" && arguments[1].length > 0) {
                            if(seat1 == username || seat2 == username)
                                return;
                            payload.type = "take_seat";
                            payload.seat = parseInt(arguments[1]);
                            payload.channel = channel;
                        } else if (arguments[0] === "/free") {
                            if(seat1 != username && seat2 != username)
                                return;
                            payload.type = "free_seat";
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
                    seat1 = message.seats[0];
                    seat2 = message.seats[1];
                    refreshUserList();
                    refreshSeats();
                }
                else if(message.type == "take_seat") {
                    if(message.seat == 1)
                        seat1 = message.username;
                    else if(message.seat == 2)
                        seat2 = message.username;

                    if(username == message.username)
                        inGame = true;

                    refreshSeats();
                }
                else if(message.type == "free_seat") {
                    if(message.seat == 1)
                        seat1 = null;
                    else if(message.seat == 2)
                        seat2 = null;

                    if(username == message.username)
                        inGame = false;

                    refreshSeats();
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
