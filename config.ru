use Rack::Static, :urls => ["/design.css", "/instapuzzle.js"]

run Proc.new { |env|
  if env['HTTP_HOST'] =~ /\Awww\./
    [301, {"Location" => request.url.sub("//www.", "//")}, self]
  else
    [200, {'Content-Type'=>'text/html'}, File.open('instapuzzle.html', 'r')]
  end
}