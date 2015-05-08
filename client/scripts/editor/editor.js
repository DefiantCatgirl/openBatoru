// Deck editor script

var locale = "en";

var cards = {};
var terms = {};
var cardsLocale = {};

var smallIcons = false;

// id: "id", count: "1"
var mainDeck = [];
var lrigDeck = [];

// The more logical part

function totalCards(deck) {
    var total = 0;
    for(var i = 0; i < deck.length; i++) {
        total += deck[i].count;
    }
    return total;
}

function maxCopies(deck) {
    var copies = 0;
    for(var i = 0; i < deck.length; i++) {
        copies = deck[i].count > copies ? deck[i].count : copies;
    }
    return copies;
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

    $.when(
        $.getJSON('config/cards.json', function(data) {
            cards = data;
            //console.log('got cards');
        }),
        $.getJSON('config/' + locale + '/cards.json', function(data) {
            cardsLocale = data;
            //console.log('got locale');
        }),
        $.getJSON('config/' + locale + '/terms.json', function(data) {
            terms = data;
            //console.log('got terms');
        })
    ).then(function(){
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
                    $(itemEl).innerWidth('100%');

                    $(itemEl).find('.card_control').removeClass('hidden');

                    if(cards[itemEl.id].type != "spell" && cards[itemEl.id].type != "signi")
                    {
                        itemEl.remove();
                    }
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
                    $(itemEl).innerWidth('100%');

                    $(itemEl).find('.card_control').removeClass('hidden');

                    if(cards[itemEl.id].type != "lrig" && cards[itemEl.id].type != "arts" && cards[itemEl.id].type != "resona")
                    {
                        itemEl.remove();
                    }
                }
            });


            var i;
            var card;

            for(var id in cards) {
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
                            '<div class="button raised card_control_button" onclick=""> \
                                <paper-ripple fit></paper-ripple><div class="center_button">-</div> \
                            </div>' +
                            '<div class="button raised card_control_button" onclick=""> \
                                <paper-ripple fit></paper-ripple><div class="center_button">+</div> \
                            </div>' +
                            '<div class="button raised card_control_button card_delete_button" onclick=""> \
                                <paper-ripple fit></paper-ripple><div class="center_button">X</div> \
                            </div>' +
                        '</div>' +
                    '</div>' +
                '</div>');
                card.data('id', id);
                card.width('50%');

                smallIcons ? card.addClass('card_small') : card.addClass('card_big');

                $('#card_list').append(card);
            };
        });
};


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
