use Rack::Static, :urls => ["/design.css", "/instapuzzle.js"]

run Proc.new { |env|
  [200, {'Content-Type'=>'text/html'}, File.open('instapuzzle.html', 'r')]
}