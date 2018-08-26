function SongSelect(){
 
    var _this=this;
    var _songs;
	var _selectedSong = {title:'', folder:'', difficulty:''};
	var _code="";
	var _preview;
	var _preview_to;

	this.startPreview = function(id, first_open=true) {
		var start = Date.now();
		setTimeout(function(){
			bgm.pause();
		}, 400);

		_preview = new Audio('/songs/' + id + '/main.mp3');
		_preview.onloadeddata = function() {
			var end = Date.now();
			var delay = end - start;
			var no_delay = first_open ? 0 : 300;

			_preview.currentTime = 10.0;
			_preview.loop = true;
			_preview.volume = 0.5;
			
			_preview_to = setTimeout(function(){
				_preview.play();
			}, delay <= 1000 && first_open ? 1000 : no_delay);
		}
	};

	this.endPreview = function() {
		clearTimeout(_preview_to);
		_preview.pause();
	};
    
    this.run = function(){
            
		_this.createCode();
		_this.display();
		$(window).resize(_this.display);
		
		var menuLoop = setInterval(_this.refresh, 20);
		$("#song-container").show();
		
		$(".difficulty").click(function(e){
			_this.endPreview();
			assets.sounds["diffsel"].pause();
			assets.sounds["diffsel"].currentTime = 0;
			assets.sounds["don"].play();

			clearInterval(menuLoop);
			var difficultyElement = (e.target.className=="stars" || e.target.className=="diffname") ? e.target.parentElement : e.target;
			_selectedSong.difficulty = difficultyElement.classList[1]+'.osu';
			var parentID = $(this).parent().closest(".song").attr("id");
			var songID = parseInt(parentID.substr(5, parentID.length-1));
			_selectedSong.title = $(this).parent().closest('.song').data('title');
			_selectedSong.folder = songID;
            
            bgm.pause();
			new loadSong(_selectedSong);
		});
		
		$(".song").hover(function(){
			if(!$(this).hasClass("opened"))
				$(this).css("background", "rgba(255, 233, 125, 0.90)");
		},
		function(){
			if(!$(this).hasClass("opened"))
				$(this).css("background", "rgba(255, 220, 47, 0.90)");
		});
		
		$(".song").click(function(e){
			if (!$(e.target).parents('.difficulties').length) {
				if ($(".opened").length && $(".opened").attr('id') == $(this).attr('id')) {
					_this.endPreview();
					bgm.play();
					assets.sounds["cancel"].play();
					$(".difficulty").hide();
					$(".opened").removeClass("opened", 300);

					assets.sounds["diffsel"].pause();
					assets.sounds["diffsel"].currentTime = 0;
					setTimeout(function(){
						assets.sounds["song-select"].play();
					}, 300);

					$('.songsel-title').fadeOut(200, function(){
						$('.songsel-title').attr('alt', '曲をえらぶ').html('曲をえらぶ').css('left', -300);
						$('.songsel-title').animate({left:0, opacity:"show"}, 400);
					});

					return;
				}


				if(!$('.opened').length) {
					_this.startPreview($(this).data('song-id'));				
					assets.sounds["don"].play();
					assets.sounds["song-select"].pause();
					assets.sounds["song-select"].currentTime = 0;
					setTimeout(function(){
						assets.sounds["diffsel"].play();
					}, 300);

					$('.songsel-title').fadeOut(200, function(){
						$('.songsel-title').attr('alt', 'むずかしさをえらぶ').html('むずかしさをえらぶ').css('left', -300);
						$('.songsel-title').animate({left:0, opacity:"show"}, 400);
					});
				} else {
					_preview.pause();
					_this.startPreview($(this).data('song-id'), false);				
					assets.sounds["ka"].play();
				}
			};

			$(".difficulty").hide();
			$(".opened").removeClass("opened", 300);
			$(this).addClass("opened", 300, "linear", function(){
				$(this).find(".difficulty").show();
				$(this).css("background", "rgba(255, 220, 47, 0.90)");
			});
		});

	}

	this.createCode = function(){
		bgm = new BufferedLoop(
			{url: '/assets/audio/bgm_songsel.ogg', duration: 1.442},
			{url: '/assets/audio/bgm_songsel_loop.ogg', duration: 2.064}
		);
		bgm.play();

		setTimeout(function(){
			assets.sounds["song-select"].play();
		}, 200);
		for(var i=0; i<assets.songs.length; i++){

			var song = assets.songs[i];
			var songDir = '/songs/' + song.id;
			var songDifficulties = song.stars;
			var songID = song.id;
			var songTitle = song.title;
			var songTitleSpace = songTitle.replace(/ /g, '&nbsp;');
			
			_code += "<div id='song-"+songID+"' class='song' data-title='"+songTitle+"' data-song-id='"+songID+"'><div class='song-title'>";
			for (var c=0; c<songTitle.length; c++) {
				var ch = songTitle.charAt(c) == ' ' ? '&nbsp;' : songTitle.charAt(c);
				var cl = ch == '&nbsp;' ? 'song-title-char song-title-space' : 'song-title-char';
				_code += '<span class="' + cl + '" alt="' + ch + '">' + ch + '</span>';
			};
			_code += "</div><ul class='difficulties'>";
			
			for(var diff in songDifficulties){
				var diffName = diff;
				var diffLevel = songDifficulties[diff];
				if (!diffLevel) {
					continue;
				}
				
				var starsDisplay="";
				for(var x=1; x<=diffLevel; x++){
					starsDisplay+="&#9733;<br>";
				}
				
				var diffTxt;
				switch(diffName){
					case 'easy':
						diffTxt="かんたん";
						break;
					case 'normal':
						diffTxt="ふつう";
						break;
					case 'hard':
						diffTxt="むずかしい";
						break;
					case 'oni':
						diffTxt="おに";
						break;
				}

				_code += "<li class='difficulty "+diffName+"'>";
					_code+= "<span class='diffname'>"+diffTxt+"</span>";
					_code+= "<span class='stars'>"+starsDisplay+"</span>";
				_code += "</li>";
			
			}
			
			_code += "</ul></div>";
			
		}
		
		$("#song-container").html(_code);
		$('.difficulty').hide();
	}
    
    this.display = function(){
    }
    
    this.refresh = function(){
        
    }
	
	$("#screen").load("/src/views/songselect.html", _this.run);
    
}