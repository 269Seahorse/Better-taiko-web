class CanvasCache{
	constructor(w, h, scale){
		if(w){
			this.resize(w, h, scale)
		}
	}
	resize(w, h, scale){
		if(this.canvas){
			this.map.clear()
		}else{
			this.map = new Map()
			this.canvas = document.createElement("canvas")
			this.ctx = this.canvas.getContext("2d")
			document.body.appendChild(this.canvas)
		}
		this.scale = scale
		this.x = 0
		this.y = 0
		this.w = w
		this.h = h
		this.lastW = 0
		this.lastH = 0
		this.canvas.width = this.w * this.scale
		this.canvas.height = this.h * this.scale
		this.ctx.scale(this.scale, this.scale)
	}
	get(config, callback, setOnly){
		var img = this.map.get(config.id)
		if(img && setOnly || !img && !callback){
			return
		}
		var saved = false
		if(!img){
			var w = config.w
			var h = config.h
			this.x += this.lastW + 1
			if(this.x + w > this.w){
				this.x = 0
				this.y += this.lastH + 1
			}
			this.lastW = w
			this.lastH = Math.max(this.lastH, h)
			img = {
				x: this.x,
				y: this.y,
				w: w,
				h: h
			}
			this.map.set(config.id, img)
			
			saved = true
			this.ctx.save()
			this.ctx.translate(img.x |0, img.y |0)
			this.ctx.beginPath()
			this.ctx.rect(0, 0, img.w |0, img.h |0)
			this.ctx.clip()
			
			callback(this.ctx)
		}
		if(setOnly){
			this.ctx.restore()
			return
		}
		var z = this.scale
		config.ctx.drawImage(this.canvas,
			img.x * z |0, img.y * z |0, img.w * z |0, img.h * z |0,
			config.x |0, config.y |0, config.w |0, config.h |0
		)
		if(saved){
			this.ctx.restore()
		}
	}
	set(config, callback){
		return this.get(config, callback, true)
	}
	clear(){
		this.x = 0
		this.y = 0
		this.lastW = 0
		this.lastH = 0
		this.map.clear()
		this.ctx.clearRect(0, 0, this.w, this.h)
	}
	clean(){
		delete this.map
		delete this.ctx
		delete this.canvas
	}
}
