function newPuzzle(n, image_src) {
  var instagram_image_size = 612;
  var number_of_pieces = n*n;
  var blank_image_src = "black.png";
  var blank_position = number_of_pieces - 1; // the last element is always the blank
  var slice = instagram_image_size / n;
  var solution = new Array();
  for(var i=0;i<number_of_pieces;i++) {
    solution[i]=i;
  }
  var random_positions = solution.sort(function(){
    return 0.5 - Math.random();
  });
  random_positions = random_positions.sort(function(){
    return 0.5 - Math.random();
  });

  console.log("positions: "+random_positions);

  var images = new Array();
  for(var i = 0; i < n; i++) {
    for(var j = 0; j < n; j++) {
      var index = i*n+j;
      var node = $('<img />').attr('src', image_src).attr('height', instagram_image_size).
          attr('width', instagram_image_size).
          css("position", "relative").css("top", -1*i*slice).
          css("left", -1*j*slice);
      images[index] = {
        id: index,
        html_node: node
      };
    }
  }

  return {
    number_of_pieces: number_of_pieces,
    height: instagram_image_size,
    width: instagram_image_size,
    positions: random_positions,
    blank_position: blank_position,
    images: images,
    build: function(){
      for(var i = 0; i < n; i++) {
        for(var j = 0; j < n; j++) {
          var piece = $('<div class="piece" id="piece-'+(i*n+j)+'"></div>').
                      css("position", "absolute").css("top", i*slice).
                      css("left", j*slice).css("overflow", "hidden").
                      css("height", slice).css("width", slice);
          if(i*n+j != blank_position) {
            piece.append(images[random_positions[i*n+j]].html_node);
          } else {
            images[random_positions[i*n+j]].html_node.attr('src', blank_image_src);
            piece.append(images[random_positions[i*n+j]].html_node);
          }
          $('#puzzle').append(piece);
        }
      }
    },
    swap: function(from,to){
      if (from != this.blank_position && to != this.blank_position)
        return;
      from = parseInt(from);
      to   = parseInt(to);
      if(from > to){
        var bigger = from;
        var smaller = to;
      } else {
        var bigger = to;
        var smaller = from;
      }
      console.log(from + " - " +  to + " bigger: " + bigger + " - smaller: " + smaller);
      console.log(bigger-smaller);
      if ((bigger - smaller) != 1 && (bigger - smaller) != n)
        return;

      var swap = this.positions[from];
      this.positions[from] = this.positions[to];
      this.positions[to] = swap;

      console.log("positions: " + this.positions);
      this.blank_position = (this.blank_position == from ? to : from);

      $('.piece:eq('+from+')').html(this.images[this.positions[from]].html_node);
      $('.piece:eq('+to+')').html(this.images[this.positions[to]].html_node);
    }
  }
}

jQuery(document).ready(function($) {
  var client_id = 'f0d3cc511b8a4f31868cab5c7f7b8f0d';
  var url = "https://api.instagram.com/v1/media/popular?client_id=" + client_id;
  var image_src = null;
  $.ajax({
    url: url,
    dataType: 'jsonp',
    success: function(data){
      image_src = data['data'][0]['images']['standard_resolution']['url'];
      var puzzle = newPuzzle(3, image_src);
      puzzle.build();
      $('.piece').click(function(){
        var position = $(this).attr('id').match(/[0-9]+/)[0];
        if(position == puzzle.blank_position)
          return;
        puzzle.swap(position, puzzle.blank_position);
      });
    }
  });
});