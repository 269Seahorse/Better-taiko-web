class Controller{
	constructor(selectedSong, songData, autoPlayEnabled, multiplayer){
		this.selectedSong = selectedSong
		this.songData = songData
		this.autoPlayEnabled = autoPlayEnabled
		this.multiplayer = multiplayer
		this.pauseMenu = false
		
		var backgroundURL = "/songs/" + this.selectedSong.folder + "/bg.png"
		var songParser = new ParseSong(songData)
		this.parsedSongData = songParser.getData()
		
		assets.songs.forEach(song => {
			if(song.id == this.selectedSong.folder){
				this.mainAsset = song.sound
			}
		})
		
		this.game = new Game(this, this.selectedSong, this.parsedSongData)
		this.view = new View(this, backgroundURL, this.selectedSong.title, this.selectedSong.difficulty)
		this.mekadon = new Mekadon(this, this.game)
		this.keyboard = new Keyboard(this)
	}
	run(syncWith){
		this.loadUIEvents()
		this.game.run()
		this.view.run()
		this.startMainLoop()
		if(syncWith){
			syncWith.game.getElapsedTime = () => {
				return this.game.elapsedTime
			}
			this.game.setElapsedTime =
			syncWith.game.setElapsedTime = time => {
				this.game.elapsedTime.ms = time
				syncWith.game.elapsedTime.ms = time
			}
			syncWith.run()
			this.syncWith = syncWith
		}
	}
	loadUIEvents(){
		$("#song-selection-butt").click(() => {
			assets.sounds["don"].play()
			this.songSelection()
		})
		$("#restart-butt").click(() => {
			assets.sounds["don"].play()
			this.restartSong()
		})
		$("#continue-butt").click(() => {
			this.togglePauseMenu()
		})
	}
	startMainLoop(){
		this.mainLoopStarted = false
		this.mainLoopRunning = true
		this.mainLoop()
	}
	mainLoop(){
		if(this.mainLoopRunning){
			if(this.multiplayer != 2){
				requestAnimationFrame(() => {
					if(this.syncWith){
						this.syncWith.game.elapsedTime.ms = this.game.elapsedTime.ms
					}
					this.mainLoop()
					if(this.syncWith){
						this.syncWith.mainLoop()
					}
				})
			}
			var ms = this.game.getElapsedTime().ms
			if(!this.game.isPaused()){
				if(ms >= 0 && !this.mainLoopStarted){
					this.mainLoopStarted = true
				}
				if(ms < 0){
					this.game.updateTime()
				}
				if(this.mainLoopStarted){
					this.game.update()
					this.game.playMainMusic()
				}
				this.view.refresh()
				this.keyboard.checkGameKeys()
			}
			this.keyboard.checkMenuKeys()
		}
	}
	getDistanceForCircle(){
		return this.view.getDistanceForCircle()
	}
	togglePauseMenu(){
		this.togglePause()
		this.view.togglePauseMenu()
	}
	displayResults(){
		var score = this.getGlobalScore()
		var vp
		if (score.fail == 0) {
			vp = "fullcombo"
			this.playSoundMeka("fullcombo", 1.350)
		} else if (score.hp >= 50) {
			vp = "clear"
		} else {
			vp = "fail"
		}
		assets.sounds["game" + vp].play()
		setTimeout(() => {
			this.mainLoopRunning = false
			if(this.multiplayer != 2){
				new Scoresheet(this, this.getGlobalScore())
			}
		}, 7000)
	}
	displayScore(score, notPlayed){
		this.view.displayScore(score, notPlayed)
	}
	fadeOutOver(){
		this.game.fadeOutOver()
		this.displayResults()
	}
	getCurrentTimingPoint(){
		return this.game.getCurrentTimingPoint()
	}
	songSelection(){
		$("#music-bg").remove()
		this.mainLoopRunning = false
		new SongSelect()
	}
	restartSong(){
		this.mainAsset.stop()
		this.mainLoopRunning = false
		$("#screen").load("/src/views/game.html", () => {
			var taikoGame = new Controller(this.selectedSong, this.songData, this.autoPlayEnabled)
			taikoGame.run()
		})
	}
	playSoundMeka(soundID, time){
		var meka = ""
		if(this.autoPlayEnabled && !this.multiplayer){
			meka = "-meka"
		}
		assets.sounds[soundID + meka].play(time)
	}
	initTiming(){
		this.game.initTiming()
	}
	setHitcircleSpeed(speed){
		this.view.setHitcircleSpeed(speed)
	}
	getHitcircleSpeed(){
		return this.game.getHitcircleSpeed()
	}
	toggleMainMusic(){
		this.game.toggleMainMusic()
	}
	togglePause(){
		if(this.syncWith){
			this.syncWith.game.togglePause()
		}
		this.game.togglePause()
	}
	isPaused(){
		return this.game.isPaused()
	}
	getKeys(){
		return this.keyboard.getKeys()
	}
	setKey(keyCode, down){
		return this.keyboard.setKey(keyCode, down)
	}
	getBindings(){
		return this.keyboard.getBindings()
	}
	getSongData(){
		return this.game.getSongData()
	}
	getElapsedTime(){
		return this.game.getElapsedTime()
	}
	getCircles(){
		return this.game.getCircles()
	}
	getCurrentCircle(){
		return this.game.getCurrentCircle()
	}
	updateCurrentCircle(){
		this.game.updateCurrentCircle()
	}
	isWaitingForKeyup(key, type){
		return this.keyboard.isWaitingForKeyup(key, type)
	}
	waitForKeyup(key, type){
		this.keyboard.waitForKeyup(key, type)
	}
	getKeyTime(){
		return this.keyboard.getKeyTime()
	}
	updateCombo(score){
		this.game.updateCombo(score)
	}
	getCombo(){
		return this.game.getCombo()
	}
	getGlobalScore(){
		return this.game.getGlobalScore()
	}
	updateGlobalScore(score){
		this.game.updateGlobalScore(score)
	}
	autoPlay(circle){
		if(this.multiplayer){
			p2.play(circle, this.mekadon)
		}else{
			this.mekadon.play(circle)
		}
	}
}
