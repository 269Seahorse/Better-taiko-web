function Loader(){
	
	var _this=this;
	var _loadedAssets=0;
	var _percentage=0;
	var _nbAssets=assets.audio.length+assets.img.length+assets.fonts.length+1; //+1 for song structures
	var _assetsDiv=document.getElementById("assets")
	var _loaderPercentage
	var _errorCount=0
	
	this.run = function(){
		
		_loaderPercentage = document.querySelector("#loader .percentage")
		
		assets.fonts.forEach(function(name){
			var font = document.createElement("h1")
			font.style.fontFamily = name
			font.appendChild(document.createTextNode("I am a font"))
			_assetsDiv.appendChild(font)
			FontDetect.onFontLoaded (name, _this.assetLoaded, _this.errorMsg, {msTimeout: 90000});
		});
		
		assets.img.forEach(function(name){
			var id = name.substr(0, name.length-4);
			var image = document.createElement("img")
			image.addEventListener("load", event=>{
				_this.assetLoaded();
			})
			image.id = name
			image.src = "/assets/img/" + name
			_assetsDiv.appendChild(image)
			assets.image[id] = image
		});
		
		assets.audio.forEach(function(name){
			var id = name.substr(0, name.length-4);
			assets.sounds[id] = new Audio();
			assets.sounds[id].muted = true;
			assets.sounds[id].playAsset = function(){
				try{
					assets.sounds[id].muted = false;
					assets.sounds[id].play()
				}catch(e){
					console.warn(e)
				}
			}
			assets.sounds[id].onloadeddata = function(){
				_this.assetLoaded();
			};
			assets.sounds[id].src = '/assets/audio/'+name;
			assets.sounds[id].load();
		});
		
		$.ajax({
			url: "/api/songs",
			mimeType: "application/json",
			success: function(songs){
				assets.songs = songs;
				_this.assetLoaded();
			},
			error: _this.errorMsg
		});
		
	}
	
	this.errorMsg = function(){
		if(_errorCount == 0){
			_loaderPercentage.appendChild(document.createElement("br"))
			_loaderPercentage.appendChild(document.createTextNode("An error occured, please refresh"))
		}
		_errorCount++
	}
	
	this.assetLoaded = function(){
		_loadedAssets++;
		_percentage=parseInt((_loadedAssets*100)/_nbAssets);
		$("#loader .progress").css("width", _percentage+"%");
		_loaderPercentage.firstChild.data=_percentage+"%"
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