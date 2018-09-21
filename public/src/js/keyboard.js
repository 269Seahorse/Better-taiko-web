class Keyboard{
	constructor(controller){
		this.controller = controller
		this.game = this.controller.game
		
		this.kbd = {
			"don_l": 86, // V
			"don_r": 66, // B
			"ka_l": 67, // C
			"ka_r": 78, // N
			"pause": 81, // Q
			"back": 8 // Backspace
		}
		this.keys = {}
		this.waitKeyupScore = {}
		this.waitKeyupSound = {}
		this.waitKeyupMenu = {}
		this.keyTime = {
			"don": -Infinity,
			"ka": -Infinity
		}
		this.gamepad = new Gamepad(this)
		pageEvents.keyAdd(this, "all", "both", event => {
			if(event.keyCode === 8){
				// Disable back navigation when pressing backspace
				event.preventDefault()
			}
			if(!event.repeat && this.buttonEnabled(event.keyCode)){
				var ms = this.game.getAccurateTime()
				this.setKey(event.keyCode, event.type === "keydown", ms)
			}
		})
	}
	getBindings(){
		return this.kbd
	}
	buttonEnabled(keyCode){
		if(this.controller.autoPlayEnabled){
			switch(keyCode){
				case this.kbd["don_l"]:
				case this.kbd["don_r"]:
				case this.kbd["ka_l"]:
				case this.kbd["ka_r"]:
					return false
			}
		}
		return true
	}
	checkGameKeys(){
		if(!this.controller.autoPlayEnabled){
			this.gamepad.play()
		}
		this.checkKeySound(this.kbd["don_l"], "don")
		this.checkKeySound(this.kbd["don_r"], "don")
		this.checkKeySound(this.kbd["ka_l"], "ka")
		this.checkKeySound(this.kbd["ka_r"], "ka")
	}
	checkMenuKeys(){
		if(!this.controller.multiplayer){
			this.gamepad.play(true)
			this.checkKey(this.kbd["pause"], "menu", () => {
				this.controller.togglePauseMenu()
			})
		}
		if(this.controller.multiplayer !== 2){
			this.checkKey(this.kbd["back"], "menu", () => {
				if(this.controller.multiplayer === 1){
					p2.send("gameend")
				}
				this.controller.togglePause()
				this.controller.songSelection()
			})
		}
	}
	checkKey(keyCode, type, callback){
		if(this.keys[keyCode] && !this.isWaiting(keyCode, type)){
			this.waitForKeyup(keyCode, type)
			callback()
		}
	}
	checkKeySound(keyCode, sound){
		this.checkKey(keyCode, "sound", () => {
			var circles = this.controller.getCircles()
			var circle = circles[this.controller.getCurrentCircle()]
			if(
				(keyCode === this.kbd["don_l"] || keyCode === this.kbd["don_r"])
				&& circle
				&& !circle.getPlayed()
				&& circle.getType() === "balloon"
				&& circle.requiredHits - circle.timesHit <= 1
			){
				assets.sounds["balloon"].play()
			}else{
				assets.sounds["note_" + sound].play()
			}
			this.keyTime[sound] = this.keyTime[keyCode]
		})
	}
	getKeys(){
		return this.keys
	}
	setKey(keyCode, down, ms){
		if(down){
			this.keys[keyCode] = true
			this.keyTime[keyCode] = ms
		}else{
			this.keys[keyCode] = false
			this.waitKeyupScore[keyCode] = false
			this.waitKeyupSound[keyCode] = false
			this.waitKeyupMenu[keyCode] = false
		}
	}
	isWaiting(keyCode, type){
		if(type === "score"){
			return this.waitKeyupScore[keyCode]
		}else if(type === "sound"){
			return this.waitKeyupSound[keyCode]
		}else if(type === "menu"){
			return this.waitKeyupMenu[keyCode]
		}
	}
	waitForKeyup(keyCode, type){
		if(type === "score"){
			this.waitKeyupScore[keyCode] = true
		}else if(type === "sound"){
			this.waitKeyupSound[keyCode] = true
		}else if(type === "menu"){
			this.waitKeyupMenu[keyCode] = true
		}
	}
	getKeyTime(){
		return this.keyTime
	}
	clean(){
		pageEvents.keyRemove(this, "all")
	}
}
