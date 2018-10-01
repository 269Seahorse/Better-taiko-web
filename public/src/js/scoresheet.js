class Scoresheet{
	constructor(controller, results, multiplayer){
		this.controller = controller
		this.results = results
		this.multiplayer = multiplayer
		
		this.canvas = document.getElementById("canvas")
		this.ctx = this.canvas.getContext("2d")
		
		this.font = "TnT"
		this.state = {
			screen: "fadeIn",
			screenMS: this.getMS(),
			startDelay: 3300
		}
		this.draw = new CanvasDraw()
		
		this.gamepad = new Gamepad({
			"13": ["a", "b", "start"]
		})
		
		this.redrawRunning = true
		this.redrawBind = this.redraw.bind(this)
		this.redraw()
		pageEvents.keyAdd(this, "all", "down", this.keyDown.bind(this))
		pageEvents.add(this.canvas, "mousedown", this.mouseDown.bind(this))
		
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
			confirm: code == 13 || code == 32 || code == 86 || code == 66,
			// Enter, Space, V, B
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
		if(event.which !== 1){
			return
		}
		this.toNext()
	}
	toNext(){
		var ms = this.getMS()
		var elapsed = ms - this.state.screenMS - this.state.startDelay
		if(this.state.screen === "fadeIn"){
			if(elapsed >= 3400){
				snd.musicGain.fadeOut(0.5)
				this.state.screen = "fadeOut"
				this.state.screenMS = ms
				assets.sounds["don"].play()
			}else if(elapsed >= 0 && elapsed <= 2400){
				this.state.screenMS = ms - 2400 - this.state.startDelay
				assets.sounds["don"].play()
			}
		}
	}
	
	startRedraw(){
		this.redrawing = true
		requestAnimationFrame(this.redrawBind)
		this.winW = null
		this.winH = null
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
		var winH = innerHeight
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
			}else if(!document.hasFocus() && ms - this.state.screenMS - this.state.startDelay > 2400){
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
			bgOffset = (1 - elapsed / 1000) * (winH / 2)
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
		ctx.fillStyle = "#000"
		ctx.fillRect(0, winH / 2 - 2, winW, 3)
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
		ctx.fillRect(0, winH / 2 - 1, winW, 3)
		ctx.fillStyle = this.multiplayer ? "#6bbec0" : "#fa4529"
		ctx.fillRect(0, winH - frameTop - 64, winW, frameTop + 64)
		ctx.fillStyle = this.multiplayer ? "rgba(160, 228, 229, 0.8)" : "rgba(255, 144, 116, 0.8)"
		ctx.fillRect(0, winH - frameTop - 72, winW, 7)
		ctx.fillStyle = this.multiplayer ? "#a8e0e0" : "#ff9b7a"
		ctx.fillRect(0, winH - frameTop - 66, winW, 2)
		
		if(bgOffset){
			ctx.restore()
		}
		
		if(this.state.screen === "fadeOut"){
			var elapsed = 2400
		}else{
			var elapsed = ms - this.state.screenMS - this.state.startDelay
		}
		
		if(elapsed >= 0){
			ctx.save()
			ctx.setTransform(1, 0, 0, 1, 0, 0)
			this.draw.alpha(Math.min(1, elapsed / 400), ctx, ctx => {
				ctx.scale(ratio, ratio)
				ctx.translate(frameLeft, frameTop)
				
				this.draw.layeredText({
					ctx: ctx,
					text: "成績発表",
					fontSize: 48,
					fontFamily: this.font,
					x: 23,
					y: 15,
					letterSpacing: 3
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
					align: "right"
				}, [
					{outline: "#000", letterBorder: 10, shadow: [1, 1, 3]},
					{fill: "#fff"}
				])
				
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
						x: 1150,
						y: 193,
						fontSize: 29,
						fontFamily: this.font,
						align: "right",
						width: 216,
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
				ctx.drawImage(assets.image["hp-bar-bg"],
					552, 120, 688, 48
				)
				var gauge = results.gauge / 100
				if(gauge > 0){
					ctx.drawImage(assets.image["hp-bar-colour"],
						0, 0, 650 * gauge, 40,
						557, 127, 635 * gauge, 37,
					)
				}
			}
			ctx.restore()
		}
		
		if(elapsed >= 1200){
			ctx.save()
			ctx.setTransform(1, 0, 0, 1, 0, 0)
			
			for(var p = 0; p < players; p++){
				var results = this.results
				if(p === 1){
					results = p2.results
				}
				var crownType = null
				if(results.bad === 0){
					crownType = "gold"
				}else if(results.gauge >= 50){
					crownType = "silver"
				}
				if(crownType !== null){
					var amount = Math.min(1, (elapsed - 1200) / 450)
					this.draw.alpha(amount, ctx, ctx => {
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
						this.draw.crown({
							ctx: ctx,
							type: crownType,
							x: 395,
							y: 218,
							scale: crownScale,
							shine: shine
						})
						
						ctx.restore()
					})
				}
			}
			ctx.restore()
		}
		
		if(elapsed >= 2400){
			ctx.save()
			ctx.translate(frameLeft, frameTop)
			
			for(var p = 0; p < players; p++){
				var results = this.results
				if(p === 1){
					results = p2.results
					ctx.translate(0, p2Offset)
				}
				ctx.save()
				var points = results.points.toString()
				var scale = 1.3
				ctx.font = "36px " + this.font
				ctx.translate(760, 286)
				ctx.scale(1 / scale, 1 * 1.1)
				ctx.textAlign = "center"
				ctx.fillStyle = "#fff"
				ctx.strokeStyle = "#fff"
				ctx.lineWidth = 0.5
				for(var i = 0; i < points.length; i++){
					ctx.translate(-23 * scale, 0)
					ctx.fillText(points[points.length - i - 1], 0, 0)
					ctx.strokeText(points[points.length - i - 1], 0, 0)
				}
				ctx.restore()
				
				var printNumbers = ["good", "ok", "bad", "maxCombo", "drumroll"]
				for(var i in printNumbers){
					this.draw.layeredText({
						ctx: ctx,
						text: results[printNumbers[i]].toString(),
						x: 971 + 270 * Math.floor(i / 3),
						y: 194 + (40 * (i % 3)),
						fontSize: 27,
						fontFamily: this.font,
						letterSpacing: 4,
						align: "right"
					}, [
						{outline: "#000", letterBorder: 9},
						{fill: "#fff"}
					])
				}
			}
			ctx.restore()
		}
		
		if(this.state.screen === "fadeOut"){
			ctx.save()
			
			var elapsed = ms - this.state.screenMS
			ctx.globalAlpha = Math.max(0, Math.min(1, elapsed / 1000))
			ctx.fillStyle = "#000"
			ctx.fillRect(0, 0, winW, winH)
			
			ctx.restore()
			
			if(elapsed >= 1000){
				this.clean()
				this.controller.songSelection(true)
			}
		}
		
		ctx.restore()
	}
	
	mod(length, index){
		return ((index % length) + length) % length
	}
	
	getMS(){
		return +new Date
	}
	
	clean(){
		assets.sounds["bgm_result"].stop()
		snd.musicGain.fadeIn()
		this.redrawRunning = false
		pageEvents.keyRemove(this, "all")
		pageEvents.remove(this.canvas, "mousedown")
		delete this.ctx
		delete this.canvas
	}
}
