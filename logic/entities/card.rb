class Card
  attr_accessor :id,                # Unique id of the card (not sure if int or string)
                :name,              # The name of this card
                :type,              # Card type: :LRIG, :SIGNI, :ARTS, :SPELL (yay for only four types - for now)
                :lrig,              # Array: the types of a LRIG or the LRIGs that can play this card (e.g. Tama, Iona)
                :signi_type,        # The type of the SIGNI ("Ancient Weapon" and such)
                :level,             # Card level (LRIG level or SIGNI level)
                :level_limit,       # Combined SIGNI level limit for this LRIG
                :color,             # :BLACK, :BLUE, :RED, :WHITE, :GREEN, :BLANK
                :cost,              # Hash of the cost to play the card
                :timing,            # When this ARTS can be activated: :MAIN, :ATTACK, :SPELL (cut-in)
                :power,             # SIGNI power

                :onplay_actions,    #
                :constant_actions,  #   Card actions, arrays of Action class, this is the scriptable part pretty much.
                :activated_actions, #

                :lifeburst_actions,

                :properties,        # Misc actions like Multiener or Lancer.

                :flavor_text        # This does not really belong here but, eh.
end
