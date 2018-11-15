class ViewAssets{
	constructor(view){
		this.view = view
		this.controller = this.view.controller
		this.allAssets = []
		this.ctx = this.view.ctx
		
		// Background
		this.don = this.createAsset("background", frame => {
			var imgw = 360
			var imgh = 184
			var scale = 165
			var w = imgw
			var h = imgh
			return {
				sx: Math.floor(frame / 10) * imgw,
				sy: (frame % 10) * imgh + 1,
				sw: imgw,
				sh: imgh - 1,
				x: view.portrait ? -60 : 0,
				y: view.portrait ? (view.multiplayer === 2 ? 560 : 35) : (view.multiplayer === 2 ? 360 : 2),
				w: w,
				h: h - 1
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
				this.don.setUpdateSpeed(4 / length)
				this.don.setAnimation("gogo")
			}else if(Math.round(this.controller.getGlobalScore().gauge / 2) - 1 >= 25){
				this.don.setAnimationStart(0)
				var length = this.don.getAnimationLength("clear")
				this.don.setUpdateSpeed(2 / length)
				this.don.setAnimation("clear")
			}else{
				this.don.setAnimationStart(0)
				var length = this.don.getAnimationLength("normal")
				this.don.setUpdateSpeed(4 / length)
				this.don.setAnimation("normal")
			}
		}
		this.don.addFrames("clear", 30, "don_anim_clear")
		this.don.normalAnimation()
		
		// Bar
		this.fire = this.createAsset("bar", frame => {
			var imgw = 360
			var imgh = 370
			var scale = 130
			var ms = this.view.getMS()
			var elapsed = ms - this.view.gogoTimeStarted
			
			var mul = this.view.slotPos.size / 106
			var barH = 130 * mul
			
			if(this.view.gogoTime){
				var grow = 3 - Math.min(200, elapsed) / 100
				this.ctx.globalAlpha = Math.min(200, elapsed) / 200
			}else{
				var grow = 1 - Math.min(100, elapsed) / 100
			}
			var w = (barH * imgw) / scale * grow
			var h = (barH * imgh) / scale * grow
			this.ctx.globalCompositeOperation = "lighter"
			return {
				sx: frame * imgw,
				sy: 0,
				sw: imgw,
				sh: imgh,
				x: this.view.slotPos.x - w / 2,
				y: this.view.slotPos.y - h / 2,
				w: w,
				h: h
			}
		})
		this.fire.addFrames("normal", 7, "fire_anim")
		this.fire.setUpdateSpeed(1 / 8)
		
		// Notes
		this.explosion = this.createAsset("notes", frame => {
			var w = 222
			var h = 222
			var mul = this.view.slotPos.size / 106
			this.ctx.globalCompositeOperation = "screen"
			var alpha = 1
			if(this.explosion.type < 2){
				if(frame < 2){
					mul *= 1 - (frame + 1) * 0.2
				}else if(frame > 9){
					alpha = Math.max(0, 1 - (frame - 10) / 4)
				}
			}else if(frame > 5){
				alpha = 0.5
			}
			if(alpha < 1 && !this.controller.touchEnabled){
				this.ctx.globalAlpha = alpha
			}
			return {
				sx: this.explosion.type * w,
				sy: Math.min(3, Math.floor(frame / 2)) * h,
				sw: w,
				sh: h,
				x: this.view.slotPos.x - w * mul / 2,
				y: this.view.slotPos.y - h * mul / 2,
				w: w * mul,
				h: h * mul
			}
		})
		this.explosion.type = null
		this.explosion.addFrames("normal", 14, "notes_explosion")
		this.explosion.setUpdateSpeed(1, true)
		
		// Foreground
		this.fireworks = []
		for(let i = 0; i < 5 ; i++){
			var fireworksAsset = this.createAsset("foreground", frame => {
				var imgw = 230
				var imgh = 460
				var scale = 165
				var w = imgw
				var h = imgh
				var winW = this.view.winW / this.view.ratio
				var winH = this.view.winH / this.view.ratio
				return {
					sx: Math.floor(frame / 4) * imgw,
					sy: (frame % 4) * imgh,
					sw: imgw,
					sh: imgh,
					x: winW / 4 * i - w / 2 * (i / 2),
					y: winH - h,
					w: w,
					h: h
				}
			})
			fireworksAsset.addFrames("normal", 30, "fireworks_anim")
			fireworksAsset.setUpdateSpeed(1 / 16)
			this.fireworks.push(fireworksAsset)
		}
		
		this.changeBeatInterval(this.view.beatInterval, true)
	}
	createAsset(layer, position){
		var asset = new CanvasAsset(this.view, layer, position)
		this.allAssets.push(asset)
		return asset
	}
	drawAssets(layer){
		this.allAssets.forEach(asset => {
			if(layer === asset.layer){
				asset.draw()
			}
		})
	}
	changeBeatInterval(beatMS, initial){
		this.allAssets.forEach(asset => {
			asset.changeBeatInterval(beatMS, initial)
		})
	}
	clean(){
		delete this.ctx
		delete this.don
		delete this.fire
		delete this.fireworks
		delete this.allAssets
	}
}
