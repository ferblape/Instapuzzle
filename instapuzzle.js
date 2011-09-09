function newTimer(selector){
  return {
    seconds: 0,
    minutes: 0,
    selector: selector,
    printTime: function(){
      jQuery(selector).html((this.minutes < 10 ? "0" + this.minutes : this.minutes ) + ':' + (this.seconds < 10 ? "0" + this.seconds : this.seconds));
    },
    increaseTime: function(){
      if(this.seconds < 59 ){
        this.seconds ++;
      } else {
        this.seconds = 0
        this.minutes ++;
      }
      this.printTime();
    },
    start: function(){
      setInterval(function(o){o.increaseTime();}, 1000, this);
    }
  }
}

function newPuzzle(n, image_src) {
  var instagram_image_size = 612;
  var number_of_pieces = n*n;
  var slice = instagram_image_size / n;
  var solution = new Array();
  var random_positions = new Array();
  for(var i=0;i<number_of_pieces;i++) {
    solution[i] = i;
    random_positions[i] = i;
  }
  random_positions = random_positions.sort(function(){
    return 0.5 - Math.random();
  }).sort(function(){
    return 0.5 - Math.random();
  });

  var blank_position = random_positions[number_of_pieces - 1]; // the last element is always the blank hole

  var images = new Array();
  for(var i = 0; i < n; i++) {
    for(var j = 0; j < n; j++) {
      var index = i*n+j;
      var node = jQuery('<img />').attr('src', image_src).attr('height', instagram_image_size).
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
    solution: solution,
    positions: random_positions,
    blank_position: blank_position,
    images: images,
    timer: newTimer('.time'),
    moves: 0,
    build: function(){
      var div = jQuery('<div>');
      var image = jQuery('<img />').attr('src', image_src);
      var puzzle = this;
      image.fadeIn(2500, function(){
        jQuery('#puzzle').html('');
        for(var i = 0; i < n; i++) {
          for(var j = 0; j < n; j++) {
            var piece = jQuery('<div class="piece" id="piece-'+(i*n+j)+'"></div>').css("top", i*slice).css("left", j*slice).css("height", slice).css("width", slice);
            if(i*n+j != blank_position) {
              piece.append(images[random_positions[i*n+j]].html_node);
            }
            piece.click(function(){
              puzzle.move(jQuery(this).attr('id').match(/[0-9]+/)[0], puzzle.blank_position);
            });
            jQuery('#puzzle').append(piece);
          }
        }
        puzzle.timer.start();
      });
      div.append(image);
      jQuery('#puzzle').append(div);
    },
    solved: function(){
      for(var i = 0; i < n*n; i++) {
        if(this.positions[i] != this.solution[i]) {
          return false;
        }
      }
      return true;
    },
    move: function(from,to){
      from = parseInt(from);
      to   = parseInt(to);
      if ((from != this.blank_position && to != this.blank_position) || (from == to))
        return;

      if(from > to){
        var bigger = from;
        var smaller = to;
      } else {
        var bigger = to;
        var smaller = from;
      }
      if ((bigger - smaller) != 1 && (bigger - smaller) != n)
        return;

      var swap = this.positions[from];
      this.positions[from] = this.positions[to];
      this.positions[to] = swap;
      this.blank_position = (this.blank_position == from ? to : from);

      jQuery('.piece:eq('+from+')').html('');
      jQuery('.piece:eq('+to+')').html(this.images[this.positions[to]].html_node);

      this.moves ++;
      jQuery('.moves').html((this.moves == 1) ? "1 move" : this.moves + " moves");

      if (this.solved()){
        alert("Solved!!");
        jQuery('.piece:eq('+this.blank_position+')').html(this.images[this.blank_position].html_node);
      }
    }
  }
}

jQuery(document).ready(function($) {
  var client_id = 'f0d3cc511b8a4f31868cab5c7f7b8f0d';
  $.ajax({
    url: "https://api.instagram.com/v1/media/popular?client_id=" + client_id,
    dataType: 'jsonp',
    success: function(data){
      var puzzle = newPuzzle(3, data['data'][0]['images']['standard_resolution']['url']);
      puzzle.build();
    }
  });
});