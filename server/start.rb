require 'em/pure_ruby'
require 'eventmachine'
require 'websocket-eventmachine-server'

class Pass < EM::Connection
  attr_accessor :client

  def connection_completed
    puts 'Socket OPEN!'
  end

  def receive_data(data)
    send_data "Socket GOT MESSAGE: #{data.chomp}"
  end

  def unbind
    puts 'Socket CLOSED!'
  end

end

class WebSocketConnection
  def initialize(ws)
    @ws = ws
  end

  def connection_completed
    puts 'Websocket OPEN!'
  end

  def handle(msg)
    write('Websocket GOT MESSAGE: ' + msg)
  end

  def unbind
    puts 'Websocket CLOSED!'
  end

  def write(msg)
    @ws.send(msg)
  end
end

@ws_conns = {}

EM.run do
  EM.start_server('0.0.0.0', 3002, Pass) do |conn|
    puts 'Socket CONNECTED'
  end
  WebSocket::EventMachine::Server.start(:host => '0.0.0.0', :port => 3001) do |ws|
    begin
      puts 'Websocket CONNECTED'
      ws.onopen do |handshake|
        @ws_conns[ws.object_id] = WebSocketConnection.new(ws)
        obj = @ws_conns[ws.object_id]
        obj.connection_completed
      end
      ws.onmessage do |msg|
        obj = @ws_conns[ws.object_id]
        obj.handle(msg)
      end
      ws.onclose do
        obj = @ws_conns[ws.object_id]
        obj.unbind
        @ws_conns.delete(ws.object_id)
      end
    rescue Exception => e # This is bad Ruby style and will be remedied, but it's convenient for now.
      @ws_conns[ws.object_id].unbind if(!ws.nil? and @ws_conns.has_key?(ws.object_id))
      @ws_conns.delete(ws.object_id) if(!ws.nil?)
      puts 'Websocket Exception: ' + e.to_s
      #raise e            # Uncomment for debug
    end
  end
end