
var loggedIn = false;
var waitingForLogin = false;
var username = "";

var entityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': '&quot;',
    "'": '&#39;',
    "/": '&#x2F;'
};

function escapeHtml(string) {
    return String(string).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
    });
}

var ws = new WebSocket("ws://127.0.0.1:3001");

ws.onopen = function() { };

ws.onclose = function() { alert("Connection closed...") };

ws.onmessage = function(evt) {
    var res = JSON.parse(evt.data);
    if(res.type == "guest_login") {
        waitingForLogin = false;
        if(res.success == false)
            alert(res.invalid ? "Invalid username" : "Username already in use");
        else {
            loggedIn = true;
            document.getElementById("send_button").innerHTML = "Send";
            $("#chat_column").append("<p>You logged in as <strong>" + username + "</strong></p>");
        }
    }
    else {
        var chat = $("#chat_column");
        chat.append("<p><strong>" + escapeHtml(res.username) + ":</strong> " + escapeHtml(res.text) + "</p>");
        chat.animate({scrollTop: chat.prop("scrollHeight")}, 500);
    }
};

function login() {
    var payload = {};
    payload.type = "guest_login";
    payload.username = document.getElementById("chat_input").value;
    username = payload.username;
    ws.send(JSON.stringify(payload));
    waitingForLogin = true;
}

function chat() {
    var payload = {};
    payload.type = "chat";
    payload.scope = "global";
    payload.text = document.getElementById("chat_input").value;
    ws.send(JSON.stringify(payload));
}

function onClick() {
    if(loggedIn)
        chat();
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
