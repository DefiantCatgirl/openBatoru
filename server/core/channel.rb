# Single channel manager. Channel 'nil' is a special case, a global channel with no game functionality.
class Channel
  attr_accessor :name, :users, :game

  def initialize(name = nil)
    @users = {}
    @name = name
  end

  # General message handling/sending

  def handle_message(username, message)
    type = message[:type]

    case type
      when 'chat'
        handle_chat(message)
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

  def handle_chat(msg)
    if valid_string?(message[:text])
      broadcast_chat_message(username, message[:text])
    end
  end

  def handle_join(user)
    @users.push(user)
    broadcast_join(username)
  end

  def handle_leave(username)
    @users.delete(username)
    broadcast_leave(username)
  end

  def handle_take_seat(msg)

  end

  def handle_free_seat(msg)

  end

  def handle_logout(username)
    if users.include? username
      users.delete username
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

  def send_userlist(username)
    payload = {}
    payload[:type] = 'userlist'
    payload[:users] = users.keys.sort
    payload[:channel] = @name

    private_message(username, payload)
  end

end