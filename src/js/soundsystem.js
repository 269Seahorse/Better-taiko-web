function soundSystem(controller){
    
    var _this = this;
    var _speed=0;
    var _circles = [];
    var _circleID = -1;
    var _measures = [];
    var _sounds = assets.sounds;
	var _channels=[];
	var _channelMAX=20;
	
	for (var i=0;i<_channelMAX;i++) {// prepare the channels
		_channels[i] = {};
		_channels[i]["end"] = -1; 
		_channels[i]["audio"] = new Audio();
	}
	
	this.playSound = function(soundID){
		
		for(var i=0;i<_channelMAX;i++){ //play in different sounds in different channels
			var now = new Date();
			if (_channels[i]["end"] < now.getTime()) {// is this channel finished?
				_channels[i]["end"] = now.getTime() + _sounds[soundID].duration*1000;
				_channels[i]["audio"].src = _sounds[soundID].src;
				_channels[i]["audio"].load();
				_channels[i]["audio"].play();
				break;
			}
		}

	}
	
	this.pauseSound = function(soundID, stop){
		_sounds[soundID].pause();
		if(stop) _sounds[soundID].currentTime=0;
	}

    this.fadeOutMusic = function(){
        
        if(_sounds["main-music"].volume.toFixed(1)!=0.0){
            _sounds["main-music"].volume-=0.1;
        }
        else{
            _sounds["main-music"].pause();
            controller.fadeOutOver();
        }
    }
    
}