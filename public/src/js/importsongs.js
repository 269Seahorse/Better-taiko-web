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
		var metaFiles = []
		this.otherFiles = {}
		this.songs = []
		this.courseTypes = {
			"easy": 0,
			"normal": 1,
			"hard": 2,
			"oni": 3,
			"ura": 4
		}
		this.categories = {
			"j-pop": "J-POP",
			"pop": "J-POP",
			"アニメ": "アニメ",
			"anime": "アニメ",
			"アニメ": "アニメ",
			"ボーカロイド™曲": "ボーカロイド™曲",
			"ボーカロイド曲": "ボーカロイド™曲",
			"ボーカロイド": "ボーカロイド™曲",
			"vocaloid™ music": "ボーカロイド™曲",
			"vocaloid music": "ボーカロイド™曲",
			"vocaloid": "ボーカロイド™曲",
			"バラエティ": "バラエティ",
			"バラエティー": "バラエティ",
			"どうよう": "バラエティ",
			"童謡・民謡": "バラエティ",
			"variety": "バラエティ",
			"children": "バラエティ",
			"children/folk": "バラエティ",
			"children-folk": "バラエティ",
			"クラシック": "クラシック",
			"クラッシック": "クラシック",
			"classical": "クラシック",
			"classic": "クラシック",
			"ゲームミュージック": "ゲームミュージック",
			"game music": "ゲームミュージック",
			"ナムコオリジナル": "ナムコオリジナル",
			"namco original": "ナムコオリジナル"
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
			}else if(name === "genre.ini" || name === "box.def"){
				var level = (file.webkitRelativePath.match(/\//g) || []).length
				metaFiles.push({
					file: file,
					level: (level * 2) + (name === "genre.ini" ? 1 : 0)
				})
			}else{
				this.otherFiles[file.webkitRelativePath.toLowerCase()] = file
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
		reader.readAsText(file, "sjis")
		return promise
	}
	
	addTja(fileObj){
		var file = fileObj.file
		var index = fileObj.index
		var category = fileObj.category
		var reader = new FileReader()
		var promise = pageEvents.load(reader).then(event => {
			var data = event.target.result.replace(/\0/g, "").split("\n")
			var tja = new ParseTja(data, "oni", 0, true)
			var songObj = {
				id: index + 1,
				type: "tja",
				chart: data,
				stars: []
			}
			var dir = file.webkitRelativePath.toLowerCase()
			dir = dir.slice(0, dir.lastIndexOf("/") + 1)
			var hasCategory = false
			for(var diff in tja.metadata){
				var meta = tja.metadata[diff]
				songObj.title = songObj.title_en = meta.title || file.name.slice(0, file.name.lastIndexOf("."))
				var subtitle = meta.subtitle || ""
				if(subtitle.startsWith("--")){
					subtitle = subtitle.slice(2)
				}
				songObj.subtitle = songObj.subtitle_en = subtitle
				songObj.preview = meta.demostart ? Math.floor(meta.demostart * 1000) : 0
				if(meta.level){
					songObj.stars[this.courseTypes[diff]] = meta.level
				}
				if(meta.wave){
					songObj.music = this.otherFiles[dir + meta.wave.toLowerCase()]
				}
				if(meta.genre){
					songObj.category = this.categories[meta.genre.toLowerCase()] || meta.genre
				}
			}
			if(!songObj.category){
				songObj.category = category || this.getCategory(file)
			}
			if(songObj.music && songObj.stars.filter(star => star).length !== 0){
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
			var osu = new ParseOsu(data, 0, true)
			var dir = file.webkitRelativePath.toLowerCase()
			dir = dir.slice(0, dir.lastIndexOf("/") + 1)
			var songObj = {
				id: index + 1,
				type: "osu",
				chart: data,
				subtitle: osu.metadata.ArtistUnicode || osu.metadata.Artist,
				subtitle_en: osu.metadata.Artist || osu.metadata.ArtistUnicode,
				preview: osu.generalInfo.PreviewTime,
				stars: [null, null, null, parseInt(osu.difficulty.overallDifficulty) || 1],
				music: this.otherFiles[dir + osu.generalInfo.AudioFilename.toLowerCase()]
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
				songObj.title_en = (osu.metadata.Title || osu.metadata.TitleUnicode) + suffix
			}else{
				songObj.title = filename
			}
			if(songObj.music){
				this.songs[index] = songObj
			}
			songObj.category = category || this.getCategory(file)
		}).catch(() => {})
		reader.readAsText(file)
		return promise
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
	
	loaded(){
		this.songs = this.songs.filter(song => typeof song !== "undefined")
		if(this.songs.length){
			assets.songs = this.songs
			assets.customSongs = true
			assets.customSelected = 0
			assets.sounds["don"].play()
			this.songSelect.clean()
			setTimeout(() => {
				loader.screen.removeChild(this.loaderDiv)
				this.clean()
				new SongSelect("browse", false, this.songSelect.touchEnabled)
			}, 500)
		}else{
			loader.screen.removeChild(this.loaderDiv)
			this.songSelect.browse.parentNode.reset()
			this.songSelect.redrawRunning = true
			this.clean()
		}
	}
	
	clean(){
		delete this.loaderDiv
		delete this.songs
		delete this.tjaFiles
		delete this.osuFiles
		delete this.otherFiles
	}
}
