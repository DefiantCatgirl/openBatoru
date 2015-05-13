// Deck editor script

var locale = "en";
var defaultLocale = "en";

var cards = {};
var terms = {};
var cardsLocale = {};
var cardsDefaultLocale = {};

var smallIcons = true;

// id: "id", count: "1"
var mainDeck = [];
var lrigDeck = [];

var mainDeckColumn;
var lrigDeckColumn;

var prefix = "openBatoru_deck_";
var currentDeckName = "openBatoru_deck";

// The more logical part

function cardExists(deck, id) {
    for(var i = 0; i < deck.length; i++) {
        if(deck[i].id == id) {
            return true;
        }
    }
    return false;
}

function getCount(deck, id) {
    for(var i = 0; i < deck.length; i++) {
        if(deck[i].id == id) {
            return deck[i].count;
        }
    }

    return 0;
}

function addExistingCard(deck, id) {
    for(var i = 0; i < deck.length; i++) {
        if(deck[i].id == id) {
            if( deck[i].count < 4 &&
                !((deck == mainDeck && totalCards(mainDeck) >= 40) || (deck == lrigDeck && totalCards(lrigDeck) >= 10))) {
                deck[i].count++;
            }
            return true;
        }
    }
    return false;
}

function subtractExistingCard(deck, id) {
    for(var i = 0; i < deck.length; i++) {
        if(deck[i].id == id) {
            if(deck[i].count > 1) {
                deck[i].count--;
            }
            return true;
        }
    }
    return false;
}

function removeExistingCards(deck, id) {
    for(var i = 0; i < deck.length; i++) {
        if(deck[i].id == id) {
            deck.splice(i, 1);
            return true;
        }
    }
    return false;
}

function totalCards(deck) {
    var total = 0;
    for(var i = 0; i < deck.length; i++) {
        total += deck[i].count;
    }
    return total;
}

function maxCopies(deck) {
    var cardCount = {};
    var id;
    var maxCopies = 0;

    for(var i = 0; i < deck.length; i++) {
        id = cardsDefaultLocale[deck[i].id];
        cardCount[id] = cardCount[id] ? deck[i].count : cardCount[id] + deck[i].count;
    }

    for(var name in cardCount) {
        if(cardCount[name] > maxCopies) {
            maxCopies = cardCount[name];
        }
    }

    return maxCopies;
}

// TODO: support cards with different ids but same names
function findErrors() {
    var i;

    if(totalCards(lrigDeck) > 10) {
        return "LRIG deck must have less than 10 cards.";
    }
    if(totalCards(mainDeck) != 40) {
        return "Main deck must have exactly 40 cards.";
    }

    var hasL0Lrig = false;
    for(i = 0; i < lrigDeck.length; i++) {
        if(cards[lrigDeck[i].id].level == 0 && cards[lrigDeck[i].id].type == "lrig") {
            hasL0Lrig = true;
        }
    }
    if(!hasL0Lrig) {
        return "LRIG deck must contain at least one Level 0 LRIG.";
    }

    if(maxCopies(mainDeck) > 4) {
        return "Main deck cannot have more than 4 copies of the same card."
    }
    if(maxCopies(lrigDeck) > 4) {
        return "LRIG deck cannot have more than 4 copies of the same card."
    }

    var burst = 0;
    for(i = 0; i < mainDeck.length; i++) {
        if(cards[mainDeck[i].id].burst) {
            burst += mainDeck[i].count;
        }
    }
    if(burst != 20) {
        return "You can only have 20 cards with Life Burst in your deck."
    }

    return null;
}

// The more visual part

window.onload = function() {

    mainDeckColumn = $("#main_deck_column");
    lrigDeckColumn = $("#lrig_deck_column");

    for(var preset in presets) {
        $("#preset_select").append("<option>" + preset + "</option>")
    }

    if(!supports_html5_storage()) {
        $("#load_select").remove();
        $("#save_input").remove();
        $("#load_button").remove();
        $("#save_button").remove();
        $("#remove_select").remove();
        $("#remove_button").remove();
    } else {
        refreshDeckLists();
    }

    var requests = [
        $.getJSON('config/cards.json', function(data) {
            cards = data;
        }),
        $.getJSON('config/' + locale + '/cards.json', function(data) {
            cardsLocale = data;

            if(locale == defaultLocale) {
                cardsDefaultLocale = cardsLocale;
            }
        }),
        $.getJSON('config/' + locale + '/terms.json', function(data) {
            terms = data;
        })
    ];

    requests.push($.getJSON('config/' + defaultLocale + '/cards.json', function(data) {
        cardsDefaultLocale = data;
    }));

    $.when.apply(null, requests).then(function(){
            Sortable.create(card_list, {
                handle: '.card_image',
                animation: 150,
                sort: false,
                group: {
                    name: 'deck',
                    pull: 'clone',
                    put: false
                }

            });

            Sortable.create(main_deck_column, {
                handle: '.card_image',
                animation: 150,
                group: {
                    name: 'main',
                    put: ['deck'],
                    pull: false
                },
                onAdd: function (evt) {
                    var itemEl = evt.item;

                    switchCardToDeckLayout(itemEl);

                    if((cards[itemEl.id].type != "spell" &&
                        cards[itemEl.id].type != "signi") ||
                        getCount(mainDeck, itemEl.id) >= 4 ||
                        totalCards(mainDeck) >= 40)
                    {
                        itemEl.remove();
                        return;
                    }

                    if(addExistingCard(mainDeck, itemEl.id)) {
                        itemEl.remove();
                        refreshCount(itemEl.id);
                    } else {
                        mainDeck.splice(evt.newIndex, 0, {"id": itemEl.id, "count": 1});
                    }

                    refreshValidity();
                },
                onEnd: function (evt) {
                    var item = mainDeck[evt.oldIndex];
                    mainDeck.splice(evt.oldIndex, 1);
                    mainDeck.splice(evt.newIndex, 0, item);
                }
            });

            Sortable.create(lrig_deck_column, {
                handle: '.card_image',
                animation: 150,
                group: {
                    name: 'lrig',
                    put: ['deck'],
                    pull: false
                },
                onAdd: function (evt) {
                    var itemEl = evt.item;

                    switchCardToDeckLayout(itemEl);

                    if((cards[itemEl.id].type != "lrig" &&
                        cards[itemEl.id].type != "arts" &&
                        cards[itemEl.id].type != "resona") ||
                        getCount(lrigDeck, itemEl.id) >= 4 ||
                        totalCards(lrigDeck) >= 10)
                    {
                        itemEl.remove();
                        return;
                    }

                    if(addExistingCard(lrigDeck, itemEl.id)) {
                        itemEl.remove();
                        refreshCount(itemEl.id);
                    } else {
                        lrigDeck.splice(evt.newIndex, 0, {"id": itemEl.id, "count": 1});
                    }

                    refreshValidity();
                },

                onEnd: function (evt) {
                    var item = lrigDeck[evt.oldIndex];
                    lrigDeck.splice(evt.oldIndex, 1);
                    lrigDeck.splice(evt.newIndex, 0, item);
                }
            });


            var i;
            var card;

            for(var id in cards) {
                card = createCardElement(id);
                card.width('50%');
                $('#card_list').append(card);
            };
        });
};

function createCardElement(id) {
    card = $('<div class="card_box" id="' + id + '">' +
    '<div class="card_box_inner">' +
    '<div class="card_image">' +
    '<img class="preview" style="height: ' + (smallIcons ? "90px" : "190px") + '; width: auto" src="' + cards[id].image + '"/>' +
    '</div>' +
    '<div class="card_right">' +
    '<div class="card_text">' +
    '<div class="card_title">' + cardsLocale[id].name + '</div>' +
    '<div class="card_desc ' + (smallIcons ? 'hidden' : '') + '">' +
    (cardsLocale[id].description ? cardsLocale[id].description.replace('\n', '<br/><br/>') : '') +
    '</div>' +
    '</div>' +
    '<div class="card_control hidden">' +
    '<div class="card_count">' + '1' + '</div>' +
    '<div class="button raised card_control_button" onclick="onMinusClicked(\'' + id + '\')"> \
                                <paper-ripple fit></paper-ripple><div class="center_button">-</div> \
                            </div>' +
    '<div class="button raised card_control_button" onclick="onPlusClicked(\'' + id + '\')"> \
                                <paper-ripple fit></paper-ripple><div class="center_button">+</div> \
                            </div>' +
    '<div class="button raised card_control_button card_delete_button" onclick="onDeleteClicked(\'' + id + '\')"> \
                                <paper-ripple fit></paper-ripple><div class="center_button">X</div> \
                            </div>' +
    '</div>' +
    '</div>' +
    '</div>');
    smallIcons ? card.addClass('card_small') : card.addClass('card_big');
    card.data('id', id);
    return card;
}

