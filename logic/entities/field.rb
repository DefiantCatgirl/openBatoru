class FieldCard
  attr_accessor :card,      # Card
                :tapped     # Boolean
end

class Field
  attr_accessor :main_deck,       # Everything not specified is Array of Card
                :lrig_deck,       # Array of FieldCard
                :lrig_stack,
                :main_trash,
                :lrig_trash,
                :signi_fields,    # Array of FieldCard
                :check_zone,      # Honestly I'm not sure how this is going to work.
                :in_play,         # Basically this is where cards go when their effect needs to be resolved? Or something?
                :life_cloth
end
