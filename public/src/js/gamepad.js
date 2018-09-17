class Gamepad{
	constructor(keyboard){
		var kbd = keyboard.getBindings()
		this.gameBtn = {}
		this.gameBtn[kbd["don_l"]] = ["u", "d", "l", "r"]
		this.gameBtn[kbd["don_r"]] = ["a", "b", "x", "y"]
		this.gameBtn[kbd["ka_l"]] = ["lb", "lt"]
		this.gameBtn[kbd["ka_r"]] = ["rb", "rt"]
		this.menuBtn = {}
		this.menuBtn[kbd["pause"]] = ["start"]
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
		this.keyboard = keyboard
	}
	play(menuPlay){
		if("getGamepads" in navigator){
			var gamepads = navigator.getGamepads()
		}else{
			return
		}
		var bindings = menuPlay ? this.menuBtn : this.gameBtn
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
									this.checkButton(gamepads, btnName, bind)
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
	checkButton(gamepads, btnName, keyCode){
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
			if(this.keyboard.getKeys()[keyCode]){
				this.keyboard.setKey(keyCode, false)
			}
			this.keyboard.setKey(keyCode, true)
		}else if(!button && this.keyboard.getKeys()[keyCode]){
			if(released){
				this.toRelease[keyCode + "released"] = true
			}
			this.toRelease[keyCode]--
			if(this.toRelease[keyCode] === 0 && this.toRelease[keyCode + "released"]){
				this.keyboard.setKey(keyCode, false)
			}
		}
	}
}
