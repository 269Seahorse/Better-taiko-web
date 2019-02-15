class Logo{
	constructor(){
		this.canvas = document.getElementById("logo")
		this.ctx = this.canvas.getContext("2d")
		this.pathSvg = failedTests.indexOf("Path2D SVG") === -1 && vectors.logo1
		this.symbolFont = "TnT, Meiryo, sans-serif"
		this.symbols = [{
			x: 315, y: 18, xAlt: 15, scale: true, text: "ブ",
			path: new Path2D(vectors.logo5)
		}, {
			x: 267, y: 50, yAlt: -34, scale: true, text: "ェ",
			path: new Path2D(vectors.logo4)
		}, {
			x: 197, y: 7, xAlt: 15, scale: true, text: "ウ",
			path: new Path2D(vectors.logo3)
		}, {
			x: 87, y: 7, xAlt: 15, text: "鼓",
			path: new Path2D(vectors.logo2),
			shadow: new Path2D(vectors.logo2Shadow)
		}, {
			x: 22, y: 16, xAlt: 10, scaleAlt: true, text: "太",
			path: new Path2D(vectors.logo1)
		}]
		pageEvents.add(window, "resize", this.update.bind(this))
	}
	updateSubtitle(){
		this.subtitleGradient = ["#df600d", "#d8446f", "#b2147b", "#428ac2", "#1f9099"]
		this.subtitle = []
		this.subtitleW = 0
		var index = 0
		var latinLowercase = /[a-z]/
		for(var i = 0; i < strings.taikoWeb.length; i++){
			var letter = strings.taikoWeb[i]
			var width = 57
			if(letter === "ェ"){
				width = 40
			}else if(letter === " "){
				width = 20
			}else if(letter === "i"){
				width = 22
			}else if(letter === "T"){
				width = 30
			}else if(latinLowercase.test(letter)){
				width = 38
			}
			this.subtitle.push({
				letter: letter,
				x: this.subtitleW + width / 2,
				index: letter === " " ? index : index++
			})
			this.subtitleW += width
		}
		this.update()
	}
	update(){
		var ctx = this.ctx
		ctx.save()
		
		this.width = 1170
		this.height = 390
		var pixelRatio = window.devicePixelRatio || 1
		var winW = this.canvas.offsetWidth * pixelRatio
		var winH = this.canvas.offsetHeight * pixelRatio
		this.canvas.width = winW
		this.canvas.height = winH
		ctx.scale(winW / this.width, winH / this.height)
		
		ctx.lineJoin = "round"
		ctx.miterLimit = 1
		ctx.textBaseline = "top"
		ctx.textAlign = "center"
		if(!this.pathSvg){
			ctx.font = "100px " + this.symbolFont
		}
		
		for(var i = 0; i < this.symbols.length; i++){
			ctx.strokeStyle = "#3f0406"
			ctx.lineWidth = 13.5
			this.drawSymbol(this.symbols[i], "stroke", 4)
		}
		ctx.font = this.bold(strings.font) + "55px " + strings.font
		this.subtitleIterate((letter, x) => {
			ctx.lineWidth = strings.id === "en" ? 19 : 18.5
			ctx.strokeStyle = "#3f0406"
			ctx.strokeText(letter, x, 315)
		})
		if(this.pathSvg){
			ctx.fillStyle = "#3f0406"
			ctx.fillRect(400, 180, 30, 50)
		}else{
			ctx.font = "100px " + this.symbolFont
		}
		for(var i = 0; i < this.symbols.length; i++){
			var symbol = this.symbols[i]
			ctx.strokeStyle = "#7c361e"
			ctx.lineWidth = 13.5
			this.drawSymbol(symbol, "stroke")
			ctx.strokeStyle = "#fff"
			ctx.lineWidth = 7.5
			this.drawSymbol(symbol, "stroke")
			if(this.pathSvg){
				var grd = ctx.createLinearGradient(0, 55 - symbol.y, 0, 95 - symbol.y)
				grd.addColorStop(0, "#a41f1e")
				grd.addColorStop(1, "#a86a29")
				ctx.fillStyle = grd
				this.drawSymbol(symbol, "fill")
				ctx.save()
				ctx.scale(symbol.scale ? 2.8 : 3.2, 3.2)
				ctx.translate(symbol.x, symbol.y)
				ctx.clip(symbol.path)
			}
			grd = ctx.createLinearGradient(0, 55 - symbol.y, 0, 95 - symbol.y)
			grd.addColorStop(0, "#d80e11")
			grd.addColorStop(1, "#e08f19")
			ctx.fillStyle = grd
			if(this.pathSvg){
				ctx.translate(3, 2)
				ctx.fill(symbol.shadow || symbol.path)
				ctx.restore()
			}else{
				this.drawSymbol(symbol, "fill")
			}
		}
		if(this.pathSvg){
			ctx.fillStyle = "#fff"
			ctx.fillRect(382, 85, 30, 15)
			ctx.fillRect(402, 145, 15, 15)
		}else{
			ctx.font = this.bold(strings.font) + "55px " + strings.font
		}
		
		this.subtitleIterate((letter, x) => {
			ctx.lineWidth = strings.id === "en" ? 19 : 18.5
			ctx.strokeStyle = "#7c361e"
			ctx.strokeText(letter, x, 305)
		})
		this.subtitleIterate((letter, x, i) => {
			ctx.lineWidth = strings.id === "en" ? 11 : 9.5
			ctx.strokeStyle = this.getSubtitleGradient(i)
			ctx.fillStyle = "#fff"
			ctx.strokeText(letter, x, 305)
			ctx.fillText(letter, x, 305)
		})
		
		ctx.restore()
	}
	drawSymbol(symbol, action, y){
		var ctx = this.ctx
		ctx.save()
		ctx.scale((symbol.scale || !this.pathSvg && symbol.scaleAlt) ? 2.8 : 3.2, 3.2)
		ctx.translate(symbol.x, symbol.y + (y || 0))
		if(this.pathSvg){
			ctx[action](symbol.path)
		}else{
			ctx[action + "Text"](symbol.text, 30 + (symbol.xAlt || 0), -4 + (symbol.yAlt || 0))
		}
		ctx.restore()
	}
	subtitleIterate(func){
		for(var i = this.subtitle.length; i--;){
			var subtitleObj = this.subtitle[i]
			var x = (this.width - this.subtitleW) / 2 + subtitleObj.x
			func(subtitleObj.letter, x, subtitleObj.index)
		}
	}
	getSubtitleGradient(index){
		var sign = 1
		var position = 0
		var length = this.subtitleGradient.length - 1
		while(index >= 0){
			if(sign === 1){
				position = index % length
			}else{
				position = length - (index % length)
			}
			sign *= -1
			index -= length
		}
		return this.subtitleGradient[position]
	}
	bold(font){
		return font === "Microsoft YaHei, sans-serif" ? "bold " : ""
	}
	clean(){
		pageEvents.remove(window, "resize")
		delete this.symbols
		delete this.ctx
		delete this.canvas
	}
}
