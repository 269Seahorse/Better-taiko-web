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
		
		this.regex = {
			comma: /[,.]/,
			ideographicComma: /[、。]/,
			apostrophe: /['＇]/,
			brackets: /[\(（\)）「」『』]/,
			tilde: /[\-－~～]/,
			tall: /[bｂdｄfｆh-lｈ-ｌtｔ0-9０-９♪]/,
			uppercase: /[A-ZＡ-Ｚ!！]/,
			lowercase: /[a-zａ-ｚ･]/,
			latin: /[A-ZＡ-Ｚ!！a-zａ-ｚ･]/,
			smallHiragana: /[ぁぃぅぇぉっゃゅょァィゥェォッャュョ]/,
			hiragana: /[\u3040-\u30ff]/,
			todo: /[トド]/,
			en: /[ceghknsuxyzｃｅｇｈｋｎｓｕｘｙｚ]/,
			em: /[mwｍｗ]/,
			emCap: /[MWＭＷ]/,
			rWidth: /[abdfIjo-rtvａｂｄｆＩｊｏ-ｒｔｖ]/,
			lWidth: /[ilｉｌ!！]/,
			uppercaseDigit: /[A-ZＡ-Ｚ0-9０-９]/
		}
		
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
		ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
		ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, 0)
		ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2)
		ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI)
		ctx.lineTo(x, y + r)
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
		
		ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
		ctx.shadowBlur = 10
		ctx.shadowOffsetX = 5
		ctx.shadowOffsetY = 5
		ctx.fillStyle = "#000"
		ctx.fillRect(x, y, w, h)
		
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
		var rect = () => {
			if(config.radius){
				this.roundedRect({
					ctx: ctx,
					x: _x,
					y: _y,
					w: _w,
					h: _h,
					radius: config.radius
				})
				ctx.stroke()
			}else{
				ctx.strokeRect(_x, _y, _w, _h)
			}
		}
		if(config.animate){
			ctx.globalAlpha = this.fade((this.getMS() - config.animateMS) % 2000 / 2000)
		}else if(config.opacity){
			ctx.globalAlpha = config.opacity
		}
		ctx.strokeStyle = "rgba(255, 249, 1, 0.45)"
		ctx.lineWidth = 14
		rect()
		ctx.strokeStyle = "rgba(255, 249, 1, .8)"
		ctx.lineWidth = 8
		rect()
		ctx.strokeStyle = "#fff"
		ctx.lineWidth = 6
		rect()
		
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
	
	verticalText(config){
		var ctx = config.ctx
		var inputText = config.text
		var mul = config.fontSize / 40
		var ura = false
		
		if(inputText.endsWith(" (裏)")){
			inputText = inputText.slice(0, -4)
			ura = true
		}else if(inputText.endsWith("(裏)")){
			inputText = inputText.slice(0, -3)
			ura = true
		}
		var string = inputText.split("")
		var drawn = []
		
		var r = this.regex
		for(let symbol of string){
			if(symbol === " "){
				// Space
				drawn.push({text: symbol, x: 0, y: 0, h: 18})
			}else if(symbol === "ー"){
				// Long-vowel mark
				drawn.push({svg: this.longVowelMark, x: -4, y: 5, h: 33, scale: [mul, mul]})
			}else if(r.comma.test(symbol)){
				// Comma, full stop
				drawn.push({text: symbol, x: 16, y: -7, h: 0, scale: [1.2, 0.7]})
			}else if(r.ideographicComma.test(symbol)){
				// Ideographic comma, full stop
				drawn.push({text: symbol, x: 16, y: -16, h: 18})
			}else if(r.apostrophe.test(symbol)){
				// Apostrophe
				drawn.push({text: ",", x: 20, y: -39, h: 0, scale: [1.2, 0.7]})
			}else if(r.brackets.test(symbol)){
				// Rotated brackets
				drawn.push({text: symbol, x: 0, y: -5, h: 25, rotate: true})
			}else if(r.tilde.test(symbol)){
				// Rotated hyphen, tilde
				if(symbol === "~"){
					symbol = "~"
				}
				drawn.push({text: symbol, x: 0, y: 2, h: 35, rotate: true})
			}else if(r.tall.test(symbol)){
				// Tall latin script lowercase, numbers
				drawn.push({text: symbol, x: 0, y: 4, h: 34, scale: [1.05, 0.9]})
			}else if(r.uppercase.test(symbol)){
				// Latin script upper case
				drawn.push({text: symbol, x: 0, y: 8, h: 37})
			}else if(r.lowercase.test(symbol)){
				// Latin script lower case
				drawn.push({text: symbol, x: 0, y: -1, h: 28, scale: [1.05, 0.9]})
			}else if(r.smallHiragana.test(symbol)){
				// Small hiragana, small katakana
				drawn.push({text: symbol, x: 0, y: -8, h: 25, right: true})
			}else if(r.hiragana.test(symbol)){
				// Hiragana, katakana
				drawn.push({text: symbol, x: 0, y: 5, h: 38, right: r.todo.test(symbol)})
			}else{
				// Kanji, other
				drawn.push({text: symbol, x: 0, y: 3, h: 39, right: true})
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
		
		var scale = 1
		if(config.height){
			var height = config.height - (ura ? 52 * mul : 0)
			if(drawnHeight > height){
				scale = height / drawnHeight
				ctx.scale(1, scale)
			}
		}
		
		if(ura){
			// Circled ura
			drawn.push({text: "裏", x: 0, y: 18, h: 52, ura: true, scale: [1, 1 / scale]})
		}
		
		var actions = []
		if(config.outline){
			actions.push("stroke")
		}
		if(config.fill){
			actions.push("fill")
		}
		for(let action of actions){
			ctx.font = config.fontSize + "px " + config.fontFamily
			ctx.textBaseline = "top"
			if(action === "stroke"){
				ctx.strokeStyle = config.outline
				ctx.lineWidth = config.outlineSize * mul
				ctx.lineJoin = "round"
				ctx.miterLimit = 1
			}else if(action === "fill"){
				ctx.fillStyle = config.fill
			}
			var offsetY = 0
			
			for(let symbol of drawn){
				var saved = false
				var currentX = symbol.x
				if(symbol.right){
					currentX += 20 * mul
				}
				var currentY = offsetY + symbol.y * mul
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
						ctx.font = (30 * mul) + "px Meiryo"
						ctx.textBaseline = "center"
						ctx.beginPath()
						ctx.arc(currentX, currentY + (21.5 * mul), (18 * mul), 0, Math.PI * 2)
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
				offsetY += symbol.h * mul
				if(saved){
					ctx.restore()
				}
			}
		}
		ctx.restore()
	}
	
	layeredText(config, layers){
		var ctx = config.ctx
		var mul = config.fontSize / 40
		ctx.save()
		
		var string = config.text.split("")
		if(config.align === "right"){
			string.reverse()
		}
		var drawn = []
		
		var r = this.regex
		for(let symbol of string){
			if(symbol === "-"){
				drawn.push({text: symbol, x: -4, y: 0, w: 28, scale: [0.8, 1]})
			}else if(symbol === "™"){
				drawn.push({text: symbol, x: -2, y: 0, w: 20, scale: [0.6, 0.5]})
			}else if(symbol === " "){
				drawn.push({text: symbol, x: 0, y: 0, w: 10})
			}else if(r.en.test(symbol)){
				// n-width
				drawn.push({text: symbol, x: 0, y: 0, w: 28, scale: [1, 0.95]})
			}else if(r.em.test(symbol)){
				// m-width
				drawn.push({text: symbol, x: 0, y: 0, w: 38, scale: [1, 0.95]})
			}else if(r.rWidth.test(symbol)){
				// r-width
				drawn.push({text: symbol, x: 0, y: 0, w: 24, scale: [1, 0.95]})
			}else if(r.lWidth.test(symbol)){
				// l-width
				drawn.push({text: symbol, x: 0, y: -1, w: 12, scale: [1, 0.95]})
			}else if(r.emCap.test(symbol)){
				// m-width uppercase
				drawn.push({text: symbol, x: 0, y: -2, w: 38})
			}else if(r.uppercaseDigit.test(symbol)){
				// Latin script uppercase, digits
				drawn.push({text: symbol, x: 0, y: -2, w: 32})
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
			drawnWidth += symbol.w
		}
		
		ctx.translate(config.x, config.y)
		var scale = 1
		if(config.width && drawnWidth > config.width){
			scale = config.width / drawnWidth
			ctx.scale(scale, 1)
		}
		ctx.font = config.fontSize + "px " + config.fontFamily
		ctx.textBaseline = "top"
		ctx.textAlign = "center"
		
		for(let layer of layers){
			var action = "strokeText"
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
				ctx.save()
				ctx.shadowOffsetX = layer.shadow[0]
				ctx.shadowOffsetY = layer.shadow[1]
				ctx.shadowBlur = layer.shadow[2]
				ctx.shadowColor = "rgba(0, 0, 0, " + (1 / (layer.shadow[3] || 2)) + ")"
			}
			var offsetX = 0
			for(let symbol of drawn){
				var saved = false
				var currentX = offsetX + symbol.x + (layer.x || 0) + symbol.w / 2
				var currentY = symbol.y + (layer.y || 0)
				var isLatin = r.latin.test(symbol.text)
				
				if(config.align === "center"){
					currentX -= drawnWidth / 2
				}else if(config.align === "right"){
					currentX = -offsetX + symbol.x + (layer.x || 0) - symbol.w / 2
				}
				if(symbol.scale || isLatin){
					saved = true
					ctx.save()
					ctx.translate(currentX, currentY)
					if(symbol.scale){
						ctx.scale(symbol.scale[0], symbol.scale[1])
						ctx.lineWidth /= symbol.scale[0]
					}
					currentX = 0
					currentY = 0
				}
				if(isLatin){
					if(action === "strokeText"){
						ctx.lineWidth *= 1.05
						ctx.strokeText(symbol.text, currentX, currentY)
					}else{
						ctx.lineWidth *= 0.05
						ctx.strokeStyle = ctx.fillStyle
						ctx.strokeText(symbol.text, currentX, currentY)
					}
				}
				ctx[action](symbol.text, currentX, currentY)
				if(saved){
					ctx.restore()
				}
				offsetX += symbol.w * mul
			}
			if(layer.shadow){
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
		var icon = this.diffIconPath[config.diff]
		ctx.translate(config.x - icon[0].w * scale / 2, config.y - icon[0].h * scale / 2)
		ctx.scale(scale, scale)
		for(var i = 1; i < icon.length; i++){
			if(!icon[i].noStroke){
				ctx.stroke(icon[i].d)
			}
		}
		if(!config.noFill){
			for(var i = 1; i < icon.length; i++){
				ctx.fillStyle = icon[i].fill
				ctx.fill(icon[i].d)
			}
		}
		ctx.restore()
	}
	
	diffOptionsIcon(config){
		var ctx = config.ctx
		ctx.save()
		ctx.translate(config.x - 21, config.y - 21)
		
		var drawLine = y => {
			ctx.beginPath()
			ctx.moveTo(12, y)
			ctx.arc(20.5, 25, 8.5, Math.PI, Math.PI * 2, true)
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
		ctx.lineWidth = 12
		drawLine(9)
		ctx.lineWidth = 5
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
			var textX = config.two ? 20 : 17
			ctx.moveTo(48, 120)
			ctx.arc(48, 48.5, 45, Math.PI * 0.58, Math.PI * 0.42)
		}else if(config.two){
			var textX = 70
			ctx.moveTo(56, 115)
			ctx.arc(98, 48.5, 45, Math.PI * 0.75, Math.PI * 0.59)
		}else{
			var textX = -33
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
		ctx.fillStyle = config.songSel ? "#fff" : "#f72568"
		if(config.songSel){
			ctx.shadowColor = "#fff"
			ctx.shadowBlur = 10
			ctx.translate(config.x - 9, config.y - 9)
		}else{
			ctx.translate(config.x - 10.5, config.y - 9.5)
			ctx.scale(1.1, 1.1)
		}
		ctx.fill(this.diffStarPath)
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
		ctx.beginPath()
		ctx.rect(config.x * mul, config.y * mul, config.w * mul, config.h * mul)
		ctx.translate(config.dx, config.dy)
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
		
		ctx.save()
		ctx.strokeStyle = "#fff"
		ctx.lineWidth = 35
		ctx.filter = "blur(1.5px)"
		ctx.stroke(this.crownPath)
		ctx.restore()
		
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
	
	getMS(){
		return +new Date
	}
}
