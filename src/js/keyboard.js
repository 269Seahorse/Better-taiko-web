function Keyboard(controller){
 
    var _this = this;
    var _keys = {};
    var _waitKeyupScore = {};
    var _waitKeyupSound = {};
    var _waitKeyupMenu = {};
    
    $(document).keydown(function(e){
        
        if (e.which === 8 && !$(e.target).is("input, textarea"))//disable back navigation when pressing backspace
            e.preventDefault();
        
        _keys[e.which]=true;
    });
        
    $(document).keyup(function(e){
        delete _keys[e.which];
        delete _waitKeyupScore[e.which];
        delete _waitKeyupSound[e.which];
        delete _waitKeyupMenu[e.which];
    });
    
    this.checkGameKeys = function(){

        if(_keys[86] && !_this.isWaitingForKeyup(86, "sound")){//if press v, play 'don' sound
            controller.playSound('don');
            _this.waitForKeyup(86, "sound");
        }
        if(_keys[66] && !_this.isWaitingForKeyup(66, "sound")){//if press b, play 'don' sound
            controller.playSound('don');
            _this.waitForKeyup(66, "sound");
        }
        
        if(_keys[67] && !_this.isWaitingForKeyup(67, "sound")){//if press c, play 'ka' sound
            controller.playSound('ka');
            _this.waitForKeyup(67, "sound");
        }
        if(_keys[78] && !_this.isWaitingForKeyup(78, "sound")){//if press n, play 'ka' sound
            controller.playSound('ka');
            _this.waitForKeyup(78, "sound");
        }
        
    }
    
    this.checkMenuKeys = function(){
        
        if(_keys[8] && !_this.isWaitingForKeyup(8, "menu")){//If press return key, go back to song selection
            _this.waitForKeyup(8, "menu");
            controller.pauseSound("main-music", true);
            controller.songSelection();
        }
        if(_keys[27]  && !_this.isWaitingForKeyup(27, "menu")){//if press escape key, pause the game
            _this.waitForKeyup(27, "menu");
            controller.togglePauseMenu();
        }
        
    }
    
    this.getKeys = function(){
        return _keys;
    }
    
    this.isWaitingForKeyup = function(key, type){
        var isWaiting;
        if(type == "score") isWaiting = _waitKeyupScore[key];
        else if(type == "sound") isWaiting = _waitKeyupSound[key];
        else if(type == "menu") isWaiting = _waitKeyupMenu[key];
        return isWaiting;
    }
    
    this.waitForKeyup = function(key, type){
        if(type == "score") _waitKeyupScore[key] = true;
        else if(type == "sound") _waitKeyupSound[key] = true;
        else if(type == "menu") _waitKeyupMenu[key] = true;
    }

}