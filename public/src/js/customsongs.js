class CustomSongs{
	constructor(touchEnabled, noPage){
		this.loaderDiv = document.createElement("div")
		this.loaderDiv.innerHTML = assets.pages["loadsong"]
		var loadingText = this.loaderDiv.querySelector("#loading-text")
		this.setAltText(loadingText, strings.loading)
		
		this.locked = false
		this.mode = "main"
		
		if(noPage){
			this.noPage = true
			return
		}
		
		this.touchEnabled = touchEnabled
		loader.changePage("customsongs", true)
		if(touchEnabled){
			this.getElement("view-outer").classList.add("touch-enabled")
		}
		
		var tutorialTitle = this.getElement("view-title")
		this.setAltText(tutorialTitle, strings.customSongs.title)
		
		var tutorialContent = this.getElement("view-content")
		strings.customSongs.description.forEach(string => {
			tutorialContent.appendChild(document.createTextNode(string))
			tutorialContent.appendChild(document.createElement("br"))
		})
		
		this.items = []
		this.linkLocalFolder = document.getElementById("link-localfolder")
		this.hasLocal = (typeof showDirectoryPicker === "function" || "webkitdirectory" in HTMLInputElement.prototype) && !(/Android|iPhone|iPad/.test(navigator.userAgent))
		this.selected = -1
		
		if(this.hasLocal){
			this.browse = document.getElementById("browse")
			pageEvents.add(this.browse, "change", this.browseChange.bind(this))
			this.setAltText(this.linkLocalFolder, strings.customSongs.localFolder)
			pageEvents.add(this.linkLocalFolder, ["mousedown", "touchstart"], this.localFolder.bind(this))
			this.items.push(this.linkLocalFolder)
			if(this.selected === -1){
				this.linkLocalFolder.classList.add("selected")
				this.selected = this.items.length - 1
			}
		}else{
			this.linkLocalFolder.parentNode.removeChild(this.linkLocalFolder)
		}
		
		var groupGdrive = document.getElementById("group-gdrive")
		this.linkGdriveFolder = document.getElementById("link-gdrivefolder")
		this.linkGdriveAccount = document.getElementById("link-gdriveaccount")
		this.linkPrivacy = document.getElementById("link-privacy")
		if(gameConfig.google_credentials.gdrive_enabled){
			this.setAltText(this.linkGdriveFolder, strings.customSongs.gdriveFolder)
			pageEvents.add(this.linkGdriveFolder, ["mousedown", "touchstart"], this.gdriveFolder.bind(this))
			this.items.push(this.linkGdriveFolder)
			if(this.selected === -1){
				this.linkGdriveFolder.classList.add("selected")
				this.selected = this.items.length - 1
			}
			this.setAltText(this.linkGdriveAccount, strings.customSongs.gdriveAccount)
			pageEvents.add(this.linkGdriveAccount, ["mousedown", "touchstart"], this.gdriveAccount.bind(this))
			this.items.push(this.linkGdriveAccount)
			this.setAltText(this.linkPrivacy, strings.account.privacy)
			pageEvents.add(this.linkPrivacy, ["mousedown", "touchstart"], this.openPrivacy.bind(this))
			this.items.push(this.linkPrivacy)
		}else{
			groupGdrive.style.display = "none"
			this.linkPrivacy.parentNode.removeChild(this.linkPrivacy)
		}
		
		this.endButton = this.getElement("view-end-button")
		this.setAltText(this.endButton, strings.session.cancel)
		pageEvents.add(this.endButton, ["mousedown", "touchstart"], event => this.onEnd(event, true))
		this.items.push(this.endButton)
		if(this.selected === -1){
			this.endButton.classList.add("selected")
			this.selected = this.items.length - 1
		}
		
		this.fileSystem = location.protocol === "https:" && DataTransferItem.prototype.getAsFileSystemHandle
		if(this.fileSystem || DataTransferItem.prototype.webkitGetAsEntry){
			this.dropzone = document.getElementById("dropzone")
			var dropContent = this.dropzone.getElementsByClassName("view-content")[0]
			dropContent.innerText = strings.customSongs.dropzone
			this.dragging = false
			pageEvents.add(document, "dragover", event => {
				event.preventDefault()
				if(!this.locked){
					event.dataTransfer.dropEffect = "copy"
					this.dropzone.classList.add("dragover")
					this.dragging = true
				}else{
					event.dataTransfer.dropEffect = "none"
				}
			})
			pageEvents.add(document, "dragleave", () => {
				this.dropzone.classList.remove("dragover")
				this.dragging = false
			})
			pageEvents.add(document, "drop", this.filesDropped.bind(this))
		}
		
		this.errorDiv = document.getElementById("customsongs-error")
		pageEvents.add(this.errorDiv, ["mousedown", "touchstart"], event => {
			if(event.target === event.currentTarget){
				this.hideError()
			}
		})
		var errorTitle = this.errorDiv.getElementsByClassName("view-title")[0]
		this.setAltText(errorTitle, strings.customSongs.importError)
		this.errorContent = this.errorDiv.getElementsByClassName("view-content")[0]
		this.errorEnd = this.errorDiv.getElementsByClassName("view-end-button")[0]
		this.setAltText(this.errorEnd, strings.tutorial.ok)
		pageEvents.add(this.errorEnd, ["mousedown", "touchstart"], () => this.hideError(true))
		
		this.keyboard = new Keyboard({
			confirm: ["enter", "space", "don_l", "don_r"],
			previous: ["left", "up", "ka_l"],
			next: ["right", "down", "ka_r"],
			backEsc: ["escape"]
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
	localFolder(event){
		if(event){
			if(event.type === "touchstart"){
				event.preventDefault()
			}else if(event.which !== 1){
				return
			}
		}
		if(this.locked || this.mode !== "main"){
			return
		}
		this.changeSelected(this.linkLocalFolder)
		if(typeof showDirectoryPicker === "function"){
			return showDirectoryPicker().then(file => {
				this.walkFilesystem(file).then(files => this.importLocal(files)).then(e => {
					db.setItem("customFolder", [file])
				}).catch(e => {
					if(e !== "cancel"){
						return Promise.reject(e)
					}
				})
			}, () => {})
		}else{
			this.browse.click()
		}
	}
	browseChange(event){
		var files = []
		for(var i = 0; i < event.target.files.length; i++){
			files.push(new LocalFile(event.target.files[i]))
		}
		this.importLocal(files)
	}
	walkFilesystem(file, path="", output=[]){
		if(file.kind === "directory"){
			return filePermission(file).then(file => {
				var values = file.values()
				var walkValues = () => values.next().then(generator => {
					if(generator.done){
						return output
					}
					return this.walkFilesystem(generator.value, path + file.name + "/", output).then(() => walkValues())
				})
				return walkValues()
			}, () => Promise.resolve())
		}else{
			output.push(new FilesystemFile(file, path + file.name))
			return Promise.resolve(output)
		}
	}
	filesDropped(event){
		event.preventDefault()
		this.dropzone.classList.remove("dragover")
		this.dragging = false
		if(this.locked){
			return
		}
		var allFiles = []
		var dropPromises = []
		var dbItems = []
		for(var i = 0; i < event.dataTransfer.items.length; i++){
			var item = event.dataTransfer.items[i]
			let promise
			if(this.fileSystem){
				promise = item.getAsFileSystemHandle().then(file => {
					dbItems.push(file)
					return this.walkFilesystem(file)
				})
			}else{
				var entry = item.webkitGetAsEntry()
				if(entry){
					promise = this.walkEntry(entry)
				}
			}
			if(promise){
				dropPromises.push(promise.then(files => {
					allFiles = allFiles.concat(files)
				}))
			}
		}
		Promise.all(dropPromises).then(() => this.importLocal(allFiles)).then(() => {
			if(dbItems.length){
				db.setItem("customFolder", dbItems)
			}
		})
	}
	walkEntry(entry, path="", output=[]){
		return new Promise(resolve => {
			if(entry.isFile){
				entry.file(file => {
					output.push(new LocalFile(file, path + file.name))
					return resolve()
				}, resolve)
			}else if(entry.isDirectory){
				var dirReader = entry.createReader()
				dirReader.readEntries(entries => {
					var dirPromises = []
					for(var i = 0; i < entries.length; i++){
						dirPromises.push(this.walkEntry(entries[i], path + entry.name + "/", output))
					}
					return Promise.all(dirPromises).then(resolve)
				}, resolve)
			}else{
				return resolve()
			}
		}).then(() => output)
	}
	importLocal(files){
		if(!files.length){
			if(this.noPage){
				return Promise.reject("cancel")
			}else{
				return Promise.resolve("cancel")
			}
		}
		this.locked = true
		this.loading(true)
		
		var importSongs = new ImportSongs()
		return importSongs.load(files).then(this.songsLoaded.bind(this), e => {
			this.browse.parentNode.reset()
			this.locked = false
			this.loading(false)
			if(e === "nosongs"){
				this.showError(strings.customSongs.noSongs)
			}else if(e !== "cancel"){
				return Promise.reject(e)
			}
		})
	}
	gdriveFolder(event){
		if(event){
			if(event.type === "touchstart"){
				event.preventDefault()
			}else if(event.which !== 1){
				return
			}
		}
		if(this.locked || this.mode !== "main"){
			return
		}
		this.changeSelected(this.linkGdriveFolder)
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
			}, error => {
				this.showError(error)
			})
		}).then(files => importSongs.load(files))
		.then(this.songsLoaded.bind(this))
		.catch(e => {
			this.locked = false
			this.loading(false)
			if(e === "nosongs"){
				this.showError(strings.customSongs.noSongs)
			}else if(e !== "cancel"){
				return Promise.reject(e)
			}
		}).finally(() => {
			var addRemove = !gpicker || !gpicker.oauthToken ? "add" : "remove"
			this.linkGdriveAccount.classList[addRemove]("hiddenbtn")
		})
	}
	gdriveAccount(event){
		if(event){
			if(event.type === "touchstart"){
				event.preventDefault()
			}else if(event.which !== 1){
				return
			}
		}
		if(this.locked || this.mode !== "main"){
			return
		}
		this.changeSelected(this.linkGdriveAccount)
		this.locked = true
		this.loading(true)
		if(!gpicker){
			var gpickerPromise = loader.loadScript("/src/js/gpicker.js").then(() => {
				gpicker = new Gpicker()
			})
		}else{
			var gpickerPromise = Promise.resolve()
		}
		gpickerPromise.then(() => {
			return gpicker.switchAccounts(locked => {
				this.locked = locked
				this.loading(locked)
			}, error => {
				this.showError(error)
			})
		}).then(() => {
			this.locked = false
			this.loading(false)
		}).catch(error => {
			if(error !== "cancel"){
				this.showError(error)
			}
		})
	}
	openPrivacy(event){
		if(event){
			if(event.type === "touchstart"){
				event.preventDefault()
			}else if(event.which !== 1){
				return
			}
		}
		if(this.locked || this.mode !== "main"){
			return
		}
		this.changeSelected(this.linkPrivacy)
		open("privacy")
	}
	loading(show){
		if(this.noPage){
			return
		}
		if(show){
			loader.screen.appendChild(this.loaderDiv)
		}else if(this.loaderDiv.parentNode){
			this.loaderDiv.parentNode.removeChild(this.loaderDiv)
		}
	}
	songsLoaded(songs){
		if(songs){
			var length = songs.length
			assets.songs = songs
			assets.customSongs = true
			assets.customSelected = this.noPage ? +localStorage.getItem("customSelected") : 0
		}
		if(!this.noPage){
			assets.sounds["se_don"].play()
		}
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
		if(this.mode === "main"){
			if(name === "confirm" || name === "confirmPad"){
				if(selected === this.endButton){
					this.onEnd(null, true)
				}else if(name !== "confirmPad"){
					if(selected === this.linkLocalFolder){
						assets.sounds["se_don"].play()
						this.localFolder()
					}else if(selected === this.linkGdriveFolder){
						assets.sounds["se_don"].play()
						this.gdriveFolder()
					}else if(selected === this.linkGdriveAccount){
						assets.sounds["se_don"].play()
						this.gdriveAccount()
					}else if(selected === this.linkPrivacy){
						assets.sounds["se_don"].play()
						this.openPrivacy()
					}
				}
			}else if(name === "previous" || name === "next"){
				selected.classList.remove("selected")
				do{
					this.selected = this.mod(this.items.length, this.selected + (name === "next" ? 1 : -1))
				}while(this.items[this.selected] === this.linkPrivacy && name !== "previous")
				this.items[this.selected].classList.add("selected")
				assets.sounds["se_ka"].play()
			}else if(name === "back" || name === "backEsc"){
				if(!this.dragging || name !== "backEsc"){
					this.onEnd()
				}
			}
		}else if(this.mode === "error"){
			if(name === "confirm" || name === "confirmPad" || name === "back" || name === "backEsc"){
				this.hideError(name === "confirm" || name === "confirmPad")
			}
		}
	}
	changeSelected(button){
		var selected = this.items[this.selected]
		if(selected !== button){
			selected.classList.remove("selected")
			this.selected = this.items.findIndex(item => item === button)
			this.items[this.selected].classList.add("selected")
		}
	}
	mod(length, index){
		return ((index % length) + length) % length
	}
	onEnd(event, confirm){
		if(this.locked || this.mode !== "main"){
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
		}else{
			touched = this.touchEnabled
		}
		this.clean()
		if(!this.noPage){
			assets.sounds[confirm ? "se_don" : "se_cancel"].play()
		}
		return new Promise(resolve => setTimeout(() => {
			new SongSelect("customSongs", false, touched)
			resolve()
		}, 500))
	}
	showError(text){
		this.locked = false
		this.loading(false)
		if(this.noPage || this.mode === "error"){
			return
		}
		this.mode = "error"
		this.errorContent.innerText = text
		this.errorDiv.style.display = "flex"
		assets.sounds["se_pause"].play()
	}
	hideError(confirm){
		if(this.mode !== "error"){
			return
		}
		this.mode = "main"
		this.errorDiv.style.display = ""
		assets.sounds[confirm ? "se_don" : "se_cancel"].play()
	}
	clean(){
		delete this.loaderDiv
		if(this.noPage){
			return
		}
		this.keyboard.clean()
		this.gamepad.clean()
		pageEvents.remove(this.browse, "change")
		if(this.hasLocal){
			pageEvents.remove(this.linkLocalFolder, ["mousedown", "touchstart"])
		}
		if(gameConfig.google_credentials.gdrive_enabled){
			pageEvents.remove(this.linkGdriveFolder, ["mousedown", "touchstart"])
			pageEvents.remove(this.linkGdriveAccount, ["mousedown", "touchstart"])
			pageEvents.remove(this.linkPrivacy, ["mousedown", "touchstart"])
		}
		pageEvents.remove(this.endButton, ["mousedown", "touchstart"])
		pageEvents.remove(this.errorDiv, ["mousedown", "touchstart"])
		pageEvents.remove(this.errorEnd, ["mousedown", "touchstart"])
		if(DataTransferItem.prototype.webkitGetAsEntry){
			pageEvents.remove(document, ["dragover", "dragleave", "drop"])
			delete this.dropzone
		}
		delete this.browse
		delete this.linkLocalFolder
		delete this.linkGdriveFolder
		delete this.linkGdriveAccount
		delete this.linkPrivacy
		delete this.endButton
		delete this.items
		delete this.errorDiv
		delete this.errorContent
		delete this.errorEnd
	}
}
