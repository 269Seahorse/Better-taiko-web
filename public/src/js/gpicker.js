class Gpicker{
	constructor(){
		this.apiKey = gameConfig.google_credentials.api_key
		this.oauthClientId = gameConfig.google_credentials.oauth_client_id
		this.projectNumber = gameConfig.google_credentials.project_number
		this.scope = "https://www.googleapis.com/auth/drive.readonly"
		this.folder = "application/vnd.google-apps.folder"
		this.filesUrl = "https://www.googleapis.com/drive/v3/files/"
		this.resolveQueue = []
		this.queueActive = false
	}
	browse(lockedCallback){
		return this.loadApi()
		.then(() => this.getToken(lockedCallback))
		.then(() => new Promise((resolve, reject) => {
			this.displayPicker(data => {
				if(data.action === "picked"){
					var file = data.docs[0]
					var walk = (files, output=[]) => {
						var batch = null
						for(var i = 0; i < files.length; i++){
							var path = files[i].path ? files[i].path + "/" : ""
							var list = files[i].list
							if(!list){
								continue
							}
							for(var j = 0; j < list.length; j++){
								var file = list[j]
								if(file.mimeType === this.folder){
									if(!batch){
										batch = gapi.client.newBatch()
									}
									batch.add(gapi.client.drive.files.list({
										q: "'" + file.id + "' in parents",
										orderBy: "name_natural"
									}), {
										id: path + file.name
									})
								}else{
									output.push(new GdriveFile({
										path: path + file.name,
										name: file.name,
										id: file.id
									}))
								}
							}
						}
						if(batch){
							return this.queue()
							.then(() => batch.then(responses => {
								var files = []
								for(var path in responses.result){
									files.push({path: path, list: responses.result[path].result.files})
								}
								return walk(files, output)
							}))
						}else{
							return output
						}
					}
					if(file.mimeType === this.folder){
						return walk([{list: [file]}]).then(resolve, reject)
					}else{
						return reject("cancel")
					}
				}else if(data.action === "cancel"){
					return reject("cancel")
				}
			})
		}))
	}
	loadApi(){
		if(window.gapi && gapi.client && gapi.client.drive){
			return Promise.resolve()
		}
		return loader.loadScript("https://apis.google.com/js/api.js")
		.then(() => new Promise((resolve, reject) =>
			gapi.load("auth2:picker:client", {
				callback: resolve,
				onerror: reject
			})
		))
		.then(() => new Promise((resolve, reject) =>
			gapi.client.load("drive", "v3").then(resolve, reject)
		))
	}
	getToken(lockedCallback){
		if(this.oauthToken){
			return Promise.resolve()
		}
		if(!this.auth){
			var authPromise = gapi.auth2.init({
				clientId: this.oauthClientId,
				fetch_basic_profile: false,
				scope: this.scope
			}).then(() => {
				this.auth = gapi.auth2.getAuthInstance()
			}, e => {
				if(e.details){
					alert(strings.gpicker.authError.replace("%s", e.details))
				}
				return Promise.reject(e)
			})
		}else{
			var authPromise = Promise.resolve()
		}
		return authPromise.then(() => {
			var user = this.auth.currentUser.get()
			if(!this.checkScope(user)){
				lockedCallback(false)
				this.auth.signIn().then(user => {
					if(this.checkScope(user)){
						lockedCallback(true)
					}else{
						return Promise.reject("cancel")
					}
				})
			}
		})
	}
	checkScope(user){
		if(user.hasGrantedScopes(this.scope)){
			this.oauthToken = user.getAuthResponse(true).access_token
			return this.oauthToken
		}else{
			return false
		}
	}
	displayPicker(callback){
		var picker = gapi.picker.api
		new picker.PickerBuilder()
			.setDeveloperKey(this.apiKey)
			.setAppId(this.projectNumber)
			.setOAuthToken(this.oauthToken)
			.hideTitleBar()
			.addView(new picker.DocsView("folders")
				.setLabel(strings.gpicker.myDrive)
				.setParent("root")
				.setSelectFolderEnabled(true)
				.setMode("grid")
			)
			.addView(new picker.DocsView("folders")
				.setLabel(strings.gpicker.starred)
				.setStarred(true)
				.setSelectFolderEnabled(true)
				.setMode("grid")
			)
			.addView(new picker.DocsView("folders")
				.setLabel(strings.gpicker.sharedWithMe)
				.setOwnedByMe(false)
				.setSelectFolderEnabled(true)
				.setMode("list")
			)
			.setCallback(callback)
			.setSize(Infinity, Infinity)
			.build()
			.setVisible(true)
	}
	downloadFile(id, arrayBuffer){
		return this.queue().then(() =>
			loader.ajax(this.filesUrl + id + "?alt=media", request => {
				if(arrayBuffer){
					request.responseType = "arraybuffer"
				}
				request.setRequestHeader("Authorization", "Bearer " + this.oauthToken)
			})
		)
	}
	queue(){
		return new Promise(resolve => {
			this.resolveQueue.push(resolve)
			if(!this.queueActive){
				this.queueActive = true
				this.queueTimer = setInterval(this.parseQueue.bind(this), 100)
				this.parseQueue()
			}
		})
	}
	parseQueue(){
		if(this.resolveQueue.length){
			var resolve = this.resolveQueue.shift()
			resolve()
		}else{
			this.queueActive = false
			clearInterval(this.queueTimer)
		}
	}
}
