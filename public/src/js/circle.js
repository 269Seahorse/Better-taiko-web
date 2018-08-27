function Circle(id, ms, type){
    
    var _id=id;
    var _ms = ms;
    var _type = type;
    var _played = false;
    var _pos={x:0, y:0};
	var _animating = false;
	var _animT = 0;
	var _score=0;
	var _lastFrame = ms+100;
	var _animationEnded = false;
    
    var played=false; //if cirlce has been played
    var _status=-1; //check if circle is playable
    
    // -1 : Not playable
    // 0 : Playable, giving 0 points if played at current time (fail)
    // 50 : Playable, giving 50 points if played at current time (pass)
    // 100 : Playable, giving 100 points if played at current time (good)

    this.getMS = function(){
        return _ms;
    }
    
    this.getType = function(){
        return _type;
    }
	
	this.getLastFrame = function(){
		return _lastFrame;
	}
	
	this.incFrame = function(){
		_lastFrame+=20;
	}
	
	this.animate = function(){
		_animating=true;
	}
	
	this.isAnimated = function(){
		return _animating;
	}
    
    this.setInitPos = function(initPos){
        _pos.x = initPos.x;   
		_pos.y = initPos.y
    }
    
    this.move = function(pxPerFrame){
        _pos.x -= pxPerFrame;
    }
	
	this.getAnimT = function(){
		return _animT;
	}
	
	this.incAnimT = function(){
		_animT+=0.05;	
	}
	
	this.moveTo = function(x, y){
		_pos.x=x;
		_pos.y=y;
	}
    
    this.getPos = function(){
        return _pos;
    }
    
    this.updateStatus = function(status){
        _status=status;
    }
    
    this.getStatus = function(){
        return _status;
    }
    
    this.getPlayed = function(){
        return _played;
    }
	
	this.isAnimationFinished = function(){
		return _animationEnded;
	}
	
	this.endAnimation = function(){
		_animationEnded = true;
	}
    
    this.played = function(score){
		_score=score;
        _played=true;
    }
	
	this.getScore = function(){
		return _score;
	}
    
    this.getID = function(){
        return _id;
    }
}