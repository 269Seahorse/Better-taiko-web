class Game{
	constructor(controller, selectedSong, songData){
		this.controller = controller
		this.selectedSong = selectedSong
		this.songData = songData
		this.elapsedTime = {}
		this.currentCircle = 0
		this.combo = 0
		this.globalScore = {
			points: 0,
			great: 0,
			good: 0,
			fail: 0,
			maxCombo: 0,
			drumroll: 0,
			hp: 0,
			song: selectedSong.title
		}
		this.HPGain = 100 / this.songData.circles.filter(circle => {
			var type = circle.getType()
			return type == "don" || type == "ka" || type == "daiDon" || type == "daiKa"
		}).length
		this.paused = false
		this.started = false
		this.mainMusicPlaying = false
		this.elapsedTimeSincePause = 0
		this.musicFadeOut = 0
		this.fadeOutStarted = false
		this.currentTimingPoint = 0
		this.offsetTime = 0
		assets.songs.forEach(song => {
			if(song.id == selectedSong.folder){
				this.mainAsset = song.sound
			}
		})
	}
	run(){
		this.timeForDistanceCircle = 2500
		this.initTiming()
	}
	initTiming(){
		// Date when the chrono is started (before the game begins)
		this.offsetDate = new Date()
		this.offsetTime = Math.max(0, this.timeForDistanceCircle - this.songData.circles[0].ms) |0
		this.setElapsedTime(-this.offsetTime)
		// The real start for the game will start when chrono will reach 0
		this.startDate = new Date()
		this.startDate.setMilliseconds(this.startDate.getMilliseconds() + this.offsetTime)
	}
	update(){
		// Main operations
		this.updateTime()
		this.checkTiming()
		this.updateCirclesStatus()
		this.checkPlays()
		// Event operations
		this.whenFadeoutMusic()
		this.whenLastCirclePlayed()
	}
	getCircles(){
		return this.songData.circles
	}
	updateCirclesStatus(){
		var circles = this.songData.circles
		circles.forEach(circle => {
			if(!circle.getPlayed()){
				var currentTime = this.getElapsedTime().ms
				var startingTime = circle.getMS() - this.timeForDistanceCircle
				// At circle.getMS(), the circle fits the slot
				var hitTime = circle.getMS()
				var endTime = circle.getEndTime()
				var type = circle.getType()
				var drumrollNotes = type === "balloon" || type === "drumroll" || type === "daiDrumroll"
				
				if(currentTime >= startingTime && currentTime <= endTime){
					
					if(currentTime>= hitTime - 50 && currentTime < hitTime - 30){
						circle.updateStatus(0)
					}else if(currentTime >= hitTime - 30 && currentTime < hitTime){
						circle.updateStatus(230)
					}else if(currentTime >= hitTime && currentTime < endTime){
						circle.updateStatus(450)
						if(drumrollNotes && !circle.rendaPlayed){
							circle.rendaPlayed = true
							if(this.controller.selectedSong.difficulty === "easy"){
								assets.sounds["renda"].stop()
								assets.sounds["renda"].play()
							}
						}
					}
				}else if(currentTime > endTime){
					if(drumrollNotes){
						circle.updateStatus(-1)
						circle.played(0, false)
						this.updateCurrentCircle()
						if(this.controller.multiplayer == 1){
							p2.send("drumroll", {
								pace: (this.getElapsedTime().ms - circle.getMS()) / circle.timesHit
							})
						}
					}else{
						if(!this.controller.autoPlayEnabled){
							circle.updateStatus(-1)
							var currentScore = 0
							circle.played(currentScore, type === "daiDon" || type === "daiKa")
							this.controller.displayScore(currentScore, true)
							this.updateCurrentCircle()
							this.updateCombo(currentScore)
							this.updateGlobalScore(currentScore, 1)
						}
						if(this.controller.multiplayer === 1){
							p2.send("note", {
								score: -1
							})
						}
					}
				}
			}
		})
	}
	setHPGain(gain){
		this.HPGain = gain
	}
	checkPlays(){
		var circles = this.songData.circles
		var circle = circles[this.currentCircle]
		
		if(circle && this.controller.autoPlayEnabled){
			return this.controller.autoPlay(circle)
		}
		var keys = this.controller.getKeys()
		var kbd = this.controller.getBindings()
		
		var don_l = keys[kbd["don_l"]] && !this.controller.isWaiting(kbd["don_l"], "score")
		var don_r = keys[kbd["don_r"]] && !this.controller.isWaiting(kbd["don_r"], "score")
		var ka_l = keys[kbd["ka_l"]] && !this.controller.isWaiting(kbd["ka_l"], "score")
		var ka_r = keys[kbd["ka_r"]] && !this.controller.isWaiting(kbd["ka_r"], "score")
		
		if(don_l && don_r){
			this.checkKey([kbd["don_l"], kbd["don_r"]], circle, "daiDon")
		}else if(don_l){
			this.checkKey([kbd["don_l"]], circle, "don")
		}else if(don_r){
			this.checkKey([kbd["don_r"]], circle, "don")
		}
		if(ka_l && ka_r){
			this.checkKey([kbd["ka_l"], kbd["ka_r"]], circle, "daiKa")
		}else if(ka_l){
			this.checkKey([kbd["ka_l"]], circle, "ka")
		}else if(ka_r){
			this.checkKey([kbd["ka_r"]], circle, "ka")
		}
	}
	checkKey(keyCodes, circle, check){
		if(circle && !circle.getPlayed() && circle.getStatus() != -1){
			if(!this.checkScore(circle, check)){
				return
			}
		}
		keyCodes.forEach(keyCode => {
			this.controller.waitForKeyup(keyCode, "score")
		})
	}
	checkScore(circle, check){
		var ms = this.getElapsedTime().ms
		var type = circle.getType()
		
		var keysDon = check === "don" || check === "daiDon"
		var keysKa = check === "ka" || check === "daiKa"
		var keyDai = check === "daiDon" || check === "daiKa"
		var typeDon = type === "don" || type === "daiDon"
		var typeKa = type === "ka" || type === "daiKa"
		var typeDai = type === "daiDon" || type === "daiKa"
		
		if(typeDon || typeKa){
			var score = 0
			if(keysDon && typeDon || keysKa && typeKa){
				if(typeDai && !keyDai){
					if(!circle.daiFailed){
						circle.daiFailed = ms
						return false
					}else if(ms < circle.daiFailed + 2000 / 60){
						return false
					}
				}
				var circleStatus = circle.getStatus()
				if(circleStatus === 230 || circleStatus === 450){
					score = circleStatus
				}
				this.controller.displayScore(score)
			}else{
				this.controller.displayScore(score, true)
			}
			this.updateCombo(score)
			this.updateGlobalScore(score, typeDai && keyDai ? 2 : 1, circle.gogoTime)
			this.updateCurrentCircle()
			circle.played(score, score === 0 ? typeDai : keyDai)
			if(this.controller.multiplayer == 1){
				p2.send("note", {
					score: score,
					ms: circle.getMS() - ms,
					dai: typeDai ? keyDai ? 2 : 1 : 0
				})
			}
		}else if(keysDon && type == "balloon"){
			this.checkBalloon(circle)
			if(check === "daiDon" && !circle.getPlayed()){
				this.checkBalloon(circle)
			}
		}else if((keysDon || keysKa) && (type === "drumroll" || type === "daiDrumroll")){
			this.checkDrumroll(circle)
			if(keyDai){
				this.checkDrumroll(circle)
			}
		}
		return true
	}
	checkBalloon(circle){
		if(circle.timesHit >= circle.requiredHits - 1){
			var score = 5000
			this.updateCurrentCircle()
			circle.hit()
			circle.played(score)
			if(this.controller.multiplayer == 1){
				p2.send("drumroll", {
					pace: (this.getElapsedTime().ms - circle.getMS()) / circle.timesHit
				})
			}
		}else{
			var score = 300
			circle.hit()
		}
		this.globalScore.drumroll ++
		this.globalScore.points += score
	}
	checkDrumroll(circle){
		var dai = circle.getType() === "daiDrumroll"
		var score = 100
		circle.hit()
		var keyTime = this.controller.getKeyTime()
		if(circle.getType() === "drumroll"){
			var sound = keyTime["don"] > keyTime["ka"] ? "don" : "ka"
		}else{
			var sound = keyTime["don"] > keyTime["ka"] ? "daiDon" : "daiKa"
		}
		var circleAnim = new Circle({
			id: 0,
			start: this.getElapsedTime().ms,
			type: sound,
			txt: "",
			speed: circle.speed,
			gogoTime: circle.gogoTime
		})
		circleAnim.played(score, dai)
		circleAnim.animate()
		this.controller.view.drumroll.push(circleAnim)
		this.globalScore.drumroll++
		this.globalScore.points += score * (dai ? 2 : 1)
	}
	whenLastCirclePlayed(){
		var circles = this.songData.circles
		var lastCircle = circles[circles.length - 1]
		var ms = this.getElapsedTime().ms
		if(!this.fadeOutStarted && ms >= lastCircle.getEndTime() + 1900){
			this.fadeOutStarted = ms
		}
	}
	whenFadeoutMusic(){
		var started = this.fadeOutStarted
		if(started){
			var ms = this.getElapsedTime().ms
			if(this.musicFadeOut === 0){
				if(this.controller.multiplayer === 1){
					p2.send("gameresults", this.controller.getGlobalScore())
				}
				this.musicFadeOut++
			}else if(this.musicFadeOut === 1 && ms >= started + 1600){
				this.controller.gameEnded()
				p2.send("gameend")
				this.musicFadeOut++
			}else if(this.musicFadeOut === 2 && (ms >= started + 8600 && ms >= this.controller.mainAsset.duration * 1000 + 250)){
				this.controller.displayResults()
				this.musicFadeOut++
			}
		}
	}
	checkTiming(){
		if(this.songData.timingPoints[this.currentTimingPoint + 1]){
			if(this.getElapsedTime().ms >= this.songData.timingPoints[this.currentTimingPoint + 1].start){
				this.currentTimingPoint++
			}
		}
	}
	playMainMusic(){
		var ms = this.getElapsedTime().ms
		if(!this.mainMusicPlaying && (!this.fadeOutStarted || ms<this.fadeOutStarted + 1600)){
			if(this.controller.multiplayer !== 2){
				this.mainAsset.play((ms < 0 ? -ms : 0) / 1000, false, Math.max(0, ms / 1000))
			}
			this.mainMusicPlaying = true
		}
	}
	togglePause(){
		if(!this.paused){
			assets.sounds["pause"].play()
			this.paused = true
			this.latestDate = new Date()
			this.mainAsset.stop()
			this.mainMusicPlaying = false
		}else{
			assets.sounds["cancel"].play()
			this.paused = false
			var currentDate = new Date()
			this.elapsedTimeSincePause = this.elapsedTimeSincePause + currentDate.getTime() - this.latestDate.getTime()
		}
	}
	isPaused(){
		return this.paused
	}
	getElapsedTime(){
		// Current time in ms from the beginning of the song
		return this.elapsedTime
	}
	setElapsedTime(time){
		this.elapsedTime.ms = time
		this.elapsedTime.sec = (this.elapsedTime.ms / 1000 |0) % 60
		this.elapsedTime.min = (this.elapsedTime.ms / 1000 / 60 |0) % 60
		this.elapsedTime.hour = (this.elapsedTime.ms / 1000 / 60 / 60 |0) % 60
	}
	updateTime(){
		// Refreshed date
		this.currentDate = new Date()
		var ms = this.getElapsedTime().ms
		if(ms >= 0 && !this.started){
			this.startDate = new Date()
			this.elapsedTimeSincePause = 0
			this.setElapsedTime(this.currentDate.getTime() - this.startDate.getTime())
			this.started = true
		}else if(ms < 0 || ms >= 0 && this.started){
			this.setElapsedTime(this.currentDate.getTime() - this.startDate.getTime() - this.elapsedTimeSincePause)
		}
	}
	getCircles(){
		return this.songData.circles
	}
	getSongData(){
		return this.songData
	}
	updateCurrentCircle(){
		this.currentCircle++
	}
	getCurrentCircle(){
		return this.currentCircle
	}
	updateCombo(score){
		if(score !== 0){
			this.combo++
		}else{
			this.combo = 0
		}
		if(this.combo > this.globalScore.maxCombo){
			this.globalScore.maxCombo = this.combo
		}
		if(this.combo === 50 || this.combo > 0 && this.combo % 100 === 0 && this.combo <= 1400){
			this.controller.playSoundMeka("combo-" + this.combo)
		}
		this.controller.view.updateCombo(this.combo)
	}
	getCombo(){
		return this.combo
	}
	getGlobalScore(){
		return this.globalScore
	}
	updateGlobalScore(score, multiplier, gogoTime){
		// Circle score
		switch(score){
			case 450:
				this.globalScore.great++
				break
			case 230:
				this.globalScore.good++
				break
			case 0:
				this.globalScore.fail++
				break
		}
		// HP Update
		if(score !== 0){
			this.globalScore.hp += this.HPGain
		}else if(this.globalScore.hp - this.HPGain > 0){
			this.globalScore.hp -= this.HPGain
		}else{
			this.globalScore.hp = 0
		}
		// Points update
		score += Math.max(0, Math.floor((Math.min(this.combo, 100) - 1) / 10) * 100)
		
		if(gogoTime){
			multiplier *= 1.2
		}
		this.globalScore.points += Math.floor(score * multiplier / 10) * 10
	}
}
