class Mekadon{
    constructor(controller, game){
        this.controller = controller
        this.game = game
        this.lr = false
        this.keys = {}
    }
    play(circle){
        if(circle.getStatus() == 450){
            return this.playNow(circle)
        }
    }
    playAt(circle, ms, score){
        var currentMs = circle.getMS() - this.controller.getElapsedTime().ms
        if(ms > currentMs - 10){
            return this.playNow(circle, score)
        }
    }
    miss(circle){
        var currentMs = circle.getMS() - this.controller.getElapsedTime().ms
        if(0 > currentMs - 10){
            circle.updateStatus(-1)
            circle.played(0)
            this.controller.displayScore(0, true)
            this.game.updateCurrentCircle()
            this.game.updateCombo(0)
            this.game.updateGlobalScore(0)
            return true
        }
    }
    playNow(circle, score){
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
        if(typeof score == "undefined"){
            score = this.game.checkScore(circle)
        }else{
            this.controller.displayScore(score)
            this.game.updateCombo(score)
            this.game.updateGlobalScore(score)
        }
        circle.updateStatus(score)
        circle.played(score)
        this.game.updateCurrentCircle()
        return true
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
