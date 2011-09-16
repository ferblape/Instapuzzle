function Timer(selector){
  return {
    seconds: 0,
    minutes: 0,
    interval: null,
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
      this.interval = setInterval(function(o){o.increaseTime();}, 1000, this);
    },
    stop: function(){
      this.interval = clearInterval(this.interval);
    }
  }
}

function Puzzle(n, image_src) {
  var instagram_image_size = 612;
  var number_of_pieces = n*n;
  var slice = instagram_image_size / n;
  var solution = new Array();
  var random_positions = new Array();
  for(var i=0;i<number_of_pieces;i++) {
    solution.push(i);
    random_positions.push(i);
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
      images.push(node);
    }
  }

  return {
    solution: solution,
    positions: random_positions,
    blank_position: blank_position,
    images: images,
    solution_image: null,
    started: false,
    disable_movements: false,
    n: n,
    timer: new Timer('.time'),
    moves: 0,
    build: function(){
      var div = jQuery('<div>');
      solution_image = jQuery('<img />').attr('src', image_src);
      div.append(solution_image);
      jQuery('#puzzle').append(div);
      this.started = false;
      this.disable_movements = false;
    },
    start: function(){
      var puzzle = this;
      solution_image.fadeOut(400, function(){
        jQuery('#puzzle').html('');
        for(var i = 0; i < n; i++) {
          for(var j = 0; j < n; j++) {
            var piece = jQuery('<div class="piece" id="piece-'+(i*n+j)+'"></div>').css("top", i*slice).css("left", j*slice).css("height", slice).css("width", slice);
            if(i*n+j != blank_position) {
              piece.append(images[random_positions[i*n+j]]);
            }
            piece.click(function(){
              puzzle.move(jQuery(this).attr('id').match(/[0-9]+/)[0], puzzle.blank_position);
              return false;
            });
            jQuery('#puzzle').append(piece);
          }
        }
        puzzle.timer.start();
        puzzle.started = true;
        puzzle.disable_movements = false;
      });
    },
    solved: function(){
      for(var i = 0; i < n*n; i++) {
        if(this.positions[i] != this.solution[i]) {
          return false;
        }
      }
      return true;
    },
    pause: function(){
      this.timer.stop();
      this.disable_movements = true;
    },
    continue_playing: function(){
      this.timer.start();
      this.disable_movements = false;
    },
    move: function(from,to){
      if(this.disable_movements)
        return;
      from = parseInt(from);
      to   = parseInt(to);
      if ((from != this.blank_position && to != this.blank_position) ||
          (from == to) ||
          (from < to && ((from+1)%this.n==0) && ((to+1)%this.n!=0)) ||
          (from > to && ((to+1)%this.n==0) && ((from+1)%this.n!=0)))
        return;

      var diff = (from - to < 0 ? to - from : from - to);
      if (diff != 1 && diff != n)
        return;

      var swap = this.positions[from];
      this.positions[from] = this.positions[to];
      this.positions[to] = swap;
      this.blank_position = (this.blank_position == from ? to : from);

      jQuery('.piece:eq('+from+')').html('');
      jQuery('.piece:eq('+to+')').html(this.images[this.positions[to]]);

      this.moves ++;
      jQuery('.moves').html((this.moves == 1) ? "1 move" : this.moves + " moves");

      if (this.solved()){
        alert("Solved!!");
        jQuery('.piece:eq('+this.blank_position+')').html(this.images[this.blank_position]);
        this.timer.stop();
      }
    }
  }
}

jQuery(document).ready(function($) {
  var client_id = 'f0d3cc511b8a4f31868cab5c7f7b8f0d';
  var puzzle;
  $('.play').attr('disabled', true);
  $.ajax({
    url: "https://api.instagram.com/v1/media/popular?client_id=" + client_id,
    dataType: 'jsonp',
    success: function(data){
      puzzle = new Puzzle(3, data['data'][0]['images']['standard_resolution']['url']);
      puzzle.build();
      $('.play').attr('disabled', false);
    }
  });
  $('.play').live('click',function(){
    if (puzzle.started)
      puzzle.continue_playing();
    else
      puzzle.start();
    $(this).removeClass('play').addClass('pause').html('Pause');
    return false;
  });
  $('.pause').live('click',function(){
    puzzle.pause();
    $(this).removeClass('pause').addClass('play').html('Play');
    return false;
  });
});