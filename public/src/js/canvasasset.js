class CanvasAsset{
	constructor(view, layer, position){
		this.ctx = view.ctx
		this.view = view
		this.position = position
		this.animationFrames = {}
		this.speed = 1000 / 60
		this.animationStart = 0
		this.layer = layer
		this.beatInterval = 468.75
	}
	draw(){
		if(this.animation){
			var u = (a, b) => typeof a === "undefined" ? b : a
			var frame = 0
			var ms = this.view.getMS()
			var beatInterval = this.frameSpeed ? 1000 / 60 : this.beatInterval
			
			if(this.animationEnd){
				if(ms > this.animationStart + this.animationEnd.frameCount * this.speed * beatInterval){
					this.animationEnd.callback()
					this.animationEnd = false
					return this.draw()
				}
			}
			var index = Math.floor((ms - this.animationStart) / (this.speed * beatInterval))
			if(Array.isArray(this.animation)){
				frame = this.animation[this.mod(this.animation.length, index)]
			}else{
				frame = this.mod(this.animation, index)
			}
			this.ctx.save()
			var pos = this.position(frame)
			if(this.image){
				this.ctx.drawImage(this.image,
					u(pos.sx, pos.x), u(pos.sy, pos.y),
					u(pos.sw, pos.w), u(pos.sh, pos.h),
					pos.x, pos.y, pos.w, pos.h
				)
			}
			this.ctx.restore()
		}
	}
	mod(length, index){
		return ((index % length) + length) % length
	}
	addFrames(name, frames, image, don){
		var framesObj = {
			frames: frames,
			don: don
		}
		if(don){
			var img = assets.image[image + "_a"]
			var cache1 = new CanvasCache()
			var cache2 = new CanvasCache()
			var w = img.width
			var h = img.height
			cache1.resize(w, h, 1)
			cache2.resize(w, h, 1)
			cache1.set({
				w: w, h: h, id: "1"
			}, ctx => {
				ctx.drawImage(assets.image[image + "_b1"], 0, 0)
				ctx.globalCompositeOperation = "source-atop"
				ctx.fillStyle = don.body_fill
				ctx.fillRect(0, 0, w, h)
			})
			cache2.set({
				w: w, h: h, id: "2"
			}, ctx => {
				ctx.drawImage(assets.image[image + "_b2"], 0, 0)
				ctx.globalCompositeOperation = "source-atop"
				ctx.fillStyle = don.face_fill
				ctx.fillRect(0, 0, w, h)
				
				ctx.globalCompositeOperation = "source-over"
				cache1.get({
					ctx: ctx,
					x: 0, y: 0, w: w, h: h,
					id: "1"
				})
				ctx.drawImage(img, 0, 0)
			})
			cache1.clean()
			framesObj.cache = cache2
			framesObj.image = cache2.canvas
		}else if(image){
			framesObj.image = assets.image[image]
		}
		this.animationFrames[name] = framesObj
	}
	setAnimation(name){
		var framesObj = this.animationFrames[name]
		this.animationName = name
		if(framesObj){
			this.animation = framesObj.frames
			if(framesObj.image){
				this.image = framesObj.image
			}
			this.don = framesObj.don
		}else{
			this.animation = false
		}
	}
	getAnimation(){
		return this.animationName
	}
	getAnimationLength(name){
		var frames = this.animationFrames[name].frames
		if(Array.isArray(frames)){
			return frames.length
		}else{
			return frames
		}
	}
	setUpdateSpeed(speed, frameSpeed){
		this.speed = speed
		this.frameSpeed = frameSpeed
	}
	setAnimationStart(ms){
		this.animationStart = ms
	}
	setAnimationEnd(frameCount, callback){
		if(typeof frameCount === "undefined"){
			this.animationEnd = false
		}else{
			this.animationEnd = {
				frameCount: frameCount,
				callback: callback
			}
		}
	}
	changeBeatInterval(beatMS, initial){
		if(!initial && !this.frameSpeed){
			var ms = this.view.getMS()
			this.animationStart = ms - (ms - this.animationStart) / this.beatInterval * beatMS
		}
		this.beatInterval = beatMS
	}
	clean(){
		for(var i in this.animationFrames){
			var frame = this.animationFrames[i]
			if(frame.cache){
				frame.cache.clean()
			}
		}
	}
}
