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
			default:
				this.good = 3 / 2 * frame
				this.ok = 9 / 2 * frame
				this.bad = 13 / 2 * frame
				break
		}
		switch(this.difficulty){
			case "easy":
				this.gaugeClear = 30 / 50
				break
			case "normal":
			case "hard":
				this.gaugeClear = 35 / 50
				break
			case "oni":
			case "ura":
				this.gaugeClear = 40 / 50
				break
			default:
				this.gaugeClear = 51 / 50
				break
		}
		
		this.daiLeniency = 2 * frame
	}
	soulPoints(combo){
		var good, ok, bad
		switch(this.difficulty){
			case "easy":
				good = Math.floor(10000 / combo * 1.575)
				ok = Math.floor(good * 0.75)
				bad = Math.ceil(good / -2)
				break
			case "normal":
				good = Math.floor(10000 / combo / 0.7)
				ok = Math.floor(good * 0.75)
				bad = Math.ceil(good / -0.75)
				break
			case "hard":
				good = Math.floor(10000 / combo * 1.5)
				ok = Math.floor(good * 0.75)
				bad = Math.ceil(good / -0.8)
				break
			case "oni":
			case "ura":
				good = Math.floor(10000 / combo / 0.7)
				ok = Math.floor(good * 0.5)
				bad = Math.ceil(good * -1.6)
				break
		}
		return {good: good, ok: ok, bad: bad}
	}
	gaugePercent(gauge){
		return Math.floor(gauge / 200) / 50
	}
	clearReached(gauge){
		return this.gaugePercent(gauge) >= this.gaugeClear
	}
}
