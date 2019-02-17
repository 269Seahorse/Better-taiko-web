class P2Connection{
	constructor(){
		this.closed = true
		this.lastMessages = {}
		this.otherConnected = false
		this.allEvents = new Map()
		this.addEventListener("message", this.message.bind(this))
		this.currentHash = ""
		pageEvents.add(window, "hashchange", this.onhashchange.bind(this))
	}
	addEventListener(type, callback){
		var addedType = this.allEvents.get(type)
		if(!addedType){
			addedType = new Set()
			this.allEvents.set(type, addedType)
		}
		return addedType.add(callback)
	}
	removeEventListener(type, callback){
		var addedType = this.allEvents.get(type)
		if(addedType){
			return addedType.delete(callback)
		}
	}
	open(){
		this.closed = false
		var wsProtocol = location.protocol == "https:" ? "wss:" : "ws:"
		this.socket = new WebSocket(wsProtocol + "//" + location.host + "/p2")
		pageEvents.race(this.socket, "open", "close").then(response => {
			if(response.type === "open"){
				return this.openEvent()
			}
			return this.closeEvent()
		})
		pageEvents.add(this.socket, "message", this.messageEvent.bind(this))
	}
	openEvent(){
		var addedType = this.allEvents.get("open")
		if(addedType){
			addedType.forEach(callback => callback())
		}
	}
	close(){
		this.closed = true
		this.socket.close()
	}
	closeEvent(){
		this.removeEventListener(onmessage)
		this.otherConnected = false
		this.session = false
		if(this.hashLock){
			this.hash("")
			this.hashLock = false
		}
		if(!this.closed){
			setTimeout(() => {
				if(this.socket.readyState !== this.socket.OPEN){
					this.open()
				}
			}, 500)
			pageEvents.send("p2-disconnected")
		}
		var addedType = this.allEvents.get("close")
		if(addedType){
			addedType.forEach(callback => callback())
		}
	}
	send(type, value){
		if(this.socket.readyState === this.socket.OPEN){
			if(typeof value === "undefined"){
				this.socket.send(JSON.stringify({type: type}))
			}else{
				this.socket.send(JSON.stringify({type: type, value: value}))
			}
		}else{
			pageEvents.once(this, "open").then(() => {
				this.send(type, value)
			})
		}
	}
	messageEvent(event){
		try{
			var response = JSON.parse(event.data)
		}catch(e){
			var response = {}
		}
		this.lastMessages[response.type] = response
		var addedType = this.allEvents.get("message")
		if(addedType){
			addedType.forEach(callback => callback(response))
		}
	}
	getMessage(type){
		if(type in this.lastMessages){
			return this.lastMessages[type]
		}
	}
	clearMessage(type){
		if(type in this.lastMessages){
			this.lastMessages[type] = null
		}
	}
	message(response){
		switch(response.type){
			case "gamestart":
				this.otherConnected = true
				this.notes = []
				this.drumrollPace = 45
				this.dai = 2
				this.kaAmount = 0
				this.results = false
				this.branch = "normal"
				break
			case "gameend":
				this.otherConnected = false
				if(this.session){
					pageEvents.send("session-end")
				}else if(!this.results){
					pageEvents.send("p2-game-end")
				}
				this.session = false
				if(this.hashLock){
					this.hash("")
					this.hashLock = false
				}
				break
			case "gameresults":
				this.results = {}
				for(var i in response.value){
					this.results[i] = response.value[i].toString()
				}
				break
			case "note":
				this.notes.push(response.value)
				if(response.value.dai){
					this.dai = response.value.dai
				}
				break
			case "drumroll":
				this.drumrollPace = response.value.pace
				if("kaAmount" in response.value){
					this.kaAmount = response.value.kaAmount
				}
				break
			case "branch":
				this.branch = response.value
				this.branchSet = false
				break
			case "session":
				this.clearMessage("users")
				this.otherConnected = true
				this.session = true
				break
		}
	}
	onhashchange(){
		if(this.hashLock){
			this.hash(this.currentHash)
		}else{
			location.reload()
		}
	}
	hash(string){
		this.currentHash = string
		history.replaceState("", "", location.pathname + (string ? "#" + string : ""))
	}
	play(circle, mekadon){
		if(this.otherConnected || this.notes.length > 0){
			var type = circle.type
			var drumrollNotes = type === "balloon" || type === "drumroll" || type === "daiDrumroll"
			
			if(drumrollNotes && mekadon.getMS() > circle.endTime){
				circle.played(-1, false)
				mekadon.game.updateCurrentCircle()
			}
			
			if(drumrollNotes){
				mekadon.playDrumrollAt(circle, 0, this.drumrollPace, type === "drumroll" || type === "daiDrumroll" ? this.kaAmount : 0)
			}else if(this.notes.length === 0){
				mekadon.play(circle)
			}else{
				var note = this.notes[0]
				if(note.score >= 0){
					var dai = 1
					if(circle.type === "daiDon" || circle.type === "daiKa"){
						dai = this.dai
					}
					if(mekadon.playAt(circle, note.ms, note.score, dai, note.reverse)){
						this.notes.shift()
					}
				}else{
					if(mekadon.miss(circle)){
						this.notes.shift()
					}
				}
			}
		}else if(mekadon.miss(circle)){
			this.notes.shift()
		}
	}
}
