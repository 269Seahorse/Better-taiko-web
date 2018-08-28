class Mekadon{
    constructor(controller, game){
        this.controller = controller
        this.game = game
        this.lr = false
        this.keys = {}
    }
    play(circle){
        if(circle.getType() == "don"){
            this.setKey(this.lr ? 86 : 66)
            this.lr = !this.lr
        }else if(circle.getType() == "daiDon"){
            this.setKey(86)
            this.setKey(66)
            this.lr = false
        }else if(circle.getType() == "ka"){
            this.setKey(this.lr ? 67 : 78)
            this.lr = !this.lr
        }else if(circle.getType() == "daiKa"){
            this.setKey(67)
            this.setKey(78)
            this.lr = false
        }
        var score = this.game.checkScore(circle);
        circle.played(score);
        this.game.updateCurrentCircle();
    }
    setKey(keyCode){
        var self = this
        if(this.keys[keyCode]){
            clearTimeout(this.keys[keyCode])
            self.clearKey(keyCode)
        }
        this.controller.setKey(keyCode, true)
        this.keys[keyCode] = setTimeout(function(){
            self.clearKey(keyCode)
        },100)
    }
    clearKey(keyCode){
        this.controller.setKey(keyCode, false)
        delete this.keys[keyCode]
    }
}
