class CanvasTest{
	constructor(){
		this.canvas = document.createElement("canvas")
		var pixelRatio = window.devicePixelRatio || 1
		var width = innerWidth * pixelRatio
		var height = innerHeight * pixelRatio
		this.canvas.width = width
		this.canvas.height = height
		this.ctx = this.canvas.getContext("2d")
		this.ctx.scale(pixelRatio, pixelRatio)
		this.ratio = pixelRatio
		this.draw = new CanvasDraw()
		this.font = "serif"
		
		this.songAsset = {
			marginLeft: 18,
			marginTop: 90,
			width: 82,
			height: 452,
			border: 6,
			innerBorder: 8
		}
	}
	blurPerformance(){
		return new Promise(resolve => {
			requestAnimationFrame(() => {
				var ctx = this.ctx
				ctx.save()
				var lastIteration = this.blurIteration()
				var frameTime = []
				
				for(var i = 0; i < 10; i++){
					lastIteration = lastIteration.then(ms => {
						frameTime.push(ms)
						return this.blurIteration()
					})
				}
				
				lastIteration.then(() => {
					ctx.restore()
					resolve(frameTime.reduce((a, b) => a + b) / frameTime.length)
				})
			})
		})
	}
	blurIteration(){
		return new Promise(resolve => {
			requestAnimationFrame(() => {
				var startTime = Date.now()
				var ctx = this.ctx
				ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
				
				for(var x = 0; x < this.canvas.width; x += this.songAsset.width + this.songAsset.marginLeft){
					this.draw.songFrame({
						ctx: ctx,
						x: x,
						y: this.songAsset.marginTop,
						width: this.songAsset.width,
						height: this.songAsset.height,
						border: this.songAsset.border,
						innerBorder: this.songAsset.innerBorder,
						background: "#efb058",
						borderStyle: ["#ffe7bd", "#c68229"],
						ratio: this.ratio,
						innerContent: () => {}
					})
				}
				
				for(var i = 0; i < 2; i++){
					this.draw.layeredText({
						ctx: ctx,
						text: "I am a text",
						fontSize: 48,
						fontFamily: this.font,
						x: 23 + 300 * i,
						y: 15
					}, [
						{x: -2, y: -2, outline: "#000", letterBorder: 22},
						{},
						{x: 2, y: 2, shadow: [2, 2, 7]},
						{x: 2, y: 2, outline: "#ad1516", letterBorder: 10},
						{x: -2, y: -2, outline: "#ff797b"},
						{outline: "#f70808"},
						{fill: "#fff", shadow: [-1, 1, 3, 1.5]}
					])
				}
				resolve(Date.now() - startTime)
			})
		})
	}
	drawAllImages(){
		return new Promise(resolve => {
			requestAnimationFrame(() => {
				var startTime = Date.now()
				var ctx = this.ctx
				ctx.save()
				ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
				
				for(var name in assets.image){
					ctx.drawImage(assets.image[name], 0, 0)
				}
				
				var comboCount = 765
				var comboX = 100
				var comboY = 100
				var fontSize = 120
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
				
				ctx.restore()
				resolve(Date.now() - startTime)
			})
		})
	}
	strokeFillText(text, x, y){
		this.ctx.strokeText(text, x, y)
		this.ctx.fillText(text, x, y)
	}
	clean(){
		this.draw.clean()
		delete this.ctx
		delete this.canvas
	}
}