function switchCardToDeckLayout(card) {
    $(card).find('.card_control').removeClass('hidden');
    $(card).innerWidth('100%');
}


$(document).on("mouseenter", ".card_image", function() {
    $('#card_information').html('<img src="' + $(this).children().first().attr('src') + '" style="width:100%; height: auto"/>');
});


function onSmaller() {
    var elems = $(".card_box");
    elems.removeClass('card_big');
    elems.addClass('card_small');
    $(".preview").height(90);
    $(".card_desc").addClass('hidden');
}

function onLarger() {
    var elems = $(".card_box");
    elems.removeClass('card_small');
    elems.addClass('card_big');
    $(".preview").height(190);
    $(".card_desc").removeClass('hidden');
}

function refreshCount(id) {
    var mainDeckCard = mainDeckColumn.find("#" + id).first();
    if(mainDeckCard) {
        mainDeckCard.find(".card_count").html(getCount(mainDeck, id));
    }

    var lrigDeckCard = lrigDeckColumn.find("#" + id).first();
    if(lrigDeckCard) {
        lrigDeckCard.find(".card_count").html(getCount(lrigDeck, id));
    }
}

function refreshCounts() {
    var i, id;
    for(i = 0; i < mainDeck.length; i++) {
        id = mainDeck[i].id;
        var mainDeckCard = mainDeckColumn.find("#" + id).first();
        if(mainDeckCard) {
            mainDeckCard.find(".card_count").html(mainDeck[i].count);
        }
    }
    for(i = 0; i < lrigDeck.length; i++) {
        id = lrigDeck[i].id;
        var lrigDeckCard = lrigDeckColumn.find("#" + id).first();
        if(lrigDeckCard) {
            lrigDeckCard.find(".card_count").html(lrigDeck[i].count);
        }
    }
}

function isInMainDeck(id) {
    return cards[id].type == "spell" || cards[id].type == "signi"
}

function onPlusClicked(id) {
    var deck = isInMainDeck(id) ? mainDeck : lrigDeck;

    addExistingCard(deck, id);
    refreshCount(id);

    refreshValidity();
}

function onMinusClicked(id) {
    var deck = isInMainDeck(id) ? mainDeck : lrigDeck;

    subtractExistingCard(deck, id);
    refreshCount(id);

    refreshValidity();
}

function onDeleteClicked(id) {
    var isInMain = isInMainDeck(id);
    var deck = isInMain ? mainDeck : lrigDeck;
    var column = isInMain ? mainDeckColumn : lrigDeckColumn;

    removeExistingCards(deck, id);

    var card = column.find("#" + id).first();
    if(card) {
        card.remove();
    }

    refreshValidity();
}

function refreshValidity() {
    error = findErrors();

    var deckValidBlock = $("#deck_valid");

    if(!error) {
        deckValidBlock.html("Deck valid!");
        deckValidBlock.removeClass("deck_invalid");
        deckValidBlock.addClass("deck_valid");
    } else {
        deckValidBlock.html("Deck invalid: <br/>" + error);
        deckValidBlock.removeClass("deck_valid");
        deckValidBlock.addClass("deck_invalid");
    }
}

// Courtesy of Stack Overflow
function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

function supports_html5_storage() {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
}

function refreshDeckLists() {
    var loadSelect = $("#load_select");
    var removeSelect = $("#remove_select");
    loadSelect.children().remove();
    removeSelect.children().remove();

    for(var deck in localStorage) {
        if(deck.substring(0, prefix.length) == prefix) {
            loadSelect.append("<option>" + deck.substring(prefix.length) + "</option>");
            removeSelect.append("<option>" + deck.substring(prefix.length) + "</option>");
        }
    }
}

function populateDeck() {
    populateColumn(mainDeck, mainDeckColumn);
    populateColumn(lrigDeck, lrigDeckColumn);
}

function populateColumn(deck, column) {
    column.children().remove();

    var card;
    for(var i = 0; i < deck.length; i++) {
        card = createCardElement(deck[i].id);
        switchCardToDeckLayout(card);
        column.append(card);
    }
}

function onSaveDeck() {
    var deckName = $("#save_input").val();

    if(!deckName) {
        return;
    }

    var res = (new RegExp("\\S")).test(deckName);
    if(!res) {
        return;
    }

    localStorage[prefix + deckName] = JSON.stringify(modelToSavedata());
    currentDeckName = deckName;

    refreshDeckLists();
}

