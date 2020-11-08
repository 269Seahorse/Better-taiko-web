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
	browse(lockedCallback, errorCallback){
		return this.loadApi()
		.then(() => this.getToken(lockedCallback, errorCallback))
		.then(() => new Promise((resolve, reject) => {
			this.displayPicker(data => {
				if(data.action === "picked"){
					var file = data.docs[0]
					var folders = []
					var rateLimit = -1
					var lastBatch = 0
					var walk = (files, output=[]) => {
						for(var i = 0; i < files.length; i++){
							var path = files[i].path ? files[i].path + "/" : ""
							var list = files[i].list
							if(!list){
								continue
							}
							for(var j = 0; j < list.length; j++){
								var file = list[j]
								if(file.mimeType === this.folder){
									folders.push({
										path: path + file.name,
										id: file.id
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
						var batchList = []
						for(var i = 0; i < folders.length && batchList.length < 100; i++){
							if(!folders[i].listed){
								folders[i].pos = i
								folders[i].listed = true
								batchList.push(folders[i])
							}
						}
						if(batchList.length){
							var batch = gapi.client.newBatch()
							batchList.forEach(folder => {
								var req = {
									q: "'" + folder.id + "' in parents and trashed = false",
									orderBy: "name_natural"
								}
								if(folder.pageToken){
									req.pageToken = folder.pageToken
								}
								batch.add(gapi.client.drive.files.list(req), {id: folder.pos})
							})
							if(lastBatch + batchList.length > 100){
								var waitPromise = this.sleep(1000)
							}else{
								var waitPromise = Promise.resolve()
							}
							return waitPromise.then(() => this.queue()).then(() => batch.then(responses => {
								var files = []
								var rateLimited = false
								for(var i in responses.result){
									var result = responses.result[i].result
									if(result.error){
										if(result.error.errors[0].domain !== "usageLimits"){
											console.warn(result)
										}else if(!rateLimited){
											rateLimited = true
											rateLimit++
											folders.push({
												path: folders[i].path,
												id: folders[i].id,
												pageToken: folders[i].pageToken
											})
										}
									}else{
										if(result.nextPageToken){
											folders.push({
												path: folders[i].path,
												id: folders[i].id,
												pageToken: result.nextPageToken
											})
										}
										files.push({path: folders[i].path, list: result.files})
									}
								}
								if(rateLimited){
									return this.sleep(Math.pow(2, rateLimit) * 1000).then(() => walk(files, output))
								}else{
									return walk(files, output)
								}
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
	getToken(lockedCallback=()=>{}, errorCallback=()=>{}){
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
					errorCallback(strings.gpicker.authError.replace("%s", e.details))
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
			.setLocale(strings.gpicker.locale)
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
	downloadFile(id, arrayBuffer, retry){
		var url = this.filesUrl + id + "?alt=media"
		return this.queue().then(this.getToken.bind(this)).then(() =>
			loader.ajax(url, request => {
				if(arrayBuffer){
					request.responseType = "arraybuffer"
				}
				request.setRequestHeader("Authorization", "Bearer " + this.oauthToken)
			}, true).then(event => {
				var request = event.target
				var reject = () => Promise.reject(`${url} (${request.status})`)
				if(request.status === 200){
					return request.response
				}else if(request.status === 401 && !retry){
					return new Response(request.response).json().then(response => {
						var e = response.error
						if(e && e.errors[0].reason === "authError"){
							delete this.oauthToken
							return this.downloadFile(id, arrayBuffer, true)
						}else{
							return reject()
						}
					}, reject)
				}
				return reject()
			})
		)
	}
	sleep(time){
		return new Promise(resolve => setTimeout(resolve, time))
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
