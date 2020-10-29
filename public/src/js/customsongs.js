class CustomSongs{
	constructor(touchEnabled){
		this.touchEnabled = touchEnabled
		loader.changePage("customsongs", true)
		if(touchEnabled){
			this.getElement("view-outer").classList.add("touch-enabled")
		}
		this.locked = false
		
		var tutorialTitle = this.getElement("view-title")
		this.setAltText(tutorialTitle, strings.customSongs.title)
		
		var tutorialContent = this.getElement("view-content")
		strings.customSongs.description.forEach(string => {
			tutorialContent.appendChild(document.createTextNode(string))
			tutorialContent.appendChild(document.createElement("br"))
		})
		
		this.items = []
		this.linkLocalFolder = document.getElementById("link-localfolder")
		this.hasLocal = "webkitdirectory" in HTMLInputElement.prototype && !(/Android/.test(navigator.userAgent))
		if(this.hasLocal){
			this.browse = document.getElementById("browse")
			pageEvents.add(this.browse, "change", this.browseChange.bind(this))
			this.setAltText(this.linkLocalFolder, strings.customSongs.localFolder)
			pageEvents.add(this.linkLocalFolder, ["mousedown", "touchstart"], this.localFolder.bind(this))
			this.items.push(this.linkLocalFolder)
		}else{
			this.linkLocalFolder.parentNode.removeChild(this.linkLocalFolder)
		}
		
		this.linkGdriveFolder = document.getElementById("link-gdrivefolder")
		if(gameConfig.google_credentials.gdrive_enabled){
			this.setAltText(this.linkGdriveFolder, strings.customSongs.gdriveFolder)
			pageEvents.add(this.linkGdriveFolder, ["mousedown", "touchstart"], this.gdriveFolder.bind(this))
			this.items.push(this.linkGdriveFolder)
		}else{
			this.linkGdriveFolder.parentNode.removeChild(this.linkGdriveFolder)
		}
		
		this.endButton = this.getElement("view-end-button")
		this.setAltText(this.endButton, strings.session.cancel)
		pageEvents.add(this.endButton, ["mousedown", "touchstart"], this.onEnd.bind(this))
		this.items.push(this.endButton)
		this.selected = this.items.length - 1
		
		this.loaderDiv = document.createElement("div")
		this.loaderDiv.innerHTML = assets.pages["loadsong"]
		var loadingText = this.loaderDiv.querySelector("#loading-text")
		loadingText.appendChild(document.createTextNode(strings.loading))
		loadingText.setAttribute("alt", strings.loading)
		
		this.keyboard = new Keyboard({
			confirm: ["enter", "space", "don_l", "don_r"],
			previous: ["left", "up", "ka_l"],
			next: ["right", "down", "ka_r"],
			back: ["escape"]
		}, this.keyPressed.bind(this))
		this.gamepad = new Gamepad({
			confirmPad: ["b", "ls", "rs"],
			previous: ["u", "l", "lb", "lt", "lsu", "lsl"],
			next: ["d", "r", "rb", "rt", "lsd", "lsr"],
			back: ["start", "a"]
		}, this.keyPressed.bind(this))
		
		pageEvents.send("custom-songs")
	}
	getElement(name){
		return loader.screen.getElementsByClassName(name)[0]
	}
	setAltText(element, text){
		element.innerText = text
		element.setAttribute("alt", text)
	}
	localFolder(){
		if(this.locked){
			return
		}
		this.browse.click()
	}
	browseChange(event){
		var files = []
		for(var i = 0; i < event.target.files.length; i++){
			files.push(new LocalFile(event.target.files[i]))
		}
		if(!files.length){
			return
		}
		this.locked = true
		this.loading(true)
		
		var importSongs = new ImportSongs()
		importSongs.load(files).then(this.songsLoaded.bind(this), e => {
			this.browse.parentNode.reset()
			this.locked = false
			this.loading(false)
			if(e !== "cancel"){
				return Promise.reject(e)
			}
		})
	}
	gdriveFolder(){
		if(this.locked){
			return
		}
		this.locked = true
		this.loading(true)
		var importSongs = new ImportSongs(true)
		if(!gpicker){
			var gpickerPromise = loader.loadScript("/src/js/gpicker.js").then(() => {
				gpicker = new Gpicker()
			})
		}else{
			var gpickerPromise = Promise.resolve()
		}
		gpickerPromise.then(() => {
			return gpicker.browse(locked => {
				this.locked = locked
				this.loading(locked)
			})
		}).then(files => importSongs.load(files))
		.then(this.songsLoaded.bind(this))
		.catch(e => {
			this.locked = false
			this.loading(false)
			if(e !== "cancel"){
				return Promise.reject(e)
			}
		})
	}
	loading(show){
		if(show){
			loader.screen.appendChild(this.loaderDiv)
		}else{
			loader.screen.removeChild(this.loaderDiv)
		}
	}
	songsLoaded(songs){
		var length = songs.length
		assets.songs = songs
		assets.customSongs = true
		assets.customSelected = 0
		assets.sounds["se_don"].play()
		this.clean()
		setTimeout(() => {
			new SongSelect("customSongs", false, this.touchEnabled)
			pageEvents.send("import-songs", length)
		}, 500)
	}
	keyPressed(pressed, name){
		if(!pressed || this.locked){
			return
		}
		var selected = this.items[this.selected]
		if(name === "confirm" || name === "confirmPad"){
			if(selected === this.endButton){
				this.onEnd()
			}else if(name !== "confirmPad"){
				if(selected === this.linkLocalFolder){
					assets.sounds["se_don"].play()
					this.localFolder()
				}else if(selected === this.linkGdriveFolder){
					assets.sounds["se_don"].play()
					this.gdriveFolder()
				}
			}
		}else if(name === "previous" || name === "next"){
			selected.classList.remove("selected")
			this.selected = this.mod(this.items.length, this.selected + (name === "next" ? 1 : -1))
			this.items[this.selected].classList.add("selected")
			assets.sounds["se_ka"].play()
		}else if(name === "back"){
			this.onEnd()
		}
	}
	mod(length, index){
		return ((index % length) + length) % length
	}
	onEnd(event){
		if(this.locked){
			return
		}
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
			new SongSelect("customSongs", false, touched)
		}, 500)
	}
	clean(){
		this.keyboard.clean()
		this.gamepad.clean()
		pageEvents.remove(this.browse, "change")
		if(this.hasLocal){
			pageEvents.remove(this.linkLocalFolder, ["mousedown", "touchstart"])
		}
		if(gameConfig.google_credentials.gdrive_enabled){
			pageEvents.remove(this.linkGdriveFolder, ["mousedown", "touchstart"])
		}
		pageEvents.remove(this.endButton, ["mousedown", "touchstart"])
		delete this.browse
		delete this.linkLocalFolder
		delete this.linkGdriveFolder
		delete this.endButton
		delete this.items
		delete this.loaderDiv
	}
}
