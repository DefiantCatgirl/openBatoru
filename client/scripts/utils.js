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

function colorizeChat(name) {
    return colorize(name, name + ": ");
}

function colorizeName(name) {
    return colorize(name, name);
}

function colorize(name, string) {
    return "<strong style=\"color: " + usernameToColor(escapeHtml(name)) + "\">" + escapeHtml(string) + "</strong>"
}

function paragraph(text) {
    return "<p class='chat_message'>" + text + "</p>"
}
