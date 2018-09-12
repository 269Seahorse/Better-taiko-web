class P2Connection{
	constructor(){
		this.closed = true
		this.lastMessages = {}
		this.msgCallbacks = {}
		this.closeCallbacks = new Set()
		this.openCallbacks = new Set()
		this.notes = []
		this.otherConnected = false
		this.onmessage("gamestart", () => {
			this.otherConnected = true
			this.notes = []
		})
		this.onmessage("gameend", () => {
			this.otherConnected = false
		})
		this.onmessage("note", response => {
			this.notes.push(response)
		})
	}
	open(){
		this.closed = false
		var wsProtocol = location.protocol == "https:" ? "wss:" : "ws:"
		this.socket = new WebSocket(wsProtocol + "//" + window.location.hostname + "/p2")
		var events = ["open", "close", "message"]
		events.forEach(eventName => {
			this.socket.addEventListener(eventName, event => {
				this[eventName + "Event"](event)
			})
		})
	}
	openEvent(event){
		this.openCallbacks.forEach(obj => {
			obj.callback()
			if(obj.once){
				this.openCallbacks.delete(obj)
			}
		})
	}
	onopen(callback, once){
		this.openCallbacks.add({
			callback: callback,
			once: once
		})
	}
	close(){
		this.closed = true
		this.socket.close()
	}
	closeEvent(event){
		if(!this.closed){
			setTimeout(() => {
				if(this.socket.readyState != this.socket.OPEN){
					this.open()
				}
			}, 500)
		}
		this.closeCallbacks.forEach(obj => {
			obj.callback()
			if(obj.once){
				this.closeCallbacks.delete(obj)
			}
		})
	}
	onclose(callback, once){
		this.closeCallbacks.add({
			callback: callback,
			once: once
		})
	}
	send(type, value){
		if(this.socket.readyState == this.socket.OPEN){
			if(typeof value == "undefined"){
				this.socket.send(JSON.stringify({type: type}))
			}else{
				this.socket.send(JSON.stringify({type: type, value: value}))
			}
		}else{
			this.onopen(() => {
				this.send(type, value)
			}, true)
		}
	}
	messageEvent(event){
		try{
			var data = JSON.parse(event.data)
		}catch(e){
			var data = {}
		}
		this.lastMessages[data.type] = data.value
		if(this.msgCallbacks[data.type]){
			this.msgCallbacks[data.type].forEach(obj => {
				obj.callback(data.value)
				if(obj.once){
					delete this.msgCallbacks[obj]
				}
			})
		}
	}
	onmessage(type, callback, once){
		if(!(type in this.msgCallbacks)){
			this.msgCallbacks[type] = new Set()
		}
		this.msgCallbacks[type].add({
			callback: callback,
			once: once
		})
	}
	getMessage(type, callback){
		if(type in this.lastMessages){
			callback(this.lastMessages[type])
		}
	}
	play(circle, mekadon){
		if(this.otherConnected){
			if(this.notes.length == 0){
				mekadon.play(circle)
			}else{
				var note = this.notes[0]
				if(note.score >= 0){
					if(mekadon.playAt(circle, note.ms, note.score)){
						this.notes.shift()
					}
				}else{
					if(mekadon.miss(circle)){
						this.notes.shift()
					}
				}
			}
		}
	}
}
