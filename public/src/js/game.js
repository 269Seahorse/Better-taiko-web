function Game(controller, selectedSong, songData){
    
    var _this = this;
    var _selectedSong = selectedSong;
    this.elapsedTime = {} //current time in ms from the beginning of the song
    var _offsetDate; //date when the chrono is started (before the game begins)
    var _startDate; //real start date (when the chrono will be 0)
    var _currentDate; // refreshed date
    var _songData=songData;
    var _currentCircle=0;
    var _currentScore=0;
    var _combo=0;
    var _globalScore={points:0, great:0, good:0, fail:0, maxCombo:0, hp:0, song:selectedSong.title};
    var _HPGain= 100/_songData.circles.length;
    var _paused=false;
    var _started=false;
    var _mainMusicPlaying=false;
    var _latestDate;
    var _elapsedTimeSincePause=0;
    var _musicFadeOut=0;
    var _fadeOutStarted=false;
    var _currentTimingPoint=0;
    var _offsetTime=0;
    var _hitcircleSpeed=_songData.difficulty.sliderMultiplier*8;
    var _timeForDistanceCircle;
    var _mainAsset
    assets.songs.forEach(song => {
        if(song.id == selectedSong.folder){
            _mainAsset = song.sound
        }
    })
    
    this.run = function(){
        _timeForDistanceCircle=2500
        _this.initTiming();
    }
    
    this.initTiming = function(){
        _offsetDate = new Date();
        _this.setElapsedTime(-_timeForDistanceCircle |0)
        _offsetTime = _timeForDistanceCircle |0
        _startDate = new Date();
        // The real start for the game will start when chrono will reach 0
        _startDate.setMilliseconds(_startDate.getMilliseconds()+_offsetTime);
    }
    
    this.update = function(){
        
        // Main operations
        _this.updateTime();
        _this.checkTiming();
        _this.updateCirclesStatus();
        _this.checkPlays();
        
        // Event operations
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
                
                var currentTime = _this.getElapsedTime().ms;
                var startingTime = circle.getMS()-_timeForDistanceCircle;
                // At circle.getMS(), the circle fits the slot
                var finishTime = circle.getMS();

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
                    if(controller.multiplayer != 2){
                        circle.updateStatus(-1);
                        _currentScore=0;
                        circle.played(_currentScore);
                        controller.displayScore(_currentScore, true);
                        _this.updateCurrentCircle();
                        _this.updateCombo(_currentScore);
                        _this.updateGlobalScore(_currentScore);
                    }
                    if(controller.multiplayer == 1){
                        p2.send("note", {
                            score: -1
                        })
                    }

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
            if(controller.autoPlayEnabled){
                return controller.autoPlay(circle)
            }
            var keys = controller.getKeys()
            var kbd = controller.getBindings()
            if(keys[kbd["don_l"]]){
                _this.checkKey(kbd["don_l"], circle)
            }
            if(keys[kbd["don_r"]]){
                _this.checkKey(kbd["don_r"], circle)
            }
            if(keys[kbd["ka_l"]]){
                _this.checkKey(kbd["ka_l"], circle)
            }
            if(keys[kbd["ka_r"]]){
                _this.checkKey(kbd["ka_r"], circle)
            }
        }

    }
    
    this.checkKey = function(keyCode, circle){
        if(!circle.getPlayed() && !controller.isWaitingForKeyup(keyCode, "score") && circle.getStatus()!=-1){
            var score = _this.checkScore(circle);
            circle.played(score);
            _this.updateCurrentCircle();
            controller.waitForKeyup(keyCode, "score");
            if(controller.multiplayer == 1){
                p2.send("note", {
                    score: score,
                    ms: circle.getMS() - _this.getElapsedTime().ms
                })
            }
        }
    }
    
    this.checkScore = function(circle){
        
        var keys = controller.getKeys()
        var kbd = controller.getBindings()
        
        if(
            ((keys[kbd["don_l"]] || keys[kbd["don_r"]]) && (circle.getType()=="don" || circle.getType()=="daiDon")) ||
            ((keys[kbd["ka_l"]] || keys[kbd["ka_r"]]) && (circle.getType()=="ka" || circle.getType()=="daiKa"))
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
        if(!_fadeOutStarted && _this.getElapsedTime().ms>=lastCircle.getMS()+2000){
            _fadeOutStarted=_this.getElapsedTime().ms
        }
    }

    this.whenFadeoutMusic = function(){
        if(_fadeOutStarted){
            if(_musicFadeOut==0){
                snd.musicGain.fadeOut(1.6)
                _musicFadeOut++
                if(controller.multiplayer == 1){
                    p2.send("gameend")
                }
            }
            if(_musicFadeOut==1 && _this.getElapsedTime().ms>=_fadeOutStarted+1600){
                controller.fadeOutOver()
                _mainAsset.stop()
                _musicFadeOut++
                setTimeout(() => {
                    snd.musicGain.fadeIn()
                    snd.musicGain.unmute()
                }, 1000)
            }
        }
    }
    
    this.checkTiming = function(){
        
        if(_songData.timingPoints[_currentTimingPoint+1]){
            if(_this.getElapsedTime().ms>=_songData.timingPoints[_currentTimingPoint+1].start){
                _currentTimingPoint++;
            }
        }
    }
    
    this.getCurrentTimingPoint = function(){
        return _songData.timingPoints[_currentTimingPoint];
    }
    
    this.playMainMusic = function(){
        var ms = _this.getElapsedTime().ms
        if(!_mainMusicPlaying && (!_fadeOutStarted || ms<_fadeOutStarted+1600)){
            if(controller.multiplayer != 2){
                _mainAsset.play((ms < 0 ? -ms : 0) / 1000, false, Math.max(0, ms / 1000));
            }
            _mainMusicPlaying=true;
        }
    }

    this.fadeOutOver = function(){
        
    }
    
    this.getHitcircleSpeed = function(){
        return _hitcircleSpeed;
    }
    
    this.togglePause = function(){
        if(!_paused){
            assets.sounds["pause"].play();
            _paused=true;
            _latestDate = new Date();
            _mainAsset.stop();
            _mainMusicPlaying=false;
            
        }
        else{
            assets.sounds["cancel"].play();
            _paused=false;
            var currentDate = new Date();
            _elapsedTimeSincePause = _elapsedTimeSincePause + currentDate.getTime() - _latestDate.getTime();
        }
    }

    this.isPaused = function(){
        return _paused;
    }
    
    this.getElapsedTime = function(){
        return this.elapsedTime;
    }
    
    this.setElapsedTime = function(time){
        this.elapsedTime.ms = time
        this.elapsedTime.sec = (this.elapsedTime.ms / 1000 |0) % 60
        this.elapsedTime.min = (this.elapsedTime.ms / 1000 / 60 |0) % 60
        this.elapsedTime.hour = (this.elapsedTime.ms / 1000 / 60 / 60 |0) % 60
    }
    
    this.updateTime = function(){
        _currentDate = new Date();
        var time = _this.getElapsedTime()
        
        if(time.ms<0){
            _this.setElapsedTime(_currentDate.getTime() - _startDate.getTime() - _elapsedTimeSincePause)
        }
        else if(time.ms>=0 && !_started){
            _startDate = new Date();
            _elapsedTimeSincePause = 0;
            _this.setElapsedTime(_currentDate.getTime() - _startDate.getTime())
            _started=true;
        }
        else if(time.ms>=0 && _started){
            _this.setElapsedTime(_currentDate.getTime() - _startDate.getTime() - _elapsedTimeSincePause)
        }
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
                controller.playSoundMeka("combo-50");
                break;
            case 100:
                controller.playSoundMeka("combo-100");
                break;
            case 200:
                controller.playSoundMeka("combo-200");
                break;
            case 300:
                controller.playSoundMeka("combo-300");
                break;
            case 400:
                controller.playSoundMeka("combo-400");
                break;
            case 500:
                controller.playSoundMeka("combo-500");
                break;
            case 600:
                controller.playSoundMeka("combo-600");
                break;
            case 700:
                controller.playSoundMeka("combo-700");
                break;
            case 800:
                controller.playSoundMeka("combo-800");
                break;
            case 900:
                controller.playSoundMeka("combo-900");
                break;
            case 1000:
                controller.playSoundMeka("combo-1000");
                break;
            case 1100:
                controller.playSoundMeka("combo-1100");
                break;
            case 1200:
                controller.playSoundMeka("combo-1200");
                break;
            case 1300:
                controller.playSoundMeka("combo-1300");
                break;
            case 1400:
                controller.playSoundMeka("combo-1400");
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