class Mekadon{
	constructor(controller, game){
		this.controller = controller
		this.game = game
		this.lr = false
		this.lastHit = -Infinity
	}
	play(circle){
		var type = circle.getType()
		if((type === "balloon" || type === "drumroll" || type === "daiDrumroll") && this.getMS() > circle.getEndTime()){
			circle.played(0, false)
			this.game.updateCurrentCircle()
		}
		type = circle.getType()
		if(type === "balloon"){
			this.playDrumrollAt(circle, 0, 30)
		}else if(type === "drumroll" || type === "daiDrumroll"){
			this.playDrumrollAt(circle, 0, 60)
		}else{
			this.playAt(circle, 0, 450)
		}
	}
	playAt(circle, ms, score, dai){
		var currentMs = circle.getMS() - this.getMS()
		if(ms > currentMs - 10){
			return this.playNow(circle, score, dai)
		}
	}
	playDrumrollAt(circle, ms, pace){
		if(pace && this.getMS() >= this.lastHit + pace){
			this.playAt(circle, ms)
		}
	}
	miss(circle){
		var currentMs = circle.getMS() - this.getMS()
		if(0 >= currentMs - 10){
			this.controller.displayScore(0, true)
			this.game.updateCurrentCircle()
			this.game.updateCombo(0)
			this.game.updateGlobalScore(0, 1, circle.gogoTime)
			return true
		}
	}
	playNow(circle, score, dai){
		var kbd = this.controller.getBindings()
		var type = circle.getType()
		var keyDai = false
		var playDai = !dai || dai === 2
		var drumrollNotes = type === "balloon" || type === "drumroll" || type === "daiDrumroll"
		
		if(drumrollNotes){
			var ms = this.getMS()
		}else{
			var ms = circle.getMS()
		}
		
		if(type == "daiDon" && playDai){
			this.setKey(kbd["don_l"], ms)
			this.setKey(kbd["don_r"], ms)
			this.lr = false
			keyDai = true
		}else if(type == "don" || type == "daiDon" || drumrollNotes){
			this.setKey(this.lr ? kbd["don_l"] : kbd["don_r"], ms)
			this.lr = !this.lr
		}else if(type == "daiKa" && playDai){
			this.setKey(kbd["ka_l"], ms)
			this.setKey(kbd["ka_r"], ms)
			this.lr = false
			keyDai = true
		}else if(type == "ka" || type == "daiKa"){
			this.setKey(this.lr ? kbd["ka_l"] : kbd["ka_r"], ms)
			this.lr = !this.lr
		}
		if(type === "balloon"){
			if(circle.requiredHits == 1){
				assets.sounds["balloon"].play()
			}
			this.game.checkBalloon(circle)
		}else if(type === "drumroll" || type === "daiDrumroll"){
			this.game.checkDrumroll(circle)
		}else{
			this.controller.displayScore(score)
			this.game.updateCombo(score)
			this.game.updateGlobalScore(score, keyDai ? 2 : 1, circle.gogoTime)
			this.game.updateCurrentCircle()
			circle.played(score, keyDai)
		}
		this.lastHit = ms
		return true
	}
	getMS(){
		return this.controller.getElapsedTime().ms
	}
	setKey(keyCode, ms){
		this.controller.setKey(keyCode, false)
		this.controller.setKey(keyCode, true, ms)
	}
}
