
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

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function usernameToColor(string) {
    var sum = 0;
    for(var i = 0; i < string.length; i++)
    {
        sum += string.charCodeAt(i);
//        console.log(sum + " + " + string.charCodeAt(i));
    }
    var red = (sum % 2 == 0);
    var blue = (sum % 3 == 0);
    var green = (sum % 5 == 0);

    return rgbToHex(red ? 150 : 0, blue ? 150 : 0, green ? 150 : 0);
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
            $("#chat_column").append("<p>You logged in as <strong style=\"color: " + usernameToColor(username) + "\">" +
                                      escapeHtml(username) + "</strong>.</p>");
        }
    }
    else if(res.type == "chat") {
        var chat = $("#chat_column");
        chat.append("<p><strong style=\"color: " + usernameToColor(res.username) + "\">" +
                     escapeHtml(res.username) + ":</strong> " + escapeHtml(res.text) + "</p>");
        chat.animate({scrollTop: chat.prop("scrollHeight")}, 500);
    }
    else if(res.type == "join" && res.username != username) {
        var chat = $("#chat_column");
        chat.append("<p><strong style=\"color: " + usernameToColor(res.username) + "\">" +
            escapeHtml(res.username) + "</strong> has joined.</p>");
        chat.animate({scrollTop: chat.prop("scrollHeight")}, 500);
    }
    else if(res.type == "leave") {
        var chat = $("#chat_column");
        chat.append("<p><strong style=\"color: " + usernameToColor(res.username) + "\">" +
            escapeHtml(res.username) + "</strong> has left.</p>");
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
//    payload.scope = "global";
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
