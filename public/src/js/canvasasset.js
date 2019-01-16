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
}
