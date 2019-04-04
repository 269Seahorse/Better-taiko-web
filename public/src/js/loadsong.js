class LoadSong{
	constructor(selectedSong, autoPlayEnabled, multiplayer, touchEnabled){
		this.selectedSong = selectedSong
		this.autoPlayEnabled = autoPlayEnabled
		this.multiplayer = multiplayer
		this.touchEnabled = touchEnabled
		var resolution = settings.getItem("resolution")
		this.imgScale = 1
		if(resolution === "medium"){
			this.imgScale = 0.75
		}else if(resolution === "low"){
			this.imgScale = 0.5
		}else if(resolution === "lowest"){
			this.imgScale = 0.25
		}
		
		loader.changePage("loadsong", true)
		var loadingText = document.getElementById("loading-text")
		loadingText.appendChild(document.createTextNode(strings.loading))
		loadingText.setAttribute("alt", strings.loading)
		if(multiplayer){
			var cancel = document.getElementById("p2-cancel-button")
			cancel.appendChild(document.createTextNode(strings.cancel))
			cancel.setAttribute("alt", strings.cancel)
		}
		this.run()
		pageEvents.send("load-song", {
			selectedSong: selectedSong,
			autoPlayEnabled: autoPlayEnabled,
			multiplayer: multiplayer,
			touchEnabled: touchEnabled
		})
	}
	run(){
		var song = this.selectedSong
		var id = song.folder
		var promises = []
		assets.sounds["v_start"].play()
		
		song.songBg = this.randInt(1, 5)
		song.songStage = this.randInt(1, 3)
		song.donBg = this.randInt(1, 6)
		
		var songObj = assets.songs.find(song => song.id === id)
		
		if(song.songSkin && song.songSkin.name){
			var imgLoad = []
			for(var type in song.songSkin){
				var value = song.songSkin[type]
				if(["song", "stage", "don"].indexOf(type) !== -1 && value && value !== "none"){
					var filename = "bg_" + type + "_" + song.songSkin.name
					if(value === "static"){
						imgLoad.push({
							filename: filename,
							type: type
						})
					}else{
						imgLoad.push({
							filename: filename + "_a",
							type: type
						})
						imgLoad.push({
							filename: filename + "_b",
							type: type
						})
					}
					if(type === "don"){
						song.donBg = null
					}else if(type === "song"){
						song.songBg = null
					}else if(type === "stage"){
						song.songStage = null
					}
				}
			}
			var skinBase = gameConfig.assets_baseurl + "song_skins/"
			for(var i = 0; i < imgLoad.length; i++){
				let filename = imgLoad[i].filename
				let prefix = song.songSkin.prefix || ""
				if((prefix + filename) in assets.image){
					continue
				}
				let img = document.createElement("img")
				let force = imgLoad[i].type === "song" && this.touchEnabled
				if(!songObj.music && (this.imgScale !== 1 || force)){
					img.crossOrigin = "Anonymous"
				}
				let promise = pageEvents.load(img)
				promises.push(promise.then(() => {
					return this.scaleImg(img, filename, prefix, force)
				}))
				if(songObj.music){
					img.src = URL.createObjectURL(song.songSkin[filename + ".png"])
				}else{
					img.src = skinBase + filename + ".png"
				}
			}
		}
		promises.push(this.loadSongBg(id))
		
		promises.push(new Promise((resolve, reject) => {
			if(songObj.sound){
				songObj.sound.gain = snd.musicGain
				resolve()
			}else if(!songObj.music){
				snd.musicGain.load(gameConfig.songs_baseurl + id + "/main.mp3").then(sound => {
					songObj.sound = sound
					resolve()
				}, reject)
			}else if(songObj.music !== "muted"){
				snd.musicGain.load(songObj.music, true).then(sound => {
					songObj.sound = sound
					resolve()
				}, reject)
			}else{
				resolve()
			}
		}))
		if(songObj.chart){
			var reader = new FileReader()
			promises.push(pageEvents.load(reader).then(event => {
				this.songData = event.target.result.replace(/\0/g, "").split("\n")
			}))
			if(song.type === "tja"){
				reader.readAsText(songObj.chart, "sjis")
			}else{
				reader.readAsText(songObj.chart)
			}
		}else{
			promises.push(loader.ajax(this.getSongPath(song)).then(data => {
				this.songData = data.replace(/\0/g, "").split("\n")
			}))
		}
		if(this.touchEnabled && !assets.image["touch_drum"]){
			let img = document.createElement("img")
			if(this.imgScale !== 1){
				img.crossOrigin = "Anonymous"
			}
			promises.push(pageEvents.load(img).then(() => {
				return this.scaleImg(img, "touch_drum", "")
			}))
			img.src = gameConfig.assets_baseurl + "img/touch_drum.png"
		}
		Promise.all(promises).then(() => {
			this.setupMultiplayer()
		}, error => {
			if(Array.isArray(error) && error[1] instanceof HTMLElement){
				error = error[0] + ": " + error[1].outerHTML
			}
			console.error(error)
			pageEvents.send("load-song-error", error)
			errorMessage(new Error(error).stack)
			alert("An error occurred, please refresh")
		})
	}
	loadSongBg(){
		return new Promise((resolve, reject) => {
			var promises = []
			var filenames = []
			if(this.selectedSong.songBg !== null){
				filenames.push("bg_song_" + this.selectedSong.songBg)
			}
			if(this.selectedSong.donBg !== null){
				filenames.push("bg_don_" + this.selectedSong.donBg)
				if(this.multiplayer){
					filenames.push("bg_don2_" + this.selectedSong.donBg)
				}
			}
			if(this.selectedSong.songStage !== null){
				filenames.push("bg_stage_" + this.selectedSong.songStage)
			}
			for(var i = 0; i < filenames.length; i++){
				var filename = filenames[i]
				var stage = filename.startsWith("bg_stage_")
				for(var letter = 0; letter < (stage ? 1 : 2); letter++){
					let filenameAb = filenames[i] + (stage ? "" : (letter === 0 ? "a" : "b"))
					if(!(filenameAb in assets.image)){
						let img = document.createElement("img")
						let force = filenameAb.startsWith("bg_song_") && this.touchEnabled
						if(this.imgScale !== 1 || force){
							img.crossOrigin = "Anonymous"
						}
						promises.push(pageEvents.load(img).then(() => {
							return this.scaleImg(img, filenameAb, "", force)
						}))
						img.src = gameConfig.assets_baseurl + "img/" + filenameAb + ".png"
					}
				}
			}
			Promise.all(promises).then(resolve, reject)
		})
	}
	scaleImg(img, filename, prefix, force){
		return new Promise((resolve, reject) => {
			var scale = this.imgScale
			if(force && scale > 0.5){
				scale = 0.5
			}
			if(scale !== 1){
				var canvas = document.createElement("canvas")
				var w = Math.floor(img.width * scale)
				var h = Math.floor(img.height * scale)
				canvas.width = w
				canvas.height = h
				var ctx = canvas.getContext("2d")
				ctx.drawImage(img, 0, 0, w, h)
				var saveScaled = url => {
					let img2 = document.createElement("img")
					pageEvents.load(img2).then(() => {
						assets.image[prefix + filename] = img2
						resolve()
					}, reject)
					img2.src = url
				}
				if("toBlob" in canvas){
					canvas.toBlob(blob => {
						saveScaled(URL.createObjectURL(blob))
					})
				}else{
					saveScaled(canvas.toDataURL())
				}
			}else{
				assets.image[prefix + filename] = img
				resolve()
			}
		})
	}
	randInt(min, max){
		return Math.floor(Math.random() * (max - min + 1)) + min
	}
	getSongPath(selectedSong){
		var directory = gameConfig.songs_baseurl + selectedSong.folder + "/"
		if(selectedSong.type === "tja"){
			return directory + "main.tja"
		}else{
			return directory + selectedSong.difficulty + ".osu"
		}
	}
	setupMultiplayer(){
		var song = this.selectedSong
		
		if(this.multiplayer){
			var loadingText = document.getElementsByClassName("loading-text")[0]
			loadingText.firstChild.data = strings.waitingForP2
			loadingText.setAttribute("alt", strings.waitingForP2)
			
			this.cancelButton = document.getElementById("p2-cancel-button")
			this.cancelButton.style.display = "inline-block"
			pageEvents.add(this.cancelButton, ["mousedown", "touchstart"], this.cancelLoad.bind(this))
			
			this.song2Data = this.songData
			this.selectedSong2 = song
			pageEvents.add(p2, "message", event => {
				if(event.type === "gameload"){
					this.cancelButton.style.display = ""
					
					if(event.value === song.difficulty){
						this.startMultiplayer()
					}else{
						this.selectedSong2 = {}
						for(var i in this.selectedSong){
							this.selectedSong2[i] = this.selectedSong[i]
						}
						this.selectedSong2.difficulty = event.value
						if(song.type === "tja"){
							this.startMultiplayer()
						}else{
							loader.ajax(this.getSongPath(this.selectedSong2)).then(data => {
								this.song2Data = data.replace(/\0/g, "").split("\n")
								this.startMultiplayer()
							}, () => {
								this.startMultiplayer()
							})
						}
					}
				}else if(event.type === "gamestart"){
					this.clean()
					p2.clearMessage("songsel")
					var taikoGame1 = new Controller(song, this.songData, false, 1, this.touchEnabled)
					var taikoGame2 = new Controller(this.selectedSong2, this.song2Data, true, 2, this.touchEnabled)
					taikoGame1.run(taikoGame2)
					pageEvents.send("load-song-player2", this.selectedSong2)
				}else if(event.type === "left" || event.type === "gameend"){
					this.clean()
					new SongSelect(false, false, this.touchEnabled)
				}
			})
			p2.send("join", {
				id: song.folder,
				diff: song.difficulty
			})
		}else{
			this.clean()
			var taikoGame = new Controller(song, this.songData, this.autoPlayEnabled, false, this.touchEnabled)
			taikoGame.run()
		}
	}
	startMultiplayer(repeat){
		if(document.hasFocus()){
			p2.send("gamestart")
		}else{
			if(!repeat){
				assets.sounds["v_sanka"].play()
				pageEvents.send("load-song-unfocused")
			}
			setTimeout(() => {
				this.startMultiplayer(true)
			}, 100)
		}
	}
	cancelLoad(event){
		if(event.type === "mousedown"){
			if(event.which !== 1){
				return
			}
		}else{
			event.preventDefault()
		}
		p2.send("leave")
		assets.sounds["se_don"].play()
		this.cancelButton.style.pointerEvents = "none"
		pageEvents.send("load-song-cancel")
	}
	clean(){
		pageEvents.remove(p2, "message")
		if(this.cancelButton){
			pageEvents.remove(this.cancelButton, ["mousedown", "touchstart"])
			delete this.cancelButton
		}
	}
}
