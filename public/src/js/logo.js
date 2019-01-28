class Logo{
	constructor(){
		this.canvas = document.getElementById("logo")
		this.ctx = this.canvas.getContext("2d")
		this.symbols = [{
			x: 315, y: 18, scale: true,
			path: new Path2D("m52 6c11 0 18 4 24 13 7 10 4 23-2 32C61 71 52 83 46 87 40 91 32 91 23 87 21 86 17 83 13 81 9 78 13 76 17 76 29 75 37 68 43 60 53 48 59 39 64 28 67 21 62 16 56 20 44 27 35 37 22 40 13 42 0 36 0 28 0 26 1 25 3 24 6 23 8 27 12 25 32 15 38 6 52 6Zm43 5c2 7-5 9-8 4-1-2-2-5-3-7-1-3-3-3-4-1 2 4 4 10 0 12-5 2-7-4-8-7-1-3-2-5-4-6-2 0-2-3 0-4 2-1 6 0 8 1 9-7 17 1 19 8z")
		}, {
			x: 267, y: 50, scale: true,
			path: new Path2D("m53 5c2 2 1 10-6 8-7-4-12 0-17 2 1 2 2 7 2 11v9c8-3 20 1 24 7 2 3 2 6-1 9-5 3-6 1-10-2C41 46 36 45 29 48 23 50 16 54 10 54 6 54 0 50 0 46 0 37 10 33 19 32 18 27 19 24 18 19 10 19 9 19 5 17-1 14 1 9 5 10 7 11 8 10 11 9L23 4C33-1 45-2 53 5ZM18 41C15 40 7 40 6 43c-1 5 6 2 12-2z")
		}, {
			x: 197, y: 7, scale: true,
			path: new Path2D("m31 0c6 0 10 1 13 3 3 2 5 6 4 10 19-9 28 2 32 7 6 7 7 18-1 35-8 19-23 35-38 35-6 0-11-2-16-5-3-2-8-4-8-7 0-4 5 1 19-6 11-5 27-26 32-37 6-11 1-15-6-10-7 4-14 11-25 15-7 3-14 1-17 0-1 5 0 7 0 13 3 7 1 12-6 12C3 65 3 50 3 46 3 35 8 31 5 30 0 28-1 25 1 22c2-3 5-3 9-1 5 2 6 3 8 7 4-2 9-4 11-7V11C29 8 24 10 24 6 24 0 30 0 31 0Z")
		}, {
			x: 87, y: 7,
			path: new Path2D("m51 48c1-4-5-3-6-6-1-2 1-8 3-6 1 1 2 1 12-1 15-2 5-6 17-4 3 3 7 5 7 6 0 2-2 3-3 5-2 6-3 10-10 16 3 3 6 8 10 13 5 6 5 5 5 7 0 2 3 2 0 4-1 1-2 1-3 2-1 1-2 1-6-1-3-1-9-8-11-11-1-1-2 0-3 1-1 1-3 1-4 2-1 1 0-2-7 1 11 2 5 6-2 7-3-1-7 0-13 0-9 1-14 4-21 5-2 2-4 2-8 0-1-6-6-7-5-9 3 2 8 1 12-1-2-3-4-6-4-9 0-3 0-2 4 0 4 1 4 4 7 3 2 0 1 2 2 5 6 0 7-1 7-4 0-3 1-4 0-11-1-3 4-1 6 2 2 2 4 4 5 7 1 1 2-1 8-4 4-1 8-3 7-6-6-7-7-9-6-13zm11 4c1 1 1 0 2-2 1-2 3-6 1-5-4 1-5 1-10 2 3 2 5 3 7 5zM43 15c4 0 9 1 17-1 9-1-1-9 5-13 3 0 4 4 6 5 5 3 1 7 6 8 1 0 3 2 3 3-2 3-3 3-4 4-1 3-3 1-4 4-1 3-2 4-4 5-1 1-2 0-3 1-5 1-1-5-5-5-3 0-4 1-7 0-3-2-5-2-6-3-1 0-3-2-4-3 0-1-3-1 0-5zM24 56c2 0 6 1 4-2-1-1-1-1-2-4-1-2-1-3-2-3-2 0-3 1-2 4 1 5 0 5 2 5zM13 44c0-2 0-3-1-4 4 1 6 4 9 2 1-1 3-1 4-2 2-2 2 0 4-2 3 1 6 3 8 5 2 1-1 2 0 5 0 2-2 7-3 8 0 3-3 3-8 7-4 2-4 5-7 4-1 0-4-2-6-3-5-2-4-5-3-6 1-1 1-1 5 0 4 0 0-1-1-5-1-2-2-5-1-9zM18 21C12 23 13 24 9 21 7 19 7 16 6 14 4 11 4 12 5 10 6 8 5 6 7 8c1 1 4 3 5 3 2 0 9-1 9-8 0-2 0-3 1-3 2 0 2 1 3 2 2 2 2 2 3 4 2 4 5 0 9 2 2 2 3 2 4 4 1 1 1 3-1 4-2 2-4 3-6 2-2-1-2-1-3 2 0 2-1 3-2 8 4 0 6 1 7-2 2 1 3 1 4 1 1 1 3 2 5 3 1 2 1 3 0 5-2 1-4 1-8 1-6 1-23 2-28 5-2 1-3 1-4 1 0-1 1-2 0-3-3-2-5-6-5-8 2 1 3 2 5 2 3-1 11-2 16-3-1-2-1-6-3-9z"),
			shadow: new Path2D("m51 48c1-4-5-3-6-6-1-2 1-8 3-6 1 1 2 1 12-1 15-2 5-6 17-4 3 3 7 5 7 6 0 2-2 3-3 5-2 6-3 10-10 16 3 3 6 8 10 13 5 6 5 5 5 7 0 2 3 2 0 4-1 1-2 1-3 2-1 1-2 1-6-1-3-1-9-8-11-11-1-1-2 0-3 1-1 1-3 1-4 2-1 1 0-2-7 1 11 2 5 6-2 7-3-1-7 0-13 0-9 1-14 4-21 5-2 2-4 2-8 0-1-6-6-7-5-9 3 2 8 1 12-1-2-3-4-6-4-9 0-3 0-2 4 0 4 1 4 4 7 3 2 0 1 2 2 5 6 0 7-1 7-4 0-3 1-4 0-11-1-3 4-1 6 2 2 2 4 4 5 7 1 1 2-1 8-4 4-1 8-3 7-6-6-7-7-9-6-13zm11 4c1 1 1 0 2-2 1-2 3-6 1-5-4 1-5 1-10 2 3 2 5 3 7 5zM43 15c4 0 9 1 17-1 9-1-1-9 5-13 3 0 4 4 6 5 5 3 1 7 6 8l3 3-17 14c-2-1 0-5-3-5-3 0-4 1-7 0-3-2-5-2-6-3-1 0-3-2-4-3 0-1-3-1 0-5zM24 56c2 0 6 1 4-2-1-1-1-1-2-4-1-2-1-3-2-3-2 0-3 1-2 4 1 5 0 5 2 5zM13 44c0-2 0-3-1-4 4 1 6 4 9 2 1-1 3-1 4-2 2-2 2 0 4-2 3 1 5 2 7 4L35 53 18 66 13 64c-5-2-4-5-3-6 1-1 1-1 5 0 4 0 0-1-1-5-1-2-2-5-1-9zM18 21C12 23 13 24 9 21 7 19 7 16 6 14 4 11 4 12 5 10 6 8 5 6 7 8c1 1 4 3 5 3 2 0 9-1 9-8 0-2 0-3 1-3 2 0 2 1 3 2 2 2 2 2 3 4 2 4 5 0 9 2l4 3-10 9c0 2-1 3-2 8 4 0 6 1 7-2 2 1 3 1 4 1 1 1 3 2 5 3L42 34 26 36 9 38 5 42C5 41 6 40 5 39 2 37 0 33 0 31c2 1 3 2 5 2 3-1 11-2 16-3-1-2-1-6-3-9z")
		}, {
			x: 22, y: 16,
			path: new Path2D("M0 83C11 65 5 65 16 43 6 45 9 43 6 39 3 37 1 37 1 34c1-5 2-4 2-7 4 2 6 3 9 2 9-3 10 1 13-9 1-4 0 0 4-11 2-4 1-9 3-9 3 1 6 5 8 8 1 2 4 4 5 6 2 4-2 2-3 10 10 0 9-4 12-4 2 0 4 2 7 4 4 3 8 4 9 6 1 3-3 8-6 9-4 1-1-3-17 0 0 1 0 1 1 3 5 12 10 20 14 30 2 6 2 4 6 6 2 1 3 1 2 3-2 3 1 3-1 5-2 1-3 2-5 4-6 2-9 0-12-4-3-8-4-8-5-12-3-5-4-9-8-17-4-5-2-8-7-14-1-2-3 4-4 6 0 3-2 6-4 9-1 2 2 1 4 3 1 1 3 2 4 4l5 5c2 2 2 2 2 4 0 2-2 4-5 3 0 3 2 8 1 8-5 0-10-7-15-18-3 3-1 4-2 6-2 5-5 11-4 13 2 3-1 6-4 6C4 91 7 89 0 83Z")
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
		ctx.font = this.bold(strings.font) + "55px " + strings.font
		ctx.textBaseline = "top"
		ctx.textAlign = "center"
		
		for(var i = 0; i < this.symbols.length; i++){
			ctx.strokeStyle = "#3f0406"
			ctx.lineWidth = 13.5
			this.drawSymbol(this.symbols[i], "stroke", 4)
		}
		this.subtitleIterate((letter, x) => {
			ctx.lineWidth = strings.id === "en" ? 19 : 18.5
			ctx.strokeStyle = "#3f0406"
			ctx.strokeText(letter, x, 315)
		})
		ctx.fillStyle = "#3f0406"
		ctx.fillRect(400, 180, 30, 50)
		for(var i = 0; i < this.symbols.length; i++){
			var symbol = this.symbols[i]
			ctx.strokeStyle = "#7c361e"
			ctx.lineWidth = 13.5
			this.drawSymbol(symbol, "stroke")
			ctx.strokeStyle = "#fff"
			ctx.lineWidth = 7.5
			this.drawSymbol(symbol, "stroke")
			var grd = ctx.createLinearGradient(0, 55 - symbol.y, 0, 95 - symbol.y)
			grd.addColorStop(0, "#a41f1e")
			grd.addColorStop(1, "#a86a29")
			ctx.fillStyle = grd
			this.drawSymbol(symbol, "fill")
			ctx.save()
			ctx.scale(symbol.scale ? 2.8 : 3.2, 3.2)
			ctx.translate(symbol.x, symbol.y)
			ctx.clip(symbol.path)
			grd = ctx.createLinearGradient(0, 55 - symbol.y, 0, 95 - symbol.y)
			grd.addColorStop(0, "#d80e11")
			grd.addColorStop(1, "#e08f19")
			ctx.fillStyle = grd
			ctx.translate(3, 2)
			ctx.fill(symbol.shadow || symbol.path)
			ctx.restore()
		}
		ctx.fillStyle = "#fff"
		ctx.fillRect(382, 85, 30, 15)
		ctx.fillRect(402, 145, 15, 15)
		
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
		ctx.scale(symbol.scale ? 2.8 : 3.2, 3.2)
		ctx.translate(symbol.x, symbol.y + (y || 0))
		ctx[action](symbol.path)
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
