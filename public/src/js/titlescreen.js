class Titlescreen{
	constructor(songId){
		this.songId = songId
		db.getItem("customFolder").then(folder => this.customFolder = folder)
		
		if(!songId){
			loader.changePage("titlescreen", false)
			
			this.titleScreen = document.getElementById("title-screen")
			this.proceed = document.getElementById("title-proceed")
			this.disclaimerText = document.getElementById("title-disclaimer-text")
			this.disclaimerCopyright = document.getElementById("title-disclaimer-copyright")
			this.logo = new Logo()
		}
		this.setLang(allStrings[settings.getItem("language")])
		
		if(songId){
			if(localStorage.getItem("tutorial") === "true"){
				new SongSelect(false, false, this.touched, this.songId)
			}else{
				new SettingsView(false, true, this.songId)
			}
		}else{
			pageEvents.add(this.titleScreen, ["mousedown", "touchstart"], event => {
				if(event.type === "touchstart"){
					event.preventDefault()
					this.touched = true
				}else if(event.type === "mousedown" && event.which !== 1){
					return
				}
				this.onPressed(true)
			})
			
			assets.sounds["v_title"].play()
			this.keyboard = new Keyboard({
				confirm: ["enter", "space", "don_l", "don_r"]
			}, this.onPressed.bind(this))
			this.gamepad = new Gamepad({
				gamepadConfirm: ["a", "b", "x", "y", "start", "ls", "rs"]
			}, this.onPressed.bind(this))
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
	
	onPressed(pressed, name){
		if(pressed){
			if(name === "gamepadConfirm" && (snd.buffer.context.state === "suspended" || this.customFolder)){
				return
			}
			this.titleScreen.style.cursor = "auto"
			this.clean()
			if(!this.customFolder || assets.customSongs){
				assets.sounds["se_don"].play()
			}
			this.goNext()
		}
	}
	goNext(fromP2){
		if(p2.session && !fromP2){
			p2.send("songsel")
		}else{
			if(fromP2 || this.customFolder || localStorage.getItem("tutorial") === "true"){
				if(this.touched){
					localStorage.setItem("tutorial", "true")
				}
				pageEvents.remove(p2, "message")
				if(this.customFolder && !fromP2 && !assets.customSongs){
					var customSongs = new CustomSongs(this.touched, true)
					var soundPlayed = false
					var promises = []
					var allFiles = []
					this.customFolder.forEach(file => {
						promises.push(customSongs.walkFilesystem(file, undefined, allFiles))
					})
					Promise.all(promises).then(() => {
						assets.sounds["se_don"].play()
						soundPlayed = true
						return customSongs.importLocal(allFiles)
					}).catch(() => {
						localStorage.removeItem("customSelected")
						db.removeItem("customFolder")
						if(!soundPlayed){
							assets.sounds["se_don"].play()
						}
						setTimeout(() => {
							new SongSelect(false, false, this.touched, this.songId)
						}, 500)
					})
				}else{
					setTimeout(() => {
						new SongSelect(false, false, this.touched, this.songId)
					}, 500)
				}
			}else{
				setTimeout(() => {
					new SettingsView(this.touched, true, this.songId)
				}, 500)
			}
		}
	}
	setLang(lang, noEvent){
		settings.setLang(lang, true)
		if(this.songId){
			return
		}
		this.proceed.innerText = strings.titleProceed
		this.proceed.setAttribute("alt", strings.titleProceed)
		
		this.disclaimerText.innerText = strings.titleDisclaimer
		this.disclaimerText.setAttribute("alt", strings.titleDisclaimer)
		this.disclaimerCopyright.innerText = strings.titleCopyright
		this.disclaimerCopyright.setAttribute("alt", strings.titleCopyright)
		
		this.logo.updateSubtitle()
	}
	clean(){
		this.keyboard.clean()
		this.gamepad.clean()
		this.logo.clean()
		assets.sounds["v_title"].stop()
		pageEvents.remove(this.titleScreen, ["mousedown", "touchstart"])
		delete this.titleScreen
		delete this.proceed
		delete this.titleDisclaimer
		delete this.titleCopyright
	}
}
