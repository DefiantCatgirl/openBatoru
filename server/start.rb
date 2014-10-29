require 'rubygems'
require 'em/pure_ruby' if Gem.win_platform?
require 'eventmachine'
require 'websocket-eventmachine-server'
require File.join(File.dirname(__FILE__), './connections/socket')
require File.join(File.dirname(__FILE__), './connections/websocket')
require File.join(File.dirname(__FILE__), './lobby')

@ws_conns = {}
@lobby = Lobby.new

EM.run do
  EM.start_server('0.0.0.0', 3002, SocketConnection) do |conn|
    conn.join_lobby(@lobby)
    puts 'Socket CONNECTED'
  end
  WebSocket::EventMachine::Server.start(:host => '0.0.0.0', :port => 3001) do |ws|
    begin
      puts 'Websocket CONNECTED'
      ws.onopen do |handshake|
        @ws_conns[ws.object_id] = WebSocketConnection.new(ws, lobby)
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
