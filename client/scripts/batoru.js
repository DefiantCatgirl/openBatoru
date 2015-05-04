
var Mode = {
    LOBBY: 0,
    CHANNEL: 1
};

var loggedIn = false;
var waitingForLogin = false;
var username = "";

var handler = Lobby;

var mode = Mode.LOBBY;

var ws = new WebSocket("ws://127.0.0.1:3001");

ws.onopen = function() { };

ws.onclose = function() { alert("Connection closed...") };

ws.onmessage = function(evt) {
    var res = JSON.parse(evt.data);

    console.log(res);

    if(res.type == "guest_login") {
        waitingForLogin = false;
        if(res.success == false)
            alert(res.invalid ? "Invalid username" : "Username already in use");
        else {
            loggedIn = true;
            document.getElementById("send_button").innerHTML = "Send";
            $("#chat_messages").append(paragraph("You logged in as " + colorizeName(username) + "."));
        }
    }
    else {
        if(res.channel == null)
            Lobby.handleMessage(res);
        else
            Channel.handleMessage(res);
    }
};

function login() {
    var input = document.getElementById("chat_input").value;
    var res = (new RegExp("\\S")).test(input);

    if(!res)
        return;

    while(input.slice(-1) == "\n") {
        input = input.slice(0, input.length - 1);
    }

    var payload = {};
    payload.type = "guest_login";
    payload.username = input;
    username = payload.username;
    waitingForLogin = true;

    sendMessage(payload);
}

function handleInput() {
    var input = document.getElementById("chat_input").value;
    var res = (new RegExp("\\S")).test(input);

    if(!res)
        return;

    while(input.slice(-1) == "\n") {
        input = input.slice(0, input.length - 1);
    }

    handler.handleInput(input);
}

function sendMessage(message) {
    if(typeof message === "object")
        ws.send(JSON.stringify(message));
    else
        ws.send(message);
}

function onClick() {
    if(loggedIn)
        handleInput();
    else if(!waitingForLogin)
        login();
    document.getElementById("chat_input").value = "";
}

window.onload = function() {
    document.getElementById("chat_input").onkeyup = function (e) {
        if (e.keyCode == 13) {
            onClick();
        }
    };
};


function joinChannel(channel) {
    mode = Mode.CHANNEL;
    Channel.active = true;
    Lobby.active = false;
    handler = Channel;

    // clears out the UI, removes channel list, adds card info

}

function leaveChannel(channel) {
    mode = Mode.LOBBY;
    Channel.active = false;
    Lobby.active = true;
    handler = Lobby;

    // clears out the UI, removes card info, adds channel list

}