class Settings{
	constructor(){
		var ios = /iPhone|iPad/.test(navigator.userAgent)
		var phone = /Android|iPhone|iPad/.test(navigator.userAgent)
		
		this.items = {
			resolution: {
				type: "select",
				options: ["high", "medium", "low", "lowest"],
				default: phone ? "medium" : "high"
			},
			touchAnimation: {
				type: "toggle",
				default: !ios,
				touch: true
			},
			keyboardSettings: {
				type: "keyboard",
				default: {
					ka_l: ["d"],
					don_l: ["f"],
					don_r: ["j"],
					ka_r: ["k"]
				},
				touch: false
			}
		}
		
		this.storage = {}
		try{
			var storage = JSON.parse(localStorage.getItem("settings") || "{}")
			for(var i in this.items){
				var current = this.items[i]
				if(i in storage){
					if(current.type === "select" && current.options.indexOf(storage[i]) === -1){
						this.storage[i] = null
					}else if(current.type === "keyboard"){
						var obj = {}
						for(var j in current.default){
							if(storage[i][j] && storage[i][j][0]){
								obj[j] = storage[i][j]
							}else{
								obj = null
								break
							}
						}
						this.storage[i] = obj
					}else{
						this.storage[i] = storage[i]
					}
				}else{
					this.storage[i] = null
				}
			}
		}catch(e){
			for(var i in this.items){
				this.storage[i] = null
			}
		}
	}
	getItem(name){
		var value = this.storage[name]
		return value === null ? this.items[name].default : value
	}
	setItem(name, value){
		this.storage[name] = value
		try{
			localStorage.setItem("settings", JSON.stringify(this.storage))
		}catch(e){}
	}
}

class SettingsView{
	constructor(touchEnabled){
		this.touchEnabled = touchEnabled
		loader.changePage("settings", false)
		assets.sounds["bgm_settings"].playLoop(0.1, false, 0, 1.392, 26.992)
		
		if(touchEnabled){
			document.getElementById("tutorial-outer").classList.add("touch-enabled")
		}
		this.mode = "settings"
		
		var tutorialTitle = document.getElementById("tutorial-title")
		tutorialTitle.innerText = strings.gameSettings
		tutorialTitle.setAttribute("alt", strings.gameSettings)
		this.defaultButton = document.getElementById("settings-default")
		this.defaultButton.innerText = strings.settings.default
		this.defaultButton.setAttribute("alt", strings.settings.default)
		this.endButton = document.getElementById("tutorial-end-button")
		this.endButton.innerText = strings.settings.ok
		this.endButton.setAttribute("alt", strings.settings.ok)
		this.resolution = settings.getItem("resolution")
		
		var content = document.getElementById("tutorial-content")
		this.items = []
		this.selected = 0
		for(let i in settings.items){
			var current = settings.items[i]
			if(
				!touchEnabled && current.touch === true ||
				touchEnabled && current.touch === false
			){
				continue
			}
			var settingBox = document.createElement("div")
			settingBox.classList.add("setting-box")
			var nameDiv = document.createElement("div")
			nameDiv.classList.add("setting-name", "stroke-sub")
			var name = strings.settings[i].name
			nameDiv.innerText = name
			nameDiv.setAttribute("alt", name)
			settingBox.appendChild(nameDiv)
			var valueDiv = document.createElement("div")
			valueDiv.classList.add("setting-value")
			this.getValue(i, valueDiv)
			settingBox.appendChild(valueDiv)
			content.appendChild(settingBox)
			if(this.items.length === this.selected){
				settingBox.classList.add("selected")
			}
			pageEvents.add(settingBox, ["mousedown", "touchstart"], event => {
				if(event.type !== "mousedown" || event.which === 1){
					event.preventDefault()
					this.setValue(i)
				}
			})
			this.items.push({
				id: i,
				settingBox: settingBox,
				valueDiv: valueDiv
			})
		}
		this.items.push({
			id: "default",
			settingBox: this.defaultButton
		})
		this.items.push({
			id: "back",
			settingBox: this.endButton
		})
		
		this.setKbd()
		pageEvents.add(this.defaultButton, ["mousedown", "touchstart"], this.defaultSettings.bind(this))
		pageEvents.add(this.endButton, ["mousedown", "touchstart"], this.onEnd.bind(this))
		pageEvents.keyAdd(this, "all", "down", this.keyEvent.bind(this))
		this.gamepad = new Gamepad({
			"confirm": ["b", "ls", "rs"],
			"up": ["u", "lsu"],
			"previous": ["l", "lb", "lt", "lsl"],
			"next": ["d", "r", "rb", "rt", "lsd", "lsr"],
			"back": ["start", "a"]
		}, this.keyPressed.bind(this))
		
		pageEvents.send("settings")
	}
	setKbd(){
		var kbdSettings = settings.getItem("keyboardSettings")
		this.kbd = {
			"confirm": ["enter", " ", kbdSettings.don_l[0], kbdSettings.don_r[0]],
			"up": ["arrowup"],
			"previous": ["arrowleft", kbdSettings.ka_l[0]],
			"next": ["arrowright", "arrowdown", kbdSettings.ka_r[0]],
			"back": ["backspace", "escape"]
		}
	}
	getValue(name, valueDiv){
		var current = settings.items[name]
		var value = settings.getItem(name)
		if(current.type === "select"){
			value = strings.settings[name][value]
		}else if(current.type === "toggle"){
			value = value ? strings.settings.on : strings.settings.off
		}else if(current.type === "keyboard"){
			valueDiv.innerHTML = ""
			for(var i in value){
				var key = document.createElement("div")
				key.style.color = i === "ka_l" || i === "ka_r" ? "#009aa5" : "#ef2c10"
				key.innerText = value[i][0].toUpperCase()
				valueDiv.appendChild(key)
			}
			return
		}
		valueDiv.innerText = value
	}
	setValue(name){
		var current = settings.items[name]
		var value = settings.getItem(name)
		var selectedIndex = this.items.findIndex(item => item.id === name)
		var selected = this.items[selectedIndex]
		if(this.mode !== "settings"){
			if(this.selected === selectedIndex){
				this.keyboardBack(selected)
			}
			return
		}
		if(this.selected !== selectedIndex){
			this.items[this.selected].settingBox.classList.remove("selected")
			this.selected = selectedIndex
			selected.settingBox.classList.add("selected")
		}
		if(current.type === "select"){
			value = current.options[this.mod(current.options.length, current.options.indexOf(value) + 1)]
		}else if(current.type === "toggle"){
			value = !value
		}else if(current.type === "keyboard"){
			this.mode = "keyboard"
			selected.settingBox.style.animation = "none"
			selected.valueDiv.classList.add("selected")
			this.keyboardKeys = {}
			this.keyboardSet()
			assets.sounds["se_don"].play()
			return
		}
		settings.setItem(name, value)
		this.getValue(name, this.items[this.selected].valueDiv)
		assets.sounds["se_ka"].play()
	}
	keyEvent(event){
		if(event.keyCode === 27 || event.keyCode === 8 || event.keyCode === 9){
			// Escape, Backspace, Tab
			event.preventDefault()
		}
		if(!event.repeat){
			for(var i in this.kbd){
				if(this.kbd[i].indexOf(event.key.toLowerCase()) !== -1){
					if(this.mode !== "keyboard" || i === "back"){
						this.keyPressed(true, i)
						return
					}
				}
			}
			if(this.mode === "keyboard"){
				var currentKey = event.key.toLowerCase()
				for(var i in this.keyboardKeys){
					if(this.keyboardKeys[i][0] === currentKey || !currentKey){
						return
					}
				}
				this.keyboardKeys[this.keyboardCurrent] = [currentKey]
				this.keyboardSet()
			}
		}
	}
	keyPressed(pressed, name){
		if(!pressed){
			return
		}
		var selected = this.items[this.selected]
		if(this.mode === "settings"){
			if(name === "confirm"){
				if(selected.id === "back"){
					this.onEnd()
				}else if(selected.id === "default"){
					this.defaultSettings()
				}else{
					this.setValue(selected.id)
				}
			}else if(name === "up" || name === "previous" || name === "next"){
				selected.settingBox.classList.remove("selected")
				do{
					this.selected = this.mod(this.items.length, this.selected + (name === "next" ? 1 : -1))
				}while(this.items[this.selected].id === "default" && name !== "previous")
				this.items[this.selected].settingBox.classList.add("selected")
				assets.sounds["se_ka"].play()
			}else if(name === "back"){
				this.onEnd()
			}
		}else if(this.mode === "keyboard"){
			if(name === "back"){
				this.keyboardBack(selected)
			}
		}
	}
	keyboardSet(){
		var selected = this.items[this.selected]
		var current = settings.items[selected.id]
		selected.valueDiv.innerHTML = ""
		for(var i in current.default){
			var key = document.createElement("div")
			key.style.color = i === "ka_l" || i === "ka_r" ? "#009aa5" : "#ef2c10"
			if(this.keyboardKeys[i]){
				key.innerText = this.keyboardKeys[i][0].toUpperCase()
				selected.valueDiv.appendChild(key)
			}else{
				key.innerText = "[" + strings.settings[selected.id][i] + "]"
				selected.valueDiv.appendChild(key)
				this.keyboardCurrent = i
				return
			}
		}
		settings.setItem(selected.id, this.keyboardKeys)
		this.keyboardBack(selected)
		this.setKbd()
		pageEvents.setKbd()
	}
	keyboardBack(selected){
		this.mode = "settings"
		selected.settingBox.style.animation = ""
		selected.valueDiv.classList.remove("selected")
		this.getValue(selected.id, selected.valueDiv)
	}
	defaultSettings(event){
		if(event && event.type === "touchstart"){
			event.preventDefault()
		}
		var selectedIndex = this.items.findIndex(item => item.id === "default")
		if(this.selected !== selectedIndex){
			this.items[this.selected].settingBox.classList.remove("selected")
			this.selected = selectedIndex
			this.items[this.selected].settingBox.classList.add("selected")
		}
		for(var i in settings.items){
			settings.setItem(i, null)
		}
		for(var i in this.items){
			var item = this.items[i]
			if(item.valueDiv){
				this.getValue(item.id, item.valueDiv)
			}
		}
		assets.sounds["se_don"].play()
	}
	onEnd(event){
		var touched = false
		if(event){
			if(event.type === "touchstart"){
				event.preventDefault()
				touched = true
			}else if(event.which !== 1){
				return
			}
		}
		this.clean()
		assets.sounds["se_don"].play()
		setTimeout(() => {
			new SongSelect("settings", false, touched)
		}, 500)
	}
	mod(length, index){
		return ((index % length) + length) % length
	}
	clean(){
		this.gamepad.clean()
		assets.sounds["bgm_settings"].stop()
		pageEvents.keyRemove(this, "all")
		for(var i in this.items){
			pageEvents.remove(this.items[i].settingBox, ["mousedown", "touchstart"])
		}
		delete this.defaultButton
		delete this.endButton
		delete this.items
		if(this.resolution !== settings.getItem("resolution")){
			for(var i in assets.image){
				if(i === "touch_drum" || i.startsWith("bg_song_") || i.startsWith("bg_stage_") || i.startsWith("bg_don_")){
					URL.revokeObjectURL(assets.image[i].src)
					delete assets.image[i]
				}
			}
		}
	}
}
