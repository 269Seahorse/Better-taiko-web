class Titlescreen{
	constructor(songId){
		this.songId = songId
		
		if(!songId){
			loader.changePage("titlescreen", false)
			
			this.titleScreen = document.getElementById("title-screen")
			this.proceed = document.getElementById("title-proceed")
			this.langDropdown = document.getElementById("lang-dropdown")
			this.langId = document.getElementById("lang-id")
			this.disclaimerText = document.getElementById("title-disclaimer-text")
			this.disclaimerCopyright = document.getElementById("title-disclaimer-copyright")
			document.getElementById("globe-path").setAttribute("d", vectors.globe)
			this.logo = new Logo()
		}
		this.lang = settings.getItem("language")
		this.setLang(allStrings[this.lang], true)
		
		if(songId){
			if(localStorage.getItem("tutorial") === "true"){
				new SongSelect(false, false, this.touched, this.songId)
			}else{
				new Tutorial(false, this.songId)
			}
		}else{
			this.addLangs()
			
			pageEvents.keyAdd(this, "all", "down", this.keyDown.bind(this))
			pageEvents.add(this.titleScreen, ["mousedown", "touchstart"], this.onPressed.bind(this))
			pageEvents.add(this.langDropdown, "change", this.langChange.bind(this))
			
			assets.sounds["v_title"].play()
			var kbdSettings = settings.getItem("keyboardSettings")
			this.kbd = {
				confirm: ["enter", " ", kbdSettings.don_l[0], kbdSettings.don_r[0]]
			}
			this.gamepad = new Gamepad({
				confirm: ["a", "b", "x", "y", "start", "ls", "rs"]
			}, pressed => {
				if(pressed){
					this.onPressed()
				}
			})
			if(p2.session){
				pageEvents.add(p2, "message", response => {
					if(response.type === "songsel"){
						this.goNext(true)
					}
				})
			}
			pageEvents.send("title-screen")
		}
	}
	
	keyDown(event, key){
		if(!key){
			if(event.repeat || event.target === this.langDropdown){
				return
			}
			for(var i in this.kbd){
				if(this.kbd[i].indexOf(event.key.toLowerCase()) !== -1){
					key = i
					break
				}
			}
		}
		if(key === "confirm"){
			this.onPressed()
		}
	}
	onPressed(event){
		if(event){
			if(event.type === "touchstart"){
				event.preventDefault()
				this.touched = true
			}else if(event.type === "mousedown" && event.which !== 1){
				return
			}
		}
		this.titleScreen.style.cursor = "auto"
		this.clean()
		assets.sounds["se_don"].play()
		this.goNext()
	}
	goNext(fromP2){
		if(p2.session && !fromP2){
			p2.send("songsel")
		}else if(fromP2 || this.touched || localStorage.getItem("tutorial") === "true"){
			if(this.touched){
				localStorage.setItem("tutorial", "true")
			}
			pageEvents.remove(p2, "message")
			setTimeout(() => {
				new SongSelect(false, false, this.touched, this.songId)
			}, 500)
		}else{
			setTimeout(() => {
				new Tutorial(false, this.songId)
			}, 500)
		}
	}
	
	setLang(lang, noEvent){
		settings.setLang(lang, noEvent || this.songId)
		if(this.songId){
			return
		}
		this.proceed.innerText = strings.titleProceed
		this.proceed.setAttribute("alt", strings.titleProceed)
		this.langId.innerText = strings.id.toUpperCase()
		this.langId.setAttribute("alt", strings.id.toUpperCase())
		
		this.disclaimerText.innerText = strings.titleDisclaimer
		this.disclaimerText.setAttribute("alt", strings.titleDisclaimer)
		this.disclaimerCopyright.innerText = strings.titleCopyright
		this.disclaimerCopyright.setAttribute("alt", strings.titleCopyright)
		
		this.logo.updateSubtitle()
	}
	addLangs(){
		for(var i in allStrings){
			var option = document.createElement("option")
			option.value = i
			if(i === this.lang){
				option.selected = true
			}
			option.appendChild(document.createTextNode(allStrings[i].name))
			this.langDropdown.appendChild(option)
		}
	}
	langChange(){
		this.lang = this.langDropdown.value
		settings.setItem("language", this.lang)
		this.setLang(allStrings[this.lang])
	}
	
	clean(){
		this.gamepad.clean()
		this.logo.clean()
		assets.sounds["v_title"].stop()
		pageEvents.keyRemove(this, "all")
		pageEvents.remove(this.titleScreen, ["mousedown", "touchstart"])
		pageEvents.remove(this.langDropdown, "change")
		delete this.titleScreen
		delete this.proceed
		delete this.titleDisclaimer
		delete this.titleCopyright
		delete this.langDropdown
	}
}
