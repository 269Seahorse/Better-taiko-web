class IDB{
	constructor(name, store){
		this.name = name
		this.store = store
	}
	init(){
		if(this.db){
			return Promise.resolve(this.db)
		}
		var request = indexedDB.open(this.name)
		request.onupgradeneeded = event => {
			var db = event.target.result
			db.createObjectStore(this.store)
		}
		return this.promise(request).then(result => {
			this.db = result
			return this.db
		}, target =>
			console.warn("DB error", target)
		)
	}
	promise(request){
		return new Promise((resolve, reject) => {
			return pageEvents.race(request, "success", "error").then(response => {
				if(response.type === "success"){
					return resolve(event.target.result)
				}else{
					return reject(event.target)
				}
			})
		})
	}
	transaction(method, ...args){
		return this.init().then(db =>
			db.transaction(this.store, "readwrite").objectStore(this.store)[method](...args)
		).then(this.promise.bind(this))
	}
	getItem(name){
		return this.transaction("get", name)
	}
	setItem(name, value){
		return this.transaction("put", value, name)
	}
	removeItem(name){
		return this.transaction("delete", name)
	}
	removeDB(){
		delete this.db
		return indexedDB.deleteDatabase(this.name)
	}
}
