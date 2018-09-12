class loadSong{
	constructor(selectedSong, autoPlayEnabled, multiplayer){
		this.selectedSong = selectedSong
		this.multiplayer = multiplayer
		this.autoPlayEnabled = autoPlayEnabled
		this.diff = this.selectedSong.difficulty.slice(0, -4)
		this.songFilePath = "/songs/" + this.selectedSong.folder + "/" + this.selectedSong.difficulty
		$("#screen").load("/src/views/loadsong.html", () => {
			this.run()
		})
	}
	run(){
		var id = this.selectedSong.folder
		var promises = []
		assets.sounds["start"].play()
		
		var img = document.createElement("img")
		promises.push(promiseLoad(img))
		img.id = "music-bg"
		img.src = "/songs/" + id + "/bg.png"
		document.getElementById("assets").appendChild(img)
		
		promises.push(new Promise((resolve, reject) => {
			var songObj
			assets.songs.forEach(song => {
				if(song.id == id){
					songObj = song
				}
			})
			if(songObj.sound){
				songObj.sound.gain = snd.musicGain
				resolve()
			}else{
				snd.musicGain.load("/songs/" + id + "/main.mp3").then(sound => {
					songObj.sound = sound
					resolve()
				}, reject)
			}
		}))
		
		promises.push(ajax(this.songFilePath).then(data => {
			this.songData = data.replace(/\0/g, "").split("\n")
		}))
		
		Promise.all(promises).then(() => {
			$("#screen").load("/src/views/game.html", () => {
				this.setupMultiplayer()
			})
		}, error => {
			console.error(error)
			alert("An error occurred, please refresh")
		})
	}
	setupMultiplayer(){
		if(this.multiplayer){
			this.song2Data = this.songData
			this.selectedSong2 = this.selectedSong
			p2.onmessage("gamestart", () => {
				var taikoGame1 = new Controller(this.selectedSong, this.songData, false, 1)
				var taikoGame2 = new Controller(this.selectedSong2, this.song2Data, true, 2)
				taikoGame1.run(taikoGame2)
			}, true)
			p2.onmessage("gameload", response => {
				if(response == this.diff){
					p2.send("gamestart")
				}else{
					this.selectedSong2 = {
						title: this.selectedSong.title,
						folder: this.selectedSong.folder,
						difficulty: response + ".osu"
					}
					ajax("/songs/" + this.selectedSong2.folder + "/" + this.selectedSong2.difficulty).then(data => {
						this.song2Data = data.replace(/\0/g, "").split("\n")
						p2.send("gamestart")
					}, () => {
						p2.send("gamestart")
					})
				}
			}, true)
			p2.send("join", {
				id: this.selectedSong.folder,
				diff: this.diff
			})
		}else{
			var taikoGame = new Controller(this.selectedSong, this.songData, this.autoPlayEnabled)
			taikoGame.run()
		}
	}
}
