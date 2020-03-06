class ScoreStorage{
	constructor(){
		this.scores = {}
		this.difficulty = ["oni", "ura", "hard", "normal", "easy"]
		this.scoreKeys = ["points", "good", "ok", "bad", "maxCombo", "drumroll"]
		this.crownValue = ["", "silver", "gold"]
		this.load()
	}
	load(){
		this.scores = {}
		this.scoreStrings = {}
		try{
			var localScores = localStorage.getItem("scoreStorage")
			if(localScores){
				this.scoreStrings = JSON.parse(localScores)
			}
		}catch(e){}
		for(var song in this.scoreStrings){
			var scoreString = this.scoreStrings[song]
			var songAdded = false
			if(typeof scoreString === "string" && scoreString){
				var diffArray = scoreString.split(";")
				for(var i in this.difficulty){
					if(diffArray[i]){
						var crown = parseInt(diffArray[i].slice(0, 1)) || 0
						var score = {
							crown: this.crownValue[crown] || ""
						}
						var scoreArray = diffArray[i].slice(1).split(",")
						for(var j in this.scoreKeys){
							var name = this.scoreKeys[j]
							var value = parseInt(scoreArray[j], 36) || 0
							if(value < 0){
								value = 0
							}
							score[name] = value
						}
						if(!songAdded){
							this.scores[song] = []
							songAdded = true
						}
						this.scores[song][this.difficulty[i]] = score
					}
				}
			}
		}
	}
	save(){
		for(var song in this.scores){
			this.writeString(song)
		}
		this.write()
	}
	write(){
		try{
			localStorage.setItem("scoreStorage", JSON.stringify(this.scoreStrings))
		}catch(e){}
	}
	writeString(song){
		var score = this.scores[song]
		var diffArray = []
		var notEmpty = false
		for(var i = this.difficulty.length; i--;){
			var diff = this.difficulty[i]
			if(score[diff]){
				var scoreArray = []
				var crown = this.crownValue.indexOf(score[diff].crown).toString()
				for(var j in this.scoreKeys){
					var name = this.scoreKeys[j]
					var value = score[diff][name]
					value = Math.floor(value).toString(36)
					scoreArray.push(value)
				}
				diffArray.unshift(crown + scoreArray.join(","))
				notEmpty = true
			}else if(notEmpty){
				diffArray.unshift("")
			}
		}
		this.scoreStrings[song] = diffArray.join(";")
	}
	get(song, difficulty){
		if(!song){
			return this.scores
		}else if(song in this.scores){
			if(difficulty){
				return this.scores[song][difficulty]
			}else{
				return this.scores[song]
			}
		}
	}
	add(song, difficulty, scoreObject){
		if(!(song in this.scores)){
			this.scores[song] = {}
		}
		this.scores[song][difficulty] = scoreObject
		this.writeString(song)
		this.write()
	}
	template(){
		var template = {crown: ""}
		for(var i in this.scoreKeys){
			var name = this.scoreKeys[i]
			template[name] = 0
		}
		return template
	}
	remove(song, difficulty){
		if(song in this.scores){
			if(difficulty){
				if(difficulty in this.scores[song]){
					delete this.scores[song][difficulty]
					var noDiff = true
					for(var i in this.difficulty){
						if(this.scores[song][this.difficulty[i]]){
							noDiff = false
							break
						}
					}
					if(noDiff){
						delete this.scores[song]
						delete this.scoreStrings[song]
					}else{
						this.writeString(song)
					}
				}
			}else{
				delete this.scores[song]
				delete this.scoreStrings[song]
			}
			this.write()
		}
	}
}
