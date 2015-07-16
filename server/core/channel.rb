require_relative '../game/game'

# Single channel manager. Channel 'nil' is a special case, a global channel with no game functionality.
class Channel
  attr_accessor :name, :users, :game, :seats

  def initialize(name = nil)
    @users = {}
    @name = name
    @game = Game.new
    @seats = []
  end

  # General message handling/sending

  def handle_message(username, message)
    type = message[:type]

    case type
      when 'chat'
        handle_chat(username, message)
      when 'take_seat'
        handle_take_seat(username, message)
      when 'free_seat'
        handle_free_seat(username, message)
      else
        ; # throw error
    end
  end

  def private_message(username, message)
    if @users.has_key? username
      @users[username].send_message(message)
    end
  end

  def broadcast_message(message)
    @users.each do |username, connection|
      connection.send_message(message)
    end
  end

  # Specific message handling

  def handle_chat(username, message)
    if valid_string?(message[:text])
      broadcast_chat_message(username, message[:text])
    end
  end

  def handle_join(user)
    @users[user.username] = user
    broadcast_join(user.username)
    send_userlist(user.username)
  end

  def handle_leave(username)
    broadcast_leave(username)
    @users.delete(username)
  end

  def handle_take_seat(username, message)
    if @name.nil?
     return
    end

    seat = message[:seat].to_i - 1

    if @seats[0] != username and @seats[1] != username and seat >= 0 and seat <= 1 and @seats[seat].nil?
      @seats[seat] = username
      broadcast_take_seat(username, seat + 1)
    end
  end

  def handle_free_seat(username, message)
    if @name.nil?
      return
    end

    if @seats[0] == username
      @seats[0] = nil
      broadcast_free_seat(username, 1)
    elsif @seats[1] == username
      @seats[1] = nil
      broadcast_free_seat(username, 2)
    end
  end

  def handle_logout(username)
    if @users.include? username
      @users.delete username
      broadcast_leave(username)
    end
  end

  # Specific message sending

  def broadcast_chat_message(username, message)
    payload = {}
    payload[:type] = 'chat'
    payload[:username] = username
    payload[:text] = message
    unless @name.nil?
      payload[:channel] = @name
    end
    broadcast_message(payload)
  end

  def broadcast_leave(username)
    payload = {}
    payload[:type] = 'leave'
    payload[:username] = username
    unless @name.nil?
      payload[:channel] = @name
    end
    broadcast_message(payload)
  end

  def broadcast_join(username)
    payload = {}
    payload[:type] = 'join'
    payload[:username] = username
    unless @name.nil?
      payload[:channel] = @name
    end
    broadcast_message(payload)
  end

  def broadcast_take_seat(username, seat)
    payload = {}
    payload[:type] = 'take_seat'
    payload[:username] = username
    payload[:seat] = seat
    payload[:channel] = @name
    broadcast_message(payload)
  end

  def broadcast_free_seat(username, seat)
    payload = {}
    payload[:type] = 'free_seat'
    payload[:username] = username
    payload[:seat] = seat
    payload[:channel] = @name
    broadcast_message(payload)
  end

  def send_userlist(username)
    payload = {}
    payload[:type] = 'userlist'
    payload[:users] = @users.keys.sort
    payload[:channel] = @name
    payload[:seats] = [@seats[0], @seats[1]]

    private_message(username, payload)
  end

end