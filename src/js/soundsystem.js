function soundSystem(controller){
    
    var _this = this;
    var _speed=0;
    var _circles = [];
    var _circleID = -1;
    var _measures = [];
    var _channel_max = 10;// number of channels
    var _mainMusicChannel=-1;
    
	var _audiochannels = new Array();
	
	for (var a=0;a<_channel_max;a++) {// prepare the channels
		_audiochannels[a] = new Array();
		_audiochannels[a]['channel'] = new Audio();	// create a new audio object
		_audiochannels[a]['finished'] = -1;	// expected end time for this channel
	}
    
    this.playSound = function(soundID){
        
        if(soundID=="main-music" && _mainMusicChannel!=-1 && _mainMusicChannel.currentTime>0 ){//if music was paused but is going to be played
            _mainMusicChannel.play();
        }
        else{
            
            for(var i=0;i<_audiochannels.length;i++){

                var thistime = new Date();
                if (_audiochannels[i]['finished'] < thistime.getTime()) {// is this channel finished?
                    _audiochannels[i]['finished'] = thistime.getTime() + document.getElementById(soundID).duration*1000;
                    _audiochannels[i]['channel'].src = document.getElementById(soundID).src;
                    _audiochannels[i]['channel'].load();
                    _audiochannels[i]['channel'].play();

                    if(soundID=="main-music" && _mainMusicChannel==-1){
                        _mainMusicChannel=_audiochannels[i]['channel'];
                    }
                    break;
                }

            }
        }
    }
	
    this.pauseSound = function(soundID, stop){
        for (var i=0;i<_audiochannels.length;i++){
            if(_audiochannels[i]['channel'].src == document.getElementById(soundID).src){
                _audiochannels[i]['channel'].pause();
                if(stop) _audiochannels[i]['channel'].currentTime=0;
            }
        }
    }

    this.fadeOutMusic = function(){
        
        if(_mainMusicChannel.volume.toFixed(1)!=0.0){
            _mainMusicChannel.volume-=0.1;
        }
        else{
            _mainMusicChannel.pause();
            controller.fadeOutOver();
        }
    }
    
}