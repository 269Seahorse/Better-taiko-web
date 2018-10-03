class CanvasAsset{
	constructor(view, layer, position){
		this.ctx = view.ctx
		this.controller = view.controller
		this.position = position
		this.animationFrames = {}
		this.speed = 1000 / 60
		this.animationStart = 0
		this.layer = layer
	}
	draw(){
		if(this.animation){
			var u = (a, b) => typeof a === "undefined" ? b : a
			var frame = 0
			var ms = this.controller.getElapsedTime()
			if(this.animationEnd){
				if(ms > this.animationEnd.ms){
					this.animationEnd.callback()
					delete this.animationEnd
					return this.draw()
				}
			}
			var index = Math.floor((ms - this.animationStart) / this.speed)
			if(Array.isArray(this.animation)){
				frame = this.animation[this.mod(this.animation.length, index)]
			}else{
				frame = this.mod(this.animation, index)
			}
			var pos = this.position(frame)
			if(this.image){
				this.ctx.drawImage(this.image,
					u(pos.sx, pos.x), u(pos.sy, pos.y),
					u(pos.sw, pos.w), u(pos.sh, pos.h),
					pos.x, pos.y, pos.w, pos.h
				)
			}
			if(pos.callback){
				pos.callback()
			}
		}
	}
	mod(length, index){
		return ((index % length) + length) % length
	}
	addFrames(name, frames, image){
		var framesObj = {
			frames: frames
		}
		if(image){
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
	setUpdateSpeed(speed){
		this.speed = speed
	}
	setAnimationStart(ms){
		this.animationStart = ms
	}
	setAnimationEnd(ms, callback){
		if(typeof ms === "undefined"){
			delete this.animationEnd
		}else{
			this.animationEnd = {
				ms: ms,
				callback: callback
			}
		}
	}
}
