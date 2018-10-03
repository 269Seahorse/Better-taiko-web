class Loader{
	constructor(){
		this.loadedAssets = 0
		this.assetsDiv = document.getElementById("assets")
		this.ajax("src/views/loader.html").then(this.run.bind(this))
	}
	run(page){
		this.promises = []
		this.screen = document.getElementById("screen")
		this.screen.innerHTML = page
		this.loaderPercentage = document.querySelector("#loader .percentage")
		this.loaderProgress = document.querySelector("#loader .progress")
		
		assets.fonts.forEach(name => {
			var font = document.createElement("h1")
			font.style.fontFamily = name
			font.appendChild(document.createTextNode("I am a font"))
			this.assetsDiv.appendChild(font)
			this.promises.push(new Promise((resolve, reject) => {
				FontDetect.onFontLoaded(name, resolve, reject, {msTimeout: 90000})
			}))
		})
		var fontDetectDiv = document.getElementById("fontdetectHelper")
		fontDetectDiv.parentNode.removeChild(fontDetectDiv)
		
		assets.img.forEach(name => {
			var id = this.getFilename(name)
			var image = document.createElement("img")
			this.promises.push(pageEvents.load(image))
			image.id = name
			image.src = "/assets/img/" + name
			this.assetsDiv.appendChild(image)
			assets.image[id] = image
		})
		
		snd.buffer = new SoundBuffer()
		snd.musicGain = snd.buffer.createGain()
		snd.sfxGain = snd.buffer.createGain()
		snd.previewGain = snd.buffer.createGain()
		snd.sfxGainL = snd.buffer.createGain("left")
		snd.sfxGainR = snd.buffer.createGain("right")
		snd.buffer.setCrossfade(
			[snd.musicGain, snd.previewGain],
			[snd.sfxGain, snd.sfxGainL, snd.sfxGainR],
			0.5
		)
		
		assets.audioSfx.forEach(name => {
			this.promises.push(this.loadSound(name, snd.sfxGain))
		})
		assets.audioMusic.forEach(name => {
			this.promises.push(this.loadSound(name, snd.musicGain))
		})
		assets.audioSfxLR.forEach(name => {
			this.promises.push(this.loadSound(name, snd.sfxGain).then(sound => {
				var id = this.getFilename(name)
				assets.sounds[id + "_p1"] = assets.sounds[id].copy(snd.sfxGainL)
				assets.sounds[id + "_p2"] = assets.sounds[id].copy(snd.sfxGainR)
			}))
		})
		
		p2 = new P2Connection()
		
		this.promises.push(this.ajax("/api/songs").then(songs => {
			assets.songs = JSON.parse(songs)
		}))
		
		assets.views.forEach(name => {
			var id = this.getFilename(name)
			this.promises.push(this.ajax("src/views/" + name).then(page => {
				assets.pages[id] = page
			}))
		})
		
		this.promises.forEach(promise => {
			promise.then(this.assetLoaded.bind(this))
		})
		
		Promise.all(this.promises).then(() => {
			this.clean()
			new Titlescreen()
		}, this.errorMsg.bind(this))
	}
	loadSound(name, gain){
		var id = this.getFilename(name)
		return gain.load("/assets/audio/" + name).then(sound => {
			assets.sounds[id] = sound
		})
	}
	getFilename(name){
		return name.slice(0, name.lastIndexOf("."))
	}
	errorMsg(){
		this.error = true
		this.loaderPercentage.appendChild(document.createElement("br"))
		this.loaderPercentage.appendChild(document.createTextNode("An error occurred, please refresh"))
		this.clean()
	}
	assetLoaded(){
		if(!this.error){
			this.loadedAssets++
			var percentage = Math.floor(this.loadedAssets * 100 / this.promises.length)
			this.loaderProgress.style.width = percentage + "%"
			this.loaderPercentage.firstChild.data = percentage + "%"
		}
	}
	changePage(name){
		document.getElementById("screen").innerHTML = assets.pages[name]
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
		delete this.assetsDiv
		delete this.loaderPercentage
		delete this.loaderProgress
		delete this.promises
	}
}

var pageEvents = new PageEvents()
var loader = new Loader()
var snd = {}
var p2
