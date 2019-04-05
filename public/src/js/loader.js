class Loader{
	constructor(callback){
		this.callback = callback
		this.loadedAssets = 0
		this.assetsDiv = document.getElementById("assets")
		this.screen = document.getElementById("screen")
		this.startTime = Date.now()
		
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
		this.loaderPercentage = document.querySelector("#loader .percentage")
		this.loaderProgress = document.querySelector("#loader .progress")
		
		var queryString = gameConfig._version.commit_short ? "?" + gameConfig._version.commit_short : ""
		
		if(gameConfig.custom_js){
			var script = document.createElement("script")
			this.addPromise(pageEvents.load(script))
			script.src = gameConfig.custom_js + queryString
			document.head.appendChild(script)
		}
		assets.js.forEach(name => {
			var script = document.createElement("script")
			this.addPromise(pageEvents.load(script))
			script.src = "/src/js/" + name + queryString
			document.head.appendChild(script)
		})
		
		this.addPromise(new Promise((resolve, reject) => {
			if(
				versionLink.href !== gameConfig._version.url &&
				gameConfig._version.commit &&
				versionLink.href.indexOf(gameConfig._version.commit) === -1
			){
				// Version in the config does not match version on the page
				reject()
			}
			var cssCount = document.styleSheets.length + assets.css.length
			assets.css.forEach(name => {
				var stylesheet = document.createElement("link")
				stylesheet.rel = "stylesheet"
				stylesheet.href = "/src/css/" + name + queryString
				document.head.appendChild(stylesheet)
			})
			assets.assetsCss.forEach(name => {
				var stylesheet = document.createElement("link")
				stylesheet.rel = "stylesheet"
				stylesheet.href = gameConfig.assets_baseurl + name + queryString
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
		
		assets.fonts.forEach(name => {
			var font = document.createElement("h1")
			font.style.fontFamily = name
			font.appendChild(document.createTextNode("I am a font"))
			this.assetsDiv.appendChild(font)
		})
		
		assets.img.forEach(name => {
			var id = this.getFilename(name)
			var image = document.createElement("img")
			this.addPromise(pageEvents.load(image))
			image.id = name
			image.src = gameConfig.assets_baseurl + "img/" + name
			this.assetsDiv.appendChild(image)
			assets.image[id] = image
		})
		
		assets.views.forEach(name => {
			var id = this.getFilename(name)
			this.addPromise(this.ajax("/src/views/" + name + queryString).then(page => {
				assets.pages[id] = page
			}))
		})
		
		this.addPromise(this.ajax("/api/songs").then(songs => {
			assets.songsDefault = JSON.parse(songs)
			assets.songs = assets.songsDefault
		}))
		
		this.addPromise(this.ajax(gameConfig.assets_baseurl + "img/vectors.json" + queryString).then(response => {
			vectors = JSON.parse(response)
		}))
		
		this.afterJSCount =
			["blurPerformance", "P2Connection"].length +
			assets.fonts.length +
			assets.audioSfx.length +
			assets.audioMusic.length +
			assets.audioSfxLR.length +
			assets.audioSfxLoud.length
		
		Promise.all(this.promises).then(() => {
			
			snd.buffer = new SoundBuffer()
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
			
			assets.fonts.forEach(name => {
				this.addPromise(new Promise(resolve => {
					FontDetect.onFontLoaded(name, resolve, resolve, {msTimeout: Infinity})
				}))
			})
			
			assets.audioSfx.forEach(name => {
				this.addPromise(this.loadSound(name, snd.sfxGain))
			})
			assets.audioMusic.forEach(name => {
				this.addPromise(this.loadSound(name, snd.musicGain))
			})
			assets.audioSfxLR.forEach(name => {
				this.addPromise(this.loadSound(name, snd.sfxGain).then(sound => {
					var id = this.getFilename(name)
					assets.sounds[id + "_p1"] = assets.sounds[id].copy(snd.sfxGainL)
					assets.sounds[id + "_p2"] = assets.sounds[id].copy(snd.sfxGainR)
				}))
			})
			assets.audioSfxLoud.forEach(name => {
				this.addPromise(this.loadSound(name, snd.sfxLoudGain))
			})
			
			this.canvasTest = new CanvasTest()
			this.addPromise(this.canvasTest.blurPerformance().then(result => {
				perf.blur = result
				if(result > 1000 / 50){
					// Less than 50 fps with blur enabled
					disableBlur = true
				}
			}))
			
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
				this.addPromise(new Promise(resolve => {
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
					p2.send("invite", location.hash.slice(1).toLowerCase())
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
			
			settings = new Settings()
			pageEvents.setKbd()
			
			Promise.all(this.promises).then(() => {
				this.canvasTest.drawAllImages().then(result => {
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
	addPromise(promise){
		this.promises.push(promise)
		promise.then(this.assetLoaded.bind(this), this.errorMsg.bind(this))
	}
	loadSound(name, gain){
		var id = this.getFilename(name)
		return gain.load(gameConfig.assets_baseurl + "audio/" + name).then(sound => {
			assets.sounds[id] = sound
		})
	}
	getFilename(name){
		return name.slice(0, name.lastIndexOf("."))
	}
	errorMsg(error){
		console.error(error)
		pageEvents.send("loader-error", error)
		this.error = true
		this.loaderPercentage.appendChild(document.createElement("br"))
		this.loaderPercentage.appendChild(document.createTextNode("An error occurred, please refresh"))
		this.clean()
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
	ajax(url, customRequest){
		return new Promise((resolve, reject) => {
			var request = new XMLHttpRequest()
			request.open("GET", url)
			pageEvents.load(request).then(() => {
				resolve(request.response)
			}, reject)
			if(customRequest){
				customRequest(request)
			}
			request.send()
		})
	}
	clean(){
		var fontDetectDiv = document.getElementById("fontdetectHelper")
		if(fontDetectDiv){
			fontDetectDiv.parentNode.removeChild(fontDetectDiv)
		}
		delete this.loaderPercentage
		delete this.loaderProgress
		delete this.promises
		pageEvents.remove(root, "touchstart")
	}
}
