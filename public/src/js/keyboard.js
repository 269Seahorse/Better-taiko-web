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
			"back": 8, // Backspace
			"previous": 38, // Up
			"next": 40, // Down
			"confirm": 13 // Enter
		}
		this.keys = {}
		this.waitKeyupScore = {}
		this.waitKeyupSound = {}
		this.waitKeyupMenu = {}
		this.keyTime = {
			"don": -Infinity,
			"ka": -Infinity
		}
		
		var gameBtn = {}
		gameBtn[this.kbd["don_l"]] = ["u", "d", "l", "r"]
		gameBtn[this.kbd["don_r"]] = ["a", "b", "x", "y"]
		gameBtn[this.kbd["ka_l"]] = ["lb", "lt"]
		gameBtn[this.kbd["ka_r"]] = ["rb", "rt"]
		this.gamepad = new Gamepad(gameBtn)
		
		var menuBtn = {
			"cancel": ["a"],
		}
		menuBtn[this.kbd["confirm"]] = ["b"]
		menuBtn[this.kbd["previous"]] = ["u", "l", "lb", "lt"],
		menuBtn[this.kbd["next"]] = ["d", "r", "rb", "rt"]
		menuBtn[this.kbd["pause"]] = ["start"]
		this.gamepadMenu = new Gamepad(menuBtn)
		
		
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
			var ms = this.game.getAccurateTime()
			this.gamepad.play((pressed, keyCode) => {
				if(pressed){
					if(this.keys[keyCode]){
						this.setKey(keyCode, false)
					}
					this.setKey(keyCode, true, ms)
				}else{
					this.setKey(keyCode, false)
				}
			})
		}else{
			this.checkKeySound(this.kbd["don_l"], "don")
			this.checkKeySound(this.kbd["don_r"], "don")
			this.checkKeySound(this.kbd["ka_l"], "ka")
			this.checkKeySound(this.kbd["ka_r"], "ka")
		}
	}
	checkMenuKeys(){
		if(!this.controller.multiplayer){
			var moveMenu = 0
			var ms = this.game.getAccurateTime()
			this.gamepadMenu.play((pressed, keyCode) => {
				if(pressed){
					if(this.game.isPaused()){
						if(keyCode === "cancel"){
							return setTimeout(() => {
								this.controller.togglePauseMenu()
							}, 200)
						}
					}
					if(this.keys[keyCode]){
						this.setKey(keyCode, false)
					}
					this.setKey(keyCode, true, ms)
				}else{
					this.setKey(keyCode, false)
				}
			})
			this.checkKey(this.kbd["pause"], "menu", () => {
				this.controller.togglePauseMenu()
				for(var key in this.keyTime){
					this.keys[key] = null
					this.keyTime[key] = null
				}
			})
			var moveMenuMinus = () => {
				moveMenu = -1
			}
			var moveMenuPlus = () => {
				moveMenu = 1
			}
			var moveMenuConfirm = () => {
				if(this.game.isPaused()){
					setTimeout(() => {
						var selected = document.getElementsByClassName("selected")[0]
						if(selected){
							selected.click()
						}
					}, 200)
					for(var key in this.keyTime){
						this.keyTime[key] = null
					}
				}
			}
			this.checkKey(this.kbd["previous"], "menu", moveMenuMinus)
			this.checkKey(this.kbd["ka_l"], "menu", moveMenuMinus)
			this.checkKey(this.kbd["next"], "menu", moveMenuPlus)
			this.checkKey(this.kbd["ka_r"], "menu", moveMenuPlus)
			this.checkKey(this.kbd["confirm"], "menu", moveMenuConfirm)
			this.checkKey(this.kbd["don_l"], "menu", moveMenuConfirm)
			this.checkKey(this.kbd["don_r"], "menu", moveMenuConfirm)
			if(moveMenu && this.game.isPaused()){
				assets.sounds["ka"].play()
				var selected = document.getElementsByClassName("selected")[0]
				selected.classList.remove("selected")
				var next = selected[(moveMenu === 1 ? "next" : "previous") + "ElementSibling"]
				if(!next){
					next = selected.parentNode[(moveMenu === 1 ? "first" : "last") + "ElementChild"]
				}
				next.classList.add("selected")
			}
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
				sound === "don"
				&& circle
				&& !circle.getPlayed()
				&& circle.getType() === "balloon"
				&& circle.requiredHits - circle.timesHit <= 1
			){
				this.controller.playSound("balloon")
			}else{
				this.controller.playSound("note_" + sound)
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
			if(keyCode == this.kbd.don_l || keyCode == this.kbd.don_r){
				this.checkKeySound(keyCode, "don")
			}else if(keyCode == this.kbd.ka_l || keyCode == this.kbd.ka_r){
				this.checkKeySound(keyCode, "ka")
			}
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
