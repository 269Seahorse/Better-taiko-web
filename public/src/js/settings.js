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
		loader.changePage("settings", true)
		this.endButton = document.getElementById("tutorial-end-button")
		if(touchEnabled){
			document.getElementById("tutorial-outer").classList.add("touch-enabled")
		}
		
		var tutorialTitle = document.getElementById("tutorial-title")
		tutorialTitle.innerText = strings.gameSettings
		tutorialTitle.setAttribute("alt", strings.gameSettings)
		this.endButton.innerText = strings.settings.ok
		this.endButton.setAttribute("alt", strings.settings.ok)
		this.resolution = settings.getItem("resolution")
		
		var content = document.getElementById("tutorial-content")
		this.items = []
		this.selected = 0
		for(let i in settings.items){
			if(!touchEnabled && settings.items[i].touch){
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
			valueDiv.innerText = this.getValue(i)
			settingBox.appendChild(valueDiv)
			content.appendChild(settingBox)
			if(this.items.length === this.selected){
				settingBox.classList.add("selected")
			}
			pageEvents.add(settingBox, ["mousedown", "touchstart"], event => {
				event.preventDefault()
				this.setValue(i)
			})
			this.items.push({
				id: i,
				settingBox: settingBox,
				valueDiv: valueDiv
			})
		}
		this.items.push({
			id: "back",
			settingBox: this.endButton
		})
		
		this.kbd = {
			"confirm": [13, 32, 70, 74], // Enter, Space, F, J
			"previous": [37, 38, 68], // Left, Up, D
			"next": [39, 40, 75], // Right, Down, K
			"back": [8, 27] // Backspace, Esc
		}
		pageEvents.once(this.endButton, ["mousedown", "touchstart"]).then(this.onEnd.bind(this))
		pageEvents.keyAdd(this, "all", "down", this.keyEvent.bind(this))
		this.gamepad = new Gamepad({
			"confirm": ["b", "ls", "rs"],
			"previous": ["u", "l", "lb", "lt", "lsu", "lsl"],
			"next": ["d", "r", "rb", "rt", "lsd", "lsr"],
			"back": ["start", "a"]
		}, this.keyPressed.bind(this))
		
		pageEvents.send("settings")
	}
	getValue(name){
		var current = settings.items[name]
		var value = settings.getItem(name)
		if(current.type === "select"){
			value = strings.settings[name][value]
		}else if(current.type === "toggle"){
			value = value ? strings.settings.on : strings.settings.off
		}
		return value
	}
	setValue(name){
		var current = settings.items[name]
		var value = settings.getItem(name)
		if(current.type === "select"){
			value = current.options[this.mod(current.options.length, current.options.indexOf(value) + 1)]
		}else if(current.type === "toggle"){
			value = !value
		}
		settings.setItem(name, value)
		this.selected = this.items.findIndex(item => item.id === name)
		this.items[this.selected].valueDiv.innerText = this.getValue(name)
	}
	keyEvent(event){
		if(event.keyCode === 27 || event.keyCode === 8 || event.keyCode === 9){
			// Escape, Backspace, Tab
			event.preventDefault()
		}
		if(!event.repeat){
			for(var i in this.kbd){
				if(this.kbd[i].indexOf(event.keyCode) !== -1){
					this.keyPressed(true, i)
					break
				}
			}
		}
	}
	keyPressed(pressed, name){
		if(!pressed){
			return
		}
		var selected = this.items[this.selected]
		if(name === "confirm"){
			if(selected.id === "back"){
				this.onEnd()
			}else{
				this.setValue(selected.id)
			}
		}else if(name === "previous" || name === "next"){
			selected.settingBox.classList.remove("selected")
			this.selected = this.mod(this.items.length, this.selected + (name === "next" ? 1 : -1))
			this.items[this.selected].settingBox.classList.add("selected")
		}else if(name === "back"){
			this.onEnd()
		}
	}
	onEnd(event){
		var touched = false
		if(event && event.type === "touchstart"){
			event.preventDefault()
			touched = true
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
		pageEvents.keyRemove(this, "all")
		for(var i in this.items){
			pageEvents.remove(this.items[i].settingBox, ["mousedown", "touchstart"])
		}
		delete this.endButton
		delete this.items
		if(this.resolution !== settings.getItem("resolution")){
			for(var i in assets.image){
				if(i.startsWith("bg_song_") || i.startsWith("bg_stage_") || i.startsWith("bg_don_")){
					URL.revokeObjectURL(assets.image[i].src)
					delete assets.image[i]
				}
			}
		}
	}
}
