class Lobby
  attr_accessor :guests       # {username => connection}

  def initialize
    @guests = {}
  end

  def guest_login(username, connection)
    if !username.nil? and @guests.has_key? username
      return false
    else
      @guests[username] = connection
      puts username + ' logged in'
      return true
    end
  end

  def logout(username)
    @guests.delete(username)
    puts username + ' logged out'
  end

  def message(username, message)
    #puts 'From ' + username + ' received ' + message.to_s
    if message[:type] == 'chat' and
       message[:text] != nil and
       message[:text].is_a? String and
       message[:text].length > 0
      payload = {}
      payload[:username] = username
      payload[:text] = message[:text]
      if message[:scope] == 'global'
        send_scope(nil, payload)
      end
    end
  end

  def send_scope(scope, message)
    if scope.nil?
      @guests.each_pair do |username, conn|
        #puts "sending " + message + " to " + username
        conn.send_message(message)
      end
    end
  end

  def send_private(username, message)

  end

end
