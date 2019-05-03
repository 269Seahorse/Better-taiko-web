class Settings{
	constructor(){
		var ios = /iPhone|iPad/.test(navigator.userAgent)
		var phone = /Android|iPhone|iPad/.test(navigator.userAgent)
		
		this.items = {
			language: {
				type: "language",
				options: ["ja", "en", "cn", "tw", "ko"],
				default: this.getLang()
			},
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
			},
			gamepadLayout: {
				type: "gamepad",
				options: ["a", "b", "c"],
				default: "a",
				gamepad: true
			}
		}
		
		this.storage = {}
		try{
			var storage = JSON.parse(localStorage.getItem("settings") || "{}")
			for(var i in this.items){
				var current = this.items[i]
				if(current.type === "language"){
					this.storage[i] = localStorage.getItem("lang")
					if(current.options.indexOf(this.storage[i]) === -1){
						this.storage[i] = null
					}
				}else if(i in storage){
					if((current.type === "select" || current.type === "gamepad") && current.options.indexOf(storage[i]) === -1){
						this.storage[i] = null
					}else if(current.type === "keyboard"){
						var obj = {}
						for(var j in current.default){
							if(storage[i] && storage[i][j] && storage[i][j][0]){
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
			if(name === "language"){
				if(value){
					localStorage.setItem("lang", value)
				}else{
					localStorage.removeItem("lang")
				}
			}else{
				var language = this.storage.language
				delete this.storage.language
				localStorage.setItem("settings", JSON.stringify(this.storage))
				this.storage.language = language
			}
		}catch(e){}
	}
	getLang(){
		if("languages" in navigator){
			var userLang = navigator.languages.slice()
			userLang.unshift(navigator.language)
			for(var i in userLang){
				for(var j in allStrings){
					if(allStrings[j].regex.test(userLang[i])){
						return j
					}
				}
			}
		}
		return "ja"
	}
	setLang(lang, noEvent){
		strings = lang
		var boldFonts = strings.font === "Microsoft YaHei, sans-serif"
		loader.screen.style.fontFamily = strings.font
		loader.screen.style.fontWeight = boldFonts ? "bold" : ""
		loader.screen.classList[boldFonts ? "add" : "remove"]("bold-fonts")
		if(!noEvent){
			pageEvents.send("language-change", lang.id)
		}
	}
}

class SettingsView{
	constructor(touchEnabled, tutorial, songId){
		this.touchEnabled = touchEnabled
		this.tutorial = tutorial
		this.songId = songId
		
		loader.changePage("settings", tutorial)
		assets.sounds["bgm_settings"].playLoop(0.1, false, 0, 1.392, 26.992)
		this.defaultButton = document.getElementById("settings-default")
		if(touchEnabled){
			this.getElement("view-outer").classList.add("touch-enabled")
		}
		var gamepadEnabled = false
		if("getGamepads" in navigator){
			var gamepads = navigator.getGamepads()
			for(var i = 0; i < gamepads.length; i++){
				if(gamepads[i]){
					gamepadEnabled = true
					break
				}
			}
		}
		this.mode = "settings"
		
		this.keyboard = new Keyboard({
			"confirm": ["enter", "space", "don_l", "don_r"],
			"up": ["up"],
			"previous": ["left", "ka_l"],
			"next": ["right", "down", "ka_r"],
			"back": ["esc"],
			"other": ["wildcard"]
		}, this.keyPressed.bind(this))
		this.gamepad = new Gamepad({
			"confirm": ["b", "ls", "rs"],
			"up": ["u", "lsu"],
			"previous": ["l", "lb", "lt", "lsl"],
			"next": ["d", "r", "rb", "rt", "lsd", "lsr"],
			"back": ["start", "a"]
		}, this.keyPressed.bind(this))
		
		this.viewTitle = this.getElement("view-title")
		this.endButton = this.getElement("view-end-button")
		this.resolution = settings.getItem("resolution")
		
		var content = this.getElement("view-content")
		this.items = []
		this.selected = 0
		for(let i in settings.items){
			var current = settings.items[i]
			if(
				!touchEnabled && current.touch === true ||
				touchEnabled && current.touch === false ||
				!gamepadEnabled && current.gamepad === true
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
			this.addTouch(settingBox, event => this.setValue(i))
			this.items.push({
				id: i,
				settingBox: settingBox,
				nameDiv: nameDiv,
				valueDiv: valueDiv
			})
		}
		this.items.push({
			id: "default",
			settingBox: this.defaultButton
		})
		this.addTouch(this.defaultButton, this.defaultSettings.bind(this))
		this.items.push({
			id: "back",
			settingBox: this.endButton
		})
		this.addTouch(this.endButton, this.onEnd.bind(this))
		
		this.gamepadSettings = document.getElementById("settings-gamepad")
		this.addTouch(this.gamepadSettings, event => {
			if(event.target === event.currentTarget){
				this.gamepadBack()
			}
		})
		this.gamepadTitle = this.gamepadSettings.getElementsByClassName("view-title")[0]
		this.gamepadEndButton = this.gamepadSettings.getElementsByClassName("view-end-button")[0]
		this.addTouch(this.gamepadEndButton, event => this.gamepadBack(true))
		this.gamepadBox = this.gamepadSettings.getElementsByClassName("setting-box")[0]
		this.addTouch(this.gamepadBox, event => this.gamepadSet(1))
		this.gamepadButtons = document.getElementById("gamepad-buttons")
		this.gamepadValue = document.getElementById("gamepad-value")
		
		this.setStrings()
		
		pageEvents.send("settings")
	}
	getElement(name){
		return loader.screen.getElementsByClassName(name)[0]
	}
	addTouch(element, callback){
		pageEvents.add(element, ["mousedown", "touchstart"], event => {
			if(event.type === "touchstart"){
				event.preventDefault()
				this.touched = true
			}else if(event.which !== 1){
				return
			}else{
				this.touched = false
			}
			callback(event)
		})
	}
	removeTouch(element){
		pageEvents.remove(element, ["mousedown", "touchstart"])
	}
	getValue(name, valueDiv){
		var current = settings.items[name]
		var value = settings.getItem(name)
		if(current.type === "language"){
			value = allStrings[value].name + " (" + value + ")"
		}else if(current.type === "select" || current.type === "gamepad"){
			value = strings.settings[name][value]
		}else if(current.type === "toggle"){
			value = value ? strings.settings.on : strings.settings.off
		}else if(current.type === "keyboard"){
			valueDiv.innerHTML = ""
			for(var i in value){
				var keyDiv = document.createElement("div")
				keyDiv.style.color = i === "ka_l" || i === "ka_r" ? "#009aa5" : "#ef2c10"
				var key = value[i][0]
				for(var j in this.keyboard.substitute){
					if(this.keyboard.substitute[j] === key){
						key = j
						break
					}
				}
				keyDiv.innerText = key.toUpperCase()
				valueDiv.appendChild(keyDiv)
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
		if(current.type === "language" || current.type === "select"){
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
		}else if(current.type === "gamepad"){
			this.mode = "gamepad"
			this.gamepadSelected = current.options.indexOf(value)
			this.gamepadSet()
			assets.sounds["se_don"].play()
			return
		}
		settings.setItem(name, value)
		this.getValue(name, this.items[this.selected].valueDiv)
		assets.sounds["se_ka"].play()
		if(current.type === "language"){
			this.setLang(allStrings[value])
		}
	}
	keyPressed(pressed, name, event){
		if(!pressed){
			return
		}
		this.touched = false
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
				selected = this.items[this.selected]
				selected.settingBox.classList.add("selected")
				selected.settingBox.scrollIntoView()
				assets.sounds["se_ka"].play()
			}else if(name === "back"){
				this.onEnd()
			}
		}else if(this.mode === "gamepad"){
			if(name === "confirm"){
				this.gamepadBack(true)
			}else if(name === "up" || name === "previous" || name === "next"){
				this.gamepadSet(name === "next" ? 1 : -1)
			}else if(name === "back"){
				this.gamepadBack()
			}
		}else if(this.mode === "keyboard"){
			if(name === "back"){
				this.keyboardBack(selected)
				assets.sounds["se_cancel"].play()
			}else{
				event.preventDefault()
				var currentKey = event.key.toLowerCase()
				for(var i in this.keyboardKeys){
					if(this.keyboardKeys[i][0] === currentKey || !currentKey){
						return
					}
				}
				var current = this.keyboardCurrent
				assets.sounds[current === "ka_l" || current === "ka_r" ? "se_ka" : "se_don"].play()
				this.keyboardKeys[current] = [currentKey]
				this.keyboardSet()
			}
		}
	}
	keyboardSet(){
		var selected = this.items[this.selected]
		var current = settings.items[selected.id]
		selected.valueDiv.innerHTML = ""
		for(var i in current.default){
			var keyDiv = document.createElement("div")
			keyDiv.style.color = i === "ka_l" || i === "ka_r" ? "#009aa5" : "#ef2c10"
			if(this.keyboardKeys[i]){
				var key = this.keyboardKeys[i][0]
				for(var j in this.keyboard.substitute){
					if(this.keyboard.substitute[j] === key){
						key = j
						break
					}
				}
				keyDiv.innerText = key.toUpperCase()
				selected.valueDiv.appendChild(keyDiv)
			}else{
				keyDiv.innerText = "[" + strings.settings[selected.id][i] + "]"
				selected.valueDiv.appendChild(keyDiv)
				this.keyboardCurrent = i
				return
			}
		}
		settings.setItem(selected.id, this.keyboardKeys)
		this.keyboardBack(selected)
		this.keyboard.update()
		pageEvents.setKbd()
	}
	keyboardBack(selected){
		this.mode = "settings"
		selected.settingBox.style.animation = ""
		selected.valueDiv.classList.remove("selected")
		this.getValue(selected.id, selected.valueDiv)
	}
	gamepadSet(diff){
		if(this.mode !== "gamepad"){
			return
		}
		var selected = this.items[this.selected]
		var current = settings.items[selected.id]
		if(diff){
			this.gamepadSelected = this.mod(current.options.length, this.gamepadSelected + diff)
			assets.sounds["se_ka"].play()
		}
		var opt = current.options[this.gamepadSelected]
		var value = strings.settings[selected.id][opt]
		this.gamepadValue.innerText = value
		this.gamepadValue.setAttribute("alt", value)
		this.gamepadButtons.style.backgroundPosition = "0 " + (-318 - 132 * this.gamepadSelected) + "px"
		this.gamepadSettings.style.display = "block"
	}
	gamepadBack(confirm){
		if(this.mode !== "gamepad"){
			return
		}
		var selected = this.items[this.selected]
		var current = settings.items[selected.id]
		settings.setItem(selected.id, current.options[this.gamepadSelected])
		this.getValue(selected.id, selected.valueDiv)
		assets.sounds[confirm ? "se_don" : "se_cancel"].play()
		this.gamepadSettings.style.display = ""
		this.mode = "settings"
	}
	defaultSettings(){
		if(this.mode === "keyboard"){
			this.keyboardBack(this.items[this.selected])
		}
		for(var i in settings.items){
			settings.setItem(i, null)
		}
		this.setLang(allStrings[settings.getItem("language")])
		this.keyboard.update()
		pageEvents.setKbd()
		assets.sounds["se_don"].play()
	}
	onEnd(){
		this.clean()
		assets.sounds["se_don"].play()
		setTimeout(() => {
			if(this.tutorial && !this.touched){
				new Tutorial(false, this.songId)
			}else{
				try{
					localStorage.setItem("tutorial", "true")
				}catch(e){}
				new SongSelect(this.tutorial ? false : "settings", false, this.touched, this.songId)
			}
		}, 500)
	}
	setLang(lang){
		settings.setLang(lang)
		if(failedTests.length !== 0){
			showUnsupported(strings)
		}
		for(var i in this.items){
			var item = this.items[i]
			if(item.valueDiv){
				var name = strings.settings[item.id].name
				item.nameDiv.innerText = name
				item.nameDiv.setAttribute("alt", name)
				this.getValue(item.id, item.valueDiv)
			}
		}
		this.setStrings()
	}
	setStrings(){
		this.viewTitle.innerText = strings.gameSettings
		this.viewTitle.setAttribute("alt", strings.gameSettings)
		this.endButton.innerText = strings.settings.ok
		this.endButton.setAttribute("alt", strings.settings.ok)
		this.gamepadTitle.innerText = strings.settings.gamepadLayout.name
		this.gamepadTitle.setAttribute("alt", strings.settings.gamepadLayout.name)
		this.gamepadEndButton.innerText = strings.settings.ok
		this.gamepadEndButton.setAttribute("alt", strings.settings.ok)
		this.defaultButton.innerText = strings.settings.default
		this.defaultButton.setAttribute("alt", strings.settings.default)
	}
	mod(length, index){
		return ((index % length) + length) % length
	}
	clean(){
		this.keyboard.clean()
		this.gamepad.clean()
		assets.sounds["bgm_settings"].stop()
		for(var i in this.items){
			this.removeTouch(this.items[i].settingBox)
		}
		if(this.defaultButton){
			delete this.defaultButton
		}
		this.removeTouch(this.gamepadSettings)
		this.removeTouch(this.gamepadEndButton)
		this.removeTouch(this.gamepadBox)
		delete this.tutorialTitle
		delete this.endButton
		delete this.items
		delete this.gamepadSettings
		delete this.gamepadTitle
		delete this.gamepadEndButton
		delete this.gamepadBox
		delete this.gamepadButtons
		delete this.gamepadValue
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
