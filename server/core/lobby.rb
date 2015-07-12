require_relative './channel'
require_relative './tools'

class Lobby
  attr_accessor :users,       # {username => connection}
                :channels,      # {name => array of usernames}
                :lobby_channel

  def initialize
    @users = {}
    @channels = {}
    @lobby_channel = Channel.new
  end

  def in_channel?(username, channel)
    @channels.has_key? channel and
    @channels[channel].users.has_key? username
  end

  def guest_login(username, connection)
    if !username.nil? and @users.has_key? username
      return false
    else
      @users[username] = connection

      # debug
      puts username + ' logged in'

      @lobby_channel.send_userlist(username)
      @lobby_channel.broadcast_join(username)

      return true
    end
  end

  def logout(username)
    @users.delete(username)

    # debug
    puts username + ' logged out'

    @lobby_channel.handle_logout(username)

    empty_channels = []

    @channels.each do |channel|
      channel.handle_logout(username)
      if channel.users.empty?
        empty_channels.push ch
      end
    end

    empty_channels.each do |ch|
      @channels.delete ch
      broadcast_delete_channel(ch)
    end

  end

  def message(username, message)
    #puts 'From ' + username + ' received ' + message.to_s

    type = message[:type]
    channel = message[:channel]

    if type != 'join' && type != 'leave' && channel != nil
      if @channels.has_key? (channel)
        @channels[channel].handle_message(username, message)
      end
    end

    if message[:type] == 'join' and valid_string?(message[:channel])
      unless in_channel?(username, channel)
        unless @channels.has_key? channel
          @channels[channel] = Channel.new(channel)
          broadcast_create_channel(channel)
        end

        @channels[channel].handle_join(@users[username])
      end
    elsif message[:type] == 'leave' and valid_string?(message[:channel])
      if in_channel?(username, channel)
        @channels[channel].handle_leave(username)
        if @channels[channel].users.empty?
          @channels.delete channel
          broadcast_delete_channel(channel)
        end
      end
    end
  end

  def broadcast_create_channel(channel)
    payload = {}
    payload[:type] = 'channel_created'
    payload[:channelname] = channel
    @lobby_channel.broadcast_message(payload)
  end

  def broadcast_delete_channel(channel)
    payload = {}
    payload[:type] = 'channel_deleted'
    payload[:channelname] = channel
    @lobby_channel.broadcast_message(payload)
  end

  def send_userlist(username, channel)
    if channel.nil?
      payload = {}
      payload[:type] = 'userlist'
      payload[:users] = @guests.keys
      payload[:channels] = @channels.keys
      private_message(username, payload)
    else
      @channels[channel].send_userlist(username)
    end
  end

  def private_message(username, message)
    @lobby_channel.private_message(username, message)
  end

end
