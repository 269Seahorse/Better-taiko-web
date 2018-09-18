class SongSelect{
	constructor(){
		this.songs
		this.selectedSong = {
			"title": "",
			"folder": "",
			"difficulty": ""
		}
		this.previewId = 0
		this.diffNames={
			"easy": "かんたん",
			"normal": "ふつう",
			"hard": "むずかしい",
			"oni": "おに"
		}
		loader.changePage("songselect")
		this.run()
	}
	startPreview(id, prvtime, switchedTo){
		this.endPreview()
		var startLoad = +new Date
		var currentId = this.previewId
		if(!switchedTo){
			snd.musicGain.fadeOut(0.4)
		}
		var songObj = assets.songs.find(song => song.id == id)
		if(songObj.sound){
			this.preview = songObj.sound
			this.preview.gain = snd.previewGain
			this.previewLoaded(startLoad, prvtime, switchedTo)
		}else{
			snd.previewGain.load("/songs/" + id + "/main.mp3").then(sound => {
				if(currentId == this.previewId){
					songObj.sound = sound
					this.preview = sound
					this.previewLoaded(startLoad, prvtime, switchedTo)
				}
			})
		}
	}
	previewLoaded(startLoad, prvtime, switchedTo){
		var endLoad = +new Date
		var difference = endLoad - startLoad
		var minDelay = switchedTo ? 300 : 1000
		var delay = minDelay - Math.min(minDelay, difference)
		this.preview.playLoop(delay / 1000, false, prvtime / 1000)
	}
	endPreview() {
		this.previewId++
		if(this.preview){
			this.preview.stop()
		}
	}
	run(){
		this.createCode()
		this.startP2()
		
		this.songselHelp = document.getElementById("songsel-help")
		pageEvents.once(this.songselHelp, "click").then(() => {
			this.clean()
			assets.sounds["don"].play()
			new Tutorial()
		})
		this.diffElements = document.getElementsByClassName("difficulty")
		for(let difficulty of this.diffElements){
			pageEvents.once(difficulty, "click").then(this.onDifficulty.bind(this))
		}
		this.songElements = document.getElementsByClassName("song")
		for(let song of this.songElements){
			pageEvents.add(song, "click", this.onSong.bind(this))
		}
		this.songSelect = document.getElementById("song-select")
	}
	onDifficulty(event){
		this.clean()
		var target = event.currentTarget
		var song = target.parentNode.parentNode
		assets.sounds["don"].play()
		
		this.selectedSong.difficulty = target.classList[1] + ".osu"
		this.selectedSong.title = song.dataset.title
		this.selectedSong.folder = song.dataset.songId
		
		new loadSong(this.selectedSong, event.shiftKey, event.ctrlKey)
	}
	onSong(event){
		var target = event.currentTarget
		var opened = document.getElementsByClassName("opened")[0]
		if(!opened){
			this.startPreview(target.dataset.songId, target.dataset.preview)
			assets.sounds["don"].play()
			assets.sounds["song-select"].stop()
			assets.sounds["diffsel"].play(0.3)
			target.classList.add("opened")
			this.songSelect.classList.add("difficulty-select")
		}else if(opened == target){
			this.endPreview()
			snd.musicGain.fadeIn(0.4)
			assets.sounds["diffsel"].stop()
			assets.sounds["cancel"].play()
			assets.sounds["song-select"].play(0.3)
			opened.classList.remove("opened")
			this.songSelect.classList.remove("difficulty-select")
		}else{
			this.startPreview(target.dataset.songId, target.dataset.preview, true)
			assets.sounds["ka"].play()
			opened.classList.remove("opened")
			target.classList.add("opened")
		}
	}
	createCode(){
		assets.sounds["bgm_songsel"].playLoop(0.1, false, 0, 1.442, 3.506)
		assets.sounds["song-select"].play(0.2)
		var songElements = [0]
		
		assets.songs.forEach(song => {
			var songTitle = song.title
			var charElements = [0]
			var diffElements = [0]
			
			for(var charIndex = 0; charIndex < songTitle.length; charIndex++){
				var ch = songTitle.charAt(charIndex)
				var cl = "song-title-char"
				if(ch == " "){
					ch = "\xa0"
					cl += " song-title-space"
				}else if(songTitle.charAt(charIndex + 1) == "'"){
					ch = ch + "'"
					cl += " song-title-apos"
					charIndex++
				}
				charElements.push(
					["span", {
						class: cl,
						alt: ch
					}, ch]
				)
			}
			for(var diff in this.diffNames){
				var diffName = diff
				var diffLevel = song.stars[diff]
				if (!diffLevel) {
					continue
				}
				var starsDisplay = [0]
				for(var star = 1; star <= diffLevel; star++){
					starsDisplay.push("\u2605")
					starsDisplay.push(["br"])
				}
				var diffTxt = this.diffNames[diffName]
				diffElements.push(
					["li", {
						class: "difficulty " + diffName
					},
						["span", {
							class: "diffname"
						}, diffTxt],
						["span", {
							class: "stars"
						}, starsDisplay]
					]
				)
			}
			songElements.push(
				["div", {
					id: "song-" + song.id,
					class: "song",
					"data-title": songTitle,
					"data-song-id": song.id,
					"data-preview": song.preview
				},
					["div", {
						class: /^[\x00-\xFF]*$/.test(songTitle) ? "song-title alpha-title" : "song-title"
					}, charElements],
					["ul", {
						class: "difficulties"
					}, diffElements]
				]
			)
		})
		element(
			document.getElementById("song-container"),
			songElements
		)
	}
	onusers(response){
		var oldP2Elements = document.getElementsByClassName("p2")
		for(var i = oldP2Elements.length; i--;){
			oldP2Elements[i].classList.remove("p2")
		}
		if(response){
			response.forEach(idDiff => {
				var id = idDiff.id |0
				var diff = idDiff.diff
				if(diff in this.diffNames){
					var idElement = document.getElementById("song-" + id)
					if(idElement){
						idElement.classList.add("p2")
						var diffElement = idElement.getElementsByClassName("difficulty " + diff)[0]
						if(diffElement){
							diffElement.classList.add("p2")
						}
					}
				}
			})
		}
	}
	startP2(){
		this.onusers(p2.getMessage("users"))
		pageEvents.add(p2, "message", response => {
			if(response.type == "users"){
				this.onusers(response.value)
			}
		})
		if(p2.closed){
			p2.open()
		}
	}
	clean(){
		assets.sounds["bgm_songsel"].stop()
		assets.sounds["song-select"].stop()
		assets.sounds["diffsel"].stop()
		this.endPreview()
		snd.musicGain.fadeIn()
		pageEvents.remove(p2, "message")
		for(let difficulty of this.diffElements){
			pageEvents.remove(difficulty, "click")
		}
		delete this.diffElements
		for(let song of this.songElements){
			pageEvents.remove(song, "click")
		}
		delete this.songElements
		pageEvents.remove(this.songselHelp, "click")
		delete this.songselHelp
		delete this.songSelect
	}
}
