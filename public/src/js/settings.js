class Settings{
	constructor(){
		var ios = /iPhone|iPad/.test(navigator.userAgent)
		var phone = /Android|iPhone|iPad/.test(navigator.userAgent)
		this.allLanguages = []
		for(var i in allStrings){
			this.allLanguages.push(i)
		}
		
		this.items = {
			language: {
				type: "language",
				options: this.allLanguages,
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
			},
			latency: {
				type: "latency",
				default: {
					"audio": 0,
					"video": 0,
					"drumSounds": true
				}
			},
			easierBigNotes: {
				type: "toggle",
				default: false
			},
			showLyrics: {
				type: "toggle",
				default: true
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
					}else if(current.type === "latency"){
						var obj = {}
						for(var j in current.default){
							if(storage[i] && j in storage[i]){
								if(j === "drumSounds"){
									obj[j] = !!storage[i][j]
									continue
								}else if(!isNaN(storage[i][j])){
									obj[j] = Math.round(parseFloat(storage[i][j]) || 0)
									continue
								}
							}
							obj = null
							break
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
		return this.allLanguages[0]
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
	constructor(touchEnabled, tutorial, songId, toSetting){
		this.touchEnabled = touchEnabled
		this.tutorial = tutorial
		this.songId = songId
		
		loader.changePage("settings", tutorial)
		assets.sounds["bgm_settings"].playLoop(0.1, false, 0, 1.392, 26.992)
		this.defaultButton = document.getElementById("settings-default")
		this.viewOuter = this.getElement("view-outer")
		if(touchEnabled){
			this.viewOuter.classList.add("touch-enabled")
		}
		this.touchEnd = []
		this.windowSymbol = Symbol()
		this.touchMove = {
			active: false,
			x: 0,
			y: 0
		}
		pageEvents.add(window, ["mouseup", "touchstart", "touchmove", "touchend", "blur"], event => {
			var move = this.touchMove
			if(event.type === "touchstart"){
				var cursor = event.changedTouches[0]
				move.active = false
				move.x = cursor.pageX
				move.y = cursor.pageY
			}else if(event.type === "touchmove"){
				var cursor = event.changedTouches[0]
				if (Math.abs(move.x - cursor.pageX) > 10 || Math.abs(move.y - cursor.pageY) > 10){
					move.active = true
				}
			}else{
				this.touchEnd.forEach(func => func(event))
				move.active = false
			}
		}, this.windowSymbol)
		
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
		
		this.pressedKeys = {}
		this.keyboard = new Keyboard({
			"confirm": ["enter", "space", "don_l", "don_r"],
			"up": ["up"],
			"right": ["right", "ka_r"],
			"down": ["down"],
			"left": ["left", "ka_l"],
			"back": ["esc"],
			"other": ["wildcard"]
		}, this.keyPressed.bind(this))
		this.gamepad = new Gamepad({
			"confirm": ["b", "ls", "rs"],
			"up": ["u", "lsu"],
			"right": ["r", "rb", "rt", "lsr"],
			"down": ["d", "lsd"],
			"left": ["l", "lb", "lt", "lsl"],
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
			this.setAltText(nameDiv, name)
			settingBox.appendChild(nameDiv)
			var valueDiv = document.createElement("div")
			valueDiv.classList.add("setting-value")
			this.getValue(i, valueDiv)
			settingBox.appendChild(valueDiv)
			content.appendChild(settingBox)
			if(!toSetting && this.items.length === this.selected || toSetting === i){
				this.selected = this.items.length
				settingBox.classList.add("selected")
			}
			this.addTouchEnd(settingBox, event => this.setValue(i))
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
		
		this.latencySettings = document.getElementById("settings-latency")
		this.addTouch(this.latencySettings, event => {
			if(event.target === event.currentTarget){
				this.latencyBack()
			}
		})
		this.latencyTitle = this.latencySettings.getElementsByClassName("view-title")[0]
		this.latencyItems = []
		this.latencySelected = 0
		var latencyContent = this.latencySettings.getElementsByClassName("view-content")[0]
		var latencyWindow = ["calibration", "audio", "video", "drumSounds"]
		for(let i in latencyWindow){
			let current = latencyWindow[i]
			var settingBox = document.createElement("div")
			settingBox.classList.add("setting-box")
			var nameDiv = document.createElement("div")
			nameDiv.classList.add("setting-name", "stroke-sub")
			var name = strings.settings.latency[current]
			this.setAltText(nameDiv, name)
			settingBox.appendChild(nameDiv)
			let outputObject = {
				id: current,
				settingBox: settingBox,
				nameDiv: nameDiv
			}
			if(current === "calibration"){
				nameDiv.style.width = "100%"
			}else{
				var valueDiv = document.createElement("div")
				valueDiv.classList.add("setting-value")
				settingBox.appendChild(valueDiv)
				var valueText = document.createTextNode("")
				valueDiv.appendChild(valueText)
				this.latencyGetValue(current, valueText)
				if(current !== "drumSounds"){
					var buttons = document.createElement("div")
					buttons.classList.add("latency-buttons")
					var buttonMinus = document.createElement("span")
					buttonMinus.innerText = "-"
					buttons.appendChild(buttonMinus)
					this.addTouchRepeat(buttonMinus, event => {
						this.latencySetAdjust(outputObject, -1)
					})
					var buttonPlus = document.createElement("span")
					buttonPlus.innerText = "+"
					buttons.appendChild(buttonPlus)
					this.addTouchRepeat(buttonPlus, event => {
						this.latencySetAdjust(outputObject, 1)
					})
					valueDiv.appendChild(buttons)
				}
			}
			latencyContent.appendChild(settingBox)
			if(this.latencyItems.length === this.latencySelected){
				settingBox.classList.add("selected")
			}
			this.addTouch(settingBox, event => {
				if(event.target.tagName !== "SPAN"){
					this.latencySetValue(current, event.type === "touchstart")
				}
			})
			if(current !== "calibration"){
				outputObject.valueDiv = valueDiv
				outputObject.valueText = valueText
				outputObject.buttonMinus = buttonMinus
				outputObject.buttonPlus = buttonPlus
			}
			this.latencyItems.push(outputObject)
		}
		this.latencyDefaultButton = document.getElementById("latency-default")
		this.latencyItems.push({
			id: "default",
			settingBox: this.latencyDefaultButton
		})
		this.addTouch(this.latencyDefaultButton, event => this.latencyDefault())
		this.latencyEndButton = this.latencySettings.getElementsByClassName("view-end-button")[0]
		this.latencyItems.push({
			id: "back",
			settingBox: this.latencyEndButton
		})
		this.addTouch(this.latencyEndButton, event => this.latencyBack(true))
		
		this.setStrings()
		
		this.drumSounds = settings.getItem("latency").drumSounds
		this.playedSounds = {}
		this.redrawRunning = true
		this.redrawBind = this.redraw.bind(this)
		this.redraw()
		if(toSetting === "latency"){
			this.mode = "latency"
			this.latencySet()
		}
		pageEvents.send("settings")
	}
	getElement(name){
		return loader.screen.getElementsByClassName(name)[0]
	}
	addTouch(element, callback, end){
		var touchEvent = end ? "touchend" : "touchstart"
		pageEvents.add(element, ["mousedown", touchEvent], event => {
			if(event.type === touchEvent){
				event.preventDefault()
				this.touched = true
			}else if(event.which !== 1){
				return
			}else{
				this.touched = false
			}
			if(event.type !== "touchend" || !this.touchMove.active){
				callback(event)
			}
		})
	}
	addTouchEnd(element, callback){
		this.addTouch(element, callback, true)
	}
	addTouchRepeat(element, callback){
		this.addTouch(element, event => {
			var active = true
			var func = () => {
				active = false
				this.touchEnd.splice(this.touchEnd.indexOf(func), 1)
			}
			this.touchEnd.push(func)
			var repeat = delay => {
				if(active){
					callback()
					setTimeout(() => repeat(50), delay)
				}
			}
			repeat(400)
		})
	}
	removeTouch(element){
		pageEvents.remove(element, ["mousedown", "touchstart"])
	}
	removeTouchEnd(element){
		pageEvents.remove(element, ["mousedown", "touchend"])
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
		}else if(current.type === "latency"){
			var audioVideo = [Math.round(value.audio), Math.round(value.video)]
			var latencyValue = strings.settings[name].value.split("%s")
			var latencyIndex = 0
			value = ""
			latencyValue.forEach((string, i) => {
				if(i !== 0){
					value += this.addMs(audioVideo[latencyIndex++])
				}
				value += string
			})
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
				this.playSound("se_don")
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
			this.playSound("se_don")
			return
		}else if(current.type === "gamepad"){
			this.mode = "gamepad"
			this.gamepadSelected = current.options.indexOf(value)
			this.gamepadSet()
			this.playSound("se_don")
			return
		}else if(current.type === "latency"){
			this.mode = "latency"
			this.latencySet()
			this.playSound("se_don")
			return
		}
		settings.setItem(name, value)
		this.getValue(name, this.items[this.selected].valueDiv)
		this.playSound("se_ka")
		if(current.type === "language"){
			this.setLang(allStrings[value])
		}
	}
	keyPressed(pressed, name, event, repeat){
		if(pressed){
			if(!this.pressedKeys[name]){
				this.pressedKeys[name] = this.getMS() + 300
			}
		}else{
			this.pressedKeys[name] = 0
			return
		}
		if(repeat && name !== "up" && name !== "right" && name !== "down" && name !== "left"){
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
			}else if(name === "up" || name === "right" || name === "down" || name === "left"){
				selected.settingBox.classList.remove("selected")
				do{
					this.selected = this.mod(this.items.length, this.selected + ((name === "right" || name === "down") ? 1 : -1))
				}while(this.items[this.selected].id === "default" && name !== "left")
				selected = this.items[this.selected]
				selected.settingBox.classList.add("selected")
				this.scrollTo(selected.settingBox)
				this.playSound("se_ka")
			}else if(name === "back"){
				this.onEnd()
			}
		}else if(this.mode === "gamepad"){
			if(name === "confirm"){
				this.gamepadBack(true)
			}else if(name === "up" || name === "right" || name === "down" || name === "left"){
				this.gamepadSet((name === "right" || name === "down") ? 1 : -1)
			}else if(name === "back"){
				this.gamepadBack()
			}
		}else if(this.mode === "keyboard"){
			if(name === "back"){
				this.keyboardBack(selected)
				this.playSound("se_cancel")
			}else if(event){
				event.preventDefault()
				var currentKey = event.key.toLowerCase()
				for(var i in this.keyboardKeys){
					if(this.keyboardKeys[i][0] === currentKey || !currentKey){
						return
					}
				}
				var current = this.keyboardCurrent
				this.playSound(current === "ka_l" || current === "ka_r" ? "se_ka" : "se_don")
				this.keyboardKeys[current] = [currentKey]
				this.keyboardSet()
			}
		}else if(this.mode === "latency"){
			var latencySelected = this.latencyItems[this.latencySelected]
			if(name === "confirm"){
				if(latencySelected.id === "back"){
					this.latencyBack(true)
				}else if(latencySelected.id === "default"){
					this.latencyDefault()
				}else{
					this.latencySetValue(latencySelected.id)
				}
			}else if(name === "up" || name === "right" || name === "down" || name === "left"){
				latencySelected.settingBox.classList.remove("selected")
				do{
					this.latencySelected = this.mod(this.latencyItems.length, this.latencySelected + ((name === "right" || name === "down") ? 1 : -1))
				}while(this.latencyItems[this.latencySelected].id === "default" && name !== "left")
				latencySelected = this.latencyItems[this.latencySelected]
				latencySelected.settingBox.classList.add("selected")
				latencySelected.settingBox.scrollIntoView()
				this.playSound("se_ka")
			}else if(name === "back"){
				this.latencyBack()
			}
		}else if(this.mode === "latencySet"){
			var latencySelected = this.latencyItems[this.latencySelected]
			if(name === "confirm" || name === "back"){
				this.latencySetBack(latencySelected)
				this.playSound(name === "confirm" ? "se_don" : "se_cancel")
			}else if(name === "up" || name === "right" || name === "down" || name === "left"){
				this.latencySetAdjust(latencySelected, (name === "up" || name === "right") ? 1 : -1)
			}
		}
	}
	scrollTo(element){
		var parentNode = element.parentNode
		var selected = element.getBoundingClientRect()
		var parent = parentNode.getBoundingClientRect()
		var scrollY = parentNode.scrollTop
		var selectedPosTop = selected.top - selected.height / 2
		if(Math.floor(selectedPosTop) < Math.floor(parent.top)){
			parentNode.scrollTop += selectedPosTop - parent.top
		}else{
			var selectedPosBottom = selected.top + selected.height * 1.5 - parent.top
			if(Math.floor(selectedPosBottom) > Math.floor(parent.height)){
				parentNode.scrollTop += selectedPosBottom - parent.height
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
			this.playSound("se_ka")
		}
		var opt = current.options[this.gamepadSelected]
		var value = strings.settings[selected.id][opt]
		this.setAltText(this.gamepadValue, value)
		this.gamepadButtons.style.backgroundPosition = "0 " + (-11.87 - 4.93 * this.gamepadSelected) + "em"
		this.gamepadSettings.style.display = "flex"
	}
	gamepadBack(confirm){
		if(this.mode !== "gamepad"){
			return
		}
		var selected = this.items[this.selected]
		var current = settings.items[selected.id]
		settings.setItem(selected.id, current.options[this.gamepadSelected])
		this.getValue(selected.id, selected.valueDiv)
		this.playSound(confirm ? "se_don" : "se_cancel")
		this.gamepadSettings.style.display = ""
		this.mode = "settings"
	}
	latencySet(){
		if(this.mode !== "latency"){
			return
		}
		var selected = this.items[this.selected]
		var current = settings.items[selected.id]
		this.latencySettings.style.display = "flex"
	}
	latencyGetValue(name, valueText){
		var currentLatency = settings.getItem("latency")
		if(name === "drumSounds"){
			valueText.data = currentLatency[name] ? strings.settings.on : strings.settings.off
		}else{
			valueText.data = this.addMs(currentLatency[name] || 0)
		}
	}
	latencySetValue(name, touched){
		var selectedIndex = this.latencyItems.findIndex(item => item.id === name)
		var selected = this.latencyItems[selectedIndex]
		if(this.mode === "latencySet"){
			this.latencySetBack(this.latencyItems[this.latencySelected])
			if(this.latencySelected === selectedIndex){
				this.playSound("se_don")
				return
			}
		}else if(this.mode !== "latency"){
			return
		}
		if(name === "calibration"){
			this.playSound("se_don")
			this.clean()
			new LoadSong({
				"title": strings.calibration.title,
				"folder": "calibration",
				"type": "tja",
				"songSkin": {}
			}, false, false, touched)
		}else if(name === "drumSounds"){
			this.drumSounds = !settings.getItem("latency")[name]
			this.latencySave(name, this.drumSounds)
			this.latencyGetValue(name, selected.valueText)
			this.playSound("se_don")
		}else{
			var value = Math.round(settings.getItem("latency")[name] || 0)
			if(this.latencySelected !== selectedIndex){
				this.latencyItems[this.latencySelected].settingBox.classList.remove("selected")
				this.latencySelected = selectedIndex
				selected.settingBox.classList.add("selected")
			}
			this.mode = "latencySet"
			selected.settingBox.style.animation = "none"
			selected.valueDiv.classList.add("selected")
			selected.value = value
			this.playSound("se_don")
		}
	}
	latencySetAdjust(selected, add){
		selected.value += add
		if(selected.value > 500){
			selected.value = 500
		}else if(selected.value < -200){
			selected.value = -200
		}else{
			this.playSound("se_ka")
		}
		selected.valueText.data = this.addMs(selected.value)
	}
	latencySetBack(selected){
		this.mode = "latency"
		selected.settingBox.style.animation = ""
		selected.valueDiv.classList.remove("selected")
		this.latencySave(selected.id, selected.value)
		this.latencyGetValue(selected.id, selected.valueText)
	}
	latencySave(id, value){
		var input = settings.getItem("latency")
		var output = {}
		for(var i in input){
			if(i === id){
				output[i] = value
			}else{
				output[i] = input[i]
			}
		}
		settings.setItem("latency", output)
	}
	latencyDefault(){
		if(this.mode === "latencySet"){
			this.latencySetBack(this.latencyItems[this.latencySelected])
		}else if(this.mode !== "latency"){
			return
		}
		settings.setItem("latency", null)
		this.latencyItems.forEach(item => {
			if(item.id === "audio" || item.id === "video" || item.id === "drumSounds"){
				this.latencyGetValue(item.id, item.valueText)
			}
		})
		this.drumSounds = settings.getItem("latency").drumSounds
		this.playSound("se_don")
	}
	latencyBack(confirm){
		if(this.mode === "latencySet"){
			this.latencySetBack(this.latencyItems[this.latencySelected])
			if(!confirm){
				this.playSound("se_don")
				return
			}
		}
		if(this.mode !== "latency"){
			return
		}
		var selected = this.items[this.selected]
		var current = settings.items[selected.id]
		this.getValue(selected.id, selected.valueDiv)
		this.playSound(confirm ? "se_don" : "se_cancel")
		this.latencySettings.style.display = ""
		this.mode = "settings"
	}
	addMs(input){
		var split = strings.calibration.ms.split("%s")
		var index = 0
		var output = ""
		var inputStrings = [(input > 0 ? "+" : "") + input.toString()]
		split.forEach((string, i) => {
			if(i !== 0){
				output += inputStrings[index++]
			}
			output += string
		})
		return output
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
		this.latencyItems.forEach(item => {
			if(item.id === "audio" || item.id === "video" || item.id === "drumSounds"){
				this.latencyGetValue(item.id, item.valueText)
			}
		})
		this.drumSounds = settings.getItem("latency").drumSounds
		this.playSound("se_don")
	}
	onEnd(){
		this.clean()
		this.playSound("se_don")
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
				this.setAltText(item.nameDiv, name)
				this.getValue(item.id, item.valueDiv)
			}
		}
		for(var i in this.latencyItems){
			var current = this.latencyItems[i]
			if(current.nameDiv){
				this.setAltText(current.nameDiv, strings.settings.latency[current.id])
			}
			if(current.valueText){
				this.latencyGetValue(current.id, current.valueText)
			}
		}
		this.setStrings()
	}
	setStrings(){
		this.setAltText(this.viewTitle, strings.gameSettings)
		this.setAltText(this.endButton, strings.settings.ok)
		this.setAltText(this.gamepadTitle, strings.settings.gamepadLayout.name)
		this.setAltText(this.gamepadEndButton, strings.settings.ok)
		this.setAltText(this.latencyTitle, strings.settings.latency.name)
		this.setAltText(this.latencyDefaultButton, strings.settings.default)
		this.setAltText(this.latencyEndButton, strings.settings.ok)
		this.setAltText(this.defaultButton, strings.settings.default)
	}
	setAltText(element, text){
		element.innerText = text
		element.setAttribute("alt", text)
	}
	mod(length, index){
		return ((index % length) + length) % length
	}
	playSound(id, time){
		if(!this.drumSounds && (id === "se_don" || id === "se_ka" || id === "se_cancel")){
			return
		}
		var ms = Date.now() + (time || 0) * 1000
		if(!(id in this.playedSounds) || ms > this.playedSounds[id] + 30){
			assets.sounds[id].play(time)
			this.playedSounds[id] = ms
		}
	}
	redraw(){
		if(!this.redrawRunning){
			return
		}
		requestAnimationFrame(this.redrawBind)
		var ms = this.getMS()
		
		for(var key in this.pressedKeys){
			if(this.pressedKeys[key]){
				if(ms >= this.pressedKeys[key] + 50){
					this.keyPressed(true, key, null, true)
					this.pressedKeys[key] = ms
				}
			}
		}
	}
	getMS(){
		return Date.now()
	}
	clean(){
		this.redrawRunning = false
		this.keyboard.clean()
		this.gamepad.clean()
		assets.sounds["bgm_settings"].stop()
		pageEvents.remove(window, ["mouseup", "touchstart", "touchmove", "touchend", "blur"], this.windowSymbol)
		for(var i in this.items){
			this.removeTouchEnd(this.items[i].settingBox)
		}
		for(var i in this.latencyItems){
			this.removeTouch(this.latencyItems[i].settingBox)
			if(this.latencyItems[i].buttonMinus){
				this.removeTouch(this.latencyItems[i].buttonMinus)
				this.removeTouch(this.latencyItems[i].buttonPlus)
			}
		}
		if(this.defaultButton){
			delete this.defaultButton
		}
		this.removeTouch(this.gamepadSettings)
		this.removeTouch(this.gamepadEndButton)
		this.removeTouch(this.gamepadBox)
		this.removeTouch(this.latencySettings)
		this.removeTouch(this.latencyDefaultButton)
		this.removeTouch(this.latencyEndButton)
		delete this.windowSymbol
		delete this.touchMove
		delete this.viewOuter
		delete this.touchEnd
		delete this.tutorialTitle
		delete this.endButton
		delete this.items
		delete this.gamepadSettings
		delete this.gamepadTitle
		delete this.gamepadEndButton
		delete this.gamepadBox
		delete this.gamepadButtons
		delete this.gamepadValue
		delete this.latencyItems
		delete this.latencySettings
		delete this.latencyTitle
		delete this.latencyDefaultButton
		delete this.latencyEndButton
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
