function SongSelect(){
	var _this=this;
	var _songs;
	var _selectedSong = {title:'', folder:'', difficulty:''};
	var _preview;
	var _preview_id = 0
	var _diffNames={
		easy:"かんたん",
		normal:"ふつう",
		hard:"むずかしい",
		oni:"おに"
	}
	
	this.startPreview = function(id, prvtime, first_open=true) {
		_this.endPreview();
		var startLoad = +new Date
		var current_id = _preview_id
		if(first_open){
			snd.musicGain.fadeOut(0.4)
		}
		var songObj
		assets.songs.forEach(song => {
			if(song.id == id){
				songObj = song
			}
		})
		if(songObj.sound){
			_preview = songObj.sound
			_preview.gain = snd.previewGain
			this.previewLoaded(startLoad, prvtime, first_open)
		}else{
			snd.previewGain.load("/songs/" + id + "/main.mp3").then(sound => {
				if(current_id == _preview_id){
					songObj.sound = sound
					_preview = sound
					this.previewLoaded(startLoad, prvtime, first_open)
				}
			})
		}
	};
	
	this.previewLoaded = function(startLoad, prvtime, first_open){
		var endLoad = +new Date
		var difference = endLoad - startLoad
		var minDelay = first_open ? 1000 : 300
		var delay = minDelay - Math.min(minDelay, difference)
		_preview.playLoop(delay / 1000, false, prvtime / 1000)
	}
	
	this.endPreview = function() {
		_preview_id++
		if (_preview) {
			_preview.stop();
		};
	};
	
	this.run = function(){
		_this.createCode();
		
		$("#song-container").show();
		
		$('#songsel-help').click(function(){
			assets.sounds["bgm_songsel"].stop()
			assets.sounds["song-select"].stop()
			assets.sounds["diffsel"].stop()
			assets.sounds["don"].play()
			snd.musicGain.fadeIn()
			_this.endPreview();
			
			new Tutorial();
		});
		
		$(".difficulty").click(function(e){
			_this.endPreview();
			assets.sounds["bgm_songsel"].stop()
			assets.sounds["diffsel"].stop()
			assets.sounds["don"].play()
			
			var difficultyElement = (e.target.className=="stars" || e.target.className=="diffname") ? e.target.parentElement : e.target;
			_selectedSong.difficulty = difficultyElement.classList[1]+'.osu';
			var parentID = $(this).parent().closest(".song").attr("id");
			var songID = parseInt(parentID.substr(5, parentID.length-1));
			_selectedSong.title = $(this).parent().closest('.song').data('title');
			_selectedSong.folder = songID;
			
			snd.musicGain.fadeIn()
			new loadSong(_selectedSong, e.shiftKey);
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
					snd.musicGain.fadeIn(0.4)
					assets.sounds["diffsel"].stop()
					assets.sounds["cancel"].play()
					assets.sounds["song-select"].play(0.3)
					
					$(".difficulty").hide();
					$(".opened").removeClass("opened", 300);
					
					$('.songsel-title').fadeOut(200, function(){
						$('.songsel-title').attr('alt', '曲をえらぶ').html('曲をえらぶ').css('left', -300);
						$('.songsel-title').animate({left:0, opacity:"show"}, 400);
					});
					
					return;
				}
				
				if(!$('.opened').length) {
					_this.startPreview($(this).data('song-id'), $(this).data('preview'));
					assets.sounds["don"].play()
					assets.sounds["song-select"].stop()
					assets.sounds["diffsel"].play(0.3)
					
					$('.songsel-title').fadeOut(200, function(){
						$('.songsel-title').attr('alt', 'むずかしさをえらぶ').html('むずかしさをえらぶ').css('left', -300);
						$('.songsel-title').animate({left:0, opacity:"show"}, 400);
					});
				} else {
					_this.startPreview($(this).data('song-id'), $(this).data('preview'), false);
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
		assets.sounds["bgm_songsel"].playLoop(0.1, false, 0, 1.442, 3.506)
		assets.sounds["song-select"].play(0.2);
		
		var songElements = [0]
		
		for(var i=0; i<assets.songs.length; i++){
			
			var song = assets.songs[i];
			var songTitle = song.title;
			var skipChars = [];
			var charElements = [0]
			var diffElements = [0]
			
			for (var c=0; c<songTitle.length; c++) {
				if (skipChars.indexOf(c) > -1) {
					continue;
				};
				
				var ch = songTitle.charAt(c) == " " ? "\xa0" : songTitle.charAt(c);
				
				var isApos = false;
				if (songTitle.charAt(c+1) == "'") {
					ch = ch + "'";
					skipChars.push(c+1);
					isApos = true;
				};
				
				var cl = ch == "\xa0" ? "song-title-char song-title-space" : "song-title-char";
				cl = isApos ? cl + " song-title-apos" : cl;
				
				charElements.push(
					["span", {
						class: cl,
						alt: ch
					}, ch]
				)
			};
			
			for(var diff in _diffNames){
				var diffName = diff;
				var diffLevel = song.stars[diff];
				if (!diffLevel) {
					continue;
				}
				
				var starsDisplay = [0]
				for(var x=1; x<=diffLevel; x++){
					starsDisplay.push("\u2605")
					starsDisplay.push(["br"])
				}
				
				var diffTxt=_diffNames[diffName]
				
				diffElements.push(
					["li", {
						class: "difficulty " + diffName
					},
						["span", {
							class: "diffname"
						}, diffTxt],
						["span", {
							class: "stars"
						}, starsDisplay]
					]
				)
			
			}
			
			songElements.push(
				["div", {
					id: "song-" + song.id,
					class: "song",
					"data-title": songTitle,
					"data-song-id": song.id,
					"data-preview": song.preview
				},
					["div", {
						class: /^[\x00-\xFF]*$/.test(songTitle) ? "song-title alpha-title" : "song-title"
					}, charElements],
					["ul", {
						class: "difficulties"
					}, diffElements]
				]
			)
		}
		
		element(
			document.getElementById("song-container"),
			songElements
		)
		$('.difficulty').hide();
	}
	
	$("#screen").load("/src/views/songselect.html", _this.run);
	
}