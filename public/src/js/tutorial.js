class Tutorial{
	constructor(fromSongSel, songId){
		this.fromSongSel = fromSongSel
		this.songId = songId
		loader.changePage("tutorial", true)
		assets.sounds["bgm_setsume"].playLoop(0.1, false, 0, 1.054, 16.054)
		this.endButton = this.getElement("view-end-button")
		
		this.tutorialTitle = this.getElement("view-title")
		this.tutorialDiv = document.createElement("div")
		this.getElement("view-content").appendChild(this.tutorialDiv)
		this.setStrings()
		
		pageEvents.add(this.endButton, ["mousedown", "touchstart"], event => {
			if(event.type === "touchstart"){
				event.preventDefault()
				this.touched = true
			}else if(event.type === "mousedown" && event.which !== 1){
				return
			}
			this.onEnd(true)
		})
		this.keyboard = new Keyboard({
			confirm: ["enter", "space", "esc", "don_l", "don_r"]
		}, this.onEnd.bind(this))
		this.gamepad = new Gamepad({
			confirm: ["start", "b", "ls", "rs"]
		}, this.onEnd.bind(this))
		
		pageEvents.send("tutorial")
	}
	getElement(name){
		return loader.screen.getElementsByClassName(name)[0]
	}
	insertText(text, parent){
		parent.appendChild(document.createTextNode(text))
	}
	insertKey(key, parent){
		var kbd = document.createElement("kbd")
		kbd.innerText = key
		parent.appendChild(kbd)
	}
	onEnd(pressed, name){
		if(pressed){
			this.clean()
			assets.sounds["se_don"].play()
			try{
				localStorage.setItem("tutorial", "true")
			}catch(e){}
			setTimeout(() => {
				new SongSelect(this.fromSongSel ? "tutorial" : false, false, this.touched, this.songId)
			}, 500)
		}
	}
	setStrings(){
		this.tutorialTitle.innerText = strings.howToPlay
		this.tutorialTitle.setAttribute("alt", strings.howToPlay)
		this.endButton.innerText = strings.tutorial.ok
		this.endButton.setAttribute("alt", strings.tutorial.ok)
		this.tutorialDiv.innerHTML = ""
		var kbdSettings = settings.getItem("keyboardSettings")
		var pauseKey = pageEvents.kbd.indexOf("q") === -1 ? "Q" : "ESC"
		var keys = [
			kbdSettings.don_l[0].toUpperCase(),
			kbdSettings.don_r[0].toUpperCase(),
			kbdSettings.ka_l[0].toUpperCase(),
			kbdSettings.ka_r[0].toUpperCase(),
			pauseKey, "SHIFT", "CTRL"
		]
		var keyIndex = 0
		strings.tutorial.basics.forEach(string => {
			var par = document.createElement("p")
			var stringKeys = string.split("%s")
			stringKeys.forEach((stringKey, i) => {
				if(i !== 0){
					this.insertKey(keys[keyIndex++], par)
				}
				this.insertText(stringKey, par)
			})
			this.tutorialDiv.appendChild(par)
		})
		var par = document.createElement("p")
		var span = document.createElement("span")
		span.style.fontWeight = "bold"
		span.innerText = strings.tutorial.otherControls
		par.appendChild(span)
		strings.tutorial.otherTutorial.forEach(string => {
			par.appendChild(document.createElement("br"))
			var stringKeys = string.split("%s")
			stringKeys.forEach((stringKey, i) => {
				if(i !== 0){
					this.insertKey(keys[keyIndex++], par)
				}
				this.insertText(stringKey, par)
			})
		})
		this.tutorialDiv.appendChild(par)
	}
	clean(){
		this.keyboard.clean()
		this.gamepad.clean()
		pageEvents.remove(this.endButton, ["mousedown", "touchstart"])
		assets.sounds["bgm_setsume"].stop()
		delete this.tutorialTitle
		delete this.endButton
		delete this.tutorialDiv
	}
}
