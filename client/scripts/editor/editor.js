// Deck editor script

var locale = "en";

var cards = {};
var terms = {};
var cardsLocale = {};


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
                }
            });


            var i;
            var card;

            for(var id in cards) {
                card = $('<div class="card_box"><div class="card_box_inner"><div class="card_image"><img style="height: 190px; width: auto" src="' + cards[id].image + '"/>' +
                '</div><div class="card_text">' + cardsLocale[id].name + '</div></div>');
                card.data('id', id);
                card.width('50%');
                $('#card_list').append(card);
                //console.log('card appended ' + i);
            };
        });


};


$(document).on("mouseenter", ".card_image", function() {
    $('#left_column').html('<img src="' + $(this).children().first().attr('src') + '" style="width:100%; height: auto"/>');
});
