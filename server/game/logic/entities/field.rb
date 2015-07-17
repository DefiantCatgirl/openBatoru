class Field
  attr_accessor :hand,
                :main_deck,
                :lrig_deck

  def initialize
    @hand = @main_deck = @lrig_deck = []
  end
end