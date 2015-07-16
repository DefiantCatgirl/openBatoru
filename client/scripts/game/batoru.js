
var Mode = {
    LOBBY: 0,
    CHANNEL: 1
};

var loggedIn = false;
var waitingForLogin = false;
var username = "";

var handler;
var mode;

var ws;

function connect() {
    ws = new WebSocket("ws://127.0.0.1:3001");
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
}



function login() {
    var input = document.getElementById("chat_input").value;
    var res = (new RegExp("\\S")).test(input);

    if(!res) {
        return;
    }

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

    init();
    connect();
};

function joinChannel(channel) {
    mode = Mode.CHANNEL;
    Channel.activate();
    Lobby.deactivate();
    handler = Channel;

    $("#chat_messages").empty();

    $("#channel_title").html("Channel: <strong>" + escapeHtml(channel) + "</strong>");

    $("#channel_list").hide();
    $("#card_information").show();

}

function leaveChannel(channel) {
    init();
}

function init() {
    mode = Mode.LOBBY;
    Channel.deactivate();
    Lobby.activate();
    handler = Lobby;

    $("#chat_messages").empty();
    $("#control_buttons").empty();

    $("#channel_title").html("<strong>Lobby</strong>");

    $("#channel_list").show();
    $("#card_information").hide();
}
