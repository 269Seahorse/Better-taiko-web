class ViewAssets{
	constructor(view){
		this.view = view
		this.controller = this.view.controller
		this.allAssets = []
		this.beatInterval = this.view.beatInterval
		this.ctx = this.view.ctx
		
		this.don = this.createAsset("background", frame => {
			var imgw = 360
			var imgh = 184
			var scale = 165
			var w = (this.view.barH * imgw) / scale
			var h = (this.view.barH * imgh) / scale
			return {
				sx: Math.floor(frame / 10) * imgw,
				sy: (frame % 10) * imgh,
				sw: imgw,
				sh: imgh,
				x: this.view.taikoSquareW - w + this.view.barH * 0.2,
				y: this.view.barY - h,
				w: w,
				h: h
			}
		})
		this.don.addFrames("normal", [
			0 ,0 ,0 ,0 ,1 ,2 ,3 ,4 ,5 ,6 ,6 ,5 ,4 ,3 ,2 ,1 ,
			0 ,0 ,0 ,0 ,1 ,2 ,3 ,4 ,5 ,6 ,6 ,5 ,4 ,3 ,2 ,1 ,
			0 ,0 ,0 ,0 ,1 ,2 ,3 ,4 ,5 ,6 ,6 ,5 ,7 ,8 ,9 ,10,
			11,11,11,11,10,9 ,8 ,7 ,13,12,12,13,14,15,16,17
		], "don_anim_normal")
		this.don.addFrames("10combo", 22, "don_anim_10combo")
		this.don.addFrames("gogo", [
			42,43,43,44,45,46,47,48,49,50,51,52,53,54,
			55,0 ,1 ,2 ,3 ,4 ,5 ,6 ,7 ,8 ,9 ,11,12,13,
			14,14,15,16,17,18,19,20,21,22,23,24,25,26,
			27,28,29,30,31,32,33,34,35,36,37,38,39,40,41
		], "don_anim_gogo")
		this.don.addFrames("gogostart", 27, "don_anim_gogostart")
		this.don.normalAnimation = () => {
			if(this.view.gogoTime){
				var length = this.don.getAnimationLength("gogo")
				this.don.setUpdateSpeed(this.beatInterval / (length / 4))
				this.don.setAnimation("gogo")
			}else{
				this.don.setAnimationStart(0)
				this.don.setUpdateSpeed(this.beatInterval / 16)
				this.don.setAnimation("normal")
			}
		}
		this.don.normalAnimation()
		this.fire = this.createAsset("bar", frame => {
			var imgw = 360
			var imgh = 370
			var scale = 175
			var ms = this.controller.getElapsedTime().ms
			var elapsed = ms - this.view.gogoTimeStarted
			if(this.view.gogoTime){
				var grow = 3 - Math.min(200, elapsed) / 100
				this.ctx.globalAlpha = Math.min(200, elapsed) / 200
			}else{
				var grow = 1 - Math.min(100, elapsed) / 100
			}
			var w = (this.view.barH * imgw) / scale * grow
			var h = (this.view.barH * imgh) / scale * grow
			this.ctx.globalCompositeOperation = "lighter"
			return {
				sx: frame * imgw,
				sy: 0,
				sw: imgw,
				sh: imgh,
				x: this.view.slotX - w / 2,
				y: this.view.circleY - h / 2,
				w: w,
				h: h,
				callback: () => {
					this.ctx.globalCompositeOperation = "source-over"
					this.ctx.globalAlpha = 1
				}
			}
		})
		this.fire.addFrames("normal", 7, "fire_anim")
		this.fire.setUpdateSpeed(this.beatInterval / 8)
		this.fireworks = []
		for(let i = 0; i < 5 ; i++){
			var fireworksAsset = this.createAsset("foreground", frame => {
				var imgw = 230
				var imgh = 460
				var scale = 165
				var w = (this.view.barH * imgw) / scale
				var h = (this.view.barH * imgh) / scale
				return {
					sx: Math.floor(frame / 4) * imgw,
					sy: (frame % 4) * imgh,
					sw: imgw,
					sh: imgh,
					x: this.view.winW / 4 * i - w / 2 * (i / 2),
					y: this.view.winH - h,
					w: w,
					h: h
				}
			})
			fireworksAsset.addFrames("normal", 30, "fireworks_anim")
			fireworksAsset.setUpdateSpeed(this.beatInterval / 16)
			this.fireworks.push(fireworksAsset)
		}
	}
	createAsset(layer, position){
		var asset = new CanvasAsset(this.view, layer, position)
		this.allAssets.push(asset)
		return asset
	}
	drawAssets(layer){
		if(this.controller.multiplayer !== 2 || layer === "bar"){
			this.allAssets.forEach(asset => {
				if(layer === asset.layer){
					asset.draw()
				}
			})
		}
	}
}
