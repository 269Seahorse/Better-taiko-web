class Debug{
	constructor(){
		this.debugDiv = document.createElement("div")
		this.debugDiv.id = "debug"
		this.debugDiv.innerHTML = assets.pages["debug"]
		document.body.appendChild(this.debugDiv)
		
		this.titleDiv = this.debugDiv.getElementsByClassName("title")[0]
		this.minimiseDiv = this.debugDiv.getElementsByClassName("minimise")[0]
		this.offsetDiv = this.debugDiv.getElementsByClassName("offset")[0]
		
		this.moving = false
		pageEvents.add(window, ["mousedown", "mouseup", "blur"], this.stopMove.bind(this))
		pageEvents.add(window, "mousemove", this.onMove.bind(this))
		pageEvents.add(this.titleDiv, "mousedown", this.startMove.bind(this))
		pageEvents.add(this.minimiseDiv, "click", this.minimise.bind(this))
		
		this.offsetSlider = new InputSlider(this.offsetDiv)
		this.offsetSlider.onchange(this.offsetChange.bind(this))
		
		this.moveTo(100, 100)
		this.restore()
		this.updateStatus()
	}
	startMove(event){
		if(event.which === 1){
			event.stopPropagation()
			this.moving = {
				x: event.offsetX,
				y: event.offsetY
			}
		}
	}
	onMove(event){
		if(this.moving){
			var x = event.clientX - this.moving.x
			var y = event.clientY - this.moving.y
			this.moveTo(x, y)
		}
	}
	stopMove(event){
		var x = event.clientX - this.moving.x
		var y = event.clientY - this.moving.y
		var w = this.debugDiv.offsetWidth
		var h = this.debugDiv.offsetHeight
		if(x + w > innerWidth){
			x = innerWidth - w
		}
		if(y + h > lastHeight){
			y = lastHeight - h
		}
		if(x < 0){
			x = 0
		}
		if(y < 0){
			y = 0
		}
		this.moveTo(x, y)
		this.moving = false
	}
	moveTo(x, y){
		this.debugDiv.style.transform = "translate(" + x + "px, " + y + "px)"
	}
	restore(){
		debugObj.state = "open"
		this.debugDiv.style.display = ""
	}
	minimise(){
		debugObj.state = "minimised"
		this.debugDiv.style.display = "none"
	}
	updateStatus(){
		if(debugObj.controller && !this.controller){
			this.controller = debugObj.controller
			var selectedSong = this.controller.selectedSong
			this.defaultOffset = selectedSong.offset
			if(this.songFolder === selectedSong.folder){
				this.offsetChange(this.offsetSlider.get())
			}else{
				this.songFolder = selectedSong.folder
				this.offsetSlider.set(this.defaultOffset)
			}
		}
		if(this.controller && !debugObj.controller){
			this.controller = null
		}
	}
	offsetChange(value){
		if(this.controller){
			var offset = (this.defaultOffset - value) * 1000
			var songData = this.controller.parsedSongData
			songData.circles.forEach(circle => {
				circle.ms = circle.originalMS + offset
				circle.endTime = circle.originalEndTime + offset
			})
			songData.measures.forEach(measure => {
				measure.ms = measure.originalMS + offset
			})
		}
	}
	clean(){
		this.offsetSlider.clean()
		
		pageEvents.remove(window, ["mousedown", "mouseup", "mousemove", "blur"])
		pageEvents.remove(this.title, "mousedown")
		
		delete this.debugDiv
		delete this.titleDiv
		delete this.minimiseDiv
		delete this.controller
		
		debugObj.state = "closed"
		debugObj.debug = null
		document.body.removeChild(this.debugDiv)
	}
}
class InputSlider{
	constructor(sliderDiv){
		this.input = sliderDiv.getElementsByTagName("input")[0]
		this.reset = sliderDiv.getElementsByClassName("reset")[0]
		this.plus = sliderDiv.getElementsByClassName("plus")[0]
		this.minus = sliderDiv.getElementsByClassName("minus")[0]
		this.value = null
		this.defaultValue = null
		this.callbacks = []
		
		pageEvents.add(this.plus, "click", this.add.bind(this))
		pageEvents.add(this.minus, "click", this.subtract.bind(this))
		pageEvents.add(this.reset, "click", this.resetValue.bind(this))
		pageEvents.add(this.input, "change", this.manualSet.bind(this))
	}
	update(noCallback, force){
		var oldValue = this.input.value
		if(this.value === null){
			this.input.value = ""
			this.input.readOnly = true
		}else{
			if(this.value > 60000){
				this.value = 60000
			}
			if(this.value < -60000){
				this.value = -60000
			}
			this.input.value = this.get().toFixed(3)
			this.input.readOnly = false
		}
		if(force || !noCallback && oldValue !== this.input.value){
			this.callbacks.forEach(callback => {
				callback(this.input.value)
			})
		}
	}
	set(number){
		this.value = Math.floor(number * 1000)
		this.defaultValue = this.value
		this.update(true)
	}
	get(){
		if(this.value === null){
			return null
		}else{
			return Math.floor(this.value) / 1000
		}
	}
	add(event){
		if(this.value !== null){
			var newValue = this.value + this.eventNumber(event)
			if(newValue <= 60000){
				this.value = newValue
				this.update()
			}
		}
	}
	subtract(event){
		if(this.value !== null){
			var newValue = this.value - this.eventNumber(event)
			if(newValue >= -60000){
				this.value = newValue
				this.update()
			}
		}
	}
	eventNumber(event){
		return (event.ctrlKey ? 10 : 1) * (event.shiftKey ? 10 : 1) * (event.altKey ? 10 : 1) * 1
	}
	resetValue(){
		this.value = this.defaultValue
		this.update()
	}
	onchange(callback){
		this.callbacks.push(callback)
	}
	manualSet(){
		var number = parseFloat(this.input.value)
		if(Number.isFinite(number) && -60 <= number && number <= 60){
			this.value = number * 1000
		}
		this.update(false, true)
	}
	clean(){
		pageEvents.remove(this.plus, "click")
		pageEvents.remove(this.minus, "click")
		pageEvents.remove(this.reset, "click")
		pageEvents.remove(this.input, "change")
		
		delete this.input
		delete this.reset
		delete this.plus
		delete this.minus
	}
}
