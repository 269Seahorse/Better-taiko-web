class Loader{
	constructor(){
		this.loadedAssets = 0
		this.errorCount = 0
		this.assetsDiv = document.getElementById("assets")
		this.promises = []
		$("#screen").load("/src/views/loader.html", () => {
			this.run()
		})
	}
	run(){
		this.loaderPercentage = document.querySelector("#loader .percentage")
		
		assets.fonts.forEach(name => {
			var font = document.createElement("h1")
			font.style.fontFamily = name
			font.appendChild(document.createTextNode("I am a font"))
			this.assetsDiv.appendChild(font)
			this.promises.push(new Promise((resolve, reject) => {
				FontDetect.onFontLoaded(name, resolve, reject, {msTimeout: 90000})
			}))
		})
		
		assets.img.forEach(name => {
			var id = name.substr(0, name.length - 4)
			var image = document.createElement("img")
			this.promises.push(promiseLoad(image))
			image.id = name
			image.src = "/assets/img/" + name
			this.assetsDiv.appendChild(image)
			assets.image[id] = image
		})
		
		snd.buffer = new SoundBuffer()
		snd.musicGain = snd.buffer.createGain()
		snd.sfxGain = snd.buffer.createGain()
		snd.buffer.setCrossfade(snd.musicGain, snd.sfxGain, 0.5)
		snd.previewGain = snd.buffer.createGain()
		snd.previewGain.setVolume(0.5)
		
		assets.audioSfx.forEach(name => {
			var id = name.substr(0, name.length-4)
			this.promises.push(snd.sfxGain.load("/assets/audio/" + name).then(sound => {
				assets.sounds[id] = sound
			}))
		})
		assets.audioMusic.forEach(name => {
			var id = name.substr(0, name.length-4)
			this.promises.push(snd.musicGain.load("/assets/audio/" + name).then(sound => {
				assets.sounds[id] = sound
			}))
		})
		
		this.promises.push(ajax("/api/songs").then(songs => {
			assets.songs = JSON.parse(songs)
		}))
		
		this.promises.forEach(promise => {
			promise.then(() => {
				this.assetLoaded()
			}, () => {
				this.errorMsg()
			})
		})
		
		Promise.all(this.promises).then(() => {
			new Titlescreen()
		})
	}
	errorMsg(){
		if(this.errorCount == 0){
			this.loaderPercentage.appendChild(document.createElement("br"))
			this.loaderPercentage.appendChild(document.createTextNode("An error occurred, please refresh"))
		}
		this.errorCount++
	}
	assetLoaded(){
		this.loadedAssets++
		var percentage = parseInt(this.loadedAssets * 100 / this.promises.length)
		document.querySelector("#loader .progress").style.width = percentage + "%"
		this.loaderPercentage.firstChild.data = percentage + "%"
	}
}
function ajax(url){
	return new Promise((resolve, reject) => {
		var request = new XMLHttpRequest()
		request.open("GET", url)
		promiseLoad(request).then(() => {
			resolve(request.response)
		}, reject)
		request.send()
	})
}
function promiseLoad(asset){
	return new Promise((resolve, reject) => {
		asset.addEventListener("load", resolve)
		asset.addEventListener("error", reject)
		asset.addEventListener("abort", reject)
	})
}

var snd = {}
new Loader()
