class Controller{
	constructor(selectedSong, songData, autoPlayEnabled, multiplayer, touchEnabled){
		this.selectedSong = selectedSong
		this.songData = songData
		this.autoPlayEnabled = autoPlayEnabled
		this.saveScore = !autoPlayEnabled
		this.multiplayer = multiplayer
		this.touchEnabled = touchEnabled
		if(multiplayer === 2){
			this.snd = p2.player === 2 ? "_p1" : "_p2"
		}else{
			this.snd = multiplayer ? "_p" + p2.player : ""
		}
		
		this.calibrationMode = selectedSong.folder === "calibration"
		this.audioLatency = 0
		this.videoLatency = 0
		if(!this.calibrationMode){
			var latency = settings.getItem("latency")
			if(!autoPlayEnabled){
				this.audioLatency = Math.round(latency.audio) || 0
			}
			this.videoLatency = Math.round(latency.video) || 0 + this.audioLatency
		}
		if(this.multiplayer !== 2){
			loader.changePage("game", false)
		}
		
		if(selectedSong.difficulty === "ino"){
			this.ino = true
			selectedSong.difficulty = "oni"
		}
		if(selectedSong.type === "tja"){
			this.parsedSongData = new ParseTja(songData, selectedSong.difficulty, selectedSong.stars, selectedSong.offset)
		}else{
			this.parsedSongData = new ParseOsu(songData, selectedSong.difficulty, selectedSong.stars, selectedSong.offset)
		}
		this.offset = this.parsedSongData.soundOffset

		var maxCombo = this.parsedSongData.circles.filter(circle => ["don", "ka", "daiDon", "daiKa"].indexOf(circle.type) > -1 && (!circle.branch || circle.branch.name == "master")).length
		if (maxCombo >= 50) {
			var comboVoices = ["v_combo_50"].concat([...Array(Math.floor(maxCombo/100)).keys()].map(i => "v_combo_" + (i + 1)*100))
			var promises = []

			comboVoices.forEach(name => {
				if (!assets.sounds[name + "_p1"]) {
					promises.push(loader.loadSound(name + ".wav", snd.sfxGain).then(sound => {
						assets.sounds[name + "_p1"] = assets.sounds[name].copy(snd.sfxGainL)
						assets.sounds[name + "_p2"] = assets.sounds[name].copy(snd.sfxGainR)
					}))
				}
			})

			Promise.all(promises)
		}
		
		if(this.calibrationMode){
			this.volume = 1
		}else{
			assets.songs.forEach(song => {
				if(song.id == this.selectedSong.folder){
					this.mainAsset = song[this.ino ? "inosound" : "sound"]
					this.volume = song.volume || 1
				}
			})
		}
		if(this.ino){
			this.inoCircles()
		}
		
		this.game = new Game(this, this.selectedSong, this.parsedSongData)
		this.view = new View(this)
		this.mekadon = new Mekadon(this, this.game)
		this.keyboard = new GameInput(this)
		if(!autoPlayEnabled && this.multiplayer !== 2){
			this.easierBigNotes = settings.getItem("easierBigNotes") || this.keyboard.keyboard.TaikoForceLv5
		}else{
			this.easierBigNotes = false
		}
		
		this.drumSounds = settings.getItem("latency").drumSounds
		this.playedSounds = {}
	}
	run(syncWith){
		if(syncWith){
			this.syncWith = syncWith
			if(this.ino && !this.syncWith.ino){
				this.syncWith.ino = this.ino
				this.syncWith.mainAsset = this.mainAsset
				this.syncWith.inoCircles()
			}
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
		if(this.game.mainAsset){
			this.game.mainAsset.stop()
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
			if(this.calibrationMode){
				this.game.calibration()
			}
			if(!this.game.isPaused()){
				this.keyboard.checkGameKeys()
				
				if(ms < 0){
					this.game.updateTime()
				}else{
					if(!this.calibrationMode){
						this.game.update()
					}
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
					var player = this.multiplayer ? p2.player : 1
					if(player === 1){
						this.viewLoop()
					}
					if(this.multiplayer === 1){
						this.syncWith.viewLoop()
					}
					if(player === 2){
						this.viewLoop()
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
		if(this.game.rules.clearReached(score.gauge)){
			if(score.bad === 0){
				vp = "fullcombo"
				this.playSound("v_fullcombo", 1.350)
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
	songSelection(fadeIn, showWarning){
		if(!fadeIn){
			this.clean()
		}
		if(this.calibrationMode){
			new SettingsView(this.touchEnabled, false, null, "latency")
		}else{
			new SongSelect(false, fadeIn, this.touchEnabled, null, showWarning)
		}
	}
	restartSong(){
		this.clean()
		if(this.ino){
			this.selectedSong.difficulty = "ino"
		}
		if(this.multiplayer){
			new LoadSong(this.selectedSong, false, true, this.touchEnabled)
		}else{
			new Promise(resolve => {
				if(this.calibrationMode){
					resolve()
				}else{
					var songObj = assets.songs.find(song => song.id === this.selectedSong.folder)
					if(songObj.chart && songObj.chart !== "blank"){
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
				}
			}).then(() => {
				var taikoGame = new Controller(this.selectedSong, this.songData, this.autoPlayEnabled, false, this.touchEnabled)
				taikoGame.run()
			})
		}
	}
	playSound(id, time, noSnd){
		if(!this.drumSounds && (id === "neiro_1_don" || id === "neiro_1_ka" || id === "se_don" || id === "se_ka")){
			return
		}
		var ms = Date.now() + (time || 0) * 1000
		if(!(id in this.playedSounds) || ms > this.playedSounds[id] + 30){
			assets.sounds[id + (noSnd ? "" : this.snd)].play(time)
			this.playedSounds[id] = ms
		}
	}
	togglePause(forcePause, pauseMove, noSound){
		if(this.multiplayer === 1){
			this.syncWith.game.togglePause(forcePause, pauseMove, noSound)
		}
		this.game.togglePause(forcePause, pauseMove, noSound)
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
	inoCircles(musicMs){
		var musicMs = this.mainAsset.duration * 1000
		var circles = this.parsedSongData.circles
		var events = this.parsedSongData.events
		if(events.length !== 0){
			var nextEvent = 0
			var lastGogo = false
			var newEvents = []
			for(var i = events.length; i-- >= 0;){
				if(i === -1){
					if(circles.length === 0){
						continue
					}else{
						var event = circles[0]
					}
				}else{
					var event = events[i]
				}
				newEvents.push(new Circle({
					start: nextEvent,
					type: "event",
					speed: event.speed,
					gogoTime: event.gogoTime,
					beatMS: event.beatMS,
					branch: event.branch
				}))
				nextEvent = musicMs - event.ms
			}
			if(newEvents.length >= 2 && newEvents[0].beatMS === newEvents[1].beatMS && newEvents[0].gogoTime !== newEvents[1].gogoTime && !newEvents[0].gogoTime){
				newEvents.shift()
			}
			this.parsedSongData.events = newEvents
		}
		if(circles.length !== 0){
			var lastMs = circles[circles.length - 1].endTime || circles[circles.length - 1].ms
			if(musicMs - lastMs >= 0){
				var end = musicMs
				this.offset = 0
			}else{
				var end = lastMs
				this.offset = Math.abs(musicMs - lastMs)
			}
			var id = 0
			circles.reverse()
			circles.forEach(circle => {
				id++
				circle.id = id
				var ms = circle.ms
				circle.ms = circle.originalMS = end - (circle.endTime || ms)
				circle.endTime = circle.originalEndTime = end - ms
			})
		}
		var measures = this.parsedSongData.measures
		if(measures.length !== 0){
			var storedBranch
			measures.forEach(measure => {
				if(measure.nextBranch){
					var currentBranch = measure.nextBranch
					if(storedBranch){
						measure.nextBranch = storedBranch
					}else{
						measure.nextBranch = {
							ms: measure.nextBranch.ms,
							originalMS: measure.nextBranch.originalMS,
							active: "normal",
							type: "accuracy",
							requirement: {advanced: 101, master: 102},
							normal: {name: "normal", active: true},
							advanced: {name: "advanced", active: false},
							master: {name: "master", active: false}
						}
					}
					storedBranch = currentBranch
				}
				measure.ms = measure.originalMS = musicMs - measure.ms
			})
			if(storedBranch){
				measures[measures.length - 1].nextBranch = storedBranch
			}
			measures.reverse()
		}
		var branches = this.parsedSongData.branches
		if(branches && branches.length !== 0){
			branches.reverse()
			var nextBranch = 0
			branches.forEach(branch => {
				var thisBranch = nextBranch
				nextBranch = musicMs - branch.ms
				branch.ms = branch.originalMS = thisBranch
			})
			var req = branches[0].requirement
			var type = branches[0].type
			var noNormal = req.advanced <= 0
			var noAdvanced = req.master <= 0 || req.advanced >= req.master || type === "accuracy" && req.advanced > 100
			var noMaster = type === "accuracy" && req.master > 100
			if(noMaster){
				if(noAdvanced){
					var relevantName = "normal"
					req.advanced = 101
					req.master = 102
				}else{
					var relevantName = "advanced"
					req.advanced = 0
					req.master = 101
				}
			}else{
				var relevantName = "master"
				req.advanced = -1
				req.master = 0
			}
			var branchNames = ["normal", "advanced", "master"]
			for(var j in branchNames){
				var name = branchNames[j]
				if(name in branches[0]){
					branches[0][name].active = name === relevantName
				}
			}
			branches[0].active = relevantName
		}
	}
	getTitle(title){
		if(this.ino){
			var symbols = ",.、。ﾟ°[\\(（\\)）\\[\\]「」『』【】:：;；\\-－~～〜_♪!！\\?？\"♦◇↓♡☆…⑨"
			var matches = title.match(new RegExp("^['＇’" + symbols + "]+"))
			var titlePrefix = matches ? matches[0] : ""
			title = title.slice(titlePrefix.length)
			var matches = title.match(new RegExp("['＇’" + symbols + "]*(\\s*[\\(（]裏[\\)）]|)$"))
			var titleSuffix = matches ? matches[0] : ""
			if(titleSuffix.length !== 0){
				title = title.slice(0, -titleSuffix.length)
			}
			var titleWords = title.split("").reverse().join("").split(new RegExp("([\\s" + symbols + "]+)"))
			for(var i = 0 ; i < titleWords.length; i++){
				var word = titleWords[i]
				if(word === "0002"){
					titleWords[i] = "Nesin"
					continue
				}
				var newWord = titleWords[i].split("")
				if(word.length >= 2){
					for(var j = 0; j < word.length; j++){
						var k = word.length - j - 1
						var lower = word[j].toLowerCase()
						var upper = word[j].toUpperCase()
						if(lower !== upper){
							if(word[j] === upper){
								newWord[k] = word[k].toUpperCase()
							}else{
								newWord[k] = word[k].toLowerCase()
							}
						}else if(k === 0){
							newWord[k] = word[k].toUpperCase()
						}else{
							newWord[k] = word[k].toLowerCase()
						}
					}
					titleWords[i] = newWord.join("")
				}
			}
			title = titlePrefix + titleWords.join("") + titleSuffix
		}
		return title
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
