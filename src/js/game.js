function Game(controller, selectedSong, songData){
    
    var _this = this;
    var _selectedSong = selectedSong;
    var _ellapsedTime; //current time in ms from the beginning of the song
    var _offsetDate; //date when the chrono is started (before the game begins)
    var _startDate; //real start date (when the chrono will be 0)
    var _currentDate; // refreshed date
	var _soundSystem = new soundSystem(controller);
    var _songData=songData;
    var _currentCircle=0;
    var _currentScore=0;
    var _combo=0;
    var _globalScore={points:0, great:0, good:0, fail:0, maxCombo:0, hp:0};
    var _HPGain= 100/_songData.circles.length;
    var _paused=false;
    var _started=false;
    var _mainMusicPlaying=true;
    var _latestDate;
    var _ellapsedTimeSincePause=0;
    var _musicFadeOut=0;
    var _fadeOutStarted=false;
    var _currentTimingPoint=0;
    var _offsetTime=0;
	var _hitcircleSpeed=_songData.difficulty.sliderMultiplier*8;
	var _timeForDistanceCircle;
    
    this.run = function(){
		_timeForDistanceCircle=((20*controller.getDistanceForCircle())/_hitcircleSpeed);
		_this.initTiming();
    }
    
    this.initTiming = function(){
        
        _offsetDate = new Date();
	        
        _ellapsedTime = {
            ms:-parseInt(_timeForDistanceCircle),
            sec:0,
            min:0,
            hour:0
        }
        _offsetTime = parseInt(_timeForDistanceCircle);
        _startDate = new Date();
        _startDate.setMilliseconds(_startDate.getMilliseconds()+_offsetTime); //The real start for the game will start when chrono will reach 0
        
    }
    
    this.update = function(){
        
        /* Main operations */
        _this.updateTime();
        _this.checkTiming();
        _this.updateCirclesStatus();
        _this.checkPlays();
        
        /* Event operations */
        _this.whenFadeoutMusic();
        _this.whenLastCirclePlayed();
      
    }
	
	this.getCircles = function(){
		return _songData.circles;
	}
    
    this.updateCirclesStatus = function(){
        
        var circles = _songData.circles;
        
        circles.forEach(function(circle){
            
            if(!circle.getPlayed()){
                
                var currentTime = _ellapsedTime.ms;
                var startingTime = circle.getMS()-_timeForDistanceCircle;
                var finishTime = circle.getMS(); //at circle.getMS(), the cirlce fits the slot

                if( currentTime >= startingTime && currentTime <= finishTime+200){

					if(currentTime>= finishTime-50 && currentTime < finishTime-30){
                        circle.updateStatus(0);
                    }
                    else if(currentTime>= finishTime-30 && currentTime < finishTime){
                        circle.updateStatus(230);
                    }
                    else if(currentTime >= finishTime && currentTime < finishTime+200){
                        circle.updateStatus(450);
                    }

                }
                else if(currentTime>finishTime+200 && currentTime<=finishTime+300){

                    circle.updateStatus(-1);
					_currentScore=0;
                    circle.played(_currentScore);
                    controller.displayScore(_currentScore, true);
                    _this.updateCurrentCircle();
                    _this.updateCombo(_currentScore);
                    _this.updateGlobalScore(_currentScore);

                }
  
            }
   
        });
        
    }
    
    this.setHPGain = function(gain){
        _HPGain=gain;
    }
    
    this.checkPlays = function(){
        
        var circles = _songData.circles;	
        var circle = circles[_currentCircle];

        if(circle){

            if(controller.getKeys()[86]){
                if(!circle.getPlayed() && !controller.isWaitingForKeyup(86, "score") && circle.getStatus()!=-1){
                    var score = _this.checkScore(circle);
                    circle.played(score);
                    _this.updateCurrentCircle();
                    controller.waitForKeyup(86, "score");
                }
            }
            if(controller.getKeys()[66]){
                if(!circle.getPlayed() && !controller.isWaitingForKeyup(66, "score") && circle.getStatus()!=-1){
                    var score = _this.checkScore(circle);
                    circle.played(score);
                    _this.updateCurrentCircle();
                    controller.waitForKeyup(66, "score");
                }
            }
            if(controller.getKeys()[67]){
                if(!circle.getPlayed() && !controller.isWaitingForKeyup(67, "score") && circle.getStatus()!=-1){
                    var score = _this.checkScore(circle);
                    circle.played(score);
                    _this.updateCurrentCircle();
                    controller.waitForKeyup(67, "score");
                }
            }
            if(controller.getKeys()[78]){
                if(!circle.getPlayed() && !controller.isWaitingForKeyup(78, "score") && circle.getStatus()!=-1){
                    var score = _this.checkScore(circle);
                    circle.played(score);
                    _this.updateCurrentCircle();
                    controller.waitForKeyup(78, "score");
                }
            }
           
        }

    }
    
    this.checkScore = function(circle){
        
        if(
            ((controller.getKeys()[86] || controller.getKeys()[66]) && (circle.getType()=="don" || circle.getType()=="daiDon")) || 
            ((controller.getKeys()[67] || controller.getKeys()[78]) && (circle.getType()=="ka" || circle.getType()=="daiKa"))
        ){
             
            switch(circle.getStatus()){

                case 230:
                    _currentScore=230;
                    break;

                case 450:
                    _currentScore=450;
                    break;

            }
			controller.displayScore(_currentScore);

        }
        else{
            _currentScore=0;
			controller.displayScore(_currentScore, true);
        }
        
        
        _this.updateCombo(_currentScore);
        _this.updateGlobalScore(_currentScore);
		return _currentScore;
    }
        
    this.whenLastCirclePlayed = function(){
        var circles = _songData.circles;
        var lastCircle = circles[_songData.circles.length-1];
        if(_ellapsedTime.ms>=lastCircle.getMS()+2000){
            _fadeOutStarted=true;
        }
    }
    
    this.whenFadeoutMusic = function(){
        if(_fadeOutStarted){
            if(_musicFadeOut%8==0){
                _soundSystem.fadeOutMusic();
                _musicFadeOut++;
            }
            else{
                _musicFadeOut++;
            }
        }
    }
    
    this.checkTiming = function(){
        
        if(_songData.timingPoints[_currentTimingPoint+1]){
            if(_this.getEllapsedTime().ms>=_songData.timingPoints[_currentTimingPoint+1].start){
                _currentTimingPoint++;
            }
        }
    }
    
    this.getCurrentTimingPoint = function(){
        return _songData.timingPoints[_currentTimingPoint];
    }
    
    this.toggleMainMusic = function(){
        if(_mainMusicPlaying){
            _soundSystem.pauseSound("main-music", false);
            _mainMusicPlaying=false;
        }
        else{
            _soundSystem.playSound("main-music");
            _mainMusicPlaying=true;
        }
    }

    this.fadeOutOver = function(){
        _fadeOutStarted=false;
    }
    
    this.playSound = function(soundID){
        _soundSystem.playSound(soundID);
    }
    
    this.pauseSound = function(soundID, stop){
        _soundSystem.pauseSound(soundID, stop);
    }
    
    this.getHitcircleSpeed = function(){
        return _hitcircleSpeed;
    }
    
    this.togglePause = function(){
        if(!_paused){
            _paused=true;
            _latestDate = new Date();
            _this.toggleMainMusic();
            
        }
        else{
           _paused=false;
            var currentDate = new Date();
            _ellapsedTimeSincePause = _ellapsedTimeSincePause + Math.abs(currentDate.getTime() - _latestDate.getTime());
            _this.toggleMainMusic(); 
        }
    }

    this.isPaused = function(){
        return _paused;
    }
    
    this.getEllapsedTime = function(){
        return _ellapsedTime;
    }
    
    this.updateTime = function(){
 
        _currentDate = new Date();
        
        if(_ellapsedTime.ms<0){
            _ellapsedTime.ms = _currentDate.getTime() - _startDate.getTime();
        }
        else if(_ellapsedTime.ms>=0 && !_started){
            _startDate = new Date();
            _ellapsedTime.ms = Math.abs(_startDate.getTime() -  _currentDate.getTime());
            _started=true;
        }
        else if(_ellapsedTime.ms>=0 && _started){
            _ellapsedTime.ms = Math.abs(_startDate.getTime() -  _currentDate.getTime()) - _ellapsedTimeSincePause;
        }
        
        _ellapsedTime.sec = parseInt(_ellapsedTime.ms / 1000) % 60;
        _ellapsedTime.min = parseInt(_ellapsedTime.ms / (1000 * 60)) % 60; 
        _ellapsedTime.hour = parseInt(_ellapsedTime.ms / (1000 * 60 * 60)) % 60; 
        
    }
    
    this.getCircles = function(){
        return _songData.circles;
    }
    
    this.getSongData = function(){
        return _songData;
    }
    
    this.updateCurrentCircle = function(){
        _currentCircle++; 
    }
    
    this.getCurrentCircle = function(){
        return _currentCircle;
    }
    
    this.updateCombo = function(score){
        
        (score!=0) ? _combo++ : _combo=0;
        
        if(_combo>_globalScore.maxCombo) _globalScore.maxCombo = _combo;
        
        switch(_combo){
            case 50:
                controller.playSound("combo-50");
                break;
            case 100:
                controller.playSound("combo-100");
                break;
            case 200:
                controller.playSound("combo-200");
                break;
            case 300:
                controller.playSound("combo-300");
                break;
            case 400:
                controller.playSound("combo-400");
                break;
            case 500:
                controller.playSound("combo-500");
                break;
            case 600:
                controller.playSound("combo-600");
                break;
            case 700:
                controller.playSound("combo-700");
                break;
        }
    }
    
    this.getCombo = function(){
        return _combo;
    }
    
    this.getGlobalScore = function(){
        return _globalScore;
    }
    
    this.updateGlobalScore = function(score){

        /* Circle score */
        switch(score){
            case 450:
                _globalScore.great++;
                break;
            case 230:
                _globalScore.good++;
                break;
            case 0:
                _globalScore.fail++;
                break;
        }
        
        /* HP Update */
        if(score!=0){
            _globalScore.hp+=_HPGain;
        }
        else{
            if(_globalScore.hp-_HPGain>0)
                 _globalScore.hp-=_HPGain;
            else
                _globalScore.hp=0;
        }
        
        /* Points update */
        if(_combo>=11 && _combo<=20){
            score+=100;
        }
		else if(_combo>=21 && _combo<=30){
			score+=200;
		}
		else if(_combo>=31 && _combo<=40){
			score+=300;
		}
		else if(_combo>=41 && _combo<=50){
			score+=400;
		}
		else if(_combo>=51 && _combo<=60){
			score+=500;
		}
		else if(_combo>=61 && _combo<=70){
			score+=500;
		}
		else if(_combo>=71 && _combo<=80){
			score+=600;
		}
		else if(_combo>=81 && _combo<=90){
			score+=700;
		}
		else if(_combo>=91 && _combo<=100){
			score+=800;
		}
        
		_globalScore.points+=score;
        
    }
    
}