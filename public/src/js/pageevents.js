class PageEvents{
	constructor(){
		this.allEvents = new Map()
		this.keyListeners = new Map()
		this.add(window, "keydown", this.keyEvent.bind(this))
		this.add(window, "keyup", this.keyEvent.bind(this))
	}
	add(target, type, callback){
		this.remove(target, type)
		var addedEvent = this.allEvents.get(target)
		if(!addedEvent){
			addedEvent = new Map()
			this.allEvents.set(target, addedEvent)
		}
		addedEvent.set(type, callback)
		return target.addEventListener(type, callback)
	}
	remove(target, type){
		var addedEvent = this.allEvents.get(target)
		if(addedEvent){
			var callback = addedEvent.get(type)
			if(callback){
				target.removeEventListener(type, callback)
				addedEvent.delete(type)
				if(addedEvent.size == 0){
					return this.allEvents.delete(target)
				}
			}
		}
	}
	once(target, type){
		return new Promise(resolve => {
			this.add(target, type, event => {
				this.remove(target, type)
				return resolve(event)
			})
		})
	}
	race(){
		var target = arguments[0]
		return new Promise(resolve => {
			for(var i = 1;i < arguments.length; i++){
				let type = arguments[i]
				this.add(target, type, event => {
					resolve({
						type: type,
						event: event
					})
				})
			}
		}).then(response => {
			for(var i = 1;i < arguments.length; i++){
				this.remove(target, arguments[i])
			}
			return response
		})
	}
	load(target){
		return new Promise((resolve, reject) => {
			this.race(target, "load", "error", "abort").then(response => {
				if(response.type === "load"){
					return resolve(response.event)
				}
				return reject()
			})
		})
	}
	keyEvent(event){
		this.keyListeners.forEach(addedKeyCode => {
			this.checkListener(addedKeyCode.get("all"), event)
			this.checkListener(addedKeyCode.get(event.keyCode), event)
		})
	}
	checkListener(keyObj, event){
		if(keyObj && (
			keyObj.type === "both"
			|| keyObj.type === "down" && event.type === "keydown"
			|| keyObj.type === "up" && event.type === "up"
		)){
			keyObj.callback(event)
		}
	}
	keyAdd(target, keyCode, type, callback){
		// keyCode="all", type="both"
		var addedKeyCode = this.keyListeners.get(target)
		if(!addedKeyCode){
			addedKeyCode = new Map()
			this.keyListeners.set(target, addedKeyCode)
		}
		addedKeyCode.set(keyCode, {
			type: type,
			callback: callback
		})
	}
	keyRemove(target, keyCode){
		var addedKeyCode = this.keyListeners.get(target)
		if(addedKeyCode){
			var keyObj = addedKeyCode.get(keyCode)
			if(keyObj){
				addedKeyCode.delete(keyCode)
				if(addedKeyCode.size == 0){
					return this.keyListeners.delete(target)
				}
			}
		}
	}
	keyOnce(target, keyCode, type){
		return new Promise(resolve => {
			this.keyAdd(target, keyCode, type, event => {
				this.keyRemove(target, keyCode)
				return resolve(event)
			})
		})
	}
}
