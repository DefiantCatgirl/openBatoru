require File.join(File.dirname(__FILE__), './connection_helper')

class WebSocketConnection
  include ConnectionHelper

  def initialize(ws, lobby)
    @ws = ws
    @lobby = lobby
  end

  def connection_completed

  end

  def handle(msg)
    handle_message(msg)
  end

  def unbind
    disconnect
  end

  def send_message_socket(msg)
    @ws.send(msg.chomp)
  end
end
