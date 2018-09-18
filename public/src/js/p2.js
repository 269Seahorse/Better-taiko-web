class P2Connection{
	constructor(){
		this.closed = true
		this.lastMessages = {}
		this.otherConnected = false
		this.allEvents = new Map()
		this.addEventListener("message", this.message.bind(this))
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
		pageEvents.race(this.socket, "open", "close", listener =>{
			if(listener === "open"){
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
		if(!this.closed){
			setTimeout(() => {
				if(this.socket.readyState !== this.socket.OPEN){
					this.open()
				}
			}, 500)
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
		this.lastMessages[response.type] = response.value
		var addedType = this.allEvents.get("message")
		if(addedType){
			addedType.forEach(callback => callback(response))
		}
	}
	getMessage(type, callback){
		if(type in this.lastMessages){
			return this.lastMessages[type]
		}
	}
	message(response){
		switch(response.type){
			case "gamestart":
				this.otherConnected = true
				this.notes = []
				this.drumrollPace = 45
				this.dai = 2
				this.results = false
				break
			case "gameend":
				this.otherConnected = false
				break
			case "gameresults":
				this.results = response.value
				break
			case "note":
				this.notes.push(response.value)
				if(response.value.dai){
					this.dai = response.value.dai
				}
				break
			case "drumroll":
				this.drumrollPace = response.value.pace
				break
		}
	}
	play(circle, mekadon){
		if(this.otherConnected || this.notes.length > 0){
			var type = circle.getType()
			if(type === "balloon"|| type === "drumroll" || type === "daiDrumroll"){
				mekadon.playDrumrollAt(circle, 0, this.drumrollPace)
			}else if(this.notes.length === 0){
				mekadon.play(circle)
			}else{
				var note = this.notes[0]
				if(note.score >= 0){
					var dai = 1
					if(circle.getType() === "daiDon" || circle.getType() === "daiKa"){
						dai = this.dai
					}
					if(mekadon.playAt(circle, note.ms, note.score, dai)){
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
