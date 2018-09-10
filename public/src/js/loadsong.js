class loadSong{
	constructor(selectedSong, autoPlayEnabled){
		this.selectedSong = selectedSong
		this.autoPlayEnabled = autoPlayEnabled
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
				var taikoGame = new Controller(this.selectedSong, this.songData, this.autoPlayEnabled)
				taikoGame.run()
			})
		}, () => {
			alert("An error occurred, please refresh")
		})
	}
 }