class CanvasDraw{
	constructor(){
		this.diffStarPath = new Path2D("M3 17 5 11 0 6h6l3-6 3 6h6l-5 5 2 6-6-3")
		this.longVowelMark = new Path2D("m1 5c2 3 1 17 .5 25 0 5 6 5 6.5 0C9 22 9 6 7 3 4-2-1 2 1 5")
		
		this.diffIconPath = [[{w: 40, h: 33}, {
			fill: "#ff2803",
			d: new Path2D("m27 10c9-9 21 9 5 11 10 9-6 18-12 7C14 39-2 30 8 21-8 19 4 1 13 10 6-4 34-3 27 10Z")
		}, {
			fill: "#ffb910",
			noStroke: true,
			d: new Path2D("m12 15c5 1 7 0 8-4 1 4 3 5 8 4-4 3-4 5-2 8-4-4-8-4-12 0 2.2-3 2-5-2-8")
		}], [{w: 48, h: 31}, {
			fill: "#8daf51",
			d: new Path2D("m24 0c-3 0-4 3-5 6-2 6-2 11 0 17 0 0 1 4 5 8 4-4 5-8 5-8C31 17 31 12 29 6 28 3 27 0 24 0M37 2c4 3 7 6 8 8 2 4 3 6 2 13C43 21 39 18 39 18 35 15 32 12 30 8 27 0 32-2 37 2M11 2C7 5 4 8 3 10 1 14 0 16 1 23 5 21 9 18 9 18 13 15 16 12 18 8 21 0 16-2 11 2")
		}], [{w: 56, h: 37}, {
			fill: "#784439",
			d: new Path2D("m26 34v-2c-10 1-12 0-12-7 4-3 8-5 14-5 6 0 10 2 14 5 0 7-2 8-12 7V34Z")
		}, {
			fill: "#000",
			noStroke: true,
			d: new Path2D("m18 19v9h8v-9m4 9h8v-9h-8")
		}, {
			fill: "#414b2b",
			d: new Path2D("M8 26C3 26-3 21 2 11 6 5 11 4 18 10c0-6 4-10 10-10 6 0 10 4 10 10 7-6 12-5 16 1 5 10-1 15-6 15-5 0-10-7-20-7-10 0-15 7-20 7")
		}], [{w: 29, h: 27}, {
			fill: "#db1885",
			d: new Path2D("m18 9c1 3 4 4 7 3 0 4 1 11 4 16H0c3-5 4-12 4-16 3 1 6 0 7-3z")
		}, {
			fill: "#fff",
			d: new Path2D("m6 0.5-2 11c4 1.5 6-0.5 6.5-3zm17 0-4.5 8C19 11 21 13 25 11.5ZM5.5 17.5C4.5 23.5 9 25 11 22Zm18 0L18 22c2 3 6.5 1.5 5.5-4.5z")
		}]]
		
		this.diffPath = {
			good: new Path2D("m12 17c4 3 9 7 10 9 0 0 1 3-1 3C19 29 9 18 9 18m6 2c3 0 3-3 3-3 2-1 5 1 4 3-1 1-2 2-5 3m-1 0C13 26 4 29 1 29 0 29 0 26 0 26 0 24 2 24 2 24V13l5-1v4l8-1c1 0 1-3 1-3 0 0-9 1-14 1V8L7 7v4.5L15 11C16 11 16 8 16 8 16 7 2 9 2 9-1 10 0 5 1 5h10l6-1c3 0 4 2 4 6 0 3-1 7-1 7L7 19v4.5c4 0 7-2.5 7-2.5M9 6C8 4 8 1 8 1c0 0 4-1 6 0 0 0 0 3 1 5"),
			ok: new Path2D("m4 10c0 0 3-1 7-1 4 0 3 8 2 11-1 2-3 1-3 1-1-1 1-7 0-8-1-1-4-1-6 0m8 6c-1 1.2-7 1-7 1v-3c0 0 6 0 7-1M2 10c1-2 3 0 3 0 0 0 0 4 1 9-2 3-4 2-4 0zM21 5v19c0 1-2 3-3 3-1 0-5-4-5-4 0-1 4-1 4-1V5M1 2C12 2 17.9 0 20 0 23 0 25 3 21 5 11.7 6 9 6 5 6 0 7-1 2 1 2Z"),
			bad: new Path2D("m13 7c8 0 10 9 10 9 1 4-6 3-8 0 0-1 4 0 2.5-3 0 0-2.5-4-4.5 0M16 6 3 18c-2 2-4 1-4 0 0-1 8-8 9-12m6 0c1 8 0 18 0 18-0.1 1-2 3-3 3-1 0-5-4-5-4 0-1 4-1 4-1 0 0-1-8 0-16M2 7C1 7 1 2 2 2 10 2 21 0 22 1 22 1 24 2 24 4 24 7 2 7 2 7Z")
		}
		
		this.crownPath = new Path2D("m82 21c0-4 3-6 5.5-6 2.5 0 5.5 2 5.5 6 0 4-3 6-5.5 6C85 27 82 25 82 21ZM41.5 6c0-4 3-6 5.5-6 2.5 0 5.5 2 5.5 6 0 4-3 6-5.5 6-2.5 0-5.5-2-5.5-6zM1 21C1 17 4 15 6.5 15 9 15 12 17 12 21 12 25 9 27 6.5 27 4 27 1 25 1 21Zm12 46h68l2 11H11ZM13 62 5 18 29 34 47 6 65 34 89 18 81 62Z")
		
		this.soulPath = new Path2D("m37 29c1-4 7 2 7 4 0 1-2 2-4 2-1 0-1-4-3-6zm-4-7c3 1 5 3 4 5-1 2-3 3-3 4 3-2 5-2 5-2 0 0-1 3-5 5-4 3-5-1-3-4 2-3 3-6 0-7zm-3 8c1 3-5 10 8 7 6-1 2-4 2-4 5 1 7 3 7 5 0 3-8 4-12 4-4 0-9-2-9-5 0 0 0-6-1-8 0-3 3-3 5 1zM20 23h8C27 27 20 44 9 42 18 36 23 28 21 26 19 24 20 23 20 23Zm0-6c4-2 9-4 14-2v2c-5 0-9 1-14 2zm8-7v12h-4c2-1 1-9-1-10zm-6 12c3 0 10-2 10-2 0 0 1-10 0-10-5 1-8 3-12 3 0 0 2 5 2 9zm0-12c0 0 6-1 9-3 3-2 9 3 8 6-1 3-2 6-4 9-2 2-15 2-15 2-1 0-3-7-2-11zM21 0c8 0 10 3 8 5 0 0-6 7-15 10C22 8 23 3 23 3 23 1 21 0 21 0ZM5 9c-1 3 2 6 4 6 5-1 13-6 4-7-3 0-5 5-8 1zm7 17c2-1 4-1 6 1 2 2 1 6-2 6-1 0-2-2-2-2-1-2-3-4-2-5zm2 4c-3 2-4 5-5 6-1 1-4 2-6-2-1-2 0-3 2-5l4-4c0-1-1 0-4 1-2 1-5-2-4-4 2-5 1 0 3-1 6-4 9-5 11-3 2 2 0 3-2 5-1 1-3 4-4 6 0 1 3-1 4-2")
		
		this.optionsPath = {
			shadow: new Path2D("M4-1V8H9V0l1-1 3 6v4l-4 5v10l4 5v4l-2 4-2 1V30H4L5 37 3 38 0 33V29L4 24V14L0 9V5L3 0Z"),
			main: new Path2D("M4 0V8H9V0h1l3 5v4l-4 5v10l4 5v4l-3 5H9V30H4v8H3L0 33V29L4 24V14L0 9V5L3 0Z")
		}
		
		this.regex = {
			comma: /[,.]/,
			ideographicComma: /[、。]/,
			apostrophe: /['＇]/,
			degree: /[ﾟ°]/,
			brackets: /[\(（\)）\[\]「」『』【】]/,
			tilde: /[\-－~～〜_]/,
			tall: /[bｂdｄfｆgｇhｈj-lｊ-ｌtｔ♪]/,
			i: /[iｉ]/,
			uppercase: /[A-ZＡ-Ｚ]/,
			lowercase: /[a-zａ-ｚ･]/,
			latin: /[A-ZＡ-Ｚa-zａ-ｚ･]/,
			numbers: /[0-9０-９]/,
			exclamation: /[!！\?？ ]/,
			question: /[\?？]/,
			smallHiragana: /[ぁぃぅぇぉっゃゅょァィゥェォッャュョ]/,
			hiragana: /[\u3040-\u30ff]/,
			todo: /[トド]/,
			en: /[ceghknsuxyzｃｅｇｈｋｎｓｕｘｙｚ]/,
			em: /[mwｍｗ]/,
			emCap: /[MWＭＷ]/,
			rWidth: /[abdfIjo-rtvａｂｄｆＩｊｏ-ｒｔｖ]/,
			lWidth: /[ilｉｌ]/,
			ura: /\s*[\(（]裏[\)）]$/
		}
		
		var numbersFull = "０１２３４５６７８９"
		var numbersHalf = "0123456789"
		this.numbersFullToHalf = {}
		for(var i = 0; i < 10; i++){
			this.numbersFullToHalf[numbersFull[i]] = numbersHalf[i]
			this.numbersFullToHalf[numbersHalf[i]] = numbersHalf[i]
		}
		
		this.songFrameCache = new CanvasCache()
		this.diffStarCache = new CanvasCache()
		this.crownCache = new CanvasCache()
		
		this.tmpCanvas = document.createElement("canvas")
		this.tmpCtx = this.tmpCanvas.getContext("2d")
	}
	
	roundedRect(config){
		var ctx = config.ctx
		var x = config.x
		var y = config.y
		var w = config.w
		var h = config.h
		var r = config.radius
		ctx.beginPath()
		this.roundedCorner(ctx, x, y, r, 0)
		this.roundedCorner(ctx, x + w, y, r, 1)
		this.roundedCorner(ctx, x + w, y + h, r, 2)
		this.roundedCorner(ctx, x, y + h, r, 3)
		ctx.closePath()
	}
	
	roundedCorner(ctx, x, y, r, rotation){
		var pi = Math.PI
		switch(rotation){
			case 0:
				return ctx.arc(x + r, y + r, r, pi, pi / -2)
			case 1:
				return ctx.arc(x - r, y + r, r, pi / -2, 0)
			case 2:
				return ctx.arc(x - r, y - r, r, 0, pi / 2)
			case 3:
				return ctx.arc(x + r, y - r, r, pi / 2, pi)
		}
	}
	
	songFrame(config){
		var ctx = config.ctx
		var x = config.x
		var y = config.y
		var w = config.width
		var h = config.height
		var border = config.border
		var innerBorder = config.innerBorder
		var allBorders = border + innerBorder
		var innerX = x + allBorders
		var innerY = y + allBorders
		var innerW = w - allBorders * 2
		var innerH = h - allBorders * 2
		
		ctx.save()
		
		var shadowBg = (ctx, noForce) => {
			this.shadow({
				ctx: ctx,
				fill: "rgba(0, 0, 0, 0.5)",
				blur: 10,
				x: 5,
				y: 5,
				force: !noForce
			})
			ctx.fillStyle = "#000"
			ctx.fillRect(0, 0, w, h)
		}
		if(config.cached){
			if(this.songFrameCache.w !== config.frameCache.w){
				this.songFrameCache.resize(config.frameCache.w, config.frameCache.h, config.frameCache.ratio)
			}
			this.songFrameCache.get({
				ctx: ctx,
				x: x,
				y: y,
				w: w + 15,
				h: h + 15,
				id: "shadow" + config.cached
			}, shadowBg)
		}else{
			ctx.translate(x, y)
			shadowBg(ctx, true)
		}
		
		ctx.restore()
		ctx.save()
		
		{
			let _x = x + border
			let _y = y + border
			let _w = w - border * 2
			let _h = h - border * 2
			ctx.fillStyle = config.borderStyle[1]
			ctx.fillRect(_x, _y, _w, _h)
			ctx.fillStyle = config.borderStyle[0]
			ctx.beginPath()
			ctx.moveTo(_x, _y)
			ctx.lineTo(_x + _w, _y)
			ctx.lineTo(_x + _w - innerBorder, _y + innerBorder)
			ctx.lineTo(_x + innerBorder, _y + _h - innerBorder)
			ctx.lineTo(_x, _y + _h)
			ctx.fill()
		}
		ctx.fillStyle = config.background
		ctx.fillRect(innerX, innerY, innerW, innerH)
		
		ctx.save()
		
		ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
		ctx.lineWidth = 3
		ctx.strokeRect(innerX, innerY, innerW, innerH)
		if(!config.noCrop){
			ctx.beginPath()
			ctx.rect(innerX, innerY, innerW, innerH)
			ctx.clip()
		}
		
		config.innerContent(innerX, innerY, innerW, innerH)
		
		ctx.restore()
		
		if(config.disabled){
			ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
			ctx.fillRect(x, y, w, h)
		}
		
		if(config.highlight){
			this.highlight({
				ctx: ctx,
				x: x,
				y: y,
				w: w,
				h: h,
				animate: config.highlight === 2,
				animateMS: config.animateMS,
				opacity: config.highlight === 1 ? 0.8 : 1
			})
		}
		
		ctx.restore()
	}
	
	highlight(config){
		var ctx = config.ctx
		ctx.save()
		var _x = config.x + 3.5
		var _y = config.y + 3.5
		var _w = config.w - 7
		var _h = config.h - 7
		if(config.animate){
			ctx.globalAlpha = this.fade((this.getMS() - config.animateMS) % 2000 / 2000)
		}else if(config.opacity){
			ctx.globalAlpha = config.opacity
		}
		if(config.radius){
			this.roundedRect({
				ctx: ctx,
				x: _x,
				y: _y,
				w: _w,
				h: _h,
				radius: config.radius
			})
		}else{
			ctx.beginPath()
			ctx.rect(_x, _y, _w, _h)
		}
		ctx.strokeStyle = "rgba(255, 249, 1, 0.45)"
		ctx.lineWidth = 14
		ctx.stroke()
		ctx.strokeStyle = "rgba(255, 249, 1, .8)"
		ctx.lineWidth = 8
		ctx.stroke()
		ctx.strokeStyle = "#fff"
		ctx.lineWidth = 6
		ctx.stroke()
		
		ctx.restore()
	}
	fade(pos){
		if(pos < 0.5){
			pos = 1 - pos
		}
		return (1 - Math.cos(Math.PI * pos * 2)) / 2
	}
	easeIn(pos){
		return 1 - Math.cos(Math.PI / 2 * pos)
	}
	easeOut(pos){
		return Math.sin(Math.PI / 2 * pos)
	}
	easeInOut(pos){
		return (Math.cos(Math.PI * pos) - 1) / -2
	}
	
	verticalText(config){
		var ctx = config.ctx
		var inputText = config.text
		var mul = config.fontSize / 40
		var ura = false
		var r = this.regex
		
		var matches = inputText.match(r.ura)
		if(matches){
			inputText = inputText.slice(0, matches.index)
			ura = matches[0]
		}
		var bold = this.bold(config.fontFamily)
		
		var string = inputText.split("")
		var drawn = []
		
		for(var i = 0; i < string.length; i++){
			let symbol = string[i]
			if(symbol === " "){
				// Space
				drawn.push({text: symbol, x: 0, y: 0, h: 18})
			}else if(symbol === "ー"){
				// Long-vowel mark
				if(bold){
					drawn.push({text: symbol, x: -1, y: -1, h: 33, rotate: true})
				}else{
					drawn.push({realText: symbol, svg: this.longVowelMark, x: -4, y: 5, h: 33, scale: [mul, mul]})
				}
			}else if(symbol === "∀"){
				drawn.push({text: symbol, x: 0, y: 0, h: 39, rotate: true})
			}else if(symbol === "↓"){
				drawn.push({text: symbol, x: 0, y: 12, h: 45})
			}else if(symbol === "．"){
				if(bold){
					drawn.push({realText: symbol, text: ".", x: 13, y: -15, h: 15})
				}else{
					drawn.push({realText: symbol, text: ".", x: 13, y: -7, h: 15, scale: [1.2, 0.7]})
				}
			}else if(symbol === "…"){
				drawn.push({text: symbol, x: bold ? 9 : 0, y: 5, h: 25, rotate: true})
			}else if(symbol === '"'){
				drawn.push({text: symbol, x: 0, y: 5, h: 20, rotate: true})
			}else if(r.comma.test(symbol)){
				// Comma, full stop
				if(bold){
					drawn.push({text: symbol, x: 13, y: -15, h: 15})
				}else{
					drawn.push({text: symbol, x: 13, y: -7, h: 15, scale: [1.2, 0.7]})
				}
			}else if(r.ideographicComma.test(symbol)){
				// Ideographic comma, full stop
				drawn.push({text: symbol, x: 16, y: -16, h: 18})
			}else if(r.apostrophe.test(symbol)){
				// Apostrophe
				if(bold){
					drawn.push({text: symbol, x: 20, y: -25, h: 0})
				}else{
					drawn.push({realText: symbol, text: ",", x: 20, y: -39, h: 0, scale: [1.2, 0.7]})
				}
			}else if(r.degree.test(symbol)){
				// Degree
				if(bold){
					drawn.push({text: symbol, x: 16, y: 9, h: 25})
				}else{
					drawn.push({text: symbol, x: 16, y: 3, h: 18})
				}
			}else if(r.brackets.test(symbol)){
				// Rotated brackets
				if(bold){
					drawn.push({text: symbol, x: 0, y: 0, h: 35, rotate: true})
				}else{
					drawn.push({text: symbol, x: 0, y: -5, h: 25, rotate: true})
				}
			}else if(r.tilde.test(symbol)){
				// Rotated hyphen, tilde
				drawn.push({realText: symbol, text: symbol === "~" ? "～" : symbol, x: 0, y: 2, h: 35, rotate: true})
			}else if(r.tall.test(symbol)){
				// Tall latin script lowercase
				drawn.push({text: symbol, x: 0, y: 4, h: 34})
			}else if(r.i.test(symbol)){
				// Lowercase i
				drawn.push({text: symbol, x: 0, y: 7, h: 34})
			}else if(r.uppercase.test(symbol)){
				// Latin script upper case
				drawn.push({text: symbol, x: 0, y: 8, h: 37})
			}else if(r.lowercase.test(symbol)){
				// Latin script lower case
				drawn.push({text: symbol, x: 0, y: -1, h: 28})
			}else if(r.numbers.test(symbol)){
				// Numbers
				var number = this.numbersFullToHalf[symbol]
				drawn.push({realText: symbol, text: number, x: 0, y: 4, h: 34})
			}else if(r.exclamation.test(symbol)){
				// Exclamation mark
				var toDraw = [symbol]
				for(var repeat = 1; repeat - 1 < i; repeat++){
					if(!r.exclamation.test(string[i - repeat])){
						break
					}
					toDraw.push(string[i - repeat])
				}
				if(repeat > 1){
					drawn.splice(i - repeat + 1, repeat)
					var allExclamations = !toDraw.find(a => a !== "!")
					
					for(var j = 1; j < repeat + 1; j++){
						var text = string[i - repeat + j]
						if(allExclamations){
							var y = 18
							var h = 61
						}else{
							var y = 8
							var h = 37
						}
						if(i === repeat - 1){
							h -= y - 4
							y = 4
						}
						
						drawn.push({
							text: text,
							x: ((j - 1) - (repeat - 1) / 2) * 15,
							y: y - (j === 1 ? 0 : h),
							h: j === 1 ? h : 0
						})
					}
				}else{
					drawn.push({text: symbol, x: 0, y: 8, h: 37})
				}
			}else if(r.smallHiragana.test(symbol)){
				// Small hiragana, small katakana
				drawn.push({text: symbol, x: 0, y: -8, h: 25, right: true})
			}else if(r.hiragana.test(symbol)){
				// Hiragana, katakana
				drawn.push({text: symbol, x: 0, y: 5, h: 38, right: r.todo.test(symbol)})
			}else{
				// Kanji, other
				drawn.push({text: symbol, x: 0, y: 3, h: 39})
			}
		}
		
		var drawnHeight = 0
		for(let symbol of drawn){
			if(config.letterSpacing){
				symbol.h += config.letterSpacing
			}
			drawnHeight += symbol.h * mul
		}
		
		ctx.save()
		ctx.translate(config.x, config.y)
		
		if(config.selectable){
			config.selectable.innerHTML = ""
			var scale = config.selectableScale
			var style = config.selectable.style
			style.left = (config.x - config.width / 2) * scale + "px"
			style.top = config.y * scale + "px"
			style.width = config.width * scale + "px"
			style.height = (drawnHeight+15) * scale + "px"
			style.fontSize = 40 * mul * scale + "px"
			style.transform = ""
		}
		
		var scaling = 1
		var height = config.height - (ura ? 52 * mul : 0)
		if(height && drawnHeight > height){
			scaling = height / drawnHeight
			if(config.align === "bottom"){
				ctx.translate(40 * mul, 0)
				ctx.scale(Math.max(0.6, height / drawnHeight), scaling)
				ctx.translate(-40 * mul, 0)
			}else{
				ctx.scale(1, scaling)
			}
			if(config.selectable){
				style.transform = "scale(1, " + scaling + ")"
				style.top = (config.y + (height - drawnHeight) / 2 - 15 / 2 * scaling) * scale + "px"
			}
		}
		
		if(ura){
			// Circled ura
			drawn.push({realText: ura, text: "裏", x: 0, y: 25, h: 52, ura: true, scale: [1, 1 / scaling]})
		}
		
		if(config.align === "bottom"){
			drawn.reverse()
		}
		
		var actions = []
		if(config.outline){
			actions.push("stroke")
		}
		if(config.fill){
			actions.push("fill")
		}
		if(config.selectable){
			actions.push("selectable")
		}
		for(let action of actions){
			ctx.font = bold + config.fontSize + "px " + config.fontFamily
			ctx.textBaseline = "top"
			if(action === "stroke"){
				ctx.strokeStyle = config.outline
				ctx.lineWidth = config.outlineSize * mul
				if(config.align === "bottom"){
					ctx.lineWidth /= scaling
				}
				ctx.lineJoin = "round"
				ctx.miterLimit = 1
			}else if(action === "fill"){
				ctx.fillStyle = config.fill
			}
			if(config.align === "bottom"){
				var offsetY = drawnHeight > config.height ? drawnHeight : config.height
			}else{
				var offsetY = 0
			}
			
			for(let symbol of drawn){
				var saved = false
				var currentX = symbol.x
				if(symbol.right){
					currentX += 20 * mul
				}
				var currentY = offsetY + symbol.y * mul
				if(config.align === "bottom"){
					currentY -= symbol.h * mul
				}
				offsetY = offsetY + symbol.h * mul * (config.align === "bottom" ? -1 : 1)
				if(action === "selectable"){
					let div = document.createElement("div")
					div.classList.add("stroke-sub")
					let text = symbol.realText || symbol.text
					let textWidth = ctx.measureText(text).width
					let transform = []
					if(symbol.scale){
						transform.push("scale(" + symbol.scale[0] + "," + symbol.scale[1] + ")")
					}
					if(symbol.rotate || symbol.realText === "ー"){
						transform.push("rotate(90deg)")
					}
					if(transform.length){
						div.style.transform = transform.join(" ")
					}
					if(symbol.right){
						currentX = currentX + config.width / 2 - textWidth
					}else{
						currentX = currentX + config.width / 2 - textWidth / 2
					}
					if(symbol.ura){
						div.style.font = (30 / (40 * mul)) + "em Meiryo, sans-serif"
					}
					div.style.left = currentX * scale + "px"
					div.style.top = currentY * scale + "px"
					div.appendChild(document.createTextNode(text))
					div.setAttribute("alt", text)
					config.selectable.appendChild(div)
					continue
				}
				if(symbol.rotate || symbol.scale || symbol.svg || symbol.ura){
					saved = true
					ctx.save()
					
					if(symbol.rotate){
						ctx.translate(currentX + 20 * mul, currentY + 20 * mul)
						ctx.rotate(Math.PI / 2)
					}else{
						ctx.translate(currentX, currentY)
					}
					if(symbol.scale){
						ctx.scale(symbol.scale[0], symbol.scale[1])
						ctx.lineWidth = ctx.lineWidth / symbol.scale[0]
					}
					currentX = 0
					currentY = 0
				}
				if(symbol.svg){
					ctx[action](symbol.svg)
				}else{
					if(symbol.right){
						ctx.textAlign = "right"
					}else{
						ctx.textAlign = "center"
					}
					if(symbol.ura){
						ctx.font = (30 * mul) + "px Meiryo, sans-serif"
						ctx.textBaseline = "center"
						ctx.beginPath()
						ctx.arc(currentX, currentY + (17 * mul), (18 * mul), 0, Math.PI * 2)
						if(action === "stroke"){
							ctx.fillStyle = config.outline
							ctx.fill()
						}else if(action === "fill"){
							ctx.strokeStyle = config.fill
							ctx.lineWidth = 2.5 * mul
							ctx.fillText(symbol.text, currentX, currentY)
						}
						ctx.stroke()
					}else{
						ctx[action + "Text"](symbol.text, currentX, currentY)
					}
				}
				if(saved){
					ctx.restore()
				}
			}
		}
		ctx.restore()
	}
	
	layeredText(config, layers){
		var ctx = config.ctx
		var inputText = config.text
		var mul = config.fontSize / 40
		var ura = false
		var r = this.regex
		
		var matches = inputText.match(r.ura)
		if(matches){
			inputText = inputText.slice(0, matches.index)
			ura = matches[0]
		}
		var bold = this.bold(config.fontFamily)
		
		var string = inputText.split("")
		var drawn = []
		
		for(var i = 0; i < string.length; i++){
			let symbol = string[i]
			
			if(symbol === "-"){
				drawn.push({text: symbol, x: -2, y: 0, w: 28})
			}else if(symbol === "™"){
				drawn.push({text: symbol, x: -2, y: 0, w: 20, scale: [0.6, 0.5]})
			}else if(symbol === " "){
				drawn.push({text: symbol, x: 0, y: 0, w: 10})
			}else if(symbol === "'"){
				drawn.push({text: ",", x: 0, y: -15, w: 7, scale: [1, 0.7]})
			}else if(symbol === "∀"){
				if(bold){
					drawn.push({text: symbol, x: 0, y: 0, w: 40})
				}else{
					drawn.push({text: symbol, x: -3, y: 0, w: 55})
				}
			}else if(symbol === "．"){
				drawn.push({text: symbol, x: -9, y: 0, w: 37})
			}else if(r.comma.test(symbol)){
				// Comma, full stop
				if(bold){
					drawn.push({text: symbol, x: -3, y: 0, w: 13})
				}else{
					drawn.push({text: symbol, x: -3, y: 13, w: 13, scale: [1.2, 0.7]})
				}
			}else if(r.en.test(symbol)){
				// n-width
				drawn.push({text: symbol, x: 0, y: 0, w: 28})
			}else if(r.em.test(symbol)){
				// m-width
				drawn.push({text: symbol, x: 0, y: 0, w: 38})
			}else if(r.rWidth.test(symbol)){
				// r-width
				drawn.push({text: symbol, x: 0, y: 0, w: 24})
			}else if(r.lWidth.test(symbol)){
				// l-width
				drawn.push({text: symbol, x: 0, y: 0, w: 12})
			}else if(r.emCap.test(symbol)){
				// m-width uppercase
				drawn.push({text: symbol, x: 0, y: 0, w: 38})
			}else if(r.numbers.test(symbol)){
				// Numbers
				var number = this.numbersFullToHalf[symbol]
				drawn.push({text: number, x: 0, y: 0, w: 32})
			}else if(r.degree.test(symbol)){
				// Degree
				if(bold){
					drawn.push({text: symbol, x: 0, y: 0, w: 20})
				}else{
					drawn.push({text: symbol, x: 5, y: 0, w: 0})
				}
			}else if(r.uppercase.test(symbol)){
				// Latin script uppercase
				drawn.push({text: symbol, x: 0, y: 0, w: 32})
			}else if(r.exclamation.test(symbol)){
				// Exclamation mark
				var nextExclamation = string[i + 1] ? r.exclamation.test(string[i + 1]) : false
				drawn.push({
					text: symbol,
					x: nextExclamation ? 4 : -1,
					y: 0,
					w: nextExclamation ? 16 : 28
				})
			}else if(r.smallHiragana.test(symbol)){
				// Small hiragana, small katakana
				drawn.push({text: symbol, x: 0, y: 0, w: 30})
			}else if(r.hiragana.test(symbol)){
				// Hiragana, katakana
				drawn.push({text: symbol, x: 0, y: 0, w: 35})
			}else{
				drawn.push({text: symbol, x: 0, y: 0, w: 39})
			}
		}
		
		var drawnWidth = 0
		for(let symbol of drawn){
			if(config.letterSpacing){
				symbol.w += config.letterSpacing
			}
			drawnWidth += symbol.w * mul
		}
		
		ctx.save()
		ctx.translate(config.x, config.y)
		
		if(config.scale){
			ctx.scale(config.scale[0], config.scale[1])
		}
		var scaling = 1
		var width = config.width - (ura ? 55 * mul : 0)
		if(width && drawnWidth > width){
			scaling = width / drawnWidth
			ctx.scale(scaling, 1)
		}
		
		if(ura){
			// Circled ura
			drawn.push({text: "裏", x: 0, y: 3, w: 55, ura: true, scale: [1 / scaling, 1]})
		}
		
		if(config.align === "right"){
			drawn.reverse()
		}
		
		ctx.font = bold + config.fontSize + "px " + config.fontFamily
		ctx.textBaseline = config.baseline || "top"
		ctx.textAlign = "center"
		
		for(let layer of layers){
			var savedLayer = false
			var action = "strokeText"
			if(layer.scale){
				savedLayer = true
				ctx.save()
				ctx.scale(layer.scale[0], layer.scale[1])
			}
			if(layer.outline){
				ctx.strokeStyle = layer.outline
				ctx.lineJoin = "round"
				ctx.miterLimit = 1
			}
			if(layer.letterBorder){
				ctx.lineWidth = layer.letterBorder
			}
			if(layer.fill){
				ctx.fillStyle = layer.fill
				action = "fillText"
			}
			if(layer.shadow){
				if(!savedLayer){
					savedLayer = true
					ctx.save()
				}
				this.shadow({
					ctx: ctx,
					fill: "rgba(0, 0, 0, " + (1 / (layer.shadow[3] || 2)) + ")",
					blur: layer.shadow[2],
					x: layer.shadow[0],
					y: layer.shadow[1],
					force: config.forceShadow
				})
			}
			var offsetX = 0
			for(let symbol of drawn){
				var saved = false
				var currentX = offsetX + symbol.x * mul + (layer.x || 0) + symbol.w * mul / 2
				var currentY = symbol.y + (layer.y || 0)
				
				if(config.align === "center"){
					currentX -= drawnWidth / 2
				}else if(config.align === "right"){
					currentX = -offsetX + symbol.x + (layer.x || 0) - symbol.w / 2
				}
				if(symbol.scale || symbol.ura){
					saved = true
					ctx.save()
					ctx.translate(currentX, currentY)
					if(symbol.scale){
						if(config.baseline === "middle"){
							ctx.translate(0, -ctx.lineWidth * (2 / symbol.scale[1]))
						}
						ctx.scale(symbol.scale[0], symbol.scale[1])
						ctx.lineWidth /= symbol.scale[0]
					}
					currentX = 0
					currentY = 0
				}
				if(symbol.ura){
					ctx.font = (30 * mul) + "px Meiryo, sans-serif"
					ctx.textBaseline = "center"
					ctx.beginPath()
					ctx.arc(currentX, currentY + (17 * mul), (18 * mul), 0, Math.PI * 2)
					if(action === "strokeText"){
						ctx.fillStyle = layer.outline
						ctx.fill()
					}else if(action === "fillText"){
						ctx.strokeStyle = layer.fill
						ctx.lineWidth = 2.5 * mul
						ctx.fillText(symbol.text, currentX, currentY)
					}
					ctx.stroke()
				}else{
					ctx[action](symbol.text, currentX, currentY)
				}
				if(saved){
					ctx.restore()
				}
				offsetX += symbol.w * mul
			}
			if(savedLayer){
				ctx.restore()
			}
		}
		ctx.restore()
	}
	
	diffIcon(config){
		var ctx = config.ctx
		var scale = config.scale
		ctx.save()
		ctx.lineWidth = config.border
		ctx.strokeStyle = "#000"
		var icon = this.diffIconPath[config.diff === 4 ? 3 : config.diff]
		ctx.translate(config.x - icon[0].w * scale / 2, config.y - icon[0].h * scale / 2)
		ctx.scale(scale, scale)
		for(var i = 1; i < icon.length; i++){
			if(!icon[i].noStroke){
				ctx.stroke(icon[i].d)
			}
		}
		if(!config.noFill){
			for(var i = 1; i < icon.length; i++){
				if(config.diff === 4 && icon[i].fill === "#db1885"){
					ctx.fillStyle = "#7135db"
				}else{
					ctx.fillStyle = icon[i].fill
				}
				ctx.fill(icon[i].d)
			}
		}
		ctx.restore()
	}
	
	diffOptionsIcon(config){
		var ctx = config.ctx
		ctx.save()
		
		if(config.iconName === "back"){
			ctx.translate(config.x - 21, config.y - 21)
			
			var drawLine = y => {
				ctx.beginPath()
				ctx.moveTo(12, y)
				ctx.arc(20.5, 24, 8.5, Math.PI, Math.PI * 2, true)
				ctx.lineTo(29, 18)
				ctx.stroke()
			}
			var drawTriangle = noFill => {
				ctx.beginPath()
				ctx.moveTo(29, 5)
				ctx.lineTo(21, 19)
				ctx.lineTo(37, 19)
				ctx.closePath()
				if(!noFill){
					ctx.fill()
				}
			}
			ctx.strokeStyle = "#000"
			ctx.lineWidth = 13
			drawLine(8)
			ctx.lineWidth = 6
			drawTriangle(true)
			ctx.stroke()
			ctx.lineWidth = 7
			ctx.fillStyle = "#fff"
			ctx.strokeStyle = "#fff"
			drawLine(11)
			drawTriangle()
			ctx.translate(-1.5, -0.5)
			ctx.fillStyle = "#23a6e1"
			ctx.strokeStyle = "#23a6e1"
			ctx.globalCompositeOperation = "darken"
			drawLine(11)
			drawTriangle()
		}else if(config.iconName === "options"){
			ctx.translate(config.x, config.y)
			ctx.rotate(-55 * Math.PI / 180)
			ctx.translate(-6, -20)
			ctx.strokeStyle = "#000"
			ctx.lineWidth = 6
			ctx.stroke(this.optionsPath.main)
			ctx.translate(-2, 2)
			ctx.stroke(this.optionsPath.main)
			ctx.fillStyle = "#7e7c76"
			ctx.fill(this.optionsPath.shadow)
			ctx.translate(2, -2)
			ctx.fillStyle = "#d9d6ce"
			ctx.fill(this.optionsPath.main)
		}
		
		ctx.restore()
	}
	
	diffCursor(config){
		var ctx = config.ctx
		ctx.save()
		if(config.scale){
			ctx.translate(config.x, config.y)
			ctx.scale(config.scale, config.scale)
			ctx.translate(-48, -64)
		}else{
			ctx.translate(config.x - 48, config.y - 64)
		}
		
		ctx.fillStyle = config.two ? "#65cdcd" : "#ff411c"
		ctx.strokeStyle = "#000"
		ctx.lineWidth = 6
		ctx.beginPath()
		if(!config.side){
			var textX = config.two ? 22 : 20
			ctx.moveTo(48, 120)
			ctx.arc(48, 48.5, 45, Math.PI * 0.58, Math.PI * 0.42)
		}else if(config.two){
			var textX = 72
			ctx.moveTo(56, 115)
			ctx.arc(98, 48.5, 45, Math.PI * 0.75, Math.PI * 0.59)
		}else{
			var textX = -30
			ctx.moveTo(39, 115)
			ctx.arc(-2, 48.5, 45, Math.PI * 0.41, Math.PI * 0.25)
		}
		ctx.closePath()
		ctx.fill()
		ctx.stroke()
		this.layeredText({
			ctx: ctx,
			text: config.two ? "2P" : "1P",
			fontSize: 43,
			fontFamily: config.font,
			x: textX,
			y: 26,
			width: 54,
			letterSpacing: -4
		}, [
			{outline: "#fff", letterBorder: 11},
			{fill: "#000"}
		])
		
		ctx.restore()
	}
	
	diffStar(config){
		var ctx = config.ctx
		ctx.save()
		if(config.songSel || config.ura){
			if(this.diffStarCache.scale !== config.ratio){
				this.diffStarCache.resize(62, 31, config.ratio)
			}
			var offset = 30 / 2 - 18 / 2
			var big = config.ura && !config.songSel
			this.diffStarCache.get({
				ctx: ctx,
				x: config.x - 9 - offset,
				y: config.y - 9 - offset,
				w: 30,
				h: 30,
				id: big ? "big" : "small"
			}, ctx => {
				ctx.fillStyle = "#fff"
				this.shadow({
					ctx: ctx,
					fill: "#fff",
					blur: 10,
					force: true
				})
				if(big){
					ctx.translate(30 / 2 - 21 / 2, 30 / 2 - 19 / 2)
					ctx.scale(1.1, 1.1)
				}else{
					ctx.translate(offset, offset)
				}
				ctx.fill(this.diffStarPath)
			})
		}else{
			ctx.fillStyle = "#f72568"
			ctx.translate(config.x - 10.5, config.y - 9.5)
			ctx.scale(1.1, 1.1)
			ctx.fill(this.diffStarPath)
		}
		ctx.restore()
	}
	
	pattern(config){
		var ctx = config.ctx
		ctx.save()
		var mul = config.scale || 1
		
		if(mul !== 1){
			ctx.scale(1 / mul, 1 / mul)
		}
		ctx.fillStyle = ctx.createPattern(config.img, "repeat")
		if(config.shape){
			config.shape(ctx, mul)
		}else{
			ctx.beginPath()
			ctx.rect(config.x * mul, config.y * mul, config.w * mul, config.h * mul)
		}
		ctx.translate(config.dx * mul, config.dy * mul)
		ctx.fill()
		
		ctx.restore()
	}
	
	score(config){
		var ctx = config.ctx
		ctx.save()
		
		ctx.translate(config.x, config.y)
		if(config.scale){
			ctx.scale(config.scale, config.scale)
		}
		ctx.strokeStyle = "#000"
		ctx.lineWidth = 7
		if(strings.good === "良"){
			if(config.align === "center"){
				ctx.translate(config.score === "bad" ? -49 / 2 : -23 / 2, 0)
			}
			if(config.score === "good"){
				var grd = ctx.createLinearGradient(0, 0, 0, 29)
				grd.addColorStop(0.3, "#f7fb00")
				grd.addColorStop(0.9, "#ff4900")
				ctx.fillStyle = grd
				ctx.stroke(this.diffPath.good)
				ctx.fill(this.diffPath.good)
			}else if(config.score === "ok"){
				ctx.fillStyle = "#fff"
				ctx.stroke(this.diffPath.ok)
				ctx.fill(this.diffPath.ok)
			}else if(config.score === "bad"){
				var grd = ctx.createLinearGradient(0, 0, 0, 27)
				grd.addColorStop(0.1, "#6B5DFF")
				grd.addColorStop(0.7, "#00AEDE")
				ctx.fillStyle = grd
				ctx.stroke(this.diffPath.bad)
				ctx.fill(this.diffPath.bad)
				ctx.translate(26, 0)
				ctx.stroke(this.diffPath.ok)
				ctx.fill(this.diffPath.ok)
			}
		}else{
			ctx.font = this.bold(strings.font) + "26px " + strings.font
			if(config.results){
				ctx.textAlign = "left"
			}else{
				ctx.textAlign = "center"
			}
			ctx.textBaseline = "top"
			ctx.miterLimit = 1
			if(config.score === "good"){
				if(config.results && strings.id === "en"){
					ctx.scale(0.75, 1)
				}
				var grd = ctx.createLinearGradient(0, 0, 0, 29)
				grd.addColorStop(0.3, "#f7fb00")
				grd.addColorStop(0.9, "#ff4900")
				ctx.fillStyle = grd
				ctx.strokeText(strings.good, 0, 4)
				ctx.fillText(strings.good, 0, 4)
			}else if(config.score === "ok"){
				ctx.fillStyle = "#fff"
				ctx.strokeText(strings.ok, 0, 4)
				ctx.fillText(strings.ok, 0, 4)
			}else if(config.score === "bad"){
				var grd = ctx.createLinearGradient(0, 0, 0, 27)
				grd.addColorStop(0.1, "#6B5DFF")
				grd.addColorStop(0.7, "#00AEDE")
				ctx.fillStyle = grd
				ctx.strokeText(strings.bad, 0, 4)
				ctx.fillText(strings.bad, 0, 4)
			}
		}
		ctx.restore()
	}
	
	crown(config){
		var ctx = config.ctx
		ctx.save()
		
		ctx.translate(config.x, config.y)
		if(config.scale){
			ctx.scale(config.scale, config.scale)
		}
		ctx.translate(-47, -39)
		ctx.miterLimit = 1.7
		
		if(!this.crownCache.w){
			this.crownCache.resize(140, 140, config.ratio)
		}
		var offset = 140 / 2 - 94 / 2
		this.crownCache.get({
			ctx: ctx,
			x: -offset,
			y: -offset,
			w: 140,
			h: 140,
			id: "crown"
		}, ctx => {
			ctx.save()
			ctx.translate(offset, offset)
			ctx.strokeStyle = "#fff"
			ctx.lineWidth = 35
			ctx.miterLimit = 1.7
			ctx.filter = "blur(1.5px)"
			ctx.stroke(this.crownPath)
			ctx.restore()
		})
		
		if(config.shine){
			ctx.strokeStyle = "#fff"
			ctx.lineWidth = 18
			ctx.stroke(this.crownPath)
			ctx.globalAlpha = 1 - config.shine
		}
		
		ctx.strokeStyle = "#000"
		ctx.lineWidth = 18
		ctx.stroke(this.crownPath)
		
		if(config.shine){
			ctx.globalAlpha = 1
			ctx.fillStyle = "#fff"
			ctx.fill(this.crownPath)
			ctx.globalAlpha = 1 - config.shine
		}
		
		var grd = ctx.createLinearGradient(0, 0, 94, 0)
		if(config.type === "gold"){
			grd.addColorStop(0, "#ffffc5")
			grd.addColorStop(0.23, "#ffff44")
			grd.addColorStop(0.53, "#efbd12")
			grd.addColorStop(0.83, "#ffff44")
			grd.addColorStop(1, "#efbd12")
		}else if(config.type === "silver"){
			grd.addColorStop(0, "#d6efef")
			grd.addColorStop(0.23, "#bddfde")
			grd.addColorStop(0.53, "#97c1c0")
			grd.addColorStop(0.83, "#bddfde")
			grd.addColorStop(1, "#97c1c0")
		}
		ctx.fillStyle = grd
		ctx.fill(this.crownPath)
		
		ctx.restore()
	}
	
	gauge(config){
		var ctx = config.ctx
		ctx.save()
		
		ctx.translate(config.x, config.y)
		if(config.scale){
			ctx.scale(config.scale, config.scale)
		}
		ctx.translate(-788, 0)
		
		var firstTop = config.multiplayer ? 0 : 30
		var secondTop = config.multiplayer ? 0 : 8
		
		var cleared = config.percentage - 1 / 50 >= config.clear
		
		var gaugeW = 14 * 50
		var gaugeClear = gaugeW * config.clear
		var gaugeFilled = gaugeW * config.percentage
		
		ctx.fillStyle = "#000"
		ctx.beginPath()
		if(config.scoresheet){
			ctx.moveTo(-4, 26)
			ctx.lineTo(gaugeClear - 4, 26)
			this.roundedCorner(ctx, gaugeClear - 4, 4, 13, 0)
			this.roundedCorner(ctx, 760, 4, 13, 1)
			ctx.lineTo(760, 56)
			ctx.lineTo(-4, 56)
		}else if(config.multiplayer){
			ctx.moveTo(gaugeClear - 7, 27)
			ctx.lineTo(788, 27)
			ctx.lineTo(788, 52)
			this.roundedCorner(ctx, gaugeClear - 7, 52, 18, 3)
		}else{
			ctx.moveTo(gaugeClear - 7, 24)
			this.roundedCorner(ctx, gaugeClear - 7, 0, 18, 0)
			ctx.lineTo(788, 0)
			ctx.lineTo(788, 24)
		}
		ctx.fill()
		
		if(gaugeFilled <= gaugeClear){
			ctx.fillStyle = config.blue ? "#184d55" : "#680000"
			var x = Math.max(0, gaugeFilled - 5)
			ctx.fillRect(x, firstTop, gaugeClear - x + 2, 22)
		}
		if(gaugeFilled > 0){
			var w = Math.min(gaugeClear + 1, gaugeFilled - 4)
			ctx.fillStyle = config.blue ? "#00edff" : "#ff3408"
			ctx.fillRect(0, firstTop + 2, w, 20)
			ctx.fillStyle = config.blue ? "#9cffff" : "#ffa191"
			ctx.fillRect(0, firstTop, w, 3)
		}
		if(gaugeFilled < gaugeW - 4){
			ctx.fillStyle = "#684900"
			var x = Math.max(gaugeClear + 9, gaugeFilled - gaugeClear + 9)
			ctx.fillRect(x, secondTop, gaugeW - 4 - x, 44)
		}
		if(gaugeFilled > gaugeClear + 14){
			var w = Math.min(gaugeW - 4, gaugeFilled - gaugeClear - 14)
			ctx.fillStyle = "#ff0"
			ctx.fillRect(gaugeClear + 9, secondTop + 2, w, 42)
			ctx.fillStyle = "#fff"
			ctx.fillRect(gaugeClear + 9, secondTop, w, 3)
		}
		ctx.fillStyle = cleared ? "#ff0" : "#684900"
		ctx.beginPath()
		if(config.multiplayer){
			this.roundedCorner(ctx, gaugeClear, secondTop + 44, 10, 3)
			ctx.lineTo(gaugeClear, secondTop)
			ctx.lineTo(gaugeClear + 10, secondTop)
		}else{
			ctx.moveTo(gaugeClear, secondTop + 44)
			this.roundedCorner(ctx, gaugeClear, secondTop, 10, 0)
			ctx.lineTo(gaugeClear + 10, secondTop + 44)
		}
		ctx.fill()
		if(cleared){
			ctx.save()
			ctx.clip()
			ctx.fillStyle = "#fff"
			ctx.fillRect(gaugeClear, secondTop, 10, 3)
			ctx.restore()
		}
		
		ctx.strokeStyle = "rgba(0, 0, 0, 0.16)"
		ctx.beginPath()
		ctx.lineWidth = 5
		for(var i = 0; i < 49; i++){
			var x = 14 + i * 14 - ctx.lineWidth / 2
			if(i === 26){
				ctx.stroke()
				ctx.beginPath()
				ctx.lineWidth = 4
			}
			ctx.moveTo(x, x < gaugeClear ? firstTop : secondTop)
			ctx.lineTo(x, x < gaugeClear ? firstTop + 22 : secondTop + 44)
		}
		ctx.stroke()
		this.layeredText({
			ctx: ctx,
			text: strings.clear,
			fontSize: 18,
			fontFamily: config.font,
			x: gaugeClear + 3,
			y: config.multiplayer ? 22 : 11,
			letterSpacing: -2
		}, [
			{scale: [1.1, 1.01], outline: "#000", letterBorder: 6},
			{scale: [1.11, 1], fill: cleared ? "#fff" : "#737373"}
		])
		
		ctx.restore()
	}
	
	soul(config){
		var ctx = config.ctx
		ctx.save()
		
		ctx.translate(config.x, config.y)
		if(config.scale){
			ctx.scale(config.scale, config.scale)
		}
		ctx.translate(-23, -21)
		
		ctx.fillStyle = config.cleared ? "#fff" : "#737373"
		ctx.fill(this.soulPath)
		
		ctx.restore()
	}
	
	slot(ctx, x, y, size){
		var mul = size / 106
		
		ctx.save()
		ctx.globalAlpha = 0.7
		ctx.globalCompositeOperation = "screen"
		ctx.fillStyle = "#444544"
		ctx.beginPath()
		ctx.arc(x, y, 26 * mul, 0, Math.PI * 2)
		ctx.fill()
		ctx.lineWidth = 3
		ctx.strokeStyle = "#9c9e9c"
		ctx.beginPath()
		ctx.arc(x, y, 33.5 * mul, 0, Math.PI * 2)
		ctx.stroke()
		ctx.lineWidth = 3.5
		ctx.strokeStyle = "#5d5e5d"
		ctx.beginPath()
		ctx.arc(x, y, 51.5 * mul, 0, Math.PI * 2)
		ctx.stroke()
		ctx.restore()
	}
	
	alpha(amount, ctx, callback){
		if(amount >= 1){
			return callback(ctx)
		}else if(amount >= 0){
			this.tmpCanvas.width = ctx.canvas.width
			this.tmpCanvas.height = ctx.canvas.height
			callback(this.tmpCtx)
			ctx.save()
			ctx.globalAlpha = amount
			ctx.drawImage(this.tmpCanvas, 0, 0)
			ctx.restore()
		}
	}
	
	shadow(config){
		if(!disableBlur || config.force){
			var ctx = config.ctx
			if(config.fill){
				ctx.shadowColor = config.fill
			}
			if(config.blur){
				ctx.shadowBlur = config.blur
			}
			if(config.x){
				ctx.shadowOffsetX = config.x
			}
			if(config.y){
				ctx.shadowOffsetY = config.y
			}
		}
	}
	
	bold(font){
		return font === "Microsoft YaHei, sans-serif" ? "bold " : ""
	}
	
	getMS(){
		return Date.now()
	}
	
	clean(){
		this.songFrameCache.clean()
		this.diffStarCache.clean()
		this.crownCache.clean()
		delete this.tmpCtx
		delete this.tmpCanvas
	}
}
