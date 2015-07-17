function Loader(){
	
	var _this=this;
	var _loadedAssets=0;
	var _percentage=0;
	var _nbAssets=assets.audio.length+assets.img.length+assets.fonts.length+1; //+1 for song structures

	this.run = function(){
		
		assets.fonts.forEach(function(name){
			var font = $("<h1 style='font-family:"+name+"'>I am a font</h1>"); 
			font.appendTo("#assets");
			FontDetect.onFontLoaded (name, _this.assetLoaded, _this.fontFailed, {msTimeout: 90000});
		});
		
		assets.img.forEach(function(name){
			var id = name.substr(0, name.length-4);
			var image = $("<img id='"+id+"' src='/assets/img/"+name+"' />");
			image.appendTo("#assets");
			image.load(function(){
				_this.assetLoaded();
			});
		});
		
		assets.audio.forEach(function(name){
			var id = name.substr(0, name.length-4);
			var audio = $("<audio id='"+id+"' src='/assets/audio/"+name+"' />");
			audio.appendTo("#assets");
			audio.on('canplay', function(){
				_this.assetLoaded();
			});
		});
		
		$.ajax({
            async:true,
            type:"POST",
            url:"/src/php/getsongs.php",
            success:function(songs){
				assets.songs = $.parseJSON(songs);
				_this.assetLoaded();
			},
			error:function(){
				alert("An error occured, please refresh");
			}
		});
		
	}
	
	this.fontFailed = function(){
		alert("An error occured, please refresh");
	}
	
	this.assetLoaded = function(){
		_loadedAssets++;
		_percentage=parseInt((_loadedAssets*100)/_nbAssets);
		$("#loader .progress").css("width", _percentage+"%");
		$("#loader .percentage").html(_percentage+"%");
		_this.checkIfEverythingLoaded();
	}
	
	this.checkIfEverythingLoaded = function(){
		if(_percentage==100){
			new Titlescreen();
			//var globalScore={points:1000, great:100, good:60, fail:10, maxCombo:50, hp:90};
			//new Scoresheet(null, globalScore);
		}
	}
	
	$("#screen").load("/src/views/loader.html", _this.run);
	
}