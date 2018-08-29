function View(controller, bg, title, diff){
    
    var _this = this;
    var _canvas = document.getElementById('canvas');
    var _ctx = _canvas.getContext('2d');
    
    var _winW = $(window).width();
    var _winH = $(window).height();

	/* Positionning and size variables */
    var _barH;
	var _barY;
	var _lyricsBarH;
    var _taikoW;
	var _taikoH;
	var _taikoX;
	var _taikoY;
    var _taikoSquareW = _winW/4;
	var _slotX = _taikoSquareW+100;;
	var _scoreSquareW;
	var _scoreSquareH;
	var _circleSize;
	var _bigCircleSize;
	var _circleY;
	var _lyricsSize;
	var _HPBarW;
	var _HPBarH;
	var _HPBarX;
	var _HPBarY;
	var _HPbarColX;
	var _HPbarColY;
	var _HPBarColMaxW;
	var _HPBarColH;7
	var _HPBarColWImage;
	var _HPBarColWCanvas;
	var _diffW;
	var _diffH;
	var _diffX;
	var _diffY;
	
	var _circleAnimatorT;
	var _animationStartPos;
    
    var _currentScore = 0;
	var _special="";
    var _scoreDispCount = -1;
	var _scoreOpacity = 1.0;
    
    var _mainTextColor = "white";
    var _mainFont = "normal 14pt TnT";
    
    var _lastMeasure = 0;
    var _currentTimingPoint=0;
    var _distanceForCircle=(_winW - _slotX); //Distance to be done by the circle
    var _timeForDistanceCircle;
	
    var _currentCircleFace=0;
	
	var _currentDonFace=0;
	var _currentBigDonFace=1;
	
	var _nextBeat=0;

	var _songTitle = title;
	var _songDifficulty = diff.split('.').slice(0, -1).join('.');
    
    this.run = function(){
		_ctx.font = _mainFont;
		_this.setBackground();

		$('.game-song').attr('alt', _songTitle).html(_songTitle);

        _this.refresh();
    }
	
	this.setBackground = function(){
		$("#game").css("background", "url('"+bg+"')");
		$("#game").css("-webkit-background-size", "cover");
		$("#game").css("-moz-background-size", "cover");
		$("#game").css("-o-background-size", "cover");
		$("#game").css("background-size", "cover");
	}
	
	this.getDistanceForCircle = function(){
		return _distanceForCircle;
	}
	
	this.positionning = function(){
		
		_winW = $(window).width();
        _winH = $(window).height();
        _canvas.width = _winW;
        _canvas.height = _winH;
		_barY = 0.25*_winH;
		_barH = 0.23*_winH;
		_lyricsBarH = 0.2*_barH;
		_taikoH = _barH;
    	_taikoW = _taikoH/1.2;
		_taikoX = _taikoSquareW-_taikoW-20;
		_taikoY = _barY+5;
    	_taikoSquareW = _winW/4;
		_slotX = _taikoSquareW+100;
		_scoreSquareW = 0.55*_taikoSquareW;
		_scoreSquareH = 0.25*_barH;
		_circleSize = 0.15*_barH;
		_bigCircleSize = 0.25*_barH;
		_circleY = (_barY+((_barH-_lyricsBarH)/2));
		_lyricsSize = 0.6*_lyricsBarH;
		_HPBarW = 2.475*_taikoSquareW;
		_HPBarH = 0.35*_barH;
		_HPBarX = _taikoSquareW+1.15*_taikoW;
		_HPBarY = _barY-_HPBarH;
		_HPbarColX = _HPBarX+0.008*_HPBarW;
		_HPbarColY = _HPBarY+0.14*_HPBarH;
		_HPBarColMaxW = _HPBarW-(0.075*_HPBarW);
		_HPBarColH = _HPBarH-(0.2*_HPBarH);
		_diffH = _winH * 0.16;
		_diffW = _winW * 0.11;
		_diffX = (_taikoX * 1.05)+15;
		_diffY = _taikoY * 0.10;

		var circles = controller.getCircles();
		var currentCircle = controller.getCurrentCircle();
		if(currentCircle==0){
			_HPBarColWImage = (controller.getGlobalScore().hp*650)/100;
       		_HPBarColWCanvas = (controller.getGlobalScore().hp*_HPBarColMaxW)/100;
		}
		else if(circles[currentCircle-1]){
			if(circles[currentCircle-1].isAnimationFinished() || circles[currentCircle-1].getScore()==0){
				_HPBarColWImage = (controller.getGlobalScore().hp*650)/100;
       			_HPBarColWCanvas = (controller.getGlobalScore().hp*_HPBarColMaxW)/100;
			}
		}

	}
    
    this.refresh = function(){
        
        _this.positionning();
        _distanceForCircle=(_winW - _slotX);
        _timeForDistanceCircle=((20*_distanceForCircle)/controller.getHitcircleSpeed());
        
        /* Draw */
        this.drawBar();
        this.drawSlot();
        this.drawMeasures();
		this.drawHPBar();
        this.drawCircles();
        this.drawTaikoSquare();
        this.drawScore();
        this.drawPressedKeys();
        this.drawCombo();
        this.drawGlobalScore();
        this.drawTime();
        this.drawDifficulty();
		
		this.updateDonFaces();//animate circle face when combo superior to 50
 
    }

	this.updateDonFaces = function(){
		
		if(controller.getEllapsedTime().ms>=_nextBeat){
			_nextBeat+=controller.getSongData().beatInfo.beatInterval;
			if(controller.getCombo()>=50){
				_currentBigDonFace=(_currentBigDonFace+1)%2;
				_currentDonFace=(_currentDonFace+1)%2;
			}
			else{
				_currentBigDonFace=1;
				_currentDonFace=0;
			}
		}
		
	}
    
    this.drawHPBar = function(){
     
		var bottomSquareX = _taikoSquareW;
		var borderSize = 0.2*_HPBarH;
		_ctx.fillStyle = "black";
		_ctx.beginPath();
		_ctx.fillRect(_HPBarX+_HPBarW-(0.2*_HPBarY), _HPBarY, 0.2*_HPBarW, _HPBarH);//right hand black square
		_ctx.fillRect(bottomSquareX+borderSize, _HPBarY+0.435*_HPBarH, 0.5*_HPBarW, _HPBarH/2);
		_ctx.fillRect(bottomSquareX, _HPBarY+0.68*_HPBarH, 0.8*_HPBarW, _HPBarH/4);
		_ctx.arc(bottomSquareX+borderSize,_HPBarY+(0.435*_HPBarH)+borderSize,borderSize,0,Math.PI*2);
		_ctx.fill();
		_ctx.closePath();
		
        var barBG = document.getElementById('hp-bar-bg');
        var barColour = document.getElementById('hp-bar-colour');

        _ctx.drawImage(barBG, _HPBarX, _HPBarY, _HPBarW, _HPBarH);
        _ctx.drawImage(barColour, 0, 0, Math.max(1, Math.floor(_HPBarColWImage)), 40, _HPbarColX, _HPbarColY, _HPBarColWCanvas, _HPBarColH);
		
    }
    
    this.drawMeasures = function(){
        
        var measures = controller.getSongData().measures;
        var currentTime = controller.getEllapsedTime().ms;
        
        measures.forEach(function(measure, index){
            if(currentTime>=measure.ms-_timeForDistanceCircle && currentTime<=measure.ms+350 && measure.nb==0){
                _this.drawMeasure(measure);
                measure.x-=controller.getHitcircleSpeed();
            }
            else{
                measure.x=_winW; //set initial position to the extreme right of the screen
            }
        });
        
    }
    
    this.drawMeasure = function(measure){
        _ctx.strokeStyle = "#bab8b8";
        _ctx.lineWidth = "5.0";
        _ctx.beginPath();
        _ctx.moveTo(measure.x, _barY+5);
        _ctx.lineTo(measure.x, _barY+_barH-_lyricsBarH-5);
        _ctx.closePath();
        _ctx.stroke();
    }

    this.drawCombo = function(){
		if(controller.getCombo()>=10){
			var comboY = _barY+(_barH/2);
			var fontSize = (0.4)*_taikoH;
			_ctx.font = "normal "+fontSize+"px TnT";
			_ctx.textAlign = "center";
			_ctx.strokeStyle = "black";
			_ctx.strokeText(controller.getCombo(), _taikoSquareW-20-(_taikoW/2), comboY);
			_ctx.fillStyle = "white";
			_ctx.fillText(controller.getCombo(), _taikoSquareW-20-(_taikoW/2), comboY);
			
			var fontSize = (0.12)*_taikoH;
			_ctx.font = "normal "+fontSize+"px TnT";
			_ctx.textAlign = "center";
			_ctx.strokeStyle = "black";
			_ctx.strokeText("コンボ", _taikoSquareW-20-(_taikoW/2), comboY+1.5*fontSize);
			_ctx.fillStyle = "white";
			_ctx.fillText("コンボ", _taikoSquareW-20-(_taikoW/2), comboY+1.5*fontSize);
			_scoreDispCount++;
		}
    }
    
    this.drawGlobalScore = function(){
		
		/* Draw score square */
		_ctx.fillStyle="black";
		_ctx.beginPath();
		_ctx.fillRect(0,_barY,_scoreSquareW,_scoreSquareH-10);
		_ctx.fillRect(0,_barY,_scoreSquareW-10,_scoreSquareH);
		_ctx.arc(_scoreSquareW-10,_barY+(_scoreSquareH-10),10,0,Math.PI*2);
		_ctx.fill();
		_ctx.closePath();
		
		var fontSize = 0.7*_scoreSquareH;
		/* Draw score text */
		_ctx.font = "normal "+fontSize+"px TnT";
        _ctx.fillStyle = "white";
		_ctx.textAlign = "right";
        _ctx.fillText(controller.getGlobalScore().points, _scoreSquareW-20, _barY+0.7*_scoreSquareH);
    }
    
    this.drawPressedKeys = function(){

		var keyRed = document.getElementById("taiko-key-red");
		var keyBlue = document.getElementById("taiko-key-blue");
        var keys = controller.getKeys()
        var kbd = controller.getBindings()
 
		if(keys[kbd["ka_l"]]){
			var elemW = 0.45*_taikoW;
			_ctx.drawImage(keyBlue, 0, 0, 68, 124, _taikoX+0.05*_taikoW, _taikoY+0.03*_taikoH, elemW, (124/68)*elemW);
        }
		
        if(keys[kbd["don_l"]]){
			var elemW = 0.35*_taikoW;
            _ctx.drawImage(keyRed, 0, 0, 53, 100, _taikoX+0.15*_taikoW, _taikoY+0.09*_taikoH, elemW, (100/53)*elemW);
        }
    
        if(keys[kbd["don_r"]]){
			var elemW = 0.35*_taikoW;
            _ctx.drawImage(keyRed, 53, 0, 53, 100, (_taikoX+0.15*_taikoW)+elemW, _taikoY+0.09*_taikoH, elemW, (100/53)*elemW);
        }
    
        if(keys[kbd["ka_r"]]){
			var elemW = 0.45*_taikoW;
            _ctx.drawImage(keyBlue, 68, 0, 68, 124, (_taikoX+0.05*_taikoW)+elemW, _taikoY+0.03*_taikoH, elemW, (124/68)*elemW);
        }
        
    }
    
    this.displayScore = function(score, notPlayed){
        _currentScore=score;
		_special = (notPlayed) ? "-b" : "";
        _scoreDispCount=0;
		_scoreOpacity=1.0;
    }
    
    this.drawScore = function(){

		if(_scoreDispCount>=0 && _scoreDispCount<=20){
			_ctx.globalAlpha = _scoreOpacity;
			var scoreIMG = document.getElementById("score-"+_currentScore+_special);
			_ctx.drawImage(scoreIMG, _slotX-(_barH/2), (_barY+((_barH-_lyricsBarH)/2))-(_barH/2), _barH, _barH);
			_scoreDispCount++;
			if(_scoreOpacity-0.1>=0 && _currentScore!=0) _scoreOpacity-=0.1;
		}
		else if(_scoreDispCount==21){
			_scoreDispCount=-1;
		}
		_ctx.globalAlpha=1;
	
    }
    
    this.drawCircles = function(){
        
        var circles = controller.getCircles();
        circles.forEach(function(circle){
            
			var currentTime = controller.getEllapsedTime().ms;
            var startingTime = circle.getMS()-_timeForDistanceCircle;
            var finishTime = circle.getMS()+100; //at circle.getMS(), the cirlce fits the slot
			
            if(!circle.getPlayed()){

				if(currentTime <= startingTime){
					var initPoint = {x:_winW, y:_circleY};
					circle.setInitPos(initPoint); //set initial position to the extreme right of the screen
				}
                if(currentTime > startingTime && currentTime <= finishTime){
                    _this.drawCircle(circle);
                    circle.move(controller.getHitcircleSpeed());
                }
  
            }
			else{ //Animate circle to the HP bar
				
				var animationDuration=470; //ms
				
				if(currentTime>finishTime && !circle.isAnimated() && circle.getScore()!=0){
					circle.animate();//start animation to HP bar
					_animationStartPos=circle.getPos().x;
					_this.drawCircle(circle);
				}
				else if(currentTime>finishTime && currentTime<=finishTime+animationDuration && circle.isAnimated()){
					
					var curveDistance = (_HPbarColX+_HPBarColWCanvas)-_animationStartPos;
					var circleBezP0={
						x:_animationStartPos,
						y:_circleY
					};

					var circleBezP1={
						x:_animationStartPos+(0.25*curveDistance),
						y:0.5*_barH
					};

					var circleBezP2={
						x:_animationStartPos+(0.75*curveDistance),
						y:-_barH
					};

					var circleBezP3={
						x:_animationStartPos+curveDistance,
						y:_HPbarColY
					};
					var bezierPoint = _this.calcBezierPoint(circle.getAnimT(), circleBezP0, circleBezP1, circleBezP2, circleBezP3);
					circle.moveTo(bezierPoint.x, bezierPoint.y);
					_this.drawCircle(circle);
					
					if(currentTime>=circle.getLastFrame()){//update animation frame
						circle.incAnimT();
						circle.incFrame();
					}
				}
				else if(currentTime>finishTime+animationDuration  && circle.isAnimated()){
					circle.endAnimation();
				}
			}
        });
        
    }
	
	this.calcBezierPoint = function(t, p0, p1, p2, p3){
		
		var data = [p0, p1, p2, p3];
		var at = 1-t;
		
		for(var i=1; i<data.length; i++){
			for(var k=0; k<data.length-i; k++){
				data[k] = {
					x: data[k].x * at + data[k+1].x *t,
					y: data[k].y * at + data[k+1].y *t
				};
			}
		}
		
		return data[0];
	}
    
    this.drawCircle = function(circle){
        
        var size, color, txt;
        var offsetBigY=0;
        var suppBig=0;
		var faceID;
		
        switch(circle.getType()){
            
            case 'don':
                color = "#f54c25";
                size = _circleSize;
                txt = "ドン";
				faceID = "don-"+_currentDonFace;
                break;
                
            case 'ka':
                color = "#75CEE9";
                size = _circleSize;
                txt="カッ";
				faceID = "don-"+_currentDonFace;
                break;
                
            case 'daiDon':
                color = "#f54c25";
                size = _bigCircleSize;
                txt = "ドン(大）";
                offsetBigY=5;
                suppBig=10;
				faceID = "big-don-"+_currentBigDonFace;
                break;
                
            case 'daiKa':
                color = "#75CEE9";
                size = _bigCircleSize;
                txt="カッ(大）";
                offsetBigY=5;
                suppBig=10;
				faceID = "big-don-"+_currentBigDonFace;
                break;
                
        }

        //Main circle
        _ctx.fillStyle = color;
        _ctx.beginPath();
        _ctx.arc(circle.getPos().x, circle.getPos().y, size, 0, 2*Math.PI);
        _ctx.closePath();
        _ctx.fill();

        //Face on circle
        var face = document.getElementById(faceID);
        _ctx.drawImage(face, circle.getPos().x-size-2, circle.getPos().y-size-4, (size*2)+5, (size*2)+6);
            
		if(!circle.isAnimated()){
			//text
			_ctx.font = "normal bold "+_lyricsSize+"px Kozuka";
			_ctx.textAlign = "center";
			_ctx.strokeStyle = "black";
			_ctx.strokeText(txt, circle.getPos().x+size/2, _barY+_barH-(0.3*_lyricsBarH));
			_ctx.fillStyle = "white";
			_ctx.fillText(txt, circle.getPos().x+size/2, _barY+_barH-(0.3*_lyricsBarH));
		}
        
    }
    
    this.togglePauseMenu = function(){
        $("#pause-menu").is(":visible") ? $("#pause-menu").hide() : $("#pause-menu").show();
    }

    this.drawDifficulty = function(){
    	var muzu = document.getElementById('muzu_' + _songDifficulty);
    	_ctx.drawImage(muzu, _diffY, _diffX, _diffW, _diffH);
    };
    
    this.drawTime = function(){
        
        var time = controller.getEllapsedTime();
        
        _ctx.globalAlpha = 0.7;
        _ctx.fillStyle = "black";
        _ctx.fillRect(_winW-110, _winH-60, _winW, _winH);
        
        _ctx.globalAlpha = 1.0;
        _ctx.fillStyle = "white";
        
        var formatedH = ('0' + time.hour).slice(-2);
        var formatedM = ('0' + time.min).slice(-2);
        var formatedS = ('0' + time.sec).slice(-2);
        
		_ctx.font = "normal "+_barH/12+"px Kozuka";
        _ctx.fillText(formatedH+':'+formatedM+':'+formatedS, _winW-10, _winH-30);
        _ctx.fillText(time.ms, _winW-10, _winH-10);
        
    }
    
    this.drawBar = function(){
    
        var grd;
        if(controller.getKeys()[86] || controller.getKeys()[66]){ //keys v, b
            grd = _ctx.createLinearGradient(0, _barY, _winW, _barH);
            grd.addColorStop(0,"#f54c25");
            grd.addColorStop(1,"#232323");
        }
        else if(controller.getKeys()[67] || controller.getKeys()[78]){ //keys c, n
            grd = _ctx.createLinearGradient(0, _barY, _winW, _barH);
            grd.addColorStop(0,"#75CEE9");
            grd.addColorStop(1,"#232323");
        }
        else{
            grd="#232323";
        }
    
	   _ctx.strokeStyle = "black";
	   _ctx.fillStyle = grd;
	   _ctx.lineWidth = 10;
	   _ctx.beginPath();
	   _ctx.rect(0,_barY,_winW,_barH);
	   _ctx.closePath();
	   _ctx.fill();
	   _ctx.stroke();
	
	   /* Lyrics bar */
	   _ctx.fillStyle = "#888888";
	   _ctx.beginPath();
	   _ctx.rect(0,_barY+_barH-_lyricsBarH,_winW,_lyricsBarH);
	   _ctx.closePath();
	   _ctx.fill();
	   _ctx.stroke();


    }

    this.drawSlot = function(){
    
        /* Main circle */
        var normalSize = _circleSize-(0.2*_circleSize);
        _ctx.fillStyle = "#6f6f6e";
        _ctx.beginPath();
        _ctx.arc(_slotX, _circleY, normalSize,0,2*Math.PI);
        _ctx.closePath();
        _ctx.fill();
    
        /* Big stroke circle */
        var bigSize = _circleSize;
        _ctx.strokeStyle = "#9e9f9f";
        _ctx.lineWidth = 3;
        _ctx.beginPath();
        _ctx.arc(_slotX, _circleY, bigSize,0,2*Math.PI);
        _ctx.closePath();
        _ctx.stroke();
		
		/* Bigger stroke circle */
        var bigSize = _bigCircleSize;
        _ctx.strokeStyle = "#6f6f6e";
        _ctx.lineWidth = 3;
        _ctx.beginPath();
        _ctx.arc(_slotX, _circleY, bigSize,0,2*Math.PI);
        _ctx.closePath();
        _ctx.stroke();
    
    }

    this.drawTaikoSquare = function(){
		
        /* Taiko square */
        _ctx.lineWidth = 7;
	    _ctx.fillStyle = "#ff3c00";
        _ctx.strokeStyle = "black";
	    _ctx.beginPath();
	    _ctx.rect(0,_barY, _taikoSquareW,_barH);
	    _ctx.fill();
	    _ctx.closePath();
	    _ctx.stroke();
		
		var taiko = document.getElementById("taiko");
		_ctx.drawImage(taiko, _taikoX, _taikoY, _taikoW, _taikoH);

    }

}