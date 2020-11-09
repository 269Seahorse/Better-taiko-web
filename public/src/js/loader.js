class Loader{
	constructor(callback){
		this.callback = callback
		this.loadedAssets = 0
		this.assetsDiv = document.getElementById("assets")
		this.screen = document.getElementById("screen")
		this.startTime = Date.now()
		this.errorMessages = []
		
		var promises = []
		
		promises.push(this.ajax("/src/views/loader.html").then(page => {
			this.screen.innerHTML = page
		}))
		
		promises.push(this.ajax("/api/config").then(conf => {
			gameConfig = JSON.parse(conf)
		}))
		
		Promise.all(promises).then(this.run.bind(this))
	}
	run(){
		this.promises = []
		this.loaderDiv = document.querySelector("#loader")
		this.loaderPercentage = document.querySelector("#loader .percentage")
		this.loaderProgress = document.querySelector("#loader .progress")
		
		this.queryString = gameConfig._version.commit_short ? "?" + gameConfig._version.commit_short : ""
		
		if(gameConfig.custom_js){
			this.addPromise(this.loadScript(gameConfig.custom_js), gameConfig.custom_js)
		}
		var oggSupport = new Audio().canPlayType("audio/ogg;codecs=vorbis")
		if(!oggSupport){
			assets.js.push("lib/oggmented-wasm.js")
		}
		assets.js.forEach(name => {
			this.addPromise(this.loadScript("/src/js/" + name), "/src/js/" + name)
		})
		
		var pageVersion = versionLink.href
		var index = pageVersion.lastIndexOf("/")
		if(index !== -1){
			pageVersion = pageVersion.slice(index + 1)
		}
		this.addPromise(new Promise((resolve, reject) => {
			if(
				versionLink.href !== gameConfig._version.url &&
				gameConfig._version.commit &&
				versionLink.href.indexOf(gameConfig._version.commit) === -1
			){
				reject("Version on the page and config does not match\n(page:  " + pageVersion + ",\nconfig: "+ gameConfig._version.commit + ")")
			}
			var cssCount = document.styleSheets.length + assets.css.length
			assets.css.forEach(name => {
				var stylesheet = document.createElement("link")
				stylesheet.rel = "stylesheet"
				stylesheet.href = "/src/css/" + name + this.queryString
				document.head.appendChild(stylesheet)
			})
			assets.assetsCss.forEach(name => {
				var stylesheet = document.createElement("link")
				stylesheet.rel = "stylesheet"
				stylesheet.href = gameConfig.assets_baseurl + name + this.queryString
				document.head.appendChild(stylesheet)
			})
			var checkStyles = () => {
				if(document.styleSheets.length >= cssCount){
					resolve()
					clearInterval(interval)
				}
			}
			var interval = setInterval(checkStyles, 100)
			checkStyles()
		}))
		
		for(var name in assets.fonts){
			var url = gameConfig.assets_baseurl + "fonts/" + assets.fonts[name]
			this.addPromise(new FontFace(name, "url('" + url + "')").load().then(font => {
				document.fonts.add(font)
			}), url)
		}
		
		assets.img.forEach(name=>{
			var id = this.getFilename(name)
			var image = document.createElement("img")
			var url = gameConfig.assets_baseurl + "img/" + name
			this.addPromise(pageEvents.load(image), url)
			image.id = name
			image.src = url
			this.assetsDiv.appendChild(image)
			assets.image[id] = image
		})
		
		assets.views.forEach(name => {
			var id = this.getFilename(name)
			var url = "/src/views/" + name + this.queryString
			this.addPromise(this.ajax(url).then(page => {
				assets.pages[id] = page
			}), url)
		})
		
		this.addPromise(this.ajax("/api/categories").then(cats => {
			assets.categories = JSON.parse(cats)
			assets.categories.forEach(cat => {
				if(cat.song_skin){
					cat.songSkin = cat.song_skin //rename the song_skin property and add category title to categories array
					delete cat.song_skin
					cat.songSkin.infoFill = cat.songSkin.info_fill
					delete cat.songSkin.info_fill
				}
			})
			
			assets.categories.push({
				title: "default",
				songSkin: {
					background: "#ececec",
					border: ["#fbfbfb", "#8b8b8b"],
					outline: "#656565",
					infoFill: "#656565"
				}
			})
		}), "/api/categories")
		
		var url = gameConfig.assets_baseurl + "img/vectors.json" + this.queryString
		this.addPromise(this.ajax(url).then(response => {
			vectors = JSON.parse(response)
		}), url)
		
		this.afterJSCount =
			[
				"/api/songs",
				"blurPerformance",
				"categories"
			].length +
			assets.audioSfx.length +
			assets.audioMusic.length +
			assets.audioSfxLR.length +
			assets.audioSfxLoud.length +
			(gameConfig.accounts ? 1 : 0)
		
		Promise.all(this.promises).then(() => {
			if(this.error){
				return
			}
			
			this.addPromise(this.ajax("/api/songs").then(songs => {
				songs = JSON.parse(songs)
				songs.forEach(song => {
					var directory = gameConfig.songs_baseurl + song.id + "/"
					var songExt = song.music_type ? song.music_type : "mp3"
					song.music = new RemoteFile(directory + "main." + songExt)
					if(song.type === "tja"){
						song.chart = new RemoteFile(directory + "main.tja")
					}else{
						song.chart = {separateDiff: true}
						for(var diff in song.courses){
							if(song.courses[diff]){
								song.chart[diff] = new RemoteFile(directory + diff + ".osu")
							}
						}
					}
					if(song.lyrics){
						song.lyricsFile = new RemoteFile(directory + "main.vtt")
					}
					if(song.preview > 0){
						song.previewMusic = new RemoteFile(directory + "preview.mp3")
					}
				})
				assets.songsDefault = songs
				assets.songs = assets.songsDefault
			}), "/api/songs")
			
			var categoryPromises = []
			assets.categories //load category backgrounds to DOM
				.filter(cat => cat.songSkin && cat.songSkin.bg_img)
				.forEach(cat => {
					let name = cat.songSkin.bg_img
					var id = this.getFilename(name)
					var image = document.createElement("img")
					var url = gameConfig.assets_baseurl + "img/" + name
					categoryPromises.push(pageEvents.load(image).catch(response => {
						this.errorMsg(response, url)
					}))
					image.id = name
					image.src = url
					this.assetsDiv.appendChild(image)
					assets.image[id] = image
				})
			this.addPromise(Promise.all(categoryPromises))
			
			snd.buffer = new SoundBuffer()
			if(!oggSupport){
				snd.buffer.oggDecoder = snd.buffer.fallbackDecoder
			}
			snd.musicGain = snd.buffer.createGain()
			snd.sfxGain = snd.buffer.createGain()
			snd.previewGain = snd.buffer.createGain()
			snd.sfxGainL = snd.buffer.createGain("left")
			snd.sfxGainR = snd.buffer.createGain("right")
			snd.sfxLoudGain = snd.buffer.createGain()
			snd.buffer.setCrossfade(
				[snd.musicGain, snd.previewGain],
				[snd.sfxGain, snd.sfxGainL, snd.sfxGainR],
				0.5
			)
			snd.sfxLoudGain.setVolume(1.2)
			snd.buffer.saveSettings()
			
			this.afterJSCount = 0
			
			assets.audioSfx.forEach(name => {
				this.addPromise(this.loadSound(name, snd.sfxGain), this.soundUrl(name))
			})
			assets.audioMusic.forEach(name => {
				this.addPromise(this.loadSound(name, snd.musicGain), this.soundUrl(name))
			})
			assets.audioSfxLR.forEach(name => {
				this.addPromise(this.loadSound(name, snd.sfxGain).then(sound => {
					var id = this.getFilename(name)
					assets.sounds[id + "_p1"] = assets.sounds[id].copy(snd.sfxGainL)
					assets.sounds[id + "_p2"] = assets.sounds[id].copy(snd.sfxGainR)
				}), this.soundUrl(name))
			})
			assets.audioSfxLoud.forEach(name => {
				this.addPromise(this.loadSound(name, snd.sfxLoudGain), this.soundUrl(name))
			})
			
			this.canvasTest = new CanvasTest()
			this.addPromise(this.canvasTest.blurPerformance().then(result => {
				perf.blur = result
				if(result > 1000 / 50){
					// Less than 50 fps with blur enabled
					disableBlur = true
				}
			}), "blurPerformance")
			
			if(gameConfig.accounts){
				this.addPromise(this.ajax("/api/scores/get").then(response => {
					response = JSON.parse(response)
					if(response.status === "ok"){
						account.loggedIn = true
						account.username = response.username
						account.displayName = response.display_name
						account.don = response.don
						scoreStorage.load(response.scores)
						pageEvents.send("login", account.username)
					}
				}), "/api/scores/get")
			}
			
			settings = new Settings()
			pageEvents.setKbd()
			scoreStorage = new ScoreStorage()
			
			Promise.all(this.promises).then(() => {
				if(this.error){
					return
				}
				if(!account.loggedIn){
					scoreStorage.load()
				}
				for(var i in assets.songsDefault){
					var song = assets.songsDefault[i]
					if(!song.hash){
						song.hash = song.title
					}
					scoreStorage.songTitles[song.title] = song.hash
					var score = scoreStorage.get(song.hash, false, true)
					if(score){
						score.title = song.title
					}
				}
				var promises = []
				
				var readyEvent = "normal"
				var songId
				var hashLower = location.hash.toLowerCase()
				p2 = new P2Connection()
				if(hashLower.startsWith("#song=")){
					var number = parseInt(location.hash.slice(6))
					if(number > 0){
						songId = number
						readyEvent = "song-id"
					}
				}else if(location.hash.length === 6){
					p2.hashLock = true
					promises.push(new Promise(resolve => {
						p2.open()
						pageEvents.add(p2, "message", response => {
							if(response.type === "session"){
								pageEvents.send("session-start", "invited")
								readyEvent = "session-start"
								resolve()
							}else if(response.type === "gameend"){
								p2.hash("")
								p2.hashLock = false
								readyEvent = "session-expired"
								resolve()
							}
						})
						p2.send("invite", {
							id: location.hash.slice(1).toLowerCase(),
							name: account.loggedIn ? account.displayName : null,
							don: account.loggedIn ? account.don : null
						})
						setTimeout(() => {
							if(p2.socket.readyState !== 1){
								p2.hash("")
								p2.hashLock = false
								resolve()
							}
						}, 10000)
					}).then(() => {
						pageEvents.remove(p2, "message")
					}))
				}else{
					p2.hash("")
				}
				
				promises.push(this.canvasTest.drawAllImages())
				
				Promise.all(promises).then(result => {
					perf.allImg = result
					perf.load = Date.now() - this.startTime
					this.canvasTest.clean()
					this.clean()
					this.callback(songId)
					pageEvents.send("ready", readyEvent)
				})
			}, this.errorMsg.bind(this))
		})
	}
	addPromise(promise, url){
		this.promises.push(promise)
		promise.then(this.assetLoaded.bind(this), response => {
			this.errorMsg(response, url)
		})
	}
	soundUrl(name){
		return gameConfig.assets_baseurl + "audio/" + name
	}
	loadSound(name, gain){
		var id = this.getFilename(name)
		return gain.load(new RemoteFile(this.soundUrl(name))).then(sound => {
			assets.sounds[id] = sound
		})
	}
	getFilename(name){
		return name.slice(0, name.lastIndexOf("."))
	}
	errorMsg(error, url){
		if(url || error){
			if(url){
				error = (Array.isArray(error) ? error[0] + ": " : (error ? error + ": " : "")) + url
			}
			this.errorMessages.push(error)
			pageEvents.send("loader-error", url || error)
		}
		if(!this.error){
			this.error = true
			cancelTouch = false
			this.loaderDiv.classList.add("loaderError")
			if(typeof allStrings === "object"){
				var lang = localStorage.lang
				if(!lang){
					var userLang = navigator.languages.slice()
					userLang.unshift(navigator.language)
					for(var i in userLang){
						for(var j in allStrings){
							if(allStrings[j].regex.test(userLang[i])){
								lang = j
							}
						}
					}
				}
				if(!lang){
					lang = "en"
				}
				loader.screen.getElementsByClassName("view-content")[0].innerText = allStrings[lang].errorOccured
			}
			var loaderError = loader.screen.getElementsByClassName("loader-error-div")[0]
			loaderError.style.display = "flex"
			var diagTxt = loader.screen.getElementsByClassName("diag-txt")[0]
			var debugLink = loader.screen.getElementsByClassName("debug-link")[0]
			if(navigator.userAgent.indexOf("Android") >= 0){
				var iframe = document.createElement("iframe")
				diagTxt.appendChild(iframe)
				var body = iframe.contentWindow.document.body
				body.setAttribute("style", `
					font-family: monospace;
					margin: 2px 0 0 2px;
					white-space: pre-wrap;
					word-break: break-all;
					cursor: text;
				`)
				body.setAttribute("onblur", `
					getSelection().removeAllRanges()
				`)
				this.errorTxt = {
					element: body,
					method: "innerText"
				}
			}else{
				var textarea = document.createElement("textarea")
				textarea.readOnly = true
				diagTxt.appendChild(textarea)
				if(!this.touchEnabled){
					textarea.addEventListener("focus", () => {
						textarea.select()
					})
					textarea.addEventListener("blur", () => {
						getSelection().removeAllRanges()
					})
				}
				this.errorTxt = {
					element: textarea,
					method: "value"
				}
			}
			var show = () => {
				diagTxt.style.display = "block"
				debugLink.style.display = "none"
			}
			debugLink.addEventListener("click", show)
			debugLink.addEventListener("touchstart", show)
			this.clean(true)
		}
		var percentage = Math.floor(this.loadedAssets * 100 / (this.promises.length + this.afterJSCount))
		this.errorTxt.element[this.errorTxt.method] = "```\n" + this.errorMessages.join("\n") + "\nPercentage: " + percentage + "%\n```"
	}
	assetLoaded(){
		if(!this.error){
			this.loadedAssets++
			var percentage = Math.floor(this.loadedAssets * 100 / (this.promises.length + this.afterJSCount))
			this.loaderProgress.style.width = percentage + "%"
			this.loaderPercentage.firstChild.data = percentage + "%"
		}
	}
	changePage(name, patternBg){
		this.screen.innerHTML = assets.pages[name]
		this.screen.classList[patternBg ? "add" : "remove"]("pattern-bg")
	}
	ajax(url, customRequest, customResponse){
		var request = new XMLHttpRequest()
		request.open("GET", url)
		var promise = pageEvents.load(request)
		if(!customResponse){
			promise = promise.then(() => {
				if(request.status === 200){
					return request.response
				}else{
					return Promise.reject(`${url} (${request.status})`)
				}
			})
		}
		if(customRequest){
			customRequest(request)
		}
		request.send()
		return promise
	}
	loadScript(url){
		var script = document.createElement("script")
		var url = url + this.queryString
		var promise = pageEvents.load(script)
		script.src = url
		document.head.appendChild(script)
		return promise
	}
	getCsrfToken(){
		return this.ajax("api/csrftoken").then(response => {
			var json = JSON.parse(response)
			if(json.status === "ok"){
				return Promise.resolve(json.token)
			}else{
				return Promise.reject()
			}
		})
	}
	clean(error){
		delete this.loaderDiv
		delete this.loaderPercentage
		delete this.loaderProgress
		if(!error){
			delete this.promises
			delete this.errorText
		}
		pageEvents.remove(root, "touchstart")
	}
}
