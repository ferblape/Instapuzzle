function setCookie(name, value) {
  var date = new Date();
  date.setTime(date.getTime()+(15*24*60*60*1000));
  var expires = "; expires="+date.toGMTString();
  document.cookie = name+"="+value+expires+"; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1,c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length,c.length);
    }
  }
  return null;
}

function Timer(selector){
  return {
    seconds: 0,
    minutes: 0,
    interval: null,
    printTime: function(){
      jQuery(selector).html((this.minutes < 10 ? "0" + this.minutes : this.minutes ) + ':' + (this.seconds < 10 ? "0" + this.seconds : this.seconds));
    },
    reset: function(){
      this.seconds = 0;
      this.minutes = 0;
      this.printTime();
    },
    increaseTime: function(){
      if(this.seconds < 59 ){
        this.seconds ++;
      } else {
        this.seconds = 0;
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
  };
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
  for(i = 0; i < n; i++) {
    for(var j = 0; j < n; j++) {
      var index = i*n+j;
      var node = jQuery('<img />').attr('src', image_src).attr('height', instagram_image_size).
          attr('width', instagram_image_size).
          css("position", "relative").css("top", -1*i*slice).
          css("left", -1*j*slice);
      images.push(node);
    }
  }

  jQuery('#puzzle').html('');
  var div = jQuery('<div>');
  solution_image = jQuery('<img />').attr('src', image_src);
  div.append(solution_image);
  jQuery('#puzzle').append(div);
  jQuery('.play').attr('disabled', false);

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
    resetMovements: function(){
      jQuery('.moves').html("0 moves");
    },
    move: function(from,to){
      if(this.disable_movements)
        return false;
      from = parseInt(from);
      to   = parseInt(to);
      if ((from != this.blank_position && to != this.blank_position) ||
          (from == to) ||
          (from < to && ((from+1)%this.n===0) && ((to+1)%this.n!==0)) ||
          (from > to && ((to+1)%this.n===0) && ((from+1)%this.n!==0)))
        return false;

      var diff = (from - to < 0 ? to - from : from - to);
      if (diff != 1 && diff != n)
        return false;

      var swap = this.positions[from];
      this.positions[from] = this.positions[to];
      this.positions[to] = swap;
      this.blank_position = (this.blank_position == from ? to : from);

      jQuery('.piece:eq('+from+')').html('');
      jQuery('.piece:eq('+to+')').html(this.images[this.positions[to]]);

      this.moves ++;
      jQuery('.moves').html((this.moves == 1) ? "1 move" : this.moves + " moves");

      if (this.solved()){
        jQuery('.play').attr('disabled', true);        jQuery('.piece:eq('+this.blank_position+')').html(this.images[this.blank_position]);
        this.timer.stop();
      }
      return true;
    }
  };
}

function setLoadingMessage(){
  jQuery('#puzzle').html('Loading image from Instagram...');
}

jQuery(document).ready(function() {
  var default_image_size = 612;
  var client_id = 'f0d3cc511b8a4f31868cab5c7f7b8f0d';
  var puzzle;
  var level;
  if (getCookie('instapuzzle')) {
    level = parseInt(getCookie('instapuzzle'));
  } else {
    level = 3;
    setCookie('instapuzzle', level);
  }

  console.log($(window).height());
  console.log($(window).width());

  jQuery('#level').hide();
  jQuery('#level a[data-level='+level+']').addClass('active');
  jQuery('.settings_controls').hide();
  jQuery('.play').attr('disabled', true);
  setLoadingMessage();

  jQuery.ajax({
    url: "https://api.instagram.com/v1/media/popular?client_id=" + client_id,
    dataType: 'jsonp',
    success: function(data){
      puzzle = new Puzzle(level, data['data'][0]['images']['standard_resolution']['url']);
    }
  });

  jQuery('.play').live('click',function(){
    if (puzzle.started) {
      puzzle.continue_playing();
    } else {
      puzzle.start();
    }
    jQuery(this).removeClass('play').addClass('pause').html('Pause');
    return false;
  });

  jQuery('.pause').live('click',function(){
    puzzle.pause();
    jQuery(this).removeClass('pause').addClass('play').html('Play');
    return false;
  });

  jQuery('.reload').live('click',function(){
    jQuery('.pause').trigger('click');
    puzzle.timer.reset();
    puzzle.resetMovements();
    setLoadingMessage();
    jQuery.ajax({
      url: "https://api.instagram.com/v1/media/popular?client_id=" + client_id,
      dataType: 'jsonp',
      success: function(data){
        puzzle = new Puzzle(level, data['data'][0]['images']['standard_resolution']['url']);
      }
    });
    return false;
  });

  jQuery('.settings').live('click', function(){
    jQuery('.pause').trigger('click');
    jQuery('#puzzle').hide();
    jQuery('.settings_controls').show();
    jQuery('.play_controls').hide();
    jQuery('#level').show();
    return false;
  });

  jQuery('.back').live('click', function(){
    jQuery('#puzzle').show();
    jQuery('.settings_controls').hide();
    jQuery('.play_controls').show();
    jQuery('#level').hide();
    return false;
  });

  jQuery('.level').live('click', function(){
    level = parseInt($(this).attr('data-level'));
    setCookie('instapuzzle', level);
    jQuery('#level a').removeClass('active');
    jQuery('#level a[data-level='+level+']').addClass('active');

    puzzle.timer.reset();
    puzzle.resetMovements();
    setLoadingMessage();
    jQuery.ajax({
      url: "https://api.instagram.com/v1/media/popular?client_id=" + client_id,
      dataType: 'jsonp',
      success: function(data){
        puzzle = new Puzzle(level, data['data'][0]['images']['standard_resolution']['url']);
      }
    });
    jQuery('#puzzle').show();
    jQuery('.settings_controls').hide();
    jQuery('.play_controls').show();
    jQuery('#level').hide();
    return false;
  });

  $(window).resize(function() {
    var current_width = $(window).width();
    if(current_width < 612){
      if((current_width >= 320) && (current_width <= 480)) {
        $('#puzzle').css('width', current_width - 10).css('height', current_width - 10);
      } else if(current_width > 480) {
        $('#puzzle').css('width', current_width - 20).css('height', current_width - 20);
      }
    } else {
      $('#puzzle').css('width', 612).css('height', 612);
    }
  });

});