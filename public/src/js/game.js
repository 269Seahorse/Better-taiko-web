class Game{
	constructor(controller, selectedSong, songData){
		this.controller = controller
		this.selectedSong = selectedSong
		this.songData = songData
		this.elapsedTime = 0
		this.currentCircle = 0
		this.combo = 0
		this.rules = new GameRules(this)
		this.globalScore = {
			points: 0,
			good: 0,
			ok: 0,
			bad: 0,
			maxCombo: 0,
			drumroll: 0,
			gauge: 0,
			title: selectedSong.title,
			difficulty: this.rules.difficulty
		}
		this.HPGain = 100 / this.songData.circles.filter(circle => {
			var type = circle.getType()
			return type === "don" || type === "ka" || type === "daiDon" || type === "daiKa"
		}).length
		this.paused = false
		this.started = false
		this.mainMusicPlaying = false
		this.musicFadeOut = 0
		this.fadeOutStarted = false
		this.currentTimingPoint = 0
		
		assets.songs.forEach(song => {
			if(song.id == selectedSong.folder){
				this.mainAsset = song.sound
			}
		})
	}
	run(){
		this.timeForDistanceCircle = 2500
		this.initTiming()
		this.view = this.controller.view
	}
	initTiming(){
		// Date when the chrono is started (before the game begins)
		var offsetTime = Math.max(0, this.timeForDistanceCircle - this.songData.circles[0].ms) |0
		this.elapsedTime = -offsetTime
		// The real start for the game will start when chrono will reach 0
		this.startDate = +(new Date) + offsetTime
	}
	update(){
		// Main operations
		this.updateTime()
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
		var nextSet = false
		var circles = this.songData.circles
		for(var i in circles){
			var circle = circles[i]
			if(!circle.getPlayed()){
				var ms = this.elapsedTime
				var type = circle.getType()
				var drumrollNotes = type === "balloon" || type === "drumroll" || type === "daiDrumroll"
				var endTime = circle.getEndTime() + (drumrollNotes ? 0 : this.rules.bad)
				
				if(ms >= circle.getMS()){
					if(drumrollNotes && !circle.rendaPlayed && ms < endTime){
						circle.rendaPlayed = true
						if(this.rules.difficulty === "easy"){
							assets.sounds["renda" + this.controller.snd].stop()
							this.controller.playSoundMeka("renda")
						}
					}
					if(!circle.beatMSCopied){
						if(this.view.beatInterval !== circle.beatMS){
							this.view.changeBeatInterval(circle.beatMS)
						}
						circle.beatMSCopied = true
					}
				}
				if(ms > endTime){
					if(!this.controller.autoPlayEnabled){
						if(drumrollNotes){
							circle.played(-1, false)
							this.updateCurrentCircle()
							if(this.controller.multiplayer === 1){
								p2.send("drumroll", {
									pace: (ms - circle.getMS()) / circle.timesHit
								})
							}
						}else{
							var currentScore = 0
							circle.played(-1, type === "daiDon" || type === "daiKa")
							this.controller.displayScore(currentScore, true)
							this.updateCurrentCircle()
							this.updateCombo(currentScore)
							this.updateGlobalScore(currentScore, 1)
							if(this.controller.multiplayer === 1){
								p2.send("note", {
									score: -1
								})
							}
						}
					}
				}else if(!this.controller.autoPlayEnabled && !nextSet){
					nextSet = true
					this.currentCircle = i
				}
			}
		}
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
		if(circle && !circle.getPlayed()){
			if(!this.checkScore(circle, check)){
				return
			}
		}
		keyCodes.forEach(keyCode => {
			this.controller.waitForKeyup(keyCode, "score")
		})
	}
	checkScore(circle, check){
		var ms = this.elapsedTime
		var type = circle.getType()
		
		var keysDon = check === "don" || check === "daiDon"
		var keysKa = check === "ka" || check === "daiKa"
		var keyDai = check === "daiDon" || check === "daiKa"
		var typeDon = type === "don" || type === "daiDon"
		var typeKa = type === "ka" || type === "daiKa"
		var typeDai = type === "daiDon" || type === "daiKa"
		
		var keyTime = this.controller.getKeyTime()
		var currentTime = keysDon ? keyTime["don"] : keyTime["ka"]
		var relative = currentTime - circle.getMS()
		
		if(typeDon || typeKa){
			if(-this.rules.bad >= relative || relative >= this.rules.bad){
				return true
			}
			var score = 0
			if(keysDon && typeDon || keysKa && typeKa){
				if(typeDai && !keyDai){
					if(!circle.daiFailed){
						circle.daiFailed = ms
						return false
					}else if(ms < circle.daiFailed + this.rules.daiLeniency){
						return false
					}
				}
				var circleStatus = -1
				relative = Math.abs(relative)
				if(relative < this.rules.good){
					circleStatus = 450
				}else if(relative < this.rules.ok){
					circleStatus = 230
				}else if(relative < this.rules.bad){
					circleStatus = 0
				}
				if(circleStatus === 230 || circleStatus === 450){
					score = circleStatus
				}
				circle.played(score, score === 0 ? typeDai : keyDai)
				this.controller.displayScore(score, false, typeDai && keyDai)
			}else{
				circle.played(-1, typeDai)
				this.controller.displayScore(score, true, false)
			}
			this.updateCombo(score)
			this.updateGlobalScore(score, typeDai && keyDai ? 2 : 1, circle.gogoTime)
			this.updateCurrentCircle()
			if(this.controller.multiplayer == 1){
				p2.send("note", {
					score: score,
					ms: circle.getMS() - currentTime,
					dai: typeDai ? keyDai ? 2 : 1 : 0
				})
			}
		}else{
			if(circle.getMS() > currentTime || currentTime > circle.getEndTime()){
				return true
			}
			if(keysDon && type === "balloon"){
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
					pace: (this.elapsedTime - circle.getMS()) / circle.timesHit
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
		var ms = this.elapsedTime
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
			start: ms,
			type: sound,
			txt: "",
			speed: circle.speed,
			gogoTime: circle.gogoTime
		})
		circleAnim.played(score, dai)
		circleAnim.animate(ms)
		this.view.drumroll.push(circleAnim)
		this.globalScore.drumroll++
		this.globalScore.points += score * (dai ? 2 : 1)
	}
	whenLastCirclePlayed(){
		var circles = this.songData.circles
		var lastCircle = circles[circles.length - 1]
		var ms = this.elapsedTime
		if(!this.fadeOutStarted && ms >= lastCircle.getEndTime() + 2000){
			this.fadeOutStarted = ms
		}
	}
	whenFadeoutMusic(){
		var started = this.fadeOutStarted
		if(started){
			var ms = this.elapsedTime
			var musicDuration = this.controller.mainAsset.duration * 1000 - this.controller.offset
			if(this.musicFadeOut === 0){
				if(this.controller.multiplayer === 1){
					p2.send("gameresults", this.getGlobalScore())
				}
				this.musicFadeOut++
			}else if(this.musicFadeOut === 1 && ms >= started + 1600){
				this.controller.gameEnded()
				if(!p2.session){
					p2.send("gameend")
				}
				this.musicFadeOut++
			}else if(this.musicFadeOut === 2 && (ms >= started + 8600 && ms >= musicDuration + 250)){
				this.controller.displayResults()
				this.musicFadeOut++
			}else if(this.musicFadeOut === 3 && (ms >= started + 9600 && ms >= musicDuration + 1250)){
				this.controller.clean()
				if(this.controller.scoresheet){
					this.controller.scoresheet.startRedraw()
				}
			}
		}
	}
	playMainMusic(){
		var ms = this.elapsedTime + this.controller.offset
		if(!this.mainMusicPlaying && (!this.fadeOutStarted || ms < this.fadeOutStarted + 1600)){
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
			this.latestDate = +new Date
			this.mainAsset.stop()
			this.mainMusicPlaying = false
		}else{
			assets.sounds["cancel"].play()
			this.paused = false
			var currentDate = +new Date
			this.startDate += currentDate - this.latestDate
			this.sndTime = currentDate - snd.buffer.getTime() * 1000
		}
	}
	isPaused(){
		return this.paused
	}
	updateTime(){
		// Refreshed date
		var ms = this.elapsedTime
		if(ms >= 0 && !this.started){
			this.startDate = +new Date
			this.elapsedTime = this.getAccurateTime()
			this.started = true
			this.sndTime = this.startDate - snd.buffer.getTime() * 1000
		}else if(ms < 0 || ms >= 0 && this.started){
			var currentDate = +new Date
			if(!this.controller.touchEnabled){
				var sndTime = currentDate - snd.buffer.getTime() * 1000
				var lag = sndTime - this.sndTime
				if(Math.abs(lag) >= 50){
					this.startDate += lag
					this.sndTime = sndTime
				}
			}
			this.elapsedTime = currentDate - this.startDate
		}
	}
	getAccurateTime(){
		if(this.isPaused()){
			return this.elapsedTime
		}else{
			return (+new Date) - this.startDate
		}
	}
	getCircles(){
		return this.songData.circles
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
		this.view.updateCombo(this.combo)
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
				this.globalScore.good++
				break
			case 230:
				this.globalScore.ok++
				break
			case 0:
				this.globalScore.bad++
				break
		}
		// Gauge update
		if(score !== 0){
			this.globalScore.gauge += this.HPGain
		}else if(this.globalScore.gauge - this.HPGain > 0){
			this.globalScore.gauge -= this.HPGain
		}else{
			this.globalScore.gauge = 0
		}
		// Points update
		score += Math.max(0, Math.floor((Math.min(this.combo, 100) - 1) / 10) * 100)
		
		if(gogoTime){
			multiplier *= 1.2
		}
		this.globalScore.points += Math.floor(score * multiplier / 10) * 10
	}
}
