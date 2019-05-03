class GameInput{
	constructor(controller){
		this.controller = controller
		this.game = this.controller.game
		
		this.keyboard = new Keyboard({
			ka_l: ["ka_l"],
			don_l: ["don_l"],
			don_r: ["don_r"],
			ka_r: ["ka_r"],
			pause: ["q", "esc"],
			back: ["backspace"],
			previous: ["left", "up"],
			next: ["right", "down"],
			confirm: ["enter", "space"]
		}, this.keyPress.bind(this))
		this.keys = {}
		this.waitKeyupScore = {}
		this.waitKeyupSound = {}
		this.waitKeyupMenu = {}
		this.keyTime = {
			"don": -Infinity,
			"ka": -Infinity
		}
		this.keyboardEvents = 0
		
		var layout = settings.getItem("gamepadLayout")
		if(layout === "b"){
			var gameBtn = {
				don_l: ["d", "r", "ls"],
				don_r: ["a", "x", "rs"],
				ka_l: ["u", "l", "lb", "lt"],
				ka_r: ["b", "y", "rb", "rt"]
			}
		}else if(layout === "c"){
			var gameBtn = {
				don_l: ["d", "l", "ls"],
				don_r: ["a", "b", "rs"],
				ka_l: ["u", "r", "lb", "lt"],
				ka_r: ["x", "y", "rb", "rt"]
			}
		}else{
			var gameBtn = {
				don_l: ["u", "d", "l", "r", "ls"],
				don_r: ["a", "b", "x", "y", "rs"],
				ka_l: ["lb", "lt"],
				ka_r: ["rb", "rt"]
			}
		}
		this.gamepad = new Gamepad(gameBtn)
		this.gamepadInterval = setInterval(this.gamepadKeys.bind(this), 1000 / 60 / 2)
		
		this.gamepadMenu = new Gamepad({
			cancel: ["a"],
			confirm: ["b", "ls", "rs"],
			previous: ["u", "l", "lb", "lt", "lsu", "lsl"],
			next: ["d", "r", "rb", "rt", "lsd", "lsr"],
			pause: ["start"]
		})
		
		if(controller.multiplayer === 1){
			pageEvents.add(window, "beforeunload", event => {
				if(p2.otherConnected){
					pageEvents.send("p2-abandoned", event)
				}
			})
		}
	}
	keyPress(pressed, name){
		if(!this.controller.autoPlayEnabled || this.game.isPaused() || name !== "don_l" && name !== "don_r" && name !== "ka_l" && name !== "ka_r"){
			this.setKey(pressed, name, this.game.getAccurateTime())
		}
	}
	checkGameKeys(){
		if(this.controller.autoPlayEnabled){
			this.checkKeySound("don_l", "don")
			this.checkKeySound("don_r", "don")
			this.checkKeySound("ka_l", "ka")
			this.checkKeySound("ka_r", "ka")
		}
	}
	gamepadKeys(){
		if(!this.game.isPaused() && !this.controller.autoPlayEnabled){
			this.gamepad.play((pressed, name) => {
				if(pressed){
					if(this.keys[name]){
						this.setKey(false, name)
					}
					this.setKey(true, name, this.game.getAccurateTime())
				}else{
					this.setKey(false, name)
				}
			})
		}
	}
	checkMenuKeys(){
		if(!this.controller.multiplayer && !this.locked){
			var moveMenu = 0
			var ms = this.game.getAccurateTime()
			this.gamepadMenu.play((pressed, name) => {
				if(pressed){
					if(this.game.isPaused()){
						if(name === "cancel"){
							this.locked = true
							return setTimeout(() => {
								this.controller.togglePause()
								this.locked = false
							}, 200)
						}
					}
					if(this.keys[name]){
						this.setKey(false, name)
					}
					this.setKey(true, name, ms)
				}else{
					this.setKey(false, name)
				}
			})
			this.checkKey("pause", "menu", () => {
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
			this.checkKey("previous", "menu", moveMenuMinus)
			this.checkKey("ka_l", "menu", moveMenuMinus)
			this.checkKey("next", "menu", moveMenuPlus)
			this.checkKey("ka_r", "menu", moveMenuPlus)
			this.checkKey("confirm", "menu", moveMenuConfirm)
			this.checkKey("don_l", "menu", moveMenuConfirm)
			this.checkKey("don_r", "menu", moveMenuConfirm)
			if(moveMenu && this.game.isPaused()){
				assets.sounds["se_ka"].play()
				this.controller.view.pauseMove(moveMenu)
			}
		}
		if(this.controller.multiplayer !== 2){
			this.checkKey("back", "menu", () => {
				if(this.controller.multiplayer === 1 && p2.otherConnected){
					p2.send("gameend")
					pageEvents.send("p2-abandoned")
				}
				this.controller.togglePause()
				this.controller.songSelection()
			})
		}
	}
	checkKey(name, type, callback){
		if(this.keys[name] && !this.isWaiting(name, type)){
			this.waitForKeyup(name, type)
			callback()
		}
	}
	checkKeySound(name, sound){
		this.checkKey(name, "sound", () => {
			var circles = this.controller.getCircles()
			var circle = circles[this.controller.getCurrentCircle()]
			var currentTime = this.keyTime[name]
			this.keyTime[sound] = currentTime
			if(circle && !circle.isPlayed){
				if(circle.type === "balloon"){
					if(sound === "don" && circle.requiredHits - circle.timesHit <= 1){
						this.controller.playSound("se_balloon")
						return
					}
				}
			}
			this.controller.playSound("neiro_1_" + sound)
		})
	}
	getKeys(){
		return this.keys
	}
	setKey(pressed, name, ms){
		if(pressed){
			this.keys[name] = true
			this.waitKeyupScore[name] = false
			this.waitKeyupSound[name] = false
			this.waitKeyupMenu[name] = false
			if(this.game.isPaused()){
				return
			}
			this.keyTime[name] = ms
			if(name == "don_l" || name == "don_r"){
				this.checkKeySound(name, "don")
				this.keyboardEvents++
			}else if(name == "ka_l" || name == "ka_r"){
				this.checkKeySound(name, "ka")
				this.keyboardEvents++
			}
		}else{
			this.keys[name] = false
			this.waitKeyupScore[name] = false
			this.waitKeyupSound[name] = false
			this.waitKeyupMenu[name] = false
		}
	}
	isWaiting(name, type){
		if(type === "score"){
			return this.waitKeyupScore[name]
		}else if(type === "sound"){
			return this.waitKeyupSound[name]
		}else if(type === "menu"){
			return this.waitKeyupMenu[name]
		}
	}
	waitForKeyup(name, type){
		if(!this.keys[name]){
			return
		}
		if(type === "score"){
			this.waitKeyupScore[name] = true
		}else if(type === "sound"){
			this.waitKeyupSound[name] = true
		}else if(type === "menu"){
			this.waitKeyupMenu[name] = true
		}
	}
	getKeyTime(){
		return this.keyTime
	}
	clean(){
		this.keyboard.clean()
		this.gamepad.clean()
		this.gamepadMenu.clean()
		clearInterval(this.gamepadInterval)
		if(this.controller.multiplayer === 1){
			pageEvents.remove(window, "beforeunload")
		}
	}
}
