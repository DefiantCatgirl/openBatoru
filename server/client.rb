require 'em/pure_ruby'
require 'eventmachine'

$connector = nil

class Connector < EM::Connection
  def post_init
    puts 'Getting /'
    $connector = self
  end

  def receive_data(data)
    puts "Received #{data.length} bytes: " + data
  end

  def send(data)
    send_data(data)
  end
end

Thread.new do
  EM.run do
    EM.connect('127.0.0.1', 3002, Connector) do |conn|
      puts 'connected'
    end
  end
end

while s = gets
  if $connector != nil
    puts 'sending ' + s
    $connector.send(s)
  else
    puts 'no connection'
  end
end