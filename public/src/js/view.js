class View{
	constructor(controller, bg, title, diff){
		this.controller = controller
		this.bg = bg
		this.diff = diff
		
		if(this.controller.multiplayer == 2){
			this.canvas = new ScalableCanvas("canvas-p2", $(window).width(), $(window).height() / 3 * 2)
			this.canvas.canvas.style.position = "absolute"
			this.canvas.canvas.style.top = "33%"
			document.getElementById("game").appendChild(this.canvas.canvas)
		}else{
			this.canvas = new ScalableCanvas("canvas", $(window).width(), $(window).height())
		}
		this.winW = this.canvas.scaledWidth
		this.winH = this.canvas.scaledHeight
		this.ctx = this.canvas.ctx
		
		this.taikoSquareW = this.winW / 4
		this.slotX = this.taikoSquareW + 100
		
		this.currentScore = 0
		this.special = ""
		this.scoreDispCount = -1
		this.scoreOpacity = 1.0
		
		this.lastMeasure = 0
		this.currentTimingPoint = 0
		//Distance to be done by the circle
		this.distanceForCircle = this.winW - this.slotX
		
		this.currentCircleFace = 0
		this.currentDonFace = 0
		this.currentBigDonFace = 1
		this.nextBeat = 0
		
		this.songTitle = title
		this.songDifficulty = this.diff.split(".").slice(0, -1).join(".")
	}
	
	run(){
		this.ctx.font = "normal 14pt TnT"
		this.setBackground()
		
		$(".game-song").attr("alt", this.songTitle).html(this.songTitle)
		
		this.refresh()
	}
	
	setBackground(){
		$("#game").css("background-image", "url('" + this.bg + "')")
	}
	
	getDistanceForCircle(){
		return this.distanceForCircle
	}
	
	positionning(){
		this.canvas.rescale()
		var height = $(window).height()
		if(this.controller.multiplayer == 2){
			height = height / 3 * 2
		}
		this.canvas.resize($(window).width(), height)
		this.winW = this.canvas.scaledWidth
		this.winH = this.canvas.scaledHeight
		if(this.controller.multiplayer == 2){
			this.winH = this.winH / 2 * 3
		}
		
		this.barY = 0.25 * this.winH
		this.barH = 0.23 * this.winH
		this.lyricsBarH = 0.2 * this.barH
		this.taikoH = this.barH
		this.taikoW = this.taikoH / 1.2
		this.taikoX = this.taikoSquareW * 0.76 - this.taikoW / 2
		this.taikoY = this.barY + 5
		this.taikoSquareW = this.winW / 4
		this.slotX = this.taikoSquareW + this.barH * 0.45
		this.scoreSquareW = this.taikoSquareW * 0.55
		this.scoreSquareH = this.barH * 0.25
		this.circleSize = this.barH * 0.15
		this.bigCircleSize = this.barH * 0.25
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
	}
	
	refresh(){
		this.positionning()
		this.distanceForCircle = this.winW - this.slotX
		
		this.ctx.clearRect(0, 0, this.canvas.scaledWidth, this.canvas.scaledHeight)
		
		// Draw
		this.drawBar()
		this.drawSlot()
		this.drawMeasures()
		this.drawHPBar()
		this.drawScore()
		this.drawCircles()
		this.drawTaikoSquare()
		this.drawDifficulty()
		this.drawPressedKeys()
		this.drawCombo()
		this.drawGlobalScore()
		this.updateDonFaces()
		//this.drawTime()
	}
	
	updateDonFaces(){
		if(this.controller.getElapsedTime().ms >= this.nextBeat){
			this.nextBeat += this.controller.getSongData().beatInfo.beatInterval
			if(this.controller.getCombo() >= 50){
				this.currentBigDonFace = (this.currentBigDonFace + 1) % 2
				this.currentDonFace = (this.currentDonFace + 1) % 2
			}
			else{
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
		var hp = this.controller.getGlobalScore().hp
		var width = Math.floor(hp * 650 / 1000) * 10
		return {
			imgW: width,
			canvasW: width / 650 * this.HPBarColMaxW
		}
	}
	
	drawMeasures(){
		var measures = this.controller.getSongData().measures
		var currentTime = this.controller.getElapsedTime().ms
		
		measures.forEach((measure, index)=>{
			var timeForDistance = 70 / this.circleSize * this.distanceForCircle / measure.speed
			if(
				currentTime >= measure.ms - timeForDistance
				&& currentTime <= measure.ms + 350
				&& measure.nb == 0
			){
				this.drawMeasure(measure)
			}
		})
	}
	
	drawMeasure(measure){
		var z = this.canvas.scale
		var currentTime = this.controller.getElapsedTime().ms
		var measureX = this.slotX + measure.speed / (70 / this.circleSize) * (measure.ms - currentTime)
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
			this.ctx.font = "normal " + fontSize + "px TnT"
			this.ctx.textAlign = "center"
			this.ctx.strokeStyle = "#000"
			this.ctx.lineWidth = fontSize / 10
			var glyph = this.ctx.measureText("0").width
			var comboText = this.controller.getCombo().toString().split("")
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
			this.ctx.font = "normal " + fontSize + "px TnT"
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
		/* Draw score square */
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
		this.ctx.font = "normal " + fontSize + "px TnT"
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
		var keys = this.controller.getKeys()
		var kbd = this.controller.getBindings()
		
		if(keys[kbd["ka_l"]]){
			var elemW = 0.45 * this.taikoW
			this.ctx.drawImage(assets.image["taiko-key-blue"],
				0, 0, 68, 124,
				this.taikoX + this.taikoW * 0.05,
				this.taikoY + this.taikoH * 0.03,
				elemW,
				124 / 68 * elemW
			)
		}
		
		if(keys[kbd["don_l"]]){
			var elemW = 0.35 * this.taikoW
			this.ctx.drawImage(assets.image["taiko-key-red"],
				0, 0, 53, 100,
				this.taikoX + this.taikoW * 0.15,
				this.taikoY + this.taikoH * 0.09,
				elemW,
				100 / 53 * elemW
			)
		}
		
		if(keys[kbd["don_r"]]){
			var elemW = 0.35 * this.taikoW
			this.ctx.drawImage(assets.image["taiko-key-red"],
				53, 0, 53, 100,
				this.taikoX + this.taikoW * 0.15 + elemW,
				this.taikoY + this.taikoH * 0.09,
				elemW,
				100 / 53 * elemW
			)
		}
		
		if(keys[kbd["ka_r"]]){
			var elemW = 0.45 * this.taikoW
			this.ctx.drawImage(assets.image["taiko-key-blue"],
				68, 0, 68, 124,
				this.taikoX + this.taikoW * 0.05 + elemW,
				this.taikoY + this.taikoH * 0.03,
				elemW,
				124 / 68 * elemW
			)
		}
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
		}
		else if(this.scoreDispCount == 21){
			this.scoreDispCount = -1
		}
		this.ctx.globalAlpha = 1
	}
	
	drawCircles(){
		var circles = this.controller.getCircles()
		for(var i = circles.length; i--;){
			var circle = circles[i]
			
			var currentTime = this.controller.getElapsedTime().ms
			var timeForDistance = 70 / this.circleSize * this.distanceForCircle / circle.getSpeed() + this.bigCircleSize / 2
			var startingTime = circle.getMS() - timeForDistance
			// At circle.getMS(), the cirlce fits the slot
			var finishTime = circle.getMS() + 100
			
			if(!circle.getPlayed() && currentTime >= startingTime && currentTime <= finishTime){
				this.drawCircle(circle)
			}
			else{
				// Animate circle to the HP bar
				
				// Animation in ms
				var animationDuration = 470
				
				if(!circle.isAnimated()){
					if(circle.getScore() != 0){
						// Start animation to HP bar
						circle.animate()
					}
				}
				if(circle.isAnimated()){
					if(currentTime <= finishTime + animationDuration){
						var curveDistance = this.HPBarX + this.HPBarW - this.slotX
						var bezierPoint = this.calcBezierPoint(circle.getAnimT(), [{
							x: this.slotX,
							y: this.circleY
						}, {
							x: this.slotX + curveDistance * 0.15,
							y: this.barH * 0.5
						}, {
							x: this.slotX + curveDistance * 0.35,
							y: 0
						}, {
							x: this.slotX + curveDistance,
							y: this.HPbarColY
						}])
						this.drawCircle(circle, {x: bezierPoint.x, y: bezierPoint.y})
						
						// Update animation frame
						circle.incAnimT()
						circle.incFrame()
					}
					else{
						circle.endAnimation()
					}
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
	
	drawCircle(circle, circlePos){
		var z = this.canvas.scale
		
		var fill, size, faceID
		if(!circlePos){
			var currentTime = this.controller.getElapsedTime().ms
			circlePos = {
				x: this.slotX + circle.getSpeed() / (70 / this.circleSize) * (circle.getMS() - currentTime),
				y: this.circleY
			}
		}
		
		if(circle.getPlayed()){
			var currentDonFace = 1
			var currentBigDonFace = 1
		}else{
			var currentDonFace = this.currentDonFace
			var currentBigDonFace = this.currentBigDonFace
		}
		
		switch(circle.getType()){
			case "don":
				fill = "#f54c25"
				size = this.circleSize
				faceID = "don-" + currentDonFace
				break
			case "ka":
				fill = "#75cee9"
				size = this.circleSize
				faceID = "don-" + currentDonFace
				break
			case "daiDon":
				fill = "#f54c25"
				size = this.bigCircleSize
				faceID = "big-don-" + currentBigDonFace
				break
			case "daiKa":
				fill = "#75cee9"
				size = this.bigCircleSize
				faceID = "big-don-" + currentBigDonFace
				break
		}
		
		// Main circle
		this.ctx.fillStyle = fill
		this.ctx.beginPath()
		this.ctx.arc(circlePos.x, circlePos.y, size, 0, Math.PI * 2)
		this.ctx.closePath()
		this.ctx.fill()
		
		// Face on circle
		var face = assets.image[faceID]
		this.ctx.drawImage(face,
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
		if($("#pause-menu").is(":visible")){
			$("#pause-menu").hide()
		}else{
			$("#pause-menu").show()
		}
	}
	
	drawDifficulty(){
		this.ctx.drawImage(assets.image["muzu_" + this.songDifficulty],
			this.diffX, this.diffY,
			this.diffW, this.diffH
		)
		
		this.ctx.drawImage(assets.image.taiko,
			this.taikoX, this.taikoY,
			this.taikoW, this.taikoH
		)
	}
	
	drawTime(){
		var z = this.canvas.scale
		var time = this.controller.getElapsedTime()
		
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
		this.ctx.fillText(formatedH + ":" + formatedM + ":" + formatedS,
			this.winW - 10 * z, this.winH - 30 * z
		)
		this.ctx.fillText(time.ms, this.winW - 10 * z, this.winH - 10 * z)
	}
	
	drawBar(){
		this.ctx.strokeStyle = "#000"
		this.ctx.fillStyle = "#232323"
		this.ctx.lineWidth = 10
		this.ctx.beginPath()
		this.ctx.rect(0, this.barY, this.winW, this.barH)
		this.ctx.closePath()
		this.ctx.fill()
		
		var currentTime = this.controller.getElapsedTime().ms
		var keyTime = this.controller.getKeyTime()
		var sound = keyTime["don"] > keyTime["ka"] ? "don" : "ka"
		if(keyTime[sound] > currentTime - 200){
			var gradients = {
				"don": ["#f54c25", "#232323"],
				"ka": ["#75cee9", "#232323"]
			}
			var grd = this.ctx.createLinearGradient(0, this.barY, this.winW, this.barH)
			grd.addColorStop(0, gradients[sound][0])
			grd.addColorStop(1, gradients[sound][1])
			this.ctx.fillStyle = grd
			this.ctx.rect(0, this.barY, this.winW, this.barH)
			this.ctx.globalAlpha = 1 - (currentTime - keyTime[sound]) / 200
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
}
