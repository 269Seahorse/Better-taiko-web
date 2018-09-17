class Titlescreen{
	constructor(){
		loader.changePage("titlescreen")
		this.titleScreen = document.getElementById("title-screen")
		pageEvents.keyOnce(this, 13, "down").then(this.goNext.bind(this))
		pageEvents.once(this.titleScreen, "click").then(this.goNext.bind(this))
		assets.sounds["title"].play()
	}
	goNext(){
		this.clean()
		assets.sounds["don"].play()
		if(localStorage.getItem("tutorial") !== "true"){
			new Tutorial()
		} else {
			new SongSelect()
		}
	}
	clean(){
		assets.sounds["title"].stop()
		pageEvents.keyRemove(this, 13)
		pageEvents.remove(this.titleScreen, "click")
		delete this.titleScreen
	}
}