function onLoadDeck() {
    var deck = $("#load_select option:selected").text();

    if(!deck) {
        return;
    }

    savedataToModel(JSON.parse(localStorage[prefix + deck]));
    populateDeck();
    currentDeckName = deck;
}

function onRemoveDeck() {
    var deck = $("#remove_select option:selected").text();
    if(!deck) {
        return;
    }
    localStorage.removeItem(prefix + deck);

    refreshDeckLists();
}

function onLoadPreset() {
    var preset = $("#preset_select option:selected").text();
    if(preset in presets) {
        savedataToModel(presets[preset]);
        refreshDeckColumns();
        currentDeckName = preset;
    }
}

function refreshDeckColumns() {
    populateDeck();
    refreshCounts();
    refreshValidity();
}

function modelToSavedata() {
    var savedata = {};
    savedata["format"] = "openBatoru";
    savedata["version"] = "1";
    savedata["mainDeck"] = deckToArray(mainDeck);
    savedata["lrigDeck"] = deckToArray(lrigDeck);
    return savedata;
}

function deckToArray(deck) {
    var array = [];
    for(var i = 0; i < deck.length; i++) {
        for(var j = 0; j < deck[i].count; j++) {
            array.push(deck[i].id);
        }
    }
    return array;
}

function deckToArrayWebxoss(deck) {
    var array = [];
    for(var i = 0; i < deck.length; i++) {
        for(var j = 0; j < deck[i].count; j++) {
            array.push(openBatoruToWebxoss[deck[i].id]);
        }
    }
    return array;
}

function savedataToModel(savedata) {
    mainDeck = arrayToDeck(savedata.mainDeck);
    lrigDeck = arrayToDeck(savedata.lrigDeck);
}

function arrayToDeck(array) {
    var deck = [];

    for(var i = 0; i < array.length; i++) {
        if(cardExists(deck, array[i])) {
            addExistingCard(deck, array[i]);
        } else {
            deck.push({"id" : array[i], "count" : 1});
        }
    }

    return deck;
}

function arrayToDeckWebxoss(array) {
    var deck = [];
    var id;

    for(var i = 0; i < array.length; i++) {
        id = webxossToOpenBatoru[array[i]];
        if(cardExists(deck, id)) {
            addExistingCard(deck, id);
        } else {
            deck.push({"id" : id, "count" : 1});
        }
    }

    return deck;
}

function onExportOpenBatoru() {
    download(currentDeckName + ".json", JSON.stringify(modelToSavedata()));
}

var currentUpload = "";

Dropzone.options.dropzone = {
    init: function() {
        this.on("addedfile", function(file) {
            var reader = new FileReader();
            reader.onload = function(data) {
                currentUpload = data.target.result;
            };
            reader.readAsText(file);
        });
    }
};

function onImportOpenBatoru() {
    currentUpload = "";

    vex.dialog.open({
        message: 'Upload a deck file:',
        input: '<form class="dropzone" id="dropzone" style="width: 100%; height: 200px; background: lightgrey; padding: 20px"></form>',
        buttons: [
            $.extend({}, vex.dialog.buttons.YES, {
                text: 'OK'
            }),
            $.extend({}, vex.dialog.buttons.NO, {
                text: 'Cancel'
            })
        ],
        callback: function(value) {
            if(value) {
                parseUpload();
            }
        }
    });

    $("form#dropzone").dropzone({ url: "#", maxFiles : 1 });
}

