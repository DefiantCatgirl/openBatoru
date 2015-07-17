class Card
  attr_accessor :id,                # e.g. "WD01-001"
                :name,              #
                :type,              # Card type: :LRIG, :SIGNI, :ARTS, :SPELL, :RESONA
                :level,
                :lifeburst_actions

  def initialize
    @lifeburst_actions = []
  end

  def deck_type
    if [:LRIG, :ARTS, :RESONA].include? @type
      :MAIN_DECK
    else
      :LRIG_DECK
    end
  end

  def has_lifeburst?
    not @lifeburst_actions.empty?
  end
end