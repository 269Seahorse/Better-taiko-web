class ScoreStorage{
	constructor(){
		this.scores = {}
		this.songTitles = {}
		this.difficulty = ["oni", "ura", "hard", "normal", "easy"]
		this.scoreKeys = ["points", "good", "ok", "bad", "maxCombo", "drumroll"]
		this.crownValue = ["", "silver", "gold"]
	}
	load(strings){
		this.scores = {}
		if(strings){
			this.scoreStrings = strings
		}else if(account.loggedIn){
			return
		}else{
			this.scoreStrings = {}
			try{
				var localScores = localStorage.getItem("scoreStorage")
				if(localScores){
					this.scoreStrings = JSON.parse(localScores)
				}
			}catch(e){}
		}
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
	prepareScores(scores){
		var output = []
		for (var k in scores) {
			output.push({'hash': k, 'score': scores[k]})
		}
		return output
	}
	save(localOnly){
		for(var hash in this.scores){
			this.writeString(hash)
		}
		this.write()
		return this.sendToServer({
			scores: this.prepareScores(this.scoreStrings),
			is_import: true
		})
	}
	write(){
		if(!account.loggedIn){
			try{
				localStorage.setItem("scoreStorage", JSON.stringify(this.scoreStrings))
			}catch(e){}
		}
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
		var obj = {}
		obj[hash] = this.scoreStrings[hash]
		this.sendToServer({
			scores: this.prepareScores(obj)
		}).catch(() => this.add.apply(this, arguments))
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
			this.sendToServer({
				scores: this.prepareScores(this.scoreStrings),
				is_import: true
			})
		}
	}
	sendToServer(obj, retry){
		if(account.loggedIn){
			var request = new XMLHttpRequest()
			request.open("POST", "api/scores/save")
			var promise = pageEvents.load(request).then(response => {
				if(request.status !== 200){
					return Promise.reject()
				}
			}).catch(() => {
				if(retry){
					account.loggedIn = false
					delete account.username
					delete account.displayName
					Cookies.remove("session")
					this.load()
					pageEvents.send("logout")
					return Promise.reject()
				}else{
					return new Promise(resolve => {
						setTimeout(() => {
							resolve()
						}, 3000)
					}).then(() => this.sendToServer(obj, true))
				}
			})
			request.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
			request.send(JSON.stringify(obj))
			return promise
		}else{
			return Promise.resolve()
		}
	}
}
