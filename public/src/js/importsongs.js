class ImportSongs{
	constructor(songSelect, event){
		this.songSelect = songSelect
		this.songSelect.redrawRunning = false
		this.songSelect.pointer(false)
		
		this.loaderDiv = document.createElement("div")
		this.loaderDiv.innerHTML = assets.pages["loadsong"]
		loader.screen.appendChild(this.loaderDiv)
		var loadingText = document.getElementById("loading-text")
		loadingText.appendChild(document.createTextNode(strings.loading))
		loadingText.setAttribute("alt", strings.loading)
		
		var files = []
		for(var i = 0; i < event.target.files.length; i++){
			files.push(event.target.files[i])
		}
		var extensionRegex = /\.[^\/]+$/
		files.sort((a, b) => {
			var path1 = a.webkitRelativePath.replace(extensionRegex, "")
			var path2 = b.webkitRelativePath.replace(extensionRegex, "")
			return path1 > path2 ? 1 : -1
		})
		
		this.tjaFiles = []
		this.osuFiles = []
		this.assetFiles = {}
		var metaFiles = []
		this.otherFiles = {}
		this.songs = []
		this.stylesheet = []
		this.songTitle = {}
		this.uraRegex = /\s*[\(（]裏[\)）]$/
		this.courseTypes = {
			"easy": 0,
			"normal": 1,
			"hard": 2,
			"oni": 3,
			"ura": 4
		}
		this.categories = {
			"ボーカロイド曲": "ボーカロイド™曲",
			"ボーカロイド": "ボーカロイド™曲",
			"vocaloid music": "ボーカロイド™曲",
			"vocaloid": "ボーカロイド™曲",
			"バラエティー": "バラエティ",
			"どうよう": "バラエティ",
			"童謡・民謡": "バラエティ",
			"children": "バラエティ",
			"children/folk": "バラエティ",
			"children-folk": "バラエティ",
			"クラッシック": "クラシック",
			"classic": "クラシック"
		}
		for(var i in allStrings){
			for(var ja in allStrings[i].categories){
				this.categories[allStrings[i].categories[ja].toLowerCase()] = ja
			}
		}
		this.assetSelectors = {
			"bg-pattern-1": ".pattern-bg",
			"bg_genre_0": "#song-select",
			"title-screen": "#title-screen",
			"dancing-don": "#loading-don",
			"touch_drum": "#touch-drum-img",
			"touch_fullscreen": "#touch-full-btn",
			"touch_pause": "#touch-pause-btn",
			"bg_stage_1": ".song-stage-1",
			"bg_stage_2": ".song-stage-2",
			"bg_stage_3": ".song-stage-3"
		}
		
		for(var i = 0; i < files.length; i++){
			var file = files[i]
			var name = file.name.toLowerCase()
			var path = file.webkitRelativePath.toLowerCase()
			if(name.endsWith(".tja")){
				this.tjaFiles.push({
					file: file,
					index: i
				})
			}else if(name.endsWith(".osu")){
				this.osuFiles.push({
					file: file,
					index: i
				})
			}else if(name === "genre.ini" || name === "box.def" || name === "songtitle.txt"){
				var level = (file.webkitRelativePath.match(/\//g) || []).length
				metaFiles.push({
					file: file,
					level: (level * 2) + (name === "genre.ini" ? 1 : 0)
				})
			}else if(path.indexOf("/taiko-web assets/") !== -1){
				if(!(name in this.assetFiles)){
					this.assetFiles[name] = file
				}
			}else{
				this.otherFiles[path] = file
			}
		}
		
		var metaPromises = []
		
		metaFiles.forEach(fileObj => {
			metaPromises.push(this.addMeta(fileObj))
		})
		
		Promise.all(metaPromises).then(() => {
			var songPromises = []
			
			this.tjaFiles.forEach(fileObj => {
				songPromises.push(this.addTja(fileObj))
			})
			this.osuFiles.forEach(fileObj => {
				songPromises.push(this.addOsu(fileObj))
			})
			songPromises.push(this.addAssets())
			Promise.all(songPromises).then(this.loaded.bind(this))
		})
	}
	
	addMeta(fileObj){
		var file = fileObj.file
		var level = fileObj.level
		var name = file.name.toLowerCase()
		var reader = new FileReader()
		var promise = pageEvents.load(reader).then(event => {
			var data = event.target.result.replace(/\0/g, "").split("\n")
			var category
			if(name === "genre.ini"){
				var key
				for(var i = 0; i < data.length; i++){
					var line = data[i].trim().toLowerCase()
					if(line.startsWith("[") && line.endsWith("]")){
						key = line.slice(1, -1)
					}else if(key === "genre"){
						var equalsPos = line.indexOf("=")
						if(equalsPos !== -1 && line.slice(0, equalsPos).trim() === "genrename"){
							var value = line.slice(equalsPos + 1).trim()
							category = this.categories[value] || data[i].trim().slice(equalsPos + 1).trim()
							break
						}
					}
				}
			}else if(name === "box.def"){
				for(var i = 0; i < data.length; i++){
					var line = data[i].trim().toLowerCase()
					if(line.startsWith("#title:")){
						var value = line.slice(7).trim()
						if(value in this.categories){
							category = this.categories[value]
						}
					}else if(line.startsWith("#genre:")){
						var value = line.slice(7).trim()
						category = this.categories[value] || data[i].trim().slice(7).trim()
						break
					}
				}
			}else if(name === "songtitle.txt"){
				var lastTitle
				for(var i = 0; i < data.length; i++){
					var line = data[i].trim()
					if(line){
						var lang = line.slice(0, 2)
						if(line.charAt(2) !== " " || !(lang in allStrings)){
							this.songTitle[line] = {}
							lastTitle = line
						}else if(lastTitle){
							this.songTitle[lastTitle][lang] = line.slice(3).trim()
						}
					}
				}
			}
			if(category){
				var metaPath = file.webkitRelativePath.toLowerCase().slice(0, file.name.length * -1)
				var filesLoop = fileObj => {
					var tjaPath = fileObj.file.webkitRelativePath.toLowerCase().slice(0, fileObj.file.name.length * -1)
					if(tjaPath.startsWith(metaPath) && (!("categoryLevel" in fileObj) || fileObj.categoryLevel < level)){
						fileObj.category = category
						fileObj.categoryLevel = level
					}
				}
				this.tjaFiles.forEach(filesLoop)
				this.osuFiles.forEach(filesLoop)
			}
		}).catch(() => {})
		if(name === "songtitle.txt"){
			reader.readAsText(file)
		}else{
			reader.readAsText(file, "sjis")
		}
		return promise
	}
	
	addTja(fileObj){
		var file = fileObj.file
		var index = fileObj.index
		var category = fileObj.category
		var reader = new FileReader()
		var promise = pageEvents.load(reader).then(event => {
			var data = event.target.result.replace(/\0/g, "").split("\n")
			var tja = new ParseTja(data, "oni", 0, 0, true)
			var songObj = {
				id: index + 1,
				type: "tja",
				chart: file,
				stars: [],
				music: "muted"
			}
			var titleLang = {}
			var subtitleLang = {}
			var dir = file.webkitRelativePath.toLowerCase()
			dir = dir.slice(0, dir.lastIndexOf("/") + 1)
			var hasCategory = false
			for(var diff in tja.metadata){
				var meta = tja.metadata[diff]
				songObj.title = meta.title || file.name.slice(0, file.name.lastIndexOf("."))
				var subtitle = meta.subtitle || ""
				if(subtitle.startsWith("--") || subtitle.startsWith("++")){
					subtitle = subtitle.slice(2).trim()
				}
				songObj.subtitle = subtitle
				songObj.preview = meta.demostart || 0
				songObj.stars[this.courseTypes[diff]] = (meta.level || "0") + (meta.branch ? " B" : "")
				if(meta.wave){
					songObj.music = this.otherFiles[dir + meta.wave.toLowerCase()] || songObj.music
				}
				if(meta.genre){
					songObj.category = this.categories[meta.genre.toLowerCase()] || meta.genre
				}
				if(meta.taikowebskin){
					songObj.song_skin = this.getSkin(dir, meta.taikowebskin)
				}
				if(meta.maker){
				    songObj.maker = {name: meta.maker, id: 1}
				}
				for(var id in allStrings){
					var songTitle = songObj.title
					var ura = ""
					if(songTitle){
						var uraPos = songTitle.search(this.uraRegex)
						if(uraPos !== -1){
							ura = songTitle.slice(uraPos)
							songTitle = songTitle.slice(0, uraPos)
						}
					}
					if(meta["title" + id]){
						titleLang[id] = meta["title" + id]
					}else if(songTitle in this.songTitle && this.songTitle[songTitle][id]){
						titleLang[id] = this.songTitle[songTitle][id] + ura
					}
					if(meta["subtitle" + id]){
						subtitleLang[id] = meta["subtitle" + id]
					}
				}
			}
			var titleLangArray = []
			for(var id in titleLang){
				titleLangArray.push(id + " " + titleLang[id])
			}
			if(titleLangArray.length !== 0){
				songObj.title_lang = titleLangArray.join("\n")
			}
			var subtitleLangArray = []
			for(var id in subtitleLang){
				subtitleLangArray.push(id + " " + subtitleLang[id])
			}
			if(subtitleLangArray.length !== 0){
				songObj.subtitle_lang = subtitleLangArray.join("\n")
			}
			if(!songObj.category){
				songObj.category = category || this.getCategory(file)
			}
			if(songObj.stars.length !== 0){
				this.songs[index] = songObj
			}
		}).catch(() => {})
		reader.readAsText(file, "sjis")
		return promise
	}
	
	addOsu(fileObj){
		var file = fileObj.file
		var index = fileObj.index
		var category = fileObj.category
		var reader = new FileReader()
		var promise = pageEvents.load(reader).then(event => {
			var data = event.target.result.replace(/\0/g, "").split("\n")
			var osu = new ParseOsu(data, "oni", 0, 0, true);
			var dir = file.webkitRelativePath.toLowerCase()
			dir = dir.slice(0, dir.lastIndexOf("/") + 1)
			var songObj = {
				id: index + 1,
				type: "osu",
				chart: file,
				subtitle: osu.metadata.ArtistUnicode || osu.metadata.Artist,
				subtitle_lang: osu.metadata.Artist || osu.metadata.ArtistUnicode,
				preview: osu.generalInfo.PreviewTime / 1000,
				stars: [null, null, null, parseInt(osu.difficulty.overallDifficulty) || 1],
				music: this.otherFiles[dir + osu.generalInfo.AudioFilename.toLowerCase()] || "muted"
			}
			var filename = file.name.slice(0, file.name.lastIndexOf("."))
			var title = osu.metadata.TitleUnicode || osu.metadata.Title
			if(title){
				var suffix = ""
				var matches = filename.match(/\[.+?\]$/)
				if(matches){
					suffix = " " + matches[0]
				}
				songObj.title = title + suffix
				songObj.title_lang = (osu.metadata.Title || osu.metadata.TitleUnicode) + suffix
			}else{
				songObj.title = filename
			}
			this.songs[index] = songObj
			songObj.category = category || this.getCategory(file)
		}).catch(() => {})
		reader.readAsText(file)
		return promise
	}
	
	addAssets(){
		return new Promise((resolve, reject) => {
			var promises = []
			for(let name in this.assetFiles){
				let id = this.getFilename(name)
				var file = this.assetFiles[name]
				if(name === "vectors.json"){
					var reader = new FileReader()
					promises.push(pageEvents.load(reader).then(() => response => {
						vectors = JSON.parse(response)
					}))
					reader.readAsText(file)
				}
				if(assets.img.indexOf(name) !== -1){
					let image = document.createElement("img")
					promises.push(pageEvents.load(image).then(() => {
						if(id in this.assetSelectors){
							var selector = this.assetSelectors[id]
							this.stylesheet.push(selector + '{background-image:url("' + image.src + '")}')
						}
					}))
					image.id = name
					image.src = URL.createObjectURL(file)
					loader.assetsDiv.appendChild(image)
					assets.image[id].parentNode.removeChild(assets.image[id])
					assets.image[id] = image
				}
				if(assets.audioSfx.indexOf(name) !== -1){
					assets.sounds[id].clean()
					promises.push(this.loadSound(file, name, snd.sfxGain))
				}
				if(assets.audioMusic.indexOf(name) !== -1){
					assets.sounds[id].clean()
					promises.push(this.loadSound(file, name, snd.musicGain))
				}
				if(assets.audioSfxLR.indexOf(name) !== -1){
					assets.sounds[id + "_p1"].clean()
					assets.sounds[id + "_p2"].clean()
					promises.push(this.loadSound(file, name, snd.sfxGain).then(sound => {
						assets.sounds[id + "_p1"] = assets.sounds[id].copy(snd.sfxGainL)
						assets.sounds[id + "_p2"] = assets.sounds[id].copy(snd.sfxGainR)
					}))
				}
				if(assets.audioSfxLoud.indexOf(name) !== -1){
					assets.sounds[id].clean()
					promises.push(this.loadSound(file, name, snd.sfxLoudGain))
				}
			}
			Promise.all(promises).then(resolve, reject)
		})
	}
	loadSound(file, name, gain){
		var id = this.getFilename(name)
		return gain.load(file, true).then(sound => {
			assets.sounds[id] = sound
		})
	}
	getFilename(name){
		return name.slice(0, name.lastIndexOf("."))
	}
	
	getCategory(file){
		var path = file.webkitRelativePath.toLowerCase().split("/")
		for(var i = path.length - 2; i >= 0; i--){
			for(var cat in this.categories){
				if(path[i].indexOf(cat) !== -1){
					return this.categories[cat]
				}
			}
		}
	}
	
	getSkin(dir, config){
		var configArray = config.toLowerCase().split(",")
		var configObj = {}
		for(var i in configArray){
			var string = configArray[i].trim()
			var space = string.indexOf(" ")
			if(space !== -1){
				configObj[string.slice(0, space).trim()] = string.slice(space + 1).trim()
			}
		}
		if(!configObj.dir){
			configObj.dir = ""
		}
		configObj.prefix = "custom "
		var skinnable = ["song", "stage", "don"]
		for(var i in skinnable){
			var skinName = skinnable[i]
			var skinValue = configObj[skinName]
			if(skinValue && skinValue !== "none"){
				var fileName = "bg_" + skinName + "_" + configObj.name
				var skinPath = this.joinPath(dir, configObj.dir, fileName)
				for(var j = 0; j < 2; j++){
					if(skinValue !== "static"){
						var suffix = (j === 0 ? "_a" : "_b") + ".png"
					}else{
						var suffix = ".png"
					}
					var skinFull = this.normPath(skinPath + suffix)
					if(skinFull in this.otherFiles){
						configObj[fileName + suffix] = this.otherFiles[skinFull]
					}else{
						configObj[skinName] = null
					}
					if(skinValue === "static"){
						break
					}
				}
			}
		}
		return configObj
	}
	
	loaded(){
		this.songs = this.songs.filter(song => typeof song !== "undefined")
		if(this.stylesheet.length){
			var style = document.createElement("style")
			style.appendChild(document.createTextNode(this.stylesheet.join("\n")))
			document.head.appendChild(style)
		}
		if(this.songs.length){
			var length = this.songs.length
			assets.songs = this.songs
			assets.customSongs = true
			assets.customSelected = 0
			assets.sounds["se_don"].play()
			this.songSelect.clean()
			setTimeout(() => {
				loader.screen.removeChild(this.loaderDiv)
				this.clean()
				new SongSelect("browse", false, this.songSelect.touchEnabled)
				pageEvents.send("import-songs", length)
			}, 500)
		}else{
			loader.screen.removeChild(this.loaderDiv)
			this.songSelect.browse.parentNode.reset()
			this.songSelect.redrawRunning = true
			this.clean()
		}
	}
	
	joinPath(){
		var resultPath = arguments[0]
		for(var i = 1; i < arguments.length; i++){
			var pPath = arguments[i]
			if(pPath && (pPath[0] === "/" || pPath[0] === "\\")){
				resultPath = pPath
			}else{
				var lastChar = resultPath.slice(-1)
				if(resultPath && (lastChar !== "/" || lastChar !== "\\")){
					resultPath = resultPath + "/"
				}
				resultPath = resultPath + pPath
			}
		}
		return resultPath
	}
	normPath(path){
		path = path.replace(/\\/g, "/").toLowerCase()
		while(path[0] === "/"){
			path = path.slice(1)
		}
		var comps = path.split("/")
		for(var i = 0; i < comps.length; i++){
			if(comps[i] === "." || comps[i] === ""){
				comps.splice(i, 1)
				i--
			}else if(i !== 0 && comps[i] === ".." && comps[i - 1] !== ".."){
				comps.splice(i - 1, 2)
				i -= 2
			}
		}
		return comps.join("/")
	}
	
	clean(){
		delete this.loaderDiv
		delete this.songs
		delete this.tjaFiles
		delete this.osuFiles
		delete this.otherFiles
	}
}
