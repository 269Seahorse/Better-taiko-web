class Gamepad{
	constructor(bindings, callback){
		this.bindings = bindings
		this.callback = !!callback
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
			"guide": 16,
			"lsu": "lsu",
			"lsr": "lsr",
			"lsd": "lsd",
			"lsl": "lsl"
		}
		this.btn = {}
		this.gamepadEvents = 0
		if(callback){
			this.interval = setInterval(() => {
				this.play(callback)
			}, 1000 / 60)
		}
	}
	play(callback){
		if("getGamepads" in navigator){
			var gamepads = navigator.getGamepads()
			if(gamepads.length === 0){
				return
			}
		}else{
			return
		}
		if(pageEvents.lastKeyEvent + 5000 > Date.now()){
			return
		}
		
		var bindings = this.bindings
		var force = {
			lsu: false,
			lsr: false,
			lsd: false,
			lsl: false
		}
		
		for(var i = 0; i < gamepads.length; i++){
			if(gamepads[i]){
				var axes = gamepads[i].axes
				if(axes.length >= 2){
					force.lsl = force.lsl || axes[0] <= -0.5
					force.lsr = force.lsr || axes[0] >= 0.5
					force.lsu = force.lsu || axes[1] <= -0.5
					force.lsd = force.lsd || axes[1] >= 0.5
				}
				if(axes.length >= 10){
					// TaTaCon left D-Pad
					for(var pov = 0; pov < 8; pov++){
						if(Math.abs(axes[9] - (pov / 3.5 - 1)) <= 0.01){
							force.lsu = force.lsu || pov === 7 || pov === 0 || pov === 1
							force.lsr = force.lsr || pov === 1 || pov === 2 || pov === 3
							force.lsd = force.lsd || pov === 3 || pov === 4 || pov === 5
							force.lsl = force.lsl || pov === 5 || pov === 6 || pov === 7
							break
						}
					}
				}
			}
		}
		
		for(var i = 0; i < gamepads.length; i++){
			if(gamepads[i]){
				this.toRelease = {}
				for(var bind in bindings){
					this.toRelease[bind] = bindings[bind].length
				}
				for(var bind in bindings){
					for(var name in bindings[bind]){
						var bindName = bindings[bind][name]
						this.checkButton(gamepads, this.b[bindName], bind, callback, force[bindName])
						if(!this.b){
							return
						}
					}
				}
				break
			}
		}
	}
	checkButton(gamepads, btnName, keyCode, callback, force){
		var button = false
		
		if(typeof force === "undefined"){
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
		}else{
			var pressed = !this.btn[btnName] && force
			var released = this.btn[btnName] && !force
		}
		
		if(pressed){
			this.btn[btnName] = true
		}else if(released){
			this.btn[btnName] = false
		}
		
		if(pressed){
			callback(true, keyCode)
			this.gamepadEvents++
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
		if(this.callback){
			clearInterval(this.interval)
		}
		delete this.bindings
		delete this.b
		delete this.btn
	}
}
