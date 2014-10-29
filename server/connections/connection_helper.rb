require 'json'

module ConnectionHelper
  attr_accessor :username, :lobby

  def handle_message(msg)
    begin
      data = JSON.parse(msg, :symbolize_names => true)

      if @username.nil?
        try_login(data[:username])
      else
        @lobby.message(username, data)
      end

    rescue => e
      message = {:type => 'generic', :error => e.to_s}
      send_message(message)
    end
  end

  def try_login(username)
    message = {}

    if username.nil? or !username.is_a? String or username.length < 2
      message = {:type => 'guest_login', :success => false, :invalid => true}
    else
      success = @lobby.guest_login(username, self)
      @username = username if success
      message = {:type => 'guest_login', :success => success, :invalid => false}
    end

    send_message(message)
  end

  def send_message(message)
    send_message_socket message.to_json
  end

  def disconnect
    if !@username.nil?
      @lobby.logout(@username)
    end
  end

end
