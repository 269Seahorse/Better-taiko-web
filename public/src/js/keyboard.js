function Keyboard(controller){
 
    var _this = this;
    var _keys = {};
    var _waitKeyupScore = {};
    var _waitKeyupSound = {};
    var _waitKeyupMenu = {};
    
    $(document).keydown(function(e){
        
        if (e.which === 8 && !$(e.target).is("input, textarea"))
            // Disable back navigation when pressing backspace
            e.preventDefault();
        
        if(!controller.autoPlay()){
            _this.setKey(e.which, true);
        }
    });
        
    $(document).keyup(function(e){
        if(!controller.autoPlay()){
            _this.setKey(e.which, false);
        }
    });
    
    this.checkGameKeys = function(){

        if(_keys[86] && !_this.isWaitingForKeyup(86, "sound")){
            // V, play 'don' sound
            controller.playSound('note_don');
            _this.waitForKeyup(86, "sound");
        }
        if(_keys[66] && !_this.isWaitingForKeyup(66, "sound")){
            // B, play 'don' sound
            controller.playSound('note_don');
            _this.waitForKeyup(66, "sound");
        }
        
        if(_keys[67] && !_this.isWaitingForKeyup(67, "sound")){
            // C, play 'ka' sound
            controller.playSound('note_ka');
            _this.waitForKeyup(67, "sound");
        }
        if(_keys[78] && !_this.isWaitingForKeyup(78, "sound")){
            // N, play 'ka' sound
            controller.playSound('note_ka');
            _this.waitForKeyup(78, "sound");
        }
        
    }
    
    this.checkMenuKeys = function(){
        
        if(_keys[8] && !_this.isWaitingForKeyup(8, "menu")){
            // Backspace, go back to song selection
            _this.waitForKeyup(8, "menu");
            controller.pauseSound("main-music", true);
            controller.songSelection();
        }
        if(_keys[81]  && !_this.isWaitingForKeyup(81, "menu")){
            // P, pause the game
            _this.waitForKeyup(81, "menu");
            controller.togglePauseMenu();
        }
        
    }
    
    this.getKeys = function(){
        return _keys;
    }
    
    this.setKey=function(keyCode, down){
        if(down){
            _keys[keyCode]=true;
        }else{
            delete _keys[keyCode];
            delete _waitKeyupScore[keyCode];
            delete _waitKeyupSound[keyCode];
            delete _waitKeyupMenu[keyCode];
        }
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