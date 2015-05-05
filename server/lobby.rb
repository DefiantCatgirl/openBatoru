class Lobby
  attr_accessor :guests,       # {username => connection}
                :channels      # {name => array of usernames}

  def initialize
    @guests = {}
    @channels = {}
  end

  def valid_string?(string)
    string != nil and
    string.is_a? String and
    string.length > 0
  end

  def in_channel?(username, channel)
    @channels.has_key? channel and
    @channels[channel].include? username
  end

  def guest_login(username, connection)
    if !username.nil? and @guests.has_key? username
      return false
    else
      @guests[username] = connection
      puts username + ' logged in'

      send_userlist(username, nil)
      send_join(username, nil)

      return true
    end
  end

  def logout(username)
    @guests.delete(username)
    puts username + ' logged out'

    send_leave(username, nil)

    empty_channels = []

    @channels.each_pair do |ch, users|
      if users.include? username
        users.delete username
        if users.empty?
          empty_channels.push ch
        else
          send_leave(username, ch)
        end
      end
    end

    empty_channels.each do |ch|
      @channels.delete ch
      send_delete_channel(ch)
    end

  end

  def message(username, message)
    #puts 'From ' + username + ' received ' + message.to_s
    if message[:type] == 'chat' and valid_string?(message[:text])
      send_message(username, ((valid_string? message[:channel]) ? message[:channel] : nil), message[:text])
    elsif message[:type] == 'join' and valid_string?(message[:channel])
      channel = message[:channel]

      unless in_channel?(username, channel)
        unless @channels.has_key? channel
          @channels[channel] = []
          send_create_channel(channel)
        end

        @channels[channel].push username
        @channels[channel].sort

        send_userlist(username, channel)
        send_join(username, channel)
      end
    elsif message[:type] == 'leave' and valid_string?(message[:channel])
      channel = message[:channel]

      if in_channel?(username, channel)

        send_leave(username, channel)
        @channels[channel].delete username

        if @channels[channel].empty?
          @channels.delete channel
          send_delete_channel(channel)
        end

      end
    end
  end

  def send_create_channel(channel)
    payload = {}
    payload[:type] = 'channel_created'
    payload[:channelname] = channel
    send_scope(nil, payload)
  end

  def send_delete_channel(channel)
    payload = {}
    payload[:type] = 'channel_deleted'
    payload[:channelname] = channel
    send_scope(nil, payload)
  end

  def send_leave(username, channel)
    payload = {}
    payload[:type] = 'leave'
    payload[:username] = username
    unless channel.nil?
      payload[:channel] = channel
    end
    send_scope(channel, payload)
  end

  def send_join(username, channel)
    payload = {}
    payload[:type] = 'join'
    payload[:username] = username
    unless channel.nil?
      payload[:channel] = channel
    end
    send_scope(channel, payload)
  end

  def send_message(username, channel, message)
    payload = {}
    payload[:type] = 'chat'
    payload[:username] = username
    payload[:text] = message
    unless channel.nil?
      payload[:channel] = channel
    end
    send_scope(channel, payload)
  end

  def send_userlist(username, channel)
    payload = {}
    payload[:type] = 'userlist'
    if channel.nil?
      payload[:users] = @guests.keys
      payload[:channels] = @channels.keys
    else
      payload[:users] = @channels[channel]
      payload[:channel] = channel
    end
    send_private(username, payload)
  end

  def send_scope(scope, message)
    if scope.nil?
      @guests.each_pair do |username, conn|
        #puts "sending " + message + " to " + username
        conn.send_message(message)
      end
    else
      if @channels.has_key? scope
        @channels[scope].each do |username|
          @guests[username].send_message(message)
        end
      end
    end
  end

  def send_private(username, message)
    if @guests.has_key? username
      @guests[username].send_message(message)
    end
  end

end
