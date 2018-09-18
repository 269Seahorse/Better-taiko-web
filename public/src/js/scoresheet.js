class Scoresheet{
	constructor(controller, score, multiplayer){
		this.controller = controller
		this.score = score
		this.multiplayer = multiplayer
		loader.changePage("scoresheet")
		this.run()
	}
	setResults(score, scoreCont){
		this.positionning(scoreCont)
		var scoreMark = this.elem("score-mark", scoreCont)
		var scoreHpBarColour = this.elem("score-hp-bar-colour", scoreCont)
		
		if(score.fail == 0){
			var mark = "gold"
		}else if (score.hp >= 50){
			var mark = "silver"
		}
		scoreHpBarColour.dataset.hp = score.hp
		var imgW = score.hp * scoreHpBarColour.offsetWidth / 100
		var imgH = scoreHpBarColour.offsetHeight
		scoreHpBarColour.getElementsByTagName("img")[0].style.clip = "rect(0, " + imgW + "px, " + imgH + "px, 0)"
		
		if(mark == "gold"){
			scoreMark.src = "/assets/img/ranking-X.png"
		}else if(mark == "silver"){
			scoreMark.src = "/assets/img/ranking-S.png"
		}else{
			scoreMark.parentNode.removeChild(scoreMark)
		}
		this.altText(this.elem("score-points", scoreCont), score.points + "点")
		this.altText(this.elem("nb-great", scoreCont), score.great)
		this.altText(this.elem("nb-good", scoreCont), score.good)
		this.altText(this.elem("nb-fail", scoreCont), score.fail)
		this.altText(this.elem("max-combo", scoreCont), score.maxCombo)
		this.altText(this.elem("nb-drumroll", scoreCont), score.drumroll)
		
		pageEvents.add(window, "resize", () => {
			this.positionning(scoreCont)
		})
	}
	elem(className, parent){
		return parent.getElementsByClassName(className)[0]
	}
	text(string){
		return document.createTextNode(string)
	}
	altText(element, string){
		element.appendChild(this.text(string))
		element.setAttribute("alt", string)
	}
	positionning(scoreCont){
		var scoreHpBarBg = this.elem("score-hp-bar-bg", scoreCont)
		var scoreHpBarColour = this.elem("score-hp-bar-colour", scoreCont)
		
		var scoreBarW = scoreCont.offsetWidth * 0.9
		var bgW = scoreBarW
		var bgH = 51 / 703 * scoreBarW
		
		scoreHpBarBg.style.width = bgW + "px"
		scoreHpBarBg.style.height = bgH + "px"
		var bgX = scoreHpBarBg.offsetLeft
		var bgY = scoreHpBarBg.offsetTop
		
		scoreHpBarColour.style.left = (bgW * 0.008) + "px"
		scoreHpBarColour.style.top = (bgH * 0.15) + "px"
		scoreHpBarColour.style.width = (bgW - bgW * 0.08) + "px"
		scoreHpBarColour.style.height = (bgH - bgH * 0.25) + "px"
		
		var imgW = scoreHpBarColour.dataset.hp * scoreHpBarColour.offsetWidth / 100
		var imgH = scoreHpBarColour.offsetHeight
		scoreHpBarColour.getElementsByTagName("img")[0].style.clip = "rect(0, " + imgW + "px, " + imgH + "px, 0)"
	}
	run(){
		this.scoresheet = document.getElementsByClassName("scoresheet")[0]
		var scoreCont = this.elem("score-cont", this.scoresheet)
		var scoreContHtml = scoreCont.innerHTML
		assets.sounds["results"].play()
		assets.sounds["bgm_result"].playLoop(0.1, false, 0, 0.847, 17.689)
		
		this.setResults(this.score, scoreCont)
		this.altText(this.elem("result-song", this.scoresheet), this.score.song)
		
		pageEvents.once(this.elem("song-select", this.scoresheet), "click").then(() => {
			this.clean()
			assets.sounds["don"].play()
			this.controller.songSelection()
		})
		pageEvents.once(this.elem("replay", this.scoresheet), "click").then(() => {
			this.clean()
			assets.sounds["don"].play()
			this.controller.restartSong()
		})
		if(this.multiplayer && p2.results){
			var scoreCont2 = document.createElement("div")
			scoreCont2.classList.add("score-cont")
			scoreCont2.innerHTML = scoreContHtml
			scoreCont.parentNode.appendChild(scoreCont2)
			this.setResults(p2.results, scoreCont2)
		}
	}
	clean(){
		assets.sounds["bgm_result"].stop()
		pageEvents.remove(window, "resize")
	}
}
