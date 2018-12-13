class LoadSong{
	constructor(selectedSong, autoPlayEnabled, multiplayer, touchEnabled){
		this.selectedSong = selectedSong
		this.autoPlayEnabled = autoPlayEnabled
		this.multiplayer = multiplayer
		this.touchEnabled = touchEnabled
		
		loader.changePage("loadsong")
		this.run()
	}
	run(){
		var song = this.selectedSong
		var id = song.folder
		var promises = []
		assets.sounds["start"].play()
		
		song.songBg = this.randInt(1, 5)
		song.songStage = this.randInt(1, 3)
		song.donBg = this.randInt(1, 6)
		
		if(song.songSkin && song.songSkin.name){
			var imgLoad = []
			for(var type in song.songSkin){
				var value = song.songSkin[type]
				if(type !== "name" && value && value !== "none"){
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
					if(type === "song"){
						song.songBg = null
					}
				}
			}
			var skinBase = gameConfig.assets_baseurl + "song_skins/"
			for(var i = 0; i < imgLoad.length; i++){
				let img = document.createElement("img")
				if(this.touchEnabled && imgLoad[i].type === "song"){
					img.crossOrigin = "Anonymous"
				}
				let filename = imgLoad[i].filename
				let promise = pageEvents.load(img)
				if(imgLoad[i].type === "song"){
					promises.push(promise.then(() => {
						return this.scaleImg(img, filename)
					}))
				}else{
					promises.push(promise.then(() => {
						assets.image[filename] = img
					}))
				}
				img.src = skinBase + filename + ".png"
			}
		}
		promises.push(this.loadSongBg(id))
		
		var songObj = assets.songs.find(song => song.id === id)
		
		promises.push(new Promise((resolve, reject) => {
			if(songObj.sound){
				songObj.sound.gain = snd.musicGain
				resolve()
			}else if(songObj.music){
				snd.musicGain.load(songObj.music, true).then(sound => {
					songObj.sound = sound
					resolve()
				}, reject)
			}else{
				snd.musicGain.load(gameConfig.songs_baseurl + id + "/main.mp3").then(sound => {
					songObj.sound = sound
					resolve()
				}, reject)
			}
		}))
		if(songObj.chart){
			this.songData = songObj.chart
		}else{
			promises.push(loader.ajax(this.getSongPath(song)).then(data => {
				this.songData = data.replace(/\0/g, "").split("\n")
			}))
		}
		Promise.all(promises).then(() => {
			this.setupMultiplayer()
		}, error => {
			console.error(error)
			if(Array.isArray(error) && error[1] instanceof HTMLElement){
				error = error[0] + ": " + error[1].outerHTML
			}
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
			for(var i = 0; i < filenames.length; i++){
				for(var letter = 0; letter < 2; letter++){
					let filenameAb = filenames[i] + (letter === 0 ? "a" : "b")
					if(!(filenameAb in assets.image)){
						let img = document.createElement("img")
						if(filenameAb.startsWith("bg_song_")){
							if(this.touchEnabled){
								img.crossOrigin = "Anonymous"
							}
							promises.push(pageEvents.load(img).then(() => {
								return this.scaleImg(img, filenameAb)
							}))
						}else{
							promises.push(pageEvents.load(img).then(() => {
								assets.image[filenameAb] = img
							}))
						}
						img.src = gameConfig.assets_baseurl + "img/" + filenameAb + ".png"
					}
				}
			}
			Promise.all(promises).then(resolve, reject)
		})
	}
	scaleImg(img, filename){
		return new Promise((resolve, reject) => {
			if(this.touchEnabled){
				var canvas = document.createElement("canvas")
				var w = Math.floor(img.width / 2)
				var h = Math.floor(img.height / 2)
				canvas.width = w
				canvas.height = h
				var ctx = canvas.getContext("2d")
				ctx.drawImage(img, 0, 0, w, h)
				var saveScaled = url => {
					let img2 = document.createElement("img")
					pageEvents.load(img2).then(() => {
						assets.image[filename] = img2
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
				assets.image[filename] = img
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
			var waitingText = "Waiting for Another Player..."
			loadingText.firstChild.data = waitingText
			loadingText.setAttribute("alt", waitingText)
			
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
					loader.changePage("game")
					var taikoGame1 = new Controller(song, this.songData, false, 1, this.touchEnabled)
					var taikoGame2 = new Controller(this.selectedSong2, this.song2Data, true, 2, this.touchEnabled)
					taikoGame1.run(taikoGame2)
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
			loader.changePage("game")
			var taikoGame = new Controller(song, this.songData, this.autoPlayEnabled, false, this.touchEnabled)
			taikoGame.run()
		}
	}
	startMultiplayer(repeat){
		if(document.hasFocus()){
			p2.send("gamestart")
		}else{
			if(!repeat){
				assets.sounds["sanka"].play()
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
		assets.sounds["don"].play()
		this.cancelButton.style.pointerEvents = "none"
	}
	clean(){
		pageEvents.remove(p2, "message")
		if(this.cancelButton){
			pageEvents.remove(this.cancelButton, ["mousedown", "touchstart"])
			delete this.cancelButton
		}
	}
}
