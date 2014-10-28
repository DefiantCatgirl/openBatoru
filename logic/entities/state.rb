class State
  attr_accessor :field_1,     # Various effects, states and triggers will also be here for the sake of serialization
                :field_2,
                :turn,        # Integer, whose turn it is - mod 2
                :phase,       # :UP, :DRAW, :ENER, :GROW, :MAIN, :ATTACK, :END
                :phase_state, # >implying I know how this is going to work (probably action stacks?)
                :first_player # 1, 2
end