function parseUpload() {

    if(currentUpload == "") {
        return;
    }

    try {
        var deck = JSON.parse(currentUpload);
        if(deck.format == "WEBXOSS Deck") {
            try {
                mainDeck = arrayToDeckWebxoss(deck.content.mainDeck);
                lrigDeck = arrayToDeckWebxoss(deck.content.lrigDeck);
                refreshDeckColumns();
            } catch (e) {
                vex.dialog.alert("Error parsing WEBXOSS deck: <br><br><div class='deck_invalid'>" + e + "</div>");
            }
        } else if(deck.format == "openBatoru") {
            try {
                savedataToModel(deck);
                refreshDeckColumns();
            } catch (e) {
                vex.dialog.alert("Error parsing openBatoru deck: <br><br><div class='deck_invalid'>" + e + "</div>");
            }
        } else {
            alert("JSON: Unknown deck format");
        }
    } catch (e) {
        if(currentUpload.indexOf('<deck version="0.8">') > -1) {
            try {
                var match = (new RegExp('<superzone name="Main Deck">([\\s\\S]*?)<\\/superzone>')).exec(currentUpload);
                var cards = match[1];

                var regexp = /id="([\s\S]*?)["|,]/g;
                var mainDeckCards = [];
                var id;

                while ((id = regexp.exec(cards))) {
                    mainDeckCards.push(id[1]);
                }

                match = (new RegExp('<superzone name="LRIG Deck">([\\s\\S]*?)<\\/superzone>')).exec(currentUpload);
                cards = match[1];

                var lrigDeckCards = [];

                while ((id = regexp.exec(cards))) {
                    lrigDeckCards.push(id[1]);
                }

                mainDeck = arrayToDeck(mainDeckCards);
                lrigDeck = arrayToDeck(lrigDeckCards);
                refreshDeckColumns();
            } catch (e) {
                vex.dialog.alert("Error parsing Lackey deck: <br><br><div class='deck_invalid'>" + e + "</div>");
            }
        } else {
            alert("Unknown deck format");
        }
    }

    currentUpload = "";
}

function onExportLackey() {

    mainDeckArray = deckToArray(mainDeck);
    lrigDeckArray = deckToArray(lrigDeck);

    result =
'<deck version="0.8">\n\
    <meta>\n\
        <game>Bato-Ruu</game>\n\
    </meta>\n\
    <superzone name="Main Deck">';

    var i;
    for(var i = 0; i < mainDeckArray.length; i++) {
        result += '\n\
        <card><name id="' + mainDeckArray[i] + '">' + cardsDefaultLocale[mainDeckArray[i]].name + '</name><set>-</set>'
    }

    result += '\n\
    </superzone>\n\
    <superzone name="LRIG Deck">'

    for(var i = 0; i < lrigDeckArray.length; i++) {
        result += '\n\
        <card><name id="' + lrigDeckArray[i] + ',white">' + cardsDefaultLocale[lrigDeckArray[i]].name + '</name><set>-</set>'
    }

    result += '\n\
    </superzone>\n\
</deck>';

    download(currentDeckName + ".dek", result);
}

function onImportLackey() {
    onImportOpenBatoru();
}

function onExportWebxoss() {
    var savedata = {};
    savedata["format"] = "WEBXOSS Deck";
    savedata["version"] = "1";
    savedata["content"] = {"mainDeck" : deckToArrayWebxoss(mainDeck), "lrigDeck" : deckToArrayWebxoss(lrigDeck)};
    download(currentDeckName + ".webxoss", JSON.stringify(savedata));
}

function onImportWebxoss() {
    onImportOpenBatoru();
}

var openBatoruToWebxoss = {
    "WD01-001" : 104,
    "WD01-002" : 105,
    "WD01-003" : 106,
    "WD01-004" : 107,
    "WD01-005" : 108,
    "WD01-006" : 109,
    "WD01-007" : 110,
    "WD01-008" : 111,
    "WD01-009" : 112,
    "WD01-010" : 113,
    "WD01-011" : 114,
    "WD01-012" : 115,
    "WD01-013" : 116,
    "WD01-014" : 117,
    "WD01-015" : 118,
    "WD01-016" : 119,
    "WD01-017" : 120,
    "WD01-018" : 121
};

var webxossToOpenBatoru = {};
for (var key in openBatoruToWebxoss) {
    webxossToOpenBatoru[openBatoruToWebxoss[key]] = key;
}

var presets = {
    "White Hope" : {
        "mainDeck":["WD01-009","WD01-009","WD01-009","WD01-009","WD01-010","WD01-010","WD01-010","WD01-010","WD01-011","WD01-011","WD01-011","WD01-011","WD01-012","WD01-012","WD01-012","WD01-012","WD01-013","WD01-013","WD01-013","WD01-013","WD01-014","WD01-014","WD01-014","WD01-014","WD01-015","WD01-015","WD01-015","WD01-015","WD01-016","WD01-016","WD01-016","WD01-016","WD01-017","WD01-017","WD01-017","WD01-017","WD01-018","WD01-018","WD01-018","WD01-018"],
        "lrigDeck":["WD01-001","WD01-002","WD01-003","WD01-004","WD01-005","WD01-006","WD01-007","WD01-008"]
    }
};
