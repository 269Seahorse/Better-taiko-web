class Scoresheet{
	constructor(controller, results, multiplayer){
		this.controller = controller
		this.results = {}
		for(var i in results){
			this.results[i] = results[i].toString()
		}
		this.multiplayer = multiplayer
		
		this.canvas = document.getElementById("canvas")
		this.ctx = this.canvas.getContext("2d")
		
		this.font = "TnT, Meiryo, sans-serif"
		this.state = {
			screen: "fadeIn",
			screenMS: this.getMS(),
			startDelay: 3300,
			hasPointer: 0
		}
		this.frame = 1000 / 60
		this.numbers = "001122334455667788900112233445".split("")
		
		this.draw = new CanvasDraw()
		this.canvasCache = new CanvasCache()
		
		this.gamepad = new Gamepad({
			"13": ["a", "b", "start", "ls", "rs"]
		})
		
		this.redrawRunning = true
		this.redrawBind = this.redraw.bind(this)
		this.redraw()
		
		assets.sounds["results"].play()
		assets.sounds["bgm_result"].playLoop(3, false, 0, 0.847, 17.689)
	}
	keyDown(event, code){
		if(!code){
			if(event.repeat){
				return
			}
			code = event.keyCode
		}
		var key = {
			confirm: code == 13 || code == 32 || code == 70 || code == 74,
			// Enter, Space, F, J
			cancel: code == 27 || code == 8
			// Esc, Backspace
		}
		if(key.cancel && event){
			event.preventDefault()
		}
		if(key.confirm || key.cancel){
			this.toNext()
		}
	}
	mouseDown(event){
		if(event.type === "touchstart"){
			event.preventDefault()
			this.canvas.style.cursor = ""
			this.state.pointerLocked = true
		}else{
			this.state.pointerLocked = false
			if(event.which !== 1){
				return
			}
		}
		this.toNext()
	}
	toNext(){
		var ms = this.getMS()
		var elapsed = ms - this.state.screenMS
		if(this.state.screen === "fadeIn" && elapsed >= this.state.startDelay){
			this.state.screen = "scoresShown"
			this.state.screenMS = ms
			assets.sounds["note_don"].play()
		}else if(this.state.screen === "scoresShown" && elapsed >= 1000){
			snd.musicGain.fadeOut(0.5)
			this.state.screen = "fadeOut"
			this.state.screenMS = ms
			assets.sounds["note_don"].play()
		}
	}
	
	startRedraw(){
		this.redrawing = true
		requestAnimationFrame(this.redrawBind)
		this.winW = null
		this.winH = null
		
		pageEvents.keyAdd(this, "all", "down", this.keyDown.bind(this))
		pageEvents.add(this.canvas, ["mousedown", "touchstart"], this.mouseDown.bind(this))
	}
	
	redraw(){
		if(!this.redrawRunning){
			return
		}
		if(this.redrawing){
			requestAnimationFrame(this.redrawBind)
		}
		var ms = this.getMS()
		
		this.gamepad.play((pressed, keyCode) => {
			if(pressed){
				this.keyDown(false, keyCode)
			}
		})
		
		if(!this.redrawRunning){
			return
		}
		
		var ctx = this.ctx
		ctx.save()
		
		var winW = innerWidth
		var winH = lastHeight
		this.pixelRatio = window.devicePixelRatio || 1
		winW *= this.pixelRatio
		winH *= this.pixelRatio
		var ratioX = winW / 1280
		var ratioY = winH / 720
		var ratio = (ratioX < ratioY ? ratioX : ratioY)
		
		if(this.redrawing){
			if(this.winW !== winW || this.winH !== winH){
				this.canvas.width = winW
				this.canvas.height = winH
				ctx.scale(ratio, ratio)
				this.canvas.style.width = (winW / this.pixelRatio) + "px"
				this.canvas.style.height = (winH / this.pixelRatio) + "px"
				
				this.canvasCache.resize(winW / ratio, 80 + 1, ratio)
			}else if(!document.hasFocus() && this.state.screen === "scoresShown"){
				return
			}else{
				ctx.clearRect(0, 0, winW / ratio, winH / ratio)
			}
		}else{
			ctx.scale(ratio, ratio)
		}
		this.winW = winW
		this.winH = winH
		this.ratio = ratio
		winW /= ratio
		winH /= ratio
		
		var frameTop = winH / 2 - 720 / 2
		var frameLeft = winW / 2 - 1280 / 2
		
		var players = this.multiplayer && p2.results ? 2 : 1
		var p2Offset = 298
		
		var bgOffset = 0
		var elapsed = ms - this.state.screenMS
		if(this.state.screen === "fadeIn" && elapsed < 1000){
			bgOffset = Math.min(1, this.draw.easeIn(1 - elapsed / 1000)) * (winH / 2)
		}
		
		if(bgOffset){
			ctx.save()
			ctx.translate(0, -bgOffset)
		}
		this.draw.pattern({
			ctx: ctx,
			img: assets.image["bg_score_p1"],
			x: 0,
			y: 0,
			w: winW,
			h: winH / 2,
			dx: frameLeft - 35,
			dy: frameTop + 17
		})
		ctx.fillStyle = "rgba(127, 28, 12, 0.5)"
		ctx.fillRect(0, winH / 2 - 12, winW, 12)
		ctx.fillStyle = "rgba(0, 0, 0, 0.25)"
		ctx.fillRect(0, winH / 2, winW, 20)
		if(bgOffset !== 0){
			ctx.fillStyle = "#000"
			ctx.fillRect(0, winH / 2 - 2, winW, 2)
		}
		ctx.fillStyle = "#fa4529"
		ctx.fillRect(0, 0, winW, frameTop + 64)
		ctx.fillStyle = "#bf2900"
		ctx.fillRect(0, frameTop + 64, winW, 8)
		
		if(bgOffset){
			ctx.restore()
			ctx.save()
			ctx.translate(0, bgOffset)
		}
		
		this.draw.pattern({
			ctx: ctx,
			img: assets.image[this.multiplayer ? "bg_score_p2" : "bg_score_p1"],
			x: 0,
			y: winH / 2,
			w: winW,
			h: winH / 2,
			dx: frameLeft - 35,
			dy: frameTop - 17
		})
		ctx.fillStyle = this.multiplayer ? "rgba(138, 245, 247, 0.5)" : "rgba(249, 163, 149, 0.5)"
		ctx.fillRect(0, winH / 2, winW, 12)
		ctx.fillStyle = "#000"
		if(bgOffset === 0){
			ctx.fillRect(0, winH / 2 - 2, winW, 4)
		}else{
			ctx.fillRect(0, winH / 2, winW, 2)
		}
		ctx.fillStyle = this.multiplayer ? "#6bbec0" : "#fa4529"
		ctx.fillRect(0, winH - frameTop - 64, winW, frameTop + 64)
		ctx.fillStyle = this.multiplayer ? "rgba(160, 228, 229, 0.8)" : "rgba(255, 144, 116, 0.8)"
		ctx.fillRect(0, winH - frameTop - 72, winW, 7)
		ctx.fillStyle = this.multiplayer ? "#a8e0e0" : "#ff9b7a"
		ctx.fillRect(0, winH - frameTop - 66, winW, 2)
		
		if(bgOffset){
			ctx.restore()
		}
		
		if(this.state.screen === "scoresShown" || this.state.screen === "fadeOut"){
			var elapsed = Infinity
		}else{
			var elapsed = ms - this.state.screenMS - this.state.startDelay
		}
		
		if(elapsed >= 0){
			if(this.state.hasPointer === 0){
				this.state.hasPointer = 1
				if(!this.state.pointerLocked){
					this.canvas.style.cursor = "pointer"
				}
			}
			ctx.save()
			ctx.setTransform(1, 0, 0, 1, 0, 0)
			this.draw.alpha(Math.min(1, elapsed / 400), ctx, ctx => {
				ctx.scale(ratio, ratio)
				ctx.translate(frameLeft, frameTop)
				
				this.canvasCache.get({
					ctx: ctx,
					x: 0,
					y: 0,
					w: winW,
					h: 80,
					id: "results"
				}, ctx => {
					this.draw.layeredText({
						ctx: ctx,
						text: "成績発表",
						fontSize: 48,
						fontFamily: this.font,
						x: 23,
						y: 15,
						letterSpacing: 3,
						forceShadow: true
					}, [
						{x: -2, y: -2, outline: "#000", letterBorder: 22},
						{},
						{x: 2, y: 2, shadow: [2, 2, 7]},
						{x: 2, y: 2, outline: "#ad1516", letterBorder: 10},
						{x: -2, y: -2, outline: "#ff797b"},
						{outline: "#f70808"},
						{fill: "#fff", shadow: [-1, 1, 3, 1.5]}
					])
					
					this.draw.layeredText({
						ctx: ctx,
						text: this.results.title,
						fontSize: 40,
						fontFamily: this.font,
						x: 1257,
						y: 20,
						align: "right",
						forceShadow: true
					}, [
						{outline: "#000", letterBorder: 10, shadow: [1, 1, 3]},
						{fill: "#fff"}
					])
				})
				
				ctx.save()
				for(var p = 0; p < players; p++){
					var results = this.results
					if(p === 1){
						results = p2.results
						ctx.translate(0, p2Offset)
					}
					
					var imgScale = 1.35
					ctx.drawImage(assets.image["muzu_" + results.difficulty],
						276, 150, imgScale * 176, imgScale * 120
					)
					
					if(this.controller.autoPlayEnabled){
						ctx.drawImage(assets.image["badge_auto"],
							431, 311, 34, 34
						)
					}
					
					this.draw.roundedRect({
						ctx: ctx,
						x: 532,
						y: 98,
						w: 728,
						h: 232,
						radius: 30,
					})
					ctx.fillStyle = p === 1 ? "rgba(195, 228, 229, 0.8)" : "rgba(255, 224, 216, 0.8)"
					ctx.fill()
					this.draw.roundedRect({
						ctx: ctx,
						x: 556,
						y: 237,
						w: 254,
						h: 70,
						radius: 15,
					})
					ctx.fillStyle = "#000"
					ctx.fill()
					this.draw.roundedRect({
						ctx: ctx,
						x: 559,
						y: 240,
						w: 248,
						h: 64,
						radius: 14,
					})
					ctx.fillStyle = "#eec954"
					ctx.fill()
					this.draw.roundedRect({
						ctx: ctx,
						x: 567,
						y: 248,
						w: 232,
						h: 48,
						radius: 6,
					})
					ctx.fillStyle = "#000"
					ctx.fill()
					ctx.font = "36px " + this.font
					ctx.textAlign = "right"
					ctx.fillStyle = "#fff"
					ctx.strokeStyle = "#000"
					ctx.lineWidth = 0.5
					ctx.fillText("点", 788, 284)
					ctx.strokeText("点", 788, 284)
					
					this.draw.score({
						ctx: ctx,
						score: "good",
						x: 823,
						y: 192
					})
					this.draw.score({
						ctx: ctx,
						score: "ok",
						x: 823,
						y: 233
					})
					this.draw.score({
						ctx: ctx,
						score: "bad",
						x: 823,
						y: 273
					})
					
					ctx.textAlign = "right"
					var grd = ctx.createLinearGradient(0, 0, 0, 30)
					grd.addColorStop(0.2, "#ff4900")
					grd.addColorStop(0.9, "#f7fb00")
					this.draw.layeredText({
						ctx: ctx,
						text: "最大コンボ数",
						x: 1149,
						y: 193,
						fontSize: 29,
						fontFamily: this.font,
						align: "right",
						width: 215,
						letterSpacing: 1
					}, [
						{outline: "#000", letterBorder: 8},
						{fill: grd}
					])
					this.draw.layeredText({
						ctx: ctx,
						text: "連打数",
						x: 1150,
						y: 233,
						fontSize: 29,
						fontFamily: this.font,
						letterSpacing: 4,
						align: "right"
					}, [
						{outline: "#000", letterBorder: 8},
						{fill: "#ffc700"}
					])
				}
				ctx.restore()
			})
			ctx.restore()
		}
		
		if(elapsed >= 800){
			ctx.save()
			ctx.translate(frameLeft, frameTop)
			
			ctx.globalAlpha = Math.min(1, (elapsed - 800) / 500)
			
			for(var p = 0; p < players; p++){
				var results = this.results
				if(p === 1){
					results = p2.results
					ctx.translate(0, p2Offset)
				}
				var gaugePercent = Math.round(results.gauge / 2) / 50
				var w = 712
				this.draw.gauge({
					ctx: ctx,
					x: 558 + w,
					y: 116,
					clear: 25 / 50,
					percentage: gaugePercent,
					font: this.font,
					scale: w / 788,
					scoresheet: true
				})
				this.draw.soul({
					ctx: ctx,
					x: 1215,
					y: 144,
					scale: 36 / 42,
					cleared: gaugePercent - 1 / 50 >= 25 / 50
				})
			}
			ctx.restore()
		}
		
		if(elapsed >= 1200){
			ctx.save()
			ctx.setTransform(1, 0, 0, 1, 0, 0)
			var noCrownResultWait = -2000;

			for(var p = 0; p < players; p++){
				var results = this.results
				if(p === 1){
					results = p2.results
				}
				var crownType = null
				if(Math.round(results.gauge / 2) - 1 >= 25){
					crownType = results.bad === "0" ? "gold" : "silver"
				}
				if(crownType !== null){
					noCrownResultWait = 0;
					var amount = Math.min(1, (elapsed - 1200) / 450)
					this.draw.alpha(this.draw.easeIn(amount), ctx, ctx => {
						ctx.save()
						ctx.scale(ratio, ratio)
						ctx.translate(frameLeft, frameTop)
						if(p === 1){
							ctx.translate(0, p2Offset)
						}
						
						var crownScale = 1
						var shine = 0
						if(amount < 1){
							crownScale = 2.8 * (1 - amount) + 0.9
						}else if(elapsed < 1850){
							crownScale = 0.9 + (elapsed - 1650) / 2000
						}else if(elapsed < 2200){
							shine = (elapsed - 1850) / 175
							if(shine > 1){
								shine = 2 - shine
							}
						}
						if(this.state.screen === "fadeIn" && elapsed >= 1200 && !this.state["fullcomboPlayed" + p]){
							this.state["fullcomboPlayed" + p] = true
							if(crownType === "gold"){
								this.playSound("results_fullcombo" + (p === 1 ? "2" : ""), p)
							}
						}
						if(this.state.screen === "fadeIn" && elapsed >= 1650 && !this.state["crownPlayed" + p]){
							this.state["crownPlayed" + p] = true
							this.playSound("results_crown", p)
						}
						this.draw.crown({
							ctx: ctx,
							type: crownType,
							x: 395,
							y: 218,
							scale: crownScale,
							shine: shine,
							ratio: ratio
						})
						
						ctx.restore()
					})
				}
			}
			ctx.restore()
		}
		
		if(elapsed >= 2400 + noCrownResultWait){
			ctx.save()
			ctx.translate(frameLeft, frameTop)
			
			var printNumbers = ["good", "ok", "bad", "maxCombo", "drumroll"]
			if(!this.state["countupTime0"]){
				var times = {}
				var lastTime = 0
				for(var p = 0; p < players; p++){
					var results = p === 0 ? this.results : p2.results
					var currentTime = 3100 + noCrownResultWait + results.points.length * 30 * this.frame
					if(currentTime > lastTime){
						lastTime = currentTime
					}
				}
				for(var i in printNumbers){
					var largestTime = 0
					for(var p = 0; p < players; p++){
						var results = p === 0 ? this.results : p2.results
						times[printNumbers[i]] = lastTime + 500
						var currentTime = lastTime + 500 + results[printNumbers[i]].length * 30 * this.frame
						if(currentTime > largestTime){
							largestTime = currentTime
						}
					}
					lastTime = largestTime
				}
				this.state.fadeInEnd = lastTime
				for(var p = 0; p < players; p++){
					this.state["countupTime" + p] = times
				}
			}
			
			for(var p = 0; p < players; p++){
				var results = this.results
				if(p === 1){
					results = p2.results
					ctx.translate(0, p2Offset)
				}
				ctx.save()
				
				this.state.countupShown = false
				
				var points = this.getNumber(results.points, 3100 + noCrownResultWait, elapsed)
				var scale = 1.3
				ctx.font = "35px " + this.font
				ctx.translate(760, 286)
				ctx.scale(1 / scale, 1 * 1.1)
				ctx.textAlign = "center"
				ctx.fillStyle = "#fff"
				ctx.strokeStyle = "#fff"
				ctx.lineWidth = 0.5
				for(var i = 0; i < points.length; i++){
					ctx.translate(-23.3 * scale, 0)
					ctx.fillText(points[points.length - i - 1], 0, 0)
					ctx.strokeText(points[points.length - i - 1], 0, 0)
				}
				ctx.restore()
				
				if(!this.state["countupTime" + p]){
					var times = {}
					var lastTime = 3100 + noCrownResultWait + results.points.length * 30 * this.frame + 1000
					for(var i in printNumbers){
						times[printNumbers[i]] = lastTime + 500
						lastTime = lastTime + 500 + results[printNumbers[i]].length * 30 * this.frame
					}
					this.state["countupTime" + p] = times
				}
				
				for(var i in printNumbers){
					var start = this.state["countupTime" + p][printNumbers[i]]
					this.draw.layeredText({
						ctx: ctx,
						text: this.getNumber(results[printNumbers[i]], start, elapsed),
						x: 971 + 270 * Math.floor(i / 3),
						y: 196 + (40 * (i % 3)),
						fontSize: 26,
						fontFamily: this.font,
						letterSpacing: 1,
						align: "right"
					}, [
						{outline: "#000", letterBorder: 9},
						{fill: "#fff"}
					])
				}
				
				if(this.state.countupShown){
					if(!this.state["countup" + p]){
						this.state["countup" + p] = true
						this.loopSound("results_countup", p, [0.1, false, 0, 0, 0.07])
					}
				}else if(this.state["countup" + p]){
					this.state["countup" + p] = false
					this.stopSound("results_countup", p)
					if(this.state.screen === "fadeIn"){
						this.playSound("note_don", p)
					}
				}
				
				if(this.state.screen === "fadeIn" && elapsed >= this.state.fadeInEnd){
					this.state.screen = "scoresShown"
					this.state.screenMS = this.getMS()
				}
			}
			ctx.restore()
		}
		
		if(this.state.screen === "fadeOut"){
			ctx.save()
			if(this.state.hasPointer === 1){
				this.state.hasPointer = 2
				this.canvas.style.cursor = ""
			}
			
			var elapsed = ms - this.state.screenMS
			ctx.globalAlpha = Math.max(0, Math.min(1, elapsed / 1000))
			ctx.fillStyle = "#000"
			ctx.fillRect(0, 0, winW, winH)
			
			ctx.restore()
			
			if(elapsed >= 1000){
				this.clean()
				this.controller.songSelection(true, false, this.state.pointerLocked)
			}
		}
		
		ctx.restore()
	}
	
	getNumber(score, start, elapsed){
		var numberPos = Math.floor((elapsed - start) / this.frame)
		if(numberPos < 0){
			return ""
		}
		var output = ""
		for(var i = 0; i < score.length; i++){
			if(numberPos < 30 * (i + 1)){
				this.state.countupShown = true
				return this.numbers[numberPos % 30] + output
			}else{
				output = score[score.length - i - 1] + output
			}
		}
		return output
	}
	
	getSound(id, p){
		return assets.sounds[id + (this.multiplayer ? "_p" + (p + 1) : "")]
	}
	playSound(id, p){
		this.getSound(id, p).play()
	}
	loopSound(id, p, args){
		this.getSound(id, p).playLoop(...args)
	}
	stopSound(id, p){
		this.getSound(id, p).stop()
	}
	
	mod(length, index){
		return ((index % length) + length) % length
	}
	
	getMS(){
		return +new Date
	}
	
	clean(){
		this.draw.clean()
		this.canvasCache.clean()
		assets.sounds["bgm_result"].stop()
		snd.musicGain.fadeIn()
		this.redrawRunning = false
		pageEvents.keyRemove(this, "all")
		pageEvents.remove(this.canvas, ["mousedown", "touchstart"])
		delete this.ctx
		delete this.canvas
	}
}
