function loadSong(selectedSong){
	
	var _this = this;
	var _selectedSong=selectedSong;
	var _bgLoaded=false;
	var _musicLoaded=false;
	var _songDataLoaded=false;
	var _songFilePath = '/songs/'+_selectedSong.folder+'/'+_selectedSong.difficulty;
	var _songData;
	
	this.run = function(){
		
		document.getElementById("start").play();
		$("#assets").append("<audio id='main-music' src='/songs/"+_selectedSong.folder+"/"+_selectedSong.title+".mp3'></audio>");
		$("#assets").append("<img id='music-bg' src='/songs/"+_selectedSong.folder+"/bg.png' />");
		
		$("#music-bg").load(function(){
			_bgLoaded=true;
			_this.checkIfEverythingLoaded();
		});
		
		$("#main-music").on('canplay', function(){
			_musicLoaded=true;
			_this.checkIfEverythingLoaded();
		});
		
		$.ajax({
            url : _songFilePath,
            dataType: "text",
            success : function (data) {
                _songData = data.split("\n");
				_songDataLoaded=true;
				_this.checkIfEverythingLoaded();
            }
        });
		
	}
	
	this.checkIfEverythingLoaded = function(){
		if(_musicLoaded && _songDataLoaded && _bgLoaded){
			$("#screen").load("/src/views/game.html", function(){
				var taikoGame = new Controller(_selectedSong, _songData);
				taikoGame.run();
			});
		}
	}
	
	$("#screen").load("/src/views/loadsong.html", _this.run);
 }