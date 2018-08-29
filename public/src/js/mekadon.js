class Mekadon{
    constructor(controller, game){
        this.controller = controller
        this.game = game
        this.lr = false
        this.keys = {}
    }
    play(circle){
        if(circle.getStatus() == 450){
            var kbd = this.controller.getBindings()
            if(circle.getType() == "don"){
                this.setKey(this.lr ? kbd["don_l"] : kbd["don_r"])
                this.lr = !this.lr
            }else if(circle.getType() == "daiDon"){
                this.setKey(kbd["don_l"])
                this.setKey(kbd["don_r"])
                this.lr = false
            }else if(circle.getType() == "ka"){
                this.setKey(this.lr ? kbd["ka_l"] : kbd["ka_r"])
                this.lr = !this.lr
            }else if(circle.getType() == "daiKa"){
                this.setKey(kbd["ka_l"])
                this.setKey(kbd["ka_r"])
                this.lr = false
            }
            var score = this.game.checkScore(circle);
            circle.played(score);
            this.game.updateCurrentCircle();
        }
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
