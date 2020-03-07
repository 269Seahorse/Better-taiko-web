class ScoreStorage{
	constructor(){
		this.scores = {}
		this.songTitles = {}
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
		for(var hash in this.scoreStrings){
			var scoreString = this.scoreStrings[hash]
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
							this.scores[hash] = {title: null}
							songAdded = true
						}
						this.scores[hash][this.difficulty[i]] = score
					}
				}
			}
		}
	}
	save(){
		for(var hash in this.scores){
			this.writeString(hash)
		}
		this.write()
	}
	write(){
		try{
			localStorage.setItem("scoreStorage", JSON.stringify(this.scoreStrings))
		}catch(e){}
	}
	writeString(hash){
		var score = this.scores[hash]
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
		this.scoreStrings[hash] = diffArray.join(";")
	}
	titleHash(song){
		if(song in this.songTitles){
			return this.songTitles[song]
		}else{
			return song
		}
	}
	get(song, difficulty, isHash){
		if(!song){
			return this.scores
		}else{
			var hash = isHash ? song : this.titleHash(song)
			if(difficulty){
				if(hash in this.scores){
					return this.scores[hash][difficulty]
				}
			}else{
				return this.scores[hash]
			}
		}
	}
	add(song, difficulty, scoreObject, isHash, setTitle){
		var hash = isHash ? song : this.titleHash(song)
		if(!(hash in this.scores)){
			this.scores[hash] = {}
		}
		if(setTitle){
			this.scores[hash].title = setTitle
		}
		this.scores[hash][difficulty] = scoreObject
		this.writeString(hash)
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
	remove(song, difficulty, isHash){
		var hash = isHash ? song : this.titleHash(song)
		if(hash in this.scores){
			if(difficulty){
				if(difficulty in this.scores[hash]){
					delete this.scores[hash][difficulty]
					var noDiff = true
					for(var i in this.difficulty){
						if(this.scores[hash][this.difficulty[i]]){
							noDiff = false
							break
						}
					}
					if(noDiff){
						delete this.scores[hash]
						delete this.scoreStrings[hash]
					}else{
						this.writeString(hash)
					}
				}
			}else{
				delete this.scores[hash]
				delete this.scoreStrings[hash]
			}
			this.write()
		}
	}
}
