# Miscellaneous useful utility functions that are used everywhere in the code

def valid_string?(string)
  string != nil and
      string.is_a? String and
      string.length > 0
end