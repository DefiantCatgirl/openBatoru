
var loggedIn = false;

var ws = new WebSocket("ws://127.0.0.1:3001");

ws.onopen = function() { };

ws.onclose = function() { alert("Connection closed...") };

ws.onmessage = function(evt) { $("#chat_column").append("<p>"+evt.data+"</p>"); };

function login() {
    var payload = {};
    payload.type = "guest_login";
    payload.username = document.getElementById("text_input").value;
    ws.send(JSON.stringify(payload));
    loggedIn = true;
}

function chat() {
    var payload = {};
    payload.type = "chat";
    payload.scope = "global";
    payload.text = document.getElementById("text_input").value;
    ws.send(JSON.stringify(payload));
}

function onClick() {
    if(loggedIn)
        chat();
    else
        login();
}

document.getElementById("text_input").keyup(function (e) {
    if (e.keyCode == 13) {
        onClick();
    }
});