class Tutorial{
	constructor(){
		loader.changePage("tutorial")
		assets.sounds["bgm_setsume"].playLoop(0.1, false, 0, 1.054, 16.054)
		this.endButton = document.getElementById("tutorial-end-button")
		pageEvents.once(this.endButton, "click").then(this.onEnd.bind(this))
	}
	onEnd(){
		this.clean()
		assets.sounds["don"].play()
		localStorage.setItem("tutorial", "true")
		new SongSelect()
	}
	clean(){
		assets.sounds["bgm_setsume"].stop()
		pageEvents.remove(this.endButton, "click")
		delete this.endButton
	}
}
