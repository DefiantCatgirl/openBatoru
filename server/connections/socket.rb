require 'rubygems'
# require 'em/pure_ruby' if Gem.win_platform?
require 'eventmachine'
require File.join(File.dirname(__FILE__), './connection_helper')

class SocketConnection < EM::Connection
  include ConnectionHelper

  attr_accessor :client

  def join_lobby(lobby)
    @lobby = lobby
  end

  def connection_completed

  end

  def receive_data(data)
    handle_message(data)
  end

  def unbind
    disconnect
  end

  def send_message_socket(msg)
    send_data(msg.chomp)
  end

end
