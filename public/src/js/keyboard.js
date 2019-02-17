class Keyboard{
	constructor(controller){
		this.controller = controller
		this.game = this.controller.game
		
		this.kbd = {
			"don_l": 70, // F
			"don_r": 74, // J
			"ka_l": 68, // D
			"ka_r": 75, // K
			"pause": 81, // Q
			"back": 8, // Backspace
			"previous": 37, // Left
			"next": 39, // Right
			"confirm": 13 // Enter
		}
		this.kbdAlias = {
			"pause": [27], // Esc
			"previous": [38], // Up
			"next": [40], // Down
			"confirm": [32] // Space
		}
		this.keys = {}
		this.waitKeyupScore = {}
		this.waitKeyupSound = {}
		this.waitKeyupMenu = {}
		this.keyTime = {
			"don": -Infinity,
			"ka": -Infinity
		}
		this.keyboardEvents = 0
		
		var gameBtn = {}
		gameBtn[this.kbd["don_l"]] = ["u", "d", "l", "r", "ls"]
		gameBtn[this.kbd["don_r"]] = ["a", "b", "x", "y", "rs"]
		gameBtn[this.kbd["ka_l"]] = ["lb", "lt"]
		gameBtn[this.kbd["ka_r"]] = ["rb", "rt"]
		this.gamepad = new Gamepad(gameBtn)
		this.gamepadInterval = setInterval(this.gamepadKeys.bind(this), 1000 / 60 / 2)
		
		var menuBtn = {
			"cancel": ["a"],
		}
		menuBtn[this.kbd["confirm"]] = ["b", "ls", "rs"]
		menuBtn[this.kbd["previous"]] = ["u", "l", "lb", "lt", "lsu", "lsl"],
		menuBtn[this.kbd["next"]] = ["d", "r", "rb", "rt", "lsd", "lsr"]
		menuBtn[this.kbd["pause"]] = ["start"]
		this.gamepadMenu = new Gamepad(menuBtn)
		
		this.kbdSearch = {}
		for(var name in this.kbdAlias){
			var list = this.kbdAlias[name]
			for(var i in list){
				this.kbdSearch[list[i]] = this.kbd[name]
			}
		}
		for(var name in this.kbd){
			this.kbdSearch[this.kbd[name]] = this.kbd[name]
		}
		
		pageEvents.keyAdd(this, "all", "both", event => {
			if(event.keyCode === 8){
				// Disable back navigation when pressing backspace
				event.preventDefault()
			}
			var key = this.kbdSearch[event.keyCode]
			if(key && !event.repeat && this.buttonEnabled(key)){
				var ms = this.game.getAccurateTime()
				this.setKey(key, event.type === "keydown", ms)
				if(event.type === "keydown"){
					this.keyboardEvents++
				}
			}
		})
		
		if(controller.multiplayer === 1){
			pageEvents.add(window, "beforeunload", event => {
				if(p2.otherConnected){
					pageEvents.send("p2-abandoned", event)
				}
			})
		}
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
		if(this.controller.autoPlayEnabled){
			this.checkKeySound(this.kbd["don_l"], "don")
			this.checkKeySound(this.kbd["don_r"], "don")
			this.checkKeySound(this.kbd["ka_l"], "ka")
			this.checkKeySound(this.kbd["ka_r"], "ka")
		}
	}
	gamepadKeys(){
		if(!this.game.isPaused() && !this.controller.autoPlayEnabled){
			this.gamepad.play((pressed, keyCode) => {
				if(pressed){
					if(this.keys[keyCode]){
						this.setKey(keyCode, false)
					}
					this.setKey(keyCode, true, this.game.getAccurateTime())
				}else{
					this.setKey(keyCode, false)
				}
			})
		}
	}
	checkMenuKeys(){
		if(!this.controller.multiplayer && !this.locked){
			var moveMenu = 0
			var ms = this.game.getAccurateTime()
			this.gamepadMenu.play((pressed, keyCode) => {
				if(pressed){
					if(this.game.isPaused()){
						if(keyCode === "cancel"){
							this.locked = true
							return setTimeout(() => {
								this.controller.togglePause()
								this.locked = false
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
				this.controller.togglePause()
				for(var key in this.keyTime){
					this.keys[key] = null
					this.keyTime[key] = -Infinity
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
					this.locked = true
					setTimeout(() => {
						this.controller.view.pauseConfirm()
						this.locked = false
					}, 200)
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
				assets.sounds["se_ka"].play()
				this.controller.view.pauseMove(moveMenu)
			}
		}
		if(this.controller.multiplayer !== 2){
			this.checkKey(this.kbd["back"], "menu", () => {
				if(this.controller.multiplayer === 1 && p2.otherConnected){
					p2.send("gameend")
					pageEvents.send("p2-abandoned")
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
				&& !circle.isPlayed
				&& circle.type === "balloon"
				&& circle.requiredHits - circle.timesHit <= 1
			){
				this.controller.playSound("se_balloon")
			}else{
				this.controller.playSound("neiro_1_" + sound)
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
			if(this.game.isPaused()){
				return
			}
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
		clearInterval(this.gamepadInterval)
		if(this.controller.multiplayer === 1){
			pageEvents.remove(window, "beforeunload")
		}
	}
}
