class View{
	constructor(controller, bg, songTitle, songDifficulty){
		this.controller = controller
		this.bg = bg
		this.songTitle = songTitle
		this.songDifficulty = songDifficulty
		
		this.pauseMenu = document.getElementById("pause-menu")
		this.cursor = document.getElementById("cursor")
		this.gameDiv = document.getElementById("game")
		
		var docW = document.body.offsetWidth
		var docH = document.body.offsetHeight
		if(this.controller.multiplayer === 2){
			this.canvas = new ScalableCanvas("canvas-p2", docW, docH / 3 * 2)
			this.canvas.canvas.style.position = "absolute"
			this.canvas.canvas.style.top = "33%"
			this.gameDiv.appendChild(this.canvas.canvas)
		}else{
			this.canvas = new ScalableCanvas("canvas", docW, docH)
		}
		this.winW = this.canvas.scaledWidth
		this.winH = this.canvas.scaledHeight
		if(this.controller.multiplayer === 2){
			this.winH = this.winH / 2 * 3
		}
		this.ctx = this.canvas.ctx
		
		this.taikoSquareW = this.winW / 4
		this.slotX = this.taikoSquareW + 100
		
		this.currentScore = 0
		this.special = ""
		this.scoreDispCount = -1
		this.scoreOpacity = 1
		
		this.lastMeasure = 0
		this.currentTimingPoint = 0
		//Distance to be done by the circle
		this.distanceForCircle = this.winW - this.slotX
		
		this.currentCircleFace = 0
		this.currentDonFace = 0
		this.currentBigDonFace = 1
		this.nextBeat = 0
		this.gogoTime = 0
		this.gogoTimeStarted = -Infinity
		
		this.drumroll = []
		
		this.beatInterval = this.controller.parsedSongData.beatInfo.beatInterval
		this.assets = new ViewAssets(this)
		
		this.touch = -Infinity
		
		if(this.controller.touchEnabled){
			this.touchEnabled = true
			
			this.touchDrumDiv = document.getElementById("touch-drum")
			this.touchDrumImg = document.getElementById("touch-drum-img")
			this.gameDiv.classList.add("touch-visible")
			document.getElementById("version").classList.add("version-hide")
			
			pageEvents.add(this.canvas.canvas, "touchstart", this.ontouch.bind(this))
			
			this.touchFullBtn = document.getElementById("touch-full-btn")
			pageEvents.add(this.touchFullBtn, "touchend", toggleFullscreen)
			if(!fullScreenSupported){
				this.touchFullBtn.style.display = "none"
			}
			
			this.touchPauseBtn = document.getElementById("touch-pause-btn")
			pageEvents.add(this.touchPauseBtn, "touchend", () => {
				this.controller.togglePauseMenu()
			})
		}
	}
	run(){
		this.ctx.font = "normal 14pt TnT, Meiryo, sans-serif"
		this.setBackground()
		
		if(this.controller.multiplayer !== 2){
			var gameSong = document.getElementsByClassName("game-song")[0]
			gameSong.appendChild(document.createTextNode(this.songTitle))
			gameSong.setAttribute("alt", this.songTitle)
		}
		this.lastMousemove = this.controller.getElapsedTime()
		pageEvents.mouseAdd(this, this.onmousemove.bind(this))
		
		this.refresh()
	}
	setBackground(){
		var gameDiv = document.getElementById("game")
		var selectedSong = this.controller.selectedSong
		if(selectedSong.defaultBg){
			var categories = {
				"J-POP": 0,
				"アニメ": 1,
				"ボーカロイド™曲": 2,
				"バラエティ": 3,
				"クラシック": 4,
				"ゲームミュージック": 5,
				"ナムコオリジナル": 6
			}
			var catId = 7
			if(selectedSong.category in categories){
				catId = categories[selectedSong.category]
			}
			this.bg = assets.image["bg_genre_" + catId].src
			gameDiv.classList.add("default-bg")
		}
		gameDiv.style.backgroundImage = "url('" + this.bg + "')"
	}
	positionning(){
		var docW = document.body.offsetWidth
		var docH = document.body.offsetHeight
		this.canvas.rescale()
		if(this.controller.multiplayer === 2){
			docH = docH / 3 * 2
		}
		this.canvas.resize(docW, docH)
		this.winW = this.canvas.scaledWidth
		this.winH = this.canvas.scaledHeight
		if(this.controller.multiplayer === 2){
			this.winH = this.winH / 2 * 3
		}
		this.barY = 0.25 * this.winH
		this.barH = 0.23 * this.winH
		this.lyricsBarH = 0.2 * this.barH
		this.taikoSquareW = this.winW / 4
		this.taikoH = this.barH
		this.taikoW = this.taikoH / 1.2
		this.taikoX = this.taikoSquareW * 0.76 - this.taikoW / 2
		this.taikoY = this.barY + 5
		this.slotX = this.taikoSquareW + this.barH * 0.5
		this.scoreSquareW = this.taikoSquareW * 0.55
		this.scoreSquareH = this.barH * 0.25
		this.circleSize = this.barH * 0.18
		this.bigCircleSize = this.circleSize * (5 / 3)
		this.circleY = this.barY + (this.barH - this.lyricsBarH) / 2
		this.lyricsSize = this.lyricsBarH * 0.6
		var HPBarRatio = 703 / 51
		this.HPBarW = this.taikoSquareW * 2.475
		this.HPBarH = this.barH * 0.35
		if(this.HPBarW/this.HPBarH > HPBarRatio){
			this.HPBarW = this.HPBarH * HPBarRatio
		}else{
			this.HPBarH = this.HPBarW / HPBarRatio
		}
		this.HPBarX = this.winW - this.HPBarW
		this.HPBarY = this.barY - this.HPBarH
		this.HPbarColX = this.HPBarX + this.HPBarW * 0.008
		this.HPbarColY = this.HPBarY + this.HPBarH * 0.14
		this.HPBarColMaxW = this.HPBarW * 0.925
		this.HPBarColH = this.HPBarH * 0.8
		var diffRatio = 176 / 120
		this.diffH = this.winH * 0.16
		this.diffW = this.diffH * diffRatio
		this.diffX = this.taikoX * 0.10
		this.diffY = this.taikoY * 1.05 + this.taikoH * 0.19
		this.touchDrum = (() => {
			var sw = 842
			var sh = 340
			var x = 0
			var y = this.barY + this.barH + 5
			var paddingTop = this.barH * 0.1
			var w = this.winW
			var maxH = this.winH - (this.barY + this.barH + 5)
			var h = maxH - paddingTop
			if(w / h >= sw / sh){
				w = h / sh * sw
				x = (this.winW - w) / 2
				y += paddingTop
			}else{
				h = w / sw * sh
				y = y + (maxH - h)
			}
			return {
				x: x, y: y, w: w, h: h
			}
		})()
		this.touchCircle = (() => {
			return {
				x: this.winW / 2,
				y: this.winH + this.touchDrum.h * 0.1,
				rx: this.touchDrum.w / 2 - this.touchDrum.h * 0.03,
				ry: this.touchDrum.h * 1.07
			}
		})()
	}
	refresh(){
		this.positionning()
		this.distanceForCircle = this.winW - this.slotX
		
		this.ctx.clearRect(0, 0, this.canvas.scaledWidth, this.canvas.scaledHeight)
		
		// Draw
		this.assets.drawAssets("background")
		this.drawBar()
		this.drawSlot()
		this.drawHPBar()
		this.assets.drawAssets("bar")
		this.drawMeasures()
		this.drawScore()
		this.drawCircles(this.controller.getCircles())
		this.drawCircles(this.drumroll)
		this.drawTaikoSquare()
		this.drawDifficulty()
		this.drawPressedKeys()
		this.drawCombo()
		this.drawGlobalScore()
		this.updateDonFaces()
		this.drawGogoTime()
		this.mouseIdle()
		if(!this.touchEnabled){
			this.assets.drawAssets("foreground")
		}
		this.drawTouch()
		//this.drawTime()
	}
	updateDonFaces(){
		var ms = this.controller.getElapsedTime()
		while(ms >= this.nextBeat){
			this.nextBeat += this.beatInterval
			if(this.controller.getCombo() >= 50){
				var face = Math.floor(ms / this.beatInterval) % 2
				this.currentBigDonFace = face
				this.currentDonFace = face
			}else{
				this.currentBigDonFace = 1
				this.currentDonFace = 0
			}
		}
	}
	drawHPBar(){
		var z = this.canvas.scale
		
		var bottomSquareX = this.taikoSquareW
		var borderSize = this.HPBarH * 0.2
		this.ctx.fillStyle = "#000"
		this.ctx.beginPath()
		// Right hand black square
		this.ctx.fillRect(
			this.HPBarX + this.HPBarW - this.HPBarY * 0.2,
			this.HPBarY,
			this.HPBarW * 0.2,
			this.HPBarH
		)
		this.ctx.fillRect(
			bottomSquareX + borderSize,
			this.HPBarY + 0.435 * this.HPBarH,
			this.winW - bottomSquareX - borderSize,
			this.HPBarH / 2 + 2 * z
		)
		this.ctx.fillRect(
			bottomSquareX,
			this.HPBarY + 0.68 * this.HPBarH,
			this.HPBarW * 0.8,
			this.HPBarH / 4 + 2 * z
		)
		this.ctx.arc(
			bottomSquareX+borderSize,
			this.HPBarY+ 0.435 * this.HPBarH + borderSize,
			borderSize,
			0,
			Math.PI * 2
		)
		this.ctx.fill()
		this.ctx.closePath()
		
		this.ctx.fillOpacity = 0.5
		this.ctx.drawImage(assets.image["hp-bar-bg"],
			this.HPBarX, this.HPBarY,
			this.HPBarW, this.HPBarH
		)
		this.ctx.fillOpacity = 1
		var hpBar = this.getHP()
		this.ctx.drawImage(assets.image["hp-bar-colour"],
			0, 0,
			Math.max(1, hpBar.imgW), 40,
			this.HPbarColX, this.HPbarColY,
			hpBar.canvasW, this.HPBarColH
		)
	}
	getHP(){
		var circles = this.controller.getCircles()
		var currentCircle = this.controller.getCurrentCircle()
		var gauge = this.controller.getGlobalScore().gauge
		var width = Math.floor(gauge * 650 / 1000) * 10
		return {
			imgW: width,
			canvasW: width / 650 * this.HPBarColMaxW
		}
	}
	drawMeasures(){
		var measures = this.controller.parsedSongData.measures
		var currentTime = this.controller.getElapsedTime()
		
		measures.forEach((measure, index)=>{
			var timeForDistance = this.posToMs(this.distanceForCircle, measure.speed)
			if(currentTime >= measure.ms - timeForDistance && currentTime <= measure.ms + 350){
				this.drawMeasure(measure)
			}
		})
	}
	drawMeasure(measure){
		var z = this.canvas.scale
		var currentTime = this.controller.getElapsedTime()
		var measureX = this.slotX + this.msToPos(measure.ms - currentTime, measure.speed)
		this.ctx.strokeStyle = "#bab8b8"
		this.ctx.lineWidth = 2
		this.ctx.beginPath()
		this.ctx.moveTo(measureX, this.barY + 5 * z)
		this.ctx.lineTo(measureX, this.barY + this.barH - this.lyricsBarH - 5 * z)
		this.ctx.closePath()
		this.ctx.stroke()
	}
	drawCombo(){
		var comboCount = this.controller.getCombo()
		if(comboCount >= 10){
			var comboX = this.taikoX + this.taikoW / 2
			var comboY = this.barY + this.barH / 2
			var fontSize = this.taikoH * 0.4
			this.ctx.font = "normal " + fontSize + "px TnT, Meiryo, sans-serif"
			this.ctx.textAlign = "center"
			this.ctx.strokeStyle = "#000"
			this.ctx.lineWidth = fontSize / 10
			var glyph = this.ctx.measureText("0").width
			var comboText = comboCount.toString().split("")
			for(var i in comboText){
				var textX = comboX + glyph * (i - (comboText.length - 1) / 2)
				if(comboCount >= 100){
					var grd = this.ctx.createLinearGradient(
						textX - glyph * 0.2,
						comboY - fontSize * 0.8,
						textX + glyph * 0.2,
						comboY - fontSize * 0.2
					)
					grd.addColorStop(0, "#f00")
					grd.addColorStop(1, "#fe0")
					this.ctx.fillStyle = grd
				}else{
					this.ctx.fillStyle = "#fff"
				}
				this.strokeFillText(comboText[i],
					textX,
					comboY
				)
			}
			
			var fontSize = this.taikoH * 0.12
			if(comboCount >= 100){
				var grd = this.ctx.createLinearGradient(0, comboY + fontSize * 0.5, 0, comboY + fontSize * 1.5)
				grd.addColorStop(0, "#f00")
				grd.addColorStop(1, "#fe0")
				this.ctx.fillStyle = grd
			}else{
				this.ctx.fillStyle = "#fff"
			}
			this.ctx.font = "normal " + fontSize + "px TnT, Meiryo, sans-serif"
			this.ctx.lineWidth = fontSize / 5
			this.strokeFillText("コンボ",
				comboX,
				comboY + fontSize * 1.5
			)
			
			this.scoreDispCount++
		}
	}
	strokeFillText(text, x, y){
		this.ctx.strokeText(text, x, y)
		this.ctx.fillText(text, x, y)
	}
	drawGlobalScore(){
		// Draw score square
		this.ctx.fillStyle="#000"
		this.ctx.beginPath()
		this.ctx.fillRect(0, this.barY, this.scoreSquareW, this.scoreSquareH - 10)
		this.ctx.fillRect(0, this.barY, this.scoreSquareW - 10, this.scoreSquareH)
		this.ctx.arc(
			this.scoreSquareW - 10,
			this.barY + this.scoreSquareH - 10,
			10,
			0,
			Math.PI * 2
		)
		this.ctx.fill()
		this.ctx.closePath()
		
		var fontSize = 0.7 * this.scoreSquareH
		// Draw score text
		this.ctx.font = "normal " + fontSize + "px TnT, Meiryo, sans-serif"
		this.ctx.fillStyle = "#fff"
		this.ctx.textAlign = "center"
		var glyph = this.ctx.measureText("0").width
		var pointsText = this.controller.getGlobalScore().points.toString().split("")
		for(var i in pointsText){
			this.ctx.fillText(pointsText[i],
				this.scoreSquareW - 30 + glyph * (i - pointsText.length + 1),
				this.barY + this.scoreSquareH * 0.7
			)
		}
	}
	drawPressedKeys(){
		var ms = this.controller.getElapsedTime()
		var keyTime = this.controller.getKeyTime()
		var kbd = this.controller.getBindings()
		
		if(keyTime[kbd["ka_l"]] > ms - 150){
			var elemW = 0.45 * this.taikoW
			this.ctx.globalAlpha = Math.min(1, 4 - (ms - keyTime[kbd["ka_l"]]) / 37.5)
			this.ctx.drawImage(assets.image["taiko-key-blue"],
				0, 0, 68, 124,
				this.taikoX + this.taikoW * 0.05,
				this.taikoY + this.taikoH * 0.03,
				elemW,
				124 / 68 * elemW
			)
		}
		if(keyTime[kbd["don_l"]] > ms - 150){
			var elemW = 0.35 * this.taikoW
			this.ctx.globalAlpha = Math.min(1, 4 - (ms - keyTime[kbd["don_l"]]) / 37.5)
			this.ctx.drawImage(assets.image["taiko-key-red"],
				0, 0, 53, 100,
				this.taikoX + this.taikoW * 0.15,
				this.taikoY + this.taikoH * 0.09,
				elemW,
				100 / 53 * elemW
			)
		}
		if(keyTime[kbd["don_r"]] > ms - 150){
			var elemW = 0.35 * this.taikoW
			this.ctx.globalAlpha = Math.min(1, 4 - (ms - keyTime[kbd["don_r"]]) / 37.5)
			this.ctx.drawImage(assets.image["taiko-key-red"],
				53, 0, 53, 100,
				this.taikoX + this.taikoW * 0.15 + elemW,
				this.taikoY + this.taikoH * 0.09,
				elemW,
				100 / 53 * elemW
			)
		}
		if(keyTime[kbd["ka_r"]] > ms - 150){
			var elemW = 0.45 * this.taikoW
			this.ctx.globalAlpha = Math.min(1, 4 - (ms - keyTime[kbd["ka_r"]]) / 37.5)
			this.ctx.drawImage(assets.image["taiko-key-blue"],
				68, 0, 68, 124,
				this.taikoX + this.taikoW * 0.05 + elemW,
				this.taikoY + this.taikoH * 0.03,
				elemW,
				124 / 68 * elemW
			)
		}
		this.ctx.globalAlpha = 1
	}
	displayScore(score, notPlayed){
		this.currentScore = score
		this.special = notPlayed ? "-b" : ""
		this.scoreDispCount = 0
		this.scoreOpacity = 1
	}
	drawScore(){
		if(this.scoreDispCount >= 0 && this.scoreDispCount <= 20){
			this.ctx.globalAlpha = this.scoreOpacity
			var scoreIMG = assets.image["score-" + this.currentScore + this.special]
			this.ctx.drawImage(scoreIMG,
				this.slotX - this.barH / 2,
				this.barY + (this.barH - this.lyricsBarH) / 2 - this.barH / 2,
				this.barH,
				this.barH
			)
			this.scoreDispCount++
			if(this.scoreOpacity - 0.1 >= 0 && this.currentScore != 0){
				this.scoreOpacity -= 0.1
			}
		}else if(this.scoreDispCount === 21){
			this.scoreDispCount = -1
		}
		this.ctx.globalAlpha = 1
	}
	posToMs(pos, speed){
		return 140 / this.circleSize * pos / speed
	}
	msToPos(ms, speed){
		return speed / (140 / this.circleSize) * ms
	}
	drawCircles(circles){
		for(var i = circles.length; i--;){
			var circle = circles[i]
			var ms = this.controller.getElapsedTime()
			var speed = circle.getSpeed()
			
			var timeForDistance = this.posToMs(this.distanceForCircle + this.bigCircleSize / 2, speed)
			var startingTime = circle.getMS() - timeForDistance
			var finishTime = circle.getEndTime() + this.posToMs(this.slotX - this.taikoSquareW + this.bigCircleSize * 3, speed)
			
			if(circle.getPlayed() <= 0 || circle.getScore() === 0){
				if(ms >= startingTime && ms <= finishTime && circle.getPlayed() !== -1){
					this.drawCircle(circle)
				}
			}else if(!circle.isAnimated()){
				// Start animation to HP bar
				circle.animate(ms)
			}
			if(ms >= circle.ms && !circle.gogoChecked){
				if(this.gogoTime != circle.gogoTime){
					this.toggleGogoTime(circle)
				}
				circle.gogoChecked = true
			}
			if(circle.isAnimated()){
				var animT = circle.getAnimT()
				var animationDuration = 400
				if(ms <= animT + animationDuration){
					var curveDistance = this.HPBarX + this.HPBarW - this.slotX - this.HPBarColH / 2
					var animPoint = (ms - animT) / animationDuration
					var bezierPoint = this.calcBezierPoint(this.easeOut(animPoint), [{
						x: this.slotX + this.circleSize * 0.4,
						y: this.circleY - this.circleSize * 0.8
					}, {
						x: this.slotX + curveDistance * 0.15,
						y: this.barH * 0.5
					}, {
						x: this.slotX + curveDistance * 0.35,
						y: 0
					}, {
						x: this.slotX + curveDistance,
						y: this.HPbarColY + this.HPBarColH / 2
					}])
					this.drawCircle(circle, {x: bezierPoint.x, y: bezierPoint.y})
				}
				else{
					circle.endAnimation()
				}
			}
		}
	}
	calcBezierPoint(t, data){
		var at = 1 - t
		
		for(var i = 1; i < data.length; i++){
			for(var k = 0; k < data.length - i; k++){
				data[k] = {
					x: data[k].x * at + data[k + 1].x * t,
					y: data[k].y * at + data[k + 1].y * t
				}
			}
		}
		return data[0]
	}
	easeOut(pos){
		return Math.sin(Math.PI / 2 * pos)
	}
	drawCircle(circle, circlePos){
		var z = this.canvas.scale
		var fill, size, faceID
		var type = circle.getType()
		var ms = this.controller.getElapsedTime()
		var circleMs = circle.getMS()
		var endTime = circle.getEndTime()
		var animated = circle.isAnimated()
		var speed = circle.getSpeed()
		var played = circle.getPlayed()
		
		if(!circlePos){
			circlePos = {
				x: this.slotX + this.msToPos(circleMs - ms, speed),
				y: this.circleY
			}
		}
		if(animated){
			var currentDonFace = 0
			var currentBigDonFace = 1
		}else{
			var currentDonFace = this.currentDonFace
			var currentBigDonFace = this.currentBigDonFace
		}
		if(type === "don" || type === "daiDon" && played === 1){
			fill = "#f34728"
			size = this.circleSize
			faceID = "don-" + currentDonFace
		}else if(type === "ka" || type === "daiKa" && played === 1){
			fill = "#65bdbb"
			size = this.circleSize
			faceID = "don-" + currentDonFace
		}else if(type === "daiDon"){
			fill = "#f34728"
			size = this.bigCircleSize
			faceID = "big-don-" + currentBigDonFace
		}else if(type === "daiKa"){
			fill = "#65bdbb"
			size = this.bigCircleSize
			faceID = "big-don-" + currentBigDonFace
		}else if(type === "balloon"){
			if(animated){
				fill = "#f34728"
				size = this.bigCircleSize * 0.8
				faceID = "big-don-" + currentBigDonFace
			}else{
				fill = "#f87700"
				size = this.circleSize
				faceID = "don-" + currentDonFace
				var h = size * 1.8
				if(circleMs < ms && ms <= endTime){
					circlePos.x = this.slotX
				}else if(ms > endTime){
					circlePos.x = this.slotX + this.msToPos(endTime - ms, speed)
				}
				this.ctx.drawImage(assets.image["balloon"],
					circlePos.x + size - 3,
					circlePos.y - h / 2,
					h / 61 * 115,
					h
				)
			}
		}else if(type === "drumroll" || type === "daiDrumroll"){
			fill = "#f3b500"
			if(type == "drumroll"){
				size = this.circleSize
				faceID = "don-" + currentDonFace
			}else{
				size = this.bigCircleSize
				faceID = "big-don-" + currentBigDonFace
			}
			var endX = this.msToPos(endTime - circleMs, speed)
			this.ctx.fillStyle = fill
			this.ctx.strokeStyle = "#1f1a17"
			this.ctx.lineWidth = this.lyricsSize / 10
			this.ctx.beginPath()
			this.ctx.moveTo(circlePos.x, circlePos.y - size)
			this.ctx.lineTo(circlePos.x + endX, circlePos.y - size)
			this.ctx.arc(circlePos.x + endX, circlePos.y, size, -Math.PI / 2, Math.PI / 2)
			this.ctx.lineTo(circlePos.x, circlePos.y + size)
			this.ctx.fill()
			this.ctx.stroke()
		}
		// Main circle
		this.ctx.fillStyle = fill
		this.ctx.beginPath()
		this.ctx.arc(circlePos.x, circlePos.y, size, 0, Math.PI * 2)
		this.ctx.closePath()
		this.ctx.fill()
		// Face on circle
		this.ctx.drawImage(assets.image[faceID],
			circlePos.x - size - 2,
			circlePos.y - size - 4,
			size * 2 + 5,
			size * 2 + 6
		)
		if(!circle.isAnimated()){
			// Text
			this.ctx.font = "normal bold " + this.lyricsSize + "px Kozuka"
			this.ctx.textAlign = "center"
			this.ctx.strokeStyle = "#000"
			this.ctx.lineWidth = this.lyricsSize / 5
			this.ctx.fillStyle = "#fff"
			this.strokeFillText(circle.getText(),
				circlePos.x,
				this.barY + this.barH - this.lyricsBarH * 0.3
			)
		}
	}
	togglePauseMenu(){
		if(this.controller.game.isPaused()){
			this.pauseMenu.style.display = "block"
			this.lastMousemove = this.controller.getElapsedTime()
			this.cursorHidden = false
			this.mouseIdle()
		}else{
			this.pauseMenu.style.display = ""
		}
	}
	drawDifficulty(){
		this.ctx.drawImage(assets.image["muzu_" + this.songDifficulty],
			this.diffX, this.diffY,
			this.diffW, this.diffH
		)
		if(this.controller.autoPlayEnabled && !this.controller.multiplayer){
			this.ctx.drawImage(assets.image["badge_auto"],
				this.diffX + this.diffW * 0.71, this.diffY + this.diffH * 0.01,
				this.diffH * 0.3, this.diffH * 0.3
			)
		}
		this.ctx.drawImage(assets.image.taiko,
			this.taikoX, this.taikoY,
			this.taikoW, this.taikoH
		)
	}
	drawTime(){
		var z = this.canvas.scale
		var ms = this.controller.getElapsedTime()
		var sign = Math.sign(ms) < 0 ? "-" : ""
		ms = Math.abs(ms) + (sign === "-" ? 1000 : 0)
		var time = {
			sec: Math.floor(ms / 1000) % 60,
			min: Math.floor(ms / 1000 / 60) % 60,
			hour: Math.floor(ms / 1000 / 60 / 60) % 60
		}
		
		this.ctx.globalAlpha = 0.7
		this.ctx.fillStyle = "#000"
		this.ctx.fillRect(this.winW - 110 * z, this.winH - 60 * z, this.winW, this.winH)
		
		this.ctx.globalAlpha = 1
		this.ctx.fillStyle = "#fff"
		
		var formatedH = ("0" + time.hour).slice(-2)
		var formatedM = ("0" + time.min).slice(-2)
		var formatedS = ("0" + time.sec).slice(-2)
		
		this.ctx.font = "normal " + (this.barH / 12) + "px Kozuka"
		this.ctx.textAlign = "right"
		this.ctx.fillText(sign + formatedH + ":" + formatedM + ":" + formatedS,
			this.winW - 10 * z, this.winH - 30 * z
		)
		this.ctx.fillText(sign + Math.floor(ms), this.winW - 10 * z, this.winH - 10 * z)
	}
	drawBar(){
		this.ctx.strokeStyle = "#000"
		this.ctx.fillStyle = "#232323"
		this.ctx.lineWidth = 10
		this.ctx.beginPath()
		this.ctx.rect(0, this.barY, this.winW, this.barH)
		this.ctx.closePath()
		this.ctx.fill()
		
		var ms = this.controller.getElapsedTime()
		var keyTime = this.controller.getKeyTime()
		var sound = keyTime["don"] > keyTime["ka"] ? "don" : "ka"
		if(this.gogoTime || ms <= this.gogoTimeStarted + 100){
			var grd = this.ctx.createLinearGradient(0, this.barY, this.winW, this.barH)
			grd.addColorStop(0, "#512a2c")
			grd.addColorStop(0.46, "#6f2a2d")
			grd.addColorStop(0.76, "#8a4763")
			grd.addColorStop(1, "#2c2a2c")
			this.ctx.fillStyle = grd
			this.ctx.rect(0, this.barY, this.winW, this.barH)
			var alpha = Math.min(100, this.controller.getElapsedTime() - this.gogoTimeStarted) / 100
			if(!this.gogoTime){
				alpha = 1 - alpha
			}
			this.ctx.globalAlpha = alpha
			this.ctx.fill()
			this.ctx.globalAlpha = 1
		}
		if(keyTime[sound] > ms - 200){
			var gradients = {
				"don": ["#f54c25", "#232323"],
				"ka": ["#75cee9", "#232323"]
			}
			var grd = this.ctx.createLinearGradient(0, this.barY, this.winW, this.barH)
			grd.addColorStop(0, gradients[sound][0])
			grd.addColorStop(1, gradients[sound][1])
			this.ctx.fillStyle = grd
			this.ctx.rect(0, this.barY, this.winW, this.barH)
			this.ctx.globalAlpha = 1 - (ms - keyTime[sound]) / 200
			this.ctx.fill()
			this.ctx.globalAlpha = 1
		}
		this.ctx.stroke()
		// Lyrics bar
		this.ctx.fillStyle = "#888888"
		this.ctx.beginPath()
		this.ctx.rect(0, this.barY + this.barH - this.lyricsBarH, this.winW, this.lyricsBarH)
		this.ctx.closePath()
		this.ctx.fill()
		this.ctx.stroke()
	}
	drawSlot(){
		// Main circle
		this.ctx.fillStyle = "#6f6f6e"
		this.ctx.beginPath()
		this.ctx.arc(this.slotX, this.circleY, this.circleSize - 0.2 * this.circleSize, 0, 2 * Math.PI)
		this.ctx.closePath()
		this.ctx.fill()
		// Big stroke circle
		this.ctx.strokeStyle = "#9e9f9f"
		this.ctx.lineWidth = 3
		this.ctx.beginPath()
		this.ctx.arc(this.slotX, this.circleY, this.circleSize, 0, 2 * Math.PI)
		this.ctx.closePath()
		this.ctx.stroke()
		// Bigger stroke circle
		this.ctx.strokeStyle = "#6f6f6e"
		this.ctx.lineWidth = 3
		this.ctx.beginPath()
		this.ctx.arc(this.slotX, this.circleY, this.bigCircleSize, 0, 2 * Math.PI)
		this.ctx.closePath()
		this.ctx.stroke()
	}
	drawTaikoSquare(){
		// Taiko square
		this.ctx.lineWidth = 7
		this.ctx.fillStyle = "#ff3c00"
		this.ctx.strokeStyle = "#000"
		this.ctx.beginPath()
		this.ctx.rect(0,this.barY, this.taikoSquareW,this.barH)
		this.ctx.fill()
		this.ctx.closePath()
		this.ctx.stroke()
	}
	toggleGogoTime(circle){
		this.gogoTime = circle.gogoTime
		this.gogoTimeStarted = circle.ms
		
		if(this.gogoTime){
			this.assets.fireworks.forEach(fireworksAsset => {
				fireworksAsset.setAnimation("normal")
				fireworksAsset.setAnimationStart(circle.ms)
				var length = fireworksAsset.getAnimationLength("normal")
				fireworksAsset.setAnimationEnd(length, () => {
					fireworksAsset.setAnimation(false)
				})
			})
			this.assets.fire.setAnimation("normal")
			var don = this.assets.don
			don.setAnimation("gogostart")
			var length = don.getAnimationLength("gogo")
			don.setUpdateSpeed(4 / length)
			var start = circle.ms - (circle.ms % this.beatInterval)
			don.setAnimationStart(start)
			var length = don.getAnimationLength("gogostart")
			don.setAnimationEnd(length, don.normalAnimation)
		}
	}
	drawGogoTime(){
		var ms = this.controller.getElapsedTime()
		
		if(this.gogoTime){
			var circles = this.controller.parsedSongData.circles
			var lastCircle = circles[circles.length - 1]
			var endTime = lastCircle.getEndTime() + 3000
			if(ms >= endTime){
				this.toggleGogoTime({
					gogoTime: 0,
					ms: endTime
				})
			}
		}else{
			var animation = this.assets.don.getAnimation()
			if(animation === "gogo" || this.controller.getGlobalScore().gauge >= 50 && animation === "normal"){
				this.assets.don.normalAnimation()
			}
			if(ms >= this.gogoTimeStarted + 100){
				this.assets.fire.setAnimation(false)
			}
		}
	}
	updateCombo(combo){
		var don = this.assets.don
		var animation = don.getAnimation()
		if(
			combo > 0
			&& combo % 10 === 0
			&& animation !== "10combo"
			&& animation !== "gogostart"
			&& animation !== "gogo"
		){
			don.setAnimation("10combo")
			var ms = this.controller.getElapsedTime()
			don.setAnimationStart(ms)
			var length = don.getAnimationLength("normal")
			don.setUpdateSpeed(4 / length)
			var length = don.getAnimationLength("10combo")
			don.setAnimationEnd(length, don.normalAnimation)
		}
	}
	drawTouch(){
		if(this.touchEnabled){
			var ms = this.controller.getElapsedTime()
			
			var drumWidth = this.touchDrum.w / this.canvas.scale
			var drumHeight = this.touchDrum.h / this.canvas.scale
			if(drumHeight !== this.touchDrumHeight || drumWidth !== this.touchDrumWidth){
				this.touchDrumWidth = drumWidth
				this.touchDrumHeight = drumHeight
				this.touchDrumDiv.style.width = drumWidth + "px"
				this.touchDrumDiv.style.height = drumHeight + "px"
			}
			if(this.touch > ms - 100){
				if(!this.drumPadding){
					this.drumPadding = true
					this.touchDrumImg.style.paddingTop = "1%"
				}
			}else if(this.drumPadding){
				this.drumPadding = false
				this.touchDrumImg.style.paddingTop = ""
			}
		}
	}
	ontouch(event){
		for(let touch of event.changedTouches){
			event.preventDefault()
			var scale = this.canvas.scale
			var pageX = touch.pageX * scale
			var pageY = touch.pageY * scale
			
			var c = this.touchCircle
			var pi = Math.PI
			var inPath = () => this.ctx.isPointInPath(pageX, pageY)
			
			this.ctx.beginPath()
			this.ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, pi, 0)
			
			if(inPath()){
				if(pageX < this.winW / 2){
					this.touchNote("don_l")
				}else{
					this.touchNote("don_r")
				}
			}else{
				if(pageX < this.winW / 2){
					this.touchNote("ka_l")
				}else{
					this.touchNote("ka_r")
				}
			}
		}
	}
	touchNote(note){
		var keyboard = this.controller.keyboard
		var kbd = keyboard.getBindings()
		var ms = this.controller.game.getAccurateTime()
		this.touch = ms
		keyboard.setKey(kbd[note], false)
		keyboard.setKey(kbd[note], true, ms)
	}
	onmousemove(event){
		this.lastMousemove = this.controller.getElapsedTime()
		this.cursorHidden = false
	}
	mouseIdle(){
		var lastMouse = pageEvents.getMouse()
		if(lastMouse && !this.cursorHidden){
			if(this.controller.getElapsedTime() >= this.lastMousemove + 2000){
				this.cursor.style.top = lastMouse.clientY + "px"
				this.cursor.style.left = lastMouse.clientX + "px"
				this.cursor.style.pointerEvents = "auto"
				this.cursorHidden = true
			}else{
				this.cursor.style.top = ""
				this.cursor.style.left = ""
				this.cursor.style.pointerEvents = ""
			}
		}
	}
	changeBeatInterval(beatMS){
		this.beatInterval = beatMS
		this.assets.changeBeatInterval(beatMS)
	}
	clean(){
		pageEvents.mouseRemove(this)
		if(this.controller.multiplayer === 2){
			if(this.canvas){
				this.canvas.canvas.parentNode.removeChild(this.canvas.canvas)
			}
		}else{
			this.cursor.parentNode.removeChild(this.cursor)
		}
		if(this.touchEnabled){
			pageEvents.remove(this.canvas.canvas, "touchstart")
			pageEvents.remove(this.touchFullBtn, "touchend")
			pageEvents.remove(this.touchPauseBtn, "touchend")
			this.gameDiv.classList.remove("touch-visible")
			document.getElementById("version").classList.remove("version-hide")
			delete this.touchDrumDiv
			delete this.touchDrumImg
			delete this.touchFullBtn
			delete this.touchPauseBtn
		}
		delete this.pauseMenu
		delete this.cursor
		delete this.gameDiv
		delete this.canvas
		delete this.ctx
	}
}
