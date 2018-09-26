class Gamepad{
	constructor(bindings, callback){
		this.bindings = bindings
		this.b = {
			"a": 0,
			"b": 1,
			"x": 2,
			"y": 3,
			"lb": 4,
			"rb": 5,
			"lt": 6,
			"rt": 7,
			"back": 8,
			"start": 9,
			"ls": 10,
			"rs": 11,
			"u": 12,
			"d": 13,
			"l": 14,
			"r": 15,
			"guide": 16
		}
		this.btn = {}
		if(callback){
			this.interval = setInterval(() => {
				this.play(callback)
			}, 100)
		}
	}
	play(callback){
		if("getGamepads" in navigator){
			var gamepads = navigator.getGamepads()
		}else{
			return
		}
		var bindings = this.bindings
		for(var i = 0; i < gamepads.length; i++){
			if(gamepads[i]){
				this.toRelease = {}
				for(var bind in bindings){
					this.toRelease[bind] = bindings[bind].length
				}
				for(var btnName = 0; btnName <= 16; btnName++){
					buttonSearch: {
						for(var bind in bindings){
							for(var name in bindings[bind]){
								if(btnName === this.b[bindings[bind][name]]){
									this.checkButton(gamepads, btnName, bind, callback)
									break buttonSearch
								}
							}
						}
					}
				}
				break
			}
		}
	}
	checkButton(gamepads, btnName, keyCode, callback){
		var button = false
		
		for(var i = 0; i < gamepads.length; i++){
			if(gamepads[i]){
				var btn = gamepads[i].buttons[btnName]
				if(btn){
					var btnPressed = btn.pressed || btn.value >= 0.5
					if(btnPressed){
						button = btnPressed
					}
				}
			}
		}
		
		var pressed = !this.btn[btnName] && button
		var released = this.btn[btnName] && !button
		
		if(pressed){
			this.btn[btnName] = true
		}else if(released){
			delete this.btn[btnName]
		}
		
		if(pressed){
			callback(true, keyCode)
		}else if(!button){
			if(released){
				this.toRelease[keyCode + "released"] = true
			}
			this.toRelease[keyCode]--
			if(this.toRelease[keyCode] === 0 && this.toRelease[keyCode + "released"]){
				callback(false, keyCode)
			}
		}
	}
	clean(){
		clearInterval(this.interval)
	}
}
