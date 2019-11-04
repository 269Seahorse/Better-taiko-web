class Controller{
	constructor(selectedSong, songData, autoPlayEnabled, multiplayer, touchEnabled){
		this.selectedSong = selectedSong
		this.songData = songData
		this.autoPlayEnabled = autoPlayEnabled
		this.multiplayer = multiplayer
		this.touchEnabled = touchEnabled
		this.snd = this.multiplayer ? "_p" + this.multiplayer : ""
		
		if(this.multiplayer !== 2){
			loader.changePage("game", false)
		}
		
		if(selectedSong.type === "tja"){
			this.parsedSongData = new ParseTja(songData, selectedSong.difficulty, selectedSong.stars, selectedSong.offset)
		}else{
			this.parsedSongData = new ParseOsu(songData, selectedSong.difficulty, selectedSong.stars, selectedSong.offset)
		}
		this.offset = this.parsedSongData.soundOffset
		
		assets.songs.forEach(song => {
			if(song.id == this.selectedSong.folder){
				this.mainAsset = song.sound
				this.volume = song.volume || 1
			}
		})
		
		this.game = new Game(this, this.selectedSong, this.parsedSongData)
		this.view = new View(this)
		this.mekadon = new Mekadon(this, this.game)
		this.keyboard = new GameInput(this)
		
		this.playedSounds = {}
	}
	run(syncWith){
		if(syncWith){
			this.syncWith = syncWith
		}
		if(this.multiplayer !== 2){
			snd.musicGain.setVolumeMul(this.volume)
		}
		this.game.run()
		this.view.run()
		if(this.multiplayer === 1){
			syncWith.run(this)
			syncWith.game.elapsedTime = this.game.elapsedTime
			syncWith.game.startDate = this.game.startDate
		}
		requestAnimationFrame(() => {
			this.startMainLoop()
			if(!this.multiplayer){
				debugObj.controller = this
				if(debugObj.debug){
					debugObj.debug.updateStatus()
				}
			}
		})
	}
	startMainLoop(){
		this.mainLoopRunning = true
		this.gameLoop()
		this.viewLoop()
		if(this.multiplayer !== 2){
			this.gameInterval = setInterval(this.gameLoop.bind(this), 1000 / 60)
			pageEvents.send("game-start", {
				selectedSong: this.selectedSong,
				autoPlayEnabled: this.autoPlayEnabled,
				multiplayer: this.multiplayer,
				touchEnabled: this.touchEnabled
			})
		}
	}
	stopMainLoop(){
		this.mainLoopRunning = false
		if(this.mainAsset){
			this.mainAsset.stop()
		}
		if(this.multiplayer !== 2){
			clearInterval(this.gameInterval)
		}
	}
	gameLoop(){
		if(this.mainLoopRunning){
			if(this.multiplayer === 1){
				this.syncWith.game.elapsedTime = this.game.elapsedTime
				this.syncWith.game.startDate = this.game.startDate
			}
			var ms = this.game.elapsedTime
			
			if(this.game.musicFadeOut < 3){
				this.keyboard.checkMenuKeys()
			}
			if(!this.game.isPaused()){
				this.keyboard.checkGameKeys()
				
				if(ms < 0){
					this.game.updateTime()
				}else{
					this.game.update()
					if(!this.mainLoopRunning){
						return
					}
					this.game.playMainMusic()
				}
			}
			if(this.multiplayer === 1){
				this.syncWith.gameLoop()
			}
		}
	}
	viewLoop(){
		if(this.mainLoopRunning){
			if(this.multiplayer !== 2){
				requestAnimationFrame(() => {
					this.viewLoop()
					if(this.multiplayer === 1){
						this.syncWith.viewLoop()
					}
					if(this.scoresheet){
						if(this.view.ctx){
							this.view.ctx.save()
							this.view.ctx.setTransform(1, 0, 0, 1, 0, 0)
						}
						this.scoresheet.redraw()
						if(this.view.ctx){
							this.view.ctx.restore()
						}
					}
				})
			}
			this.view.refresh()
		}
	}
	gameEnded(){
		var score = this.getGlobalScore()
		var vp
		if(Math.round(score.gauge / 2) - 1 >= 25){
			if(score.bad === 0){
				vp = "fullcombo"
				this.playSoundMeka("v_fullcombo", 1.350)
			}else{
				vp = "clear"
			}
		}else{
			vp = "fail"
		}
		this.playSound("se_game" + vp)
	}
	displayResults(){
		if(this.multiplayer !== 2){
			this.scoresheet = new Scoresheet(this, this.getGlobalScore(), this.multiplayer, this.touchEnabled)
		}
	}
	displayScore(score, notPlayed, bigNote){
		this.view.displayScore(score, notPlayed, bigNote)
	}
	songSelection(fadeIn){
		if(!fadeIn){
			this.clean()
		}
		new SongSelect(false, fadeIn, this.touchEnabled)
	}
	restartSong(){
		this.clean()
		if(this.multiplayer){
			new LoadSong(this.selectedSong, false, true, this.touchEnabled)
		}else{
			new Promise(resolve => {
				var songObj = assets.songs.find(song => song.id === this.selectedSong.folder)
				if(songObj.chart){
					var reader = new FileReader()
					var promise = pageEvents.load(reader).then(event => {
						this.songData = event.target.result.replace(/\0/g, "").split("\n")
						resolve()
					})
					if(this.selectedSong.type === "tja"){
						reader.readAsText(songObj.chart, "sjis")
					}else{
						reader.readAsText(songObj.chart)
					}
				}else{
					resolve()
				}
			}).then(() => {
				var taikoGame = new Controller(this.selectedSong, this.songData, this.autoPlayEnabled, false, this.touchEnabled)
				taikoGame.run()
			})
		}
	}
	playSound(id, time){
		var ms = Date.now() + (time || 0) * 1000
		if(!(id in this.playedSounds) || ms > this.playedSounds[id] + 30){
			assets.sounds[id + this.snd].play(time)
			this.playedSounds[id] = ms
		}
	}
	playSoundMeka(soundID, time){
		var meka = ""
		if(this.autoPlayEnabled && !this.multiplayer){
			meka = "_meka"
		}
		this.playSound(soundID + meka, time)
	}
	togglePause(){
		if(this.multiplayer === 1){
			this.syncWith.game.togglePause()
		}
		this.game.togglePause()
	}
	getKeys(){
		return this.keyboard.getKeys()
	}
	setKey(pressed, name, ms){
		return this.keyboard.setKey(pressed, name, ms)
	}
	getElapsedTime(){
		return this.game.elapsedTime
	}
	getCircles(){
		return this.game.getCircles()
	}
	getCurrentCircle(){
		return this.game.getCurrentCircle()
	}
	isWaiting(key, type){
		return this.keyboard.isWaiting(key, type)
	}
	waitForKeyup(key, type){
		this.keyboard.waitForKeyup(key, type)
	}
	getKeyTime(){
		return this.keyboard.getKeyTime()
	}
	getCombo(){
		return this.game.getCombo()
	}
	getGlobalScore(){
		return this.game.getGlobalScore()
	}
	autoPlay(circle){
		if(this.multiplayer){
			p2.play(circle, this.mekadon)
		}else{
			return this.mekadon.play(circle)
		}
	}
	clean(){
		if(this.multiplayer === 1){
			this.syncWith.clean()
		}
		this.stopMainLoop()
		this.keyboard.clean()
		this.view.clean()
		snd.buffer.loadSettings()
		
		if(!this.multiplayer){
			debugObj.controller = null
			if(debugObj.debug){
				debugObj.debug.updateStatus()
			}
		}
	}
}
