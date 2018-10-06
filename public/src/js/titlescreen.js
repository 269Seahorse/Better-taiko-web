class Titlescreen{
	constructor(){
		loader.changePage("titlescreen")
		this.titleScreen = document.getElementById("title-screen")
		pageEvents.keyOnce(this, 13, "down").then(this.onPressed.bind(this))
		pageEvents.once(this.titleScreen, "mousedown").then(this.onPressed.bind(this))
		pageEvents.once(this.titleScreen, "touchstart").then(this.onPressed.bind(this))
		assets.sounds["title"].play()
		this.gamepad = new Gamepad({
			"start": ["b", "x", "y", "start"],
			"a": ["a"]
		}, (pressed, key) => {
			if(pressed){
				this.onPressed()
			}
		})
	}
	onPressed(event){
		if(event && event.type === "touchstart"){
			event.preventDefault()
			this.touched = true
		}
		this.titleScreen.style.cursor = "auto"
		this.clean()
		assets.sounds["don"].play()
		setTimeout(this.goNext.bind(this), 500)
	}
	goNext(){
		if(this.touched || localStorage.getItem("tutorial") === "true"){
			new SongSelect(false, false, this.touched)
		}else{
			new Tutorial()
		}
	}
	clean(){
		this.gamepad.clean()
		assets.sounds["title"].stop()
		pageEvents.keyRemove(this, 13)
		pageEvents.remove(this.titleScreen, "mousedown")
		pageEvents.remove(this.titleScreen, "touchstart")
		delete this.titleScreen
	}
}
