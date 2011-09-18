use Rack::Static, :urls => ["/design.css", "/instapuzzle.js", "/instapuzzle.min.js", "/icons.png"]

run Proc.new { |env|
  if env["HTTP_HOST"] =~ /\Awww\./
    [301, {"Content-Type"=>"text/html", "Location" => "http://instapuzzlegame.com"}, []]
  else
    [200, {"Content-Type"=>"text/html"}, File.open("instapuzzle.html", "r")]
  end
}