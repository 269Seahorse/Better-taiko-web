function SongSelect(){
 
    var _this=this;
    var _songs;
	var _selectedSong = {title:'', folder:'', difficulty:''};
	var _code="";
    
    this.run = function(){
            
		_this.createCode();
		_this.display();
		$(window).resize(_this.display);
		
		var menuLoop = setInterval(_this.refresh, 20);
		$("#song-container").show();
		
		$(".difficulty").click(function(e){
			
			clearInterval(menuLoop);
			var difficultyElement = (e.target.className=="stars" || e.target.className=="diffname") ? e.target.parentElement : e.target;
			_selectedSong.difficulty = difficultyElement.classList[1]+'.osu';
			var parentID = $(this).parent().closest(".song").attr("id");
			var songID = parseInt(parentID.substr(5, parentID.length-1));
			_selectedSong.title = $(this).parent().closest('.song').find('.song-title').html();
			_selectedSong.folder = songID+" "+_selectedSong.title;
                   
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
		
		$(".song:not(.opened)").click(function(){
			document.getElementById("don").play();
			$(".difficulty").hide();
			$(".opened").removeClass("opened", 300);
			$(this).addClass("opened", 300, "linear", function(){
				$(this).find(".difficulty").show();
				$(this).css("background", "rgba(255, 220, 47, 0.90)");
			});
		});

	}
	
	this.createCode = function(){
		
		for(var i=0; i<assets.songs.length; i++){
			
			var songDir = assets.songs[i].songDir;
			var songDifficulties = assets.songs[i].files;
			var titleSplit = songDir.split(" ");
			var songID = titleSplit[0];
			var songTitle = songDir.substr(songID.length+1, songDir.length-(songID.length+1));
			
			songDifficulties.sort(function(a, b){
				if(a.difficulty < b.difficulty)
					return -1;
				if(a.difficulty > b.difficulty)
					return 1;
				return 0;
			});
			
			_code += "<div id='song-"+songID+"' class='song'><div class='song-title'>"+songTitle+'</div>';
			_code += "<ul class='difficulties'>";
			
			for(var j=0; j<songDifficulties.length; j++){
				
				var diffName = songDifficulties[j].songFile;
				diffName = diffName.substr(0, diffName.length-4);
				var diffLevel = songDifficulties[j].difficulty;
				
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
	}
    
    this.display = function(){
    }
    
    this.refresh = function(){
        
    }
	
	$("#screen").load("/src/views/songselect.html", _this.run);
    
}