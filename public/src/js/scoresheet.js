class Scoresheet{
	constructor(controller, results, multiplayer, touchEnabled){
		this.controller = controller
		this.results = {}
		for(var i in results){
			this.results[i] = results[i].toString()
		}
		this.multiplayer = multiplayer
		this.touchEnabled = touchEnabled
		
		this.canvas = document.getElementById("canvas")
		this.ctx = this.canvas.getContext("2d")
		this.game = document.getElementById("game")
		
		this.fadeScreen = document.createElement("div")
		this.fadeScreen.id = "fade-screen"
		this.game.appendChild(this.fadeScreen)
		
		this.font = strings.font
		this.numbersFont = "TnT, Meiryo, sans-serif"
		this.state = {
			screen: "fadeIn",
			screenMS: this.getMS(),
			startDelay: 3300,
			hasPointer: 0,
			scoreNext: false
		}
		this.frame = 1000 / 60
		this.numbers = "001122334455667788900112233445".split("")
		
		this.draw = new CanvasDraw()
		this.canvasCache = new CanvasCache()
		
		this.keyboard = new Keyboard({
			confirm: ["enter", "space", "esc", "don_l", "don_r"]
		}, this.keyDown.bind(this))
		this.gamepad = new Gamepad({
			confirm: ["a", "b", "start", "ls", "rs"]
		}, this.keyDown.bind(this))
		
		this.difficulty = {
			"easy": 0,
			"normal": 1,
			"hard": 2,
			"oni": 3,
			"ura": 4
		}
		
		this.redrawRunning = true
		this.redrawBind = this.redraw.bind(this)
		this.redraw()
		
		assets.sounds["v_results"].play()
		assets.sounds["bgm_result"].playLoop(3, false, 0, 0.847, 17.689)
		
		if(p2.session){
			if(p2.getMessage("songsel")){
				this.toSongsel(true)
			}
			pageEvents.add(p2, "message", response => {
				if(response.type === "songsel"){
					this.toSongsel(true)
				}
			})
		}
		pageEvents.send("scoresheet", {
			selectedSong: controller.selectedSong,
			autoPlayEnabled: controller.autoPlayEnabled,
			multiplayer: multiplayer,
			touchEnabled: touchEnabled,
			results: this.results,
			p2results: multiplayer ? p2.results : null,
			keyboardEvents: controller.keyboard.keyboardEvents,
			gamepadEvents: controller.keyboard.gamepad.gamepadEvents,
			touchEvents: controller.view.touchEvents
		})
	}
	keyDown(pressed){
		if(pressed && this.redrawing){
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
		var elapsed = this.getMS() - this.state.screenMS
		if(this.state.screen === "fadeIn" && elapsed >= this.state.startDelay){
			this.toScoresShown()
		}else if(this.state.screen === "scoresShown" && elapsed >= 1000){
			this.toSongsel()
		}
	}
	toScoresShown(){
		if(!p2.session){
			this.state.screen = "scoresShown"
			this.state.screenMS = this.getMS()
			assets.sounds["neiro_1_don"].play()
		}
	}
	toSongsel(fromP2){
		if(!p2.session || fromP2){
			snd.musicGain.fadeOut(0.5)
			this.state.screen = "fadeOut"
			this.state.screenMS = this.getMS()
			if(!fromP2){
				assets.sounds["neiro_1_don"].play()
			}
		}
	}
	
	startRedraw(){
		this.redrawing = true
		requestAnimationFrame(this.redrawBind)
		this.winW = null
		this.winH = null
		
		pageEvents.add(this.canvas, ["mousedown", "touchstart"], this.mouseDown.bind(this))
		
		if(!this.multiplayer){
			this.tetsuoHana = document.createElement("div")
			this.tetsuoHana.id = "tetsuohana"
			var flowersBg = "url('" + assets.image["results_flowers"].src + "')"
			var mikoshiBg = "url('" + assets.image["results_mikoshi"].src + "')"
			var tetsuoHanaBg = "url('" + assets.image["results_tetsuohana" + (debugObj.state === "closed" ? "" : "2")].src + "')"
			var id = ["flowers1", "flowers2", "mikoshi", "tetsuo", "hana"]
			var bg = [flowersBg, flowersBg, mikoshiBg, tetsuoHanaBg, tetsuoHanaBg]
			for(var i = 0; i < id.length; i++){
				if(id[i] === "mikoshi"){
					var divOut = document.createElement("div")
					divOut.id = id[i] + "-out"
					this.tetsuoHana.appendChild(divOut)
				}else{
					var divOut = this.tetsuoHana
				}
				var div = document.createElement("div")
				div.id = id[i]
				var divIn = document.createElement("div")
				divIn.id = id[i] + "-in"
				divIn.style.backgroundImage = bg[i]
				div.appendChild(divIn)
				divOut.appendChild(div)
			}
			this.game.appendChild(this.tetsuoHana)
		}
	}
	
	redraw(){
		if(!this.redrawRunning){
			return
		}
		if(this.redrawing){
			requestAnimationFrame(this.redrawBind)
		}
		var ms = this.getMS()
		
		if(!this.redrawRunning){
			return
		}
		
		var ctx = this.ctx
		ctx.save()
		
		var winW = innerWidth
		var winH = lastHeight
		this.pixelRatio = window.devicePixelRatio || 1
		var resolution = settings.getItem("resolution")
		if(resolution === "medium"){
			this.pixelRatio *= 0.75
		}else if(resolution === "low"){
			this.pixelRatio *= 0.5
		}else if(resolution === "lowest"){
			this.pixelRatio *= 0.25
		}
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
				
				if(!this.multiplayer){
					this.tetsuoHana.style.setProperty("--scale", ratio / this.pixelRatio)
					if(this.tetsuoHanaClass === "dance"){
						this.tetsuoHana.classList.remove("dance", "dance2")
						setTimeout(()=>{
							this.tetsuoHana.classList.add("dance2")
						},50)
					}else if(this.tetsuoHanaClass === "failed"){
						this.tetsuoHana.classList.remove("failed")
						setTimeout(()=>{
							this.tetsuoHana.classList.add("failed")
						},50)
					}
				}
			}else if(!document.hasFocus() && this.state.screen === "scoresShown"){
				return
			}else{
				ctx.clearRect(0, 0, winW / ratio, winH / ratio)
			}
		}else{
			ctx.scale(ratio, ratio)
			if(!this.canvasCache.canvas){
				this.canvasCache.resize(winW / ratio, 80 + 1, ratio)
			}
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
		}else if(this.redrawing){
			var elapsed = ms - this.state.screenMS - this.state.startDelay
		}else{
			var elapsed = 0
		}
		
		var gaugePercent = Math.round(this.results.gauge / 2) / 50
		if(players === 2){
			var gauge2 = Math.round(p2.results.gauge / 2) / 50
			if(gauge2 > gaugePercent){
				gaugePercent = gauge2
			}
		}
		var gaugeClear = 25 / 50
		var failedOffset = gaugePercent >= gaugeClear ? 0 : -2000
		if(elapsed >= 3100 + failedOffset){
			for(var p = 0; p < players; p++){
				ctx.save()
				var results = this.results
				if(p === 1){
					results = p2.results
				}
				var resultGauge = Math.round(results.gauge / 2) / 50
				var clear = resultGauge >= gaugeClear
				if(p === 1 || !this.multiplayer && clear){
					ctx.translate(0, 290)
				}
				if(clear){
					ctx.globalCompositeOperation = "lighter"
				}
				ctx.globalAlpha = Math.min(1, Math.max(0, (elapsed - (3100 + failedOffset)) / 500)) * 0.5
				var grd = ctx.createLinearGradient(0, frameTop + 72, 0, frameTop + 368)
				grd.addColorStop(0, "#000")
				if(clear){
					grd.addColorStop(1, "#ffffba")
				}else{
					grd.addColorStop(1, "transparent")
				}
				ctx.fillStyle = grd
				ctx.fillRect(0, frameTop + 72, winW, 286)
				ctx.restore()
			}
		}
		
		if(elapsed >= 0){
			if(this.state.hasPointer === 0){
				this.state.hasPointer = 1
				if(!this.state.pointerLocked && !p2.session){
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
						text: strings.results,
						fontSize: 48,
						fontFamily: this.font,
						x: 23,
						y: 15,
						letterSpacing: strings.id === "en" ? 0 : 3,
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
						width: 600,
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
					
					ctx.drawImage(assets.image["difficulty"],
						0, 144 * this.difficulty[results.difficulty],
						168, 143,
						300, 150, 189, 162
					)
					var diff = results.difficulty
					var text = strings[diff === "ura" ? "oni" : diff]
					ctx.font = this.draw.bold(this.font) + "28px " + this.font
					ctx.textAlign = "center"
					ctx.textBaseline = "bottom"
					ctx.strokeStyle = "#000"
					ctx.fillStyle = "#fff"
					ctx.lineWidth = 9
					ctx.miterLimit = 1
					ctx.strokeText(text, 395, 308)
					ctx.fillText(text, 395, 308)
					ctx.miterLimit = 10
					
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
					this.draw.layeredText({
						ctx: ctx,
						text: strings.points,
						x: 792,
						y: strings.id === "ko" ? 260 : 253,
						fontSize: 36,
						fontFamily: this.font,
						align: "right",
						width: 36
					}, [
						{fill: "#fff"},
						{outline: "#000", letterBorder: 0.5}
					])
					
					this.draw.score({
						ctx: ctx,
						score: "good",
						x: 823,
						y: 192,
						results: true
					})
					this.draw.score({
						ctx: ctx,
						score: "ok",
						x: 823,
						y: 233,
						results: true
					})
					this.draw.score({
						ctx: ctx,
						score: "bad",
						x: 823,
						y: 273,
						results: true
					})
					
					ctx.textAlign = "right"
					var grd = ctx.createLinearGradient(0, 0, 0, 30)
					grd.addColorStop(0.2, "#ff4900")
					grd.addColorStop(0.9, "#f7fb00")
					this.draw.layeredText({
						ctx: ctx,
						text: strings.maxCombo,
						x: 1149,
						y: 193,
						fontSize: 29,
						fontFamily: this.font,
						align: "right",
						width: 154,
						letterSpacing: strings.id === "ja" ? 1 : 0
					}, [
						{outline: "#000", letterBorder: 8},
						{fill: grd}
					])
					this.draw.layeredText({
						ctx: ctx,
						text: strings.drumroll,
						x: 1150,
						y: 233,
						fontSize: 29,
						fontFamily: this.font,
						align: "right",
						width: 154,
						letterSpacing: strings.id === "ja" ? 4 : 0
					}, [
						{outline: "#000", letterBorder: 8},
						{fill: "#ffc700"}
					])
				}
				ctx.restore()
			})
			ctx.restore()
		}
		
		if(!this.multiplayer){
			if(elapsed >= 400 && elapsed < 3100 + failedOffset){
				if(this.tetsuoHanaClass !== "fadein"){
					this.tetsuoHana.classList.add("fadein")
					this.tetsuoHanaClass = "fadein"
				}
			}else if(elapsed >= 3100 + failedOffset){
				if(this.tetsuoHanaClass !== "dance" && this.tetsuoHanaClass !== "failed"){
					if(this.tetsuoHanaClass){
						this.tetsuoHana.classList.remove(this.tetsuoHanaClass)
					}
					this.tetsuoHanaClass = gaugePercent >= gaugeClear ? "dance" : "failed"
					this.tetsuoHana.classList.add(this.tetsuoHanaClass)
				}
			}
		}
		
		if(elapsed >= 800){
			ctx.save()
			ctx.setTransform(1, 0, 0, 1, 0, 0)
			this.draw.alpha(Math.min(1, (elapsed - 800) / 500), ctx, ctx => {
				ctx.scale(ratio, ratio)
				ctx.translate(frameLeft, frameTop)
				
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
						scoresheet: true,
						blue: p === 1
					})
					this.draw.soul({
						ctx: ctx,
						x: 1215,
						y: 144,
						scale: 36 / 42,
						cleared: gaugePercent - 1 / 50 >= 25 / 50
					})
				}
			})
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
								this.playSound("v_results_fullcombo" + (p === 1 ? "2" : ""), p)
							}
						}
						if(this.state.screen === "fadeIn" && elapsed >= 1650 && !this.state["crownPlayed" + p]){
							this.state["crownPlayed" + p] = true
							this.playSound("se_results_crown", p)
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
				ctx.font = "35px " + this.numbersFont
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
						fontFamily: this.numbersFont,
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
						this.loopSound("se_results_countup", p, [0.1, false, 0, 0, 0.07])
					}
				}else if(this.state["countup" + p]){
					this.state["countup" + p] = false
					this.stopSound("se_results_countup", p)
					if(this.state.screen === "fadeIn"){
						this.playSound("neiro_1_don", p)
					}
				}
				
				if(this.state.screen === "fadeIn" && elapsed >= this.state.fadeInEnd){
					this.state.screen = "scoresShown"
					this.state.screenMS = this.getMS()
				}
			}
			ctx.restore()
		}
		
		if(p2.session && !this.state.scoreNext && this.state.screen === "scoresShown" && ms - this.state.screenMS >= 10000){
			this.state.scoreNext = true
			p2.send("songsel")
		}
		
		if(this.state.screen === "fadeOut"){
			if(this.state.hasPointer === 1){
				this.state.hasPointer = 2
				this.canvas.style.cursor = ""
			}
			
			if(!this.fadeScreenBlack){
				this.fadeScreenBlack = true
				this.fadeScreen.style.backgroundColor = "#000"
			}
			var elapsed = ms - this.state.screenMS
			
			if(elapsed >= 1000){
				this.clean()
				this.controller.songSelection(true)
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
		return Date.now()
	}
	
	clean(){
		this.keyboard.clean()
		this.gamepad.clean()
		this.draw.clean()
		this.canvasCache.clean()
		assets.sounds["bgm_result"].stop()
		snd.buffer.loadSettings()
		this.redrawRunning = false
		pageEvents.remove(this.canvas, ["mousedown", "touchstart"])
		if(this.multiplayer !== 2 && this.touchEnabled){
			pageEvents.remove(document.getElementById("touch-full-btn"), "touchend")
		}
		if(p2.session){
			pageEvents.remove(p2, "message")
		}
		if(!this.multiplayer){
			delete this.tetsuoHana
		}
		delete this.ctx
		delete this.canvas
		delete this.fadeScreen
	}
}
