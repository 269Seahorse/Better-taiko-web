class Titlescreen{
	constructor(){
		loader.changePage("titlescreen", false)
		this.titleScreen = document.getElementById("title-screen")
		var proceed = document.getElementById("title-proceed")
		proceed.appendChild(document.createTextNode(strings.titleProceed))
		proceed.setAttribute("alt", strings.titleProceed)
		
		pageEvents.keyAdd(this, "all", "down", this.keyDown.bind(this))
		pageEvents.add(this.titleScreen, ["mousedown", "touchstart"], this.onPressed.bind(this))
		assets.sounds["title"].play()
		this.gamepad = new Gamepad({
			"13": ["a", "b", "x", "y", "start", "ls", "rs"]
		}, pressed => {
			if(pressed){
				this.onPressed()
			}
		})
		if(p2.session){
			pageEvents.add(p2, "message", response => {
				if(response.type === "songsel"){
					this.goNext(true)
				}
			})
		}
	}
	keyDown(event, code){
		if(!code){
			code = event.keyCode
		}
		if(code == 13 || code == 32 || code == 70 || code == 74){
			// Enter, Space, F, J
			this.onPressed()
		}
	}
	onPressed(event){
		if(event){
			if(event.type === "touchstart"){
				event.preventDefault()
				this.touched = true
			}else if(event.type === "mousedown" && event.which !== 1){
				return
			}
		}
		this.titleScreen.style.cursor = "auto"
		this.clean()
		assets.sounds["don"].play()
		this.goNext()
	}
	goNext(fromP2){
		if(p2.session && !fromP2){
			p2.send("songsel")
		}else if(fromP2 || this.touched || localStorage.getItem("tutorial") === "true"){
			pageEvents.remove(p2, "message")
			setTimeout(() => {
				new SongSelect(false, false, this.touched)
			}, 500)
		}else{
			setTimeout(() => {
				new Tutorial()
			}, 500)
		}
	}
	clean(){
		this.gamepad.clean()
		assets.sounds["title"].stop()
		pageEvents.keyRemove(this, "all")
		pageEvents.remove(this.titleScreen, ["mousedown", "touchstart"])
		delete this.titleScreen
	}
}
