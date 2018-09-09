class ScalableCanvas{
	constructor(id, width, height, noStyle){
		var oldCanvas = document.getElementById(id)
		if(oldCanvas){
			this.canvas = oldCanvas
		}else{
			this.canvas = document.createElement("canvas")
			this.canvas.id = id
		}
		this.ctx = this.canvas.getContext("2d")
		this.rescale()
		this.resize(width, height, noStyle)
	}
	resize(width, height, noStyle){
		if(width != this.width || height != this.height){
			this.width = width
			this.height = height
			this.scaledWidth = width * this.scale
			this.canvas.width = this.scaledWidth
			this.scaledHeight = height * this.scale
			this.canvas.height = this.scaledHeight
			if(noStyle || this.scale == 1){
				if(this.canvas.style.width){
					this.canvas.style.width = ""
				}
				if(this.canvas.style.height){
					this.canvas.style.height = ""
				}
			}else{
				this.canvas.style.width = width + "px"
				this.canvas.style.height = height + "px"
			}
		}
	}
	rescale(){
		var scale = window.devicePixelRatio || 1
		if(scale != this.scale){
			this.ctx.scale(scale, scale)
			this.scale = scale
		}
	}
}