require_relative './card.rb'

class Deck
  attr_accessor :main_deck, :lrig_deck

  def initialize
    @main_deck = []
    @lrig_deck = []
  end

  # @param [Card] card
  def add_card(card)
    if card.deck_type == :MAIN_DECK
      @main_deck.push card
    else
      @lrig_deck.push card
    end
  end

  # @returns [Boolean]
  def is_valid?
    # Optimized for reading more than performance

    # Is deck size correct?
    if @main_deck.length != 40
      return false
    elsif @lrig_deck.length > 10
      return false
    end

    # Are there correct card types in both decks?
    @main_deck.each do |card|
      if card.deck_type != :MAIN_DECK
        return false
      end
    end

    @lrig_deck.each do |card|
      if card.deck_type != :LRIG_DECK
        return false
      end
    end

    # Does LRIG deck have at least 1 level 0 LRIG?
    zero_level_lrig_exists = false
    @lrig_deck.each do |card|
      if card.type == :LRIG and card.level == 0
        zero_level_lrig_exists = true
        break
      end
    end

    unless zero_level_lrig_exists
      return false
    end

    # Are there exactly 20 cards with Life Burst in the main deck?
    if @main_deck.reduce(0) { |sum, card| if card.has_lifeburst? then sum+=1 end } != 20
      return false
    end

    # Are there no more than 4 cards with the same name in each deck?
    if max_copies(@main_deck) > 4 or max_copies(@lrig_deck) > 4
      return false
    end

    true
  end

  def max_copies(deck)
    copies = Hash.new(0)
    deck.each do |card|
      copies[card.name] += 1
    end
    copies.values.max
  end

end

