class GameRules{
	constructor(game){
		this.difficulty = game.controller.selectedSong.difficulty
		var frame = 1000 / 60
		
		switch(this.difficulty){
			case "easy":
			case "normal":
				this.good = 5 / 2 * frame
				this.ok = 13 / 2 * frame
				this.bad = 15 / 2 * frame
				break
			case "hard":
			case "oni":
			case "ura":
				this.good = 3 / 2 * frame
				this.ok = 9 / 2 * frame
				this.bad = 13 / 2 * frame
				break
		}
		
		this.daiLeniency = 2 * frame
	}
}
