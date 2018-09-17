class Keyboard{
	constructor(controller){
		this.controller = controller
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
			if (event.keyCode === 8){
				// Disable back navigation when pressing backspace
				event.preventDefault()
			}
			if(this.buttonEnabled(event.keyCode)){
				this.setKey(event.keyCode, event.type === "keydown")
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
	checkKey(keyCode, keyup, callback){
		if(this.keys[keyCode] && !this.isWaitingForKeyup(keyCode, keyup)){
			this.waitForKeyup(keyCode, keyup)
			callback()
		}
	}
	checkKeySound(keyCode, sound){
		this.checkKey(keyCode, "sound", () => {
			var circles = this.controller.parsedSongData.circles
			var circle = circles[this.controller.game.getCurrentCircle()]
			if(
				(keyCode === this.kbd["don_l"] || keyCode === this.kbd["don_r"])
				&& circle
				&& !circle.getPlayed()
				&& circle.getStatus() !== -1
				&& circle.getType() === "balloon"
				&& circle.requiredHits - circle.timesHit <= 1
			){
				assets.sounds["balloon"].play()
			}else{
				assets.sounds["note_" + sound].play()
			}
			this.keyTime[sound] = this.controller.getElapsedTime().ms
		})
	}
	getKeys(){
		return this.keys
	}
	setKey(keyCode, down){
		if(down){
			this.keys[keyCode] = true
		}else{
			delete this.keys[keyCode]
			delete this.waitKeyupScore[keyCode]
			delete this.waitKeyupSound[keyCode]
			delete this.waitKeyupMenu[keyCode]
		}
	}
	isWaitingForKeyup(key, type){
		if(type === "score"){
			return this.waitKeyupScore[key]
		}else if(type === "sound"){
			return this.waitKeyupSound[key]
		}else if(type === "menu"){
			return this.waitKeyupMenu[key]
		}
	}
	waitForKeyup(key, type){
		if(type === "score"){
			this.waitKeyupScore[key] = true
		}else if(type === "sound"){
			this.waitKeyupSound[key] = true
		}else if(type === "menu"){
			this.waitKeyupMenu[key] = true
		}
	}
	getKeyTime(){
		return this.keyTime
	}
	clean(){
		pageEvents.keyRemove(this, "all")
	}
}
