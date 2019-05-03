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
		var time = Date.now()
		if(!img){
			var w = config.w
			var h = config.h
			this.x += this.lastW + (this.lastW ? 1 : 0)
			if(this.x + w > this.w){
				this.x = 0
				this.y += this.lastH + 1
			}
			if(this.y + h > this.h){
				var clear = true
				var oldest = {time: time}
				this.map.forEach((oldImg, id) => {
					if(oldImg.time < oldest.time){
						oldest.id = id
						oldest.time = oldImg.time
					}
				})
				var oldImg = this.map.get(oldest.id)
				this.map.delete(oldest.id)
				img = {
					x: oldImg.x,
					y: oldImg.y,
					w: w,
					h: h
				}
			}else{
				var clear = false
				this.lastW = w
				this.lastH = Math.max(this.lastH, h)
				img = {
					x: this.x,
					y: this.y,
					w: w,
					h: h
				}
			}
			
			saved = true
			this.ctx.save()
			this.ctx.translate(img.x |0, img.y |0)
			if(clear){
				this.ctx.clearRect(0, 0, (img.w |0) + 1, (img.h |0) + 1)
			}
			this.ctx.beginPath()
			this.ctx.rect(0, 0, img.w |0, img.h |0)
			this.ctx.clip()
			
			this.map.set(config.id, img)
			callback(this.ctx)
		}
		img.time = time
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
		if(!this.canvas){
			return
		}
		this.resize(1, 1, 1)
		delete this.map
		delete this.ctx
		delete this.canvas
	}
}
