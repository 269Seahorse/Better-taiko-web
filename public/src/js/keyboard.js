function Keyboard(controller){
 
    var _kbd = {
        "don_l": 86, // V
        "don_r": 66, // B
        "ka_l": 67, // C
        "ka_r": 78, // N
        "pause": 81, // Q
        "back": 8 // Backspace
    }
    var _this = this;
    var _keys = {};
    var _waitKeyupScore = {};
    var _waitKeyupSound = {};
    var _waitKeyupMenu = {};
    var _keyTime = {
        "don": -Infinity,
        "ka": -Infinity
    }
    
    this.getBindings = function(){
        return _kbd
    }
    
    var _gamepad = new Gamepad(this)
    
    $(document).keydown(function(e){
        
        if (e.which === 8 && !$(e.target).is("input, textarea"))
            // Disable back navigation when pressing backspace
            e.preventDefault();
        
        if(_this.buttonEnabled(e.which)){
            _this.setKey(e.which, true);
        }
    });
        
    $(document).keyup(function(e){
        if(_this.buttonEnabled(e.which)){
            _this.setKey(e.which, false);
        }
    });
    
    this.buttonEnabled = function(keyCode){
        if(controller.autoPlayEnabled){
            switch(keyCode){
                case _kbd["don_l"]:
                case _kbd["don_r"]:
                case _kbd["ka_l"]:
                case _kbd["ka_r"]:
                    return false
            }
        }
        return true
    }
    
    this.checkGameKeys = function(){
        if(!controller.autoPlayEnabled){
            _gamepad.play()
        }
        _this.checkKeySound(_kbd["don_l"], "don")
        _this.checkKeySound(_kbd["don_r"], "don")
        _this.checkKeySound(_kbd["ka_l"], "ka")
        _this.checkKeySound(_kbd["ka_r"], "ka")
    }
    
    this.checkMenuKeys = function(){
        _gamepad.play(1)
        _this.checkKey(_kbd["back"], "menu", function(){
            controller.pauseSound("main-music", true);
            controller.songSelection();
        })
        _this.checkKey(_kbd["pause"], "menu", function(){
            controller.togglePauseMenu();
        })
    }
    
    this.checkKey = function(keyCode, keyup, callback){
        if(_keys[keyCode] && !_this.isWaitingForKeyup(keyCode, keyup)){
            _this.waitForKeyup(keyCode, keyup);
            callback()
        }
    }
    
    this.checkKeySound = function(keyCode, sound){
        _this.checkKey(keyCode, "sound", function(){
            controller.playSound("note_"+sound);
            _keyTime[sound] = controller.getEllapsedTime().ms
        })
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
    
    this.getKeyTime = function(){
        return _keyTime;
    }

}