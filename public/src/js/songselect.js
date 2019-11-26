class SongSelect{
	constructor(fromTutorial, fadeIn, touchEnabled, songId){
		this.touchEnabled = touchEnabled
		
		loader.changePage("songselect", false)
		this.canvas = document.getElementById("song-sel-canvas")
		this.ctx = this.canvas.getContext("2d")

		this.songSkin = {
			"selected": {
				background: "#ffdb2c",
				border: ["#fff4b5", "#ffa600"],
				outline: "#000"
			},
			"back": {
				background: "#efb058",
				border: ["#ffe7bd", "#c68229"],
				outline: "#ad7723"
			},
			"random": {
				sort: 7,
				background: "#fa91ff",
				border: ["#ffdfff", "#b068b2"],
				outline: "#b221bb"
			},
			"tutorial": {
				sort: 7,
				background: "#29e8aa",
				border: ["#86ffbd", "#009a8c"],
				outline: "#08a28c"
			},
			"about": {
				sort: 7,
				background: "#a2d0e7",
				border: ["#c6dfff", "#4485d9"],
				outline: "#2390d9"
			},
			"settings": {
				sort: 7,
				background: "#ce93fa",
				border: ["#dec4fd", "#a543ef"],
				outline: "#a741ef"
			},
			"browse": {
				sort: 7,
				background: "#fab5d3",
				border: ["#ffe7ef", "#d36aa2"],
				outline: "#d36aa2"
			},
			"J-POP": {
				sort: 0,
				background: "#219fbb",
				border: ["#7ec3d3", "#0b6773"],
				outline: "#005058"
			},
			"アニメ": {
				sort: 1,
				background: "#ff9700",
				border: ["#ffdb8c", "#e75500"],
				outline: "#9c4100"
			},
			"ボーカロイド™曲": {
				sort: 2,
				background: "#def2ef",
				border: ["#f7fbff", "#79919f"],
				outline: "#5a6584"
			},
			"バラエティ": {
				sort: 3,
				background: "#8fd321",
				border: ["#f7fbff", "#587d0b"],
				outline: "#374c00"
			},
			"クラシック": {
				sort: 4,
				background: "#d1a016",
				border: ["#e7cf6b", "#9a6b00"],
				outline: "#734d00"
			},
			"ゲームミュージック": {
				sort: 5,
				background: "#9c72c0",
				border: ["#bda2ce", "#63407e"],
				outline: "#4b1c74"
			},
			"ナムコオリジナル": {
				sort: 6,
				background: "#ff5716",
				border: ["#ffa66b", "#b53000"],
				outline: "#9c2000"
			},
			"default": {
				sort: 7,
				background: "#ececec",
				border: ["#fbfbfb", "#8b8b8b"],
				outline: "#656565"
			}
		}
		this.font = strings.font
		
		this.songs = []
		for(let song of assets.songs){
			var title = this.getLocalTitle(song.title, song.title_lang)
			var subtitle = this.getLocalTitle(title === song.title ? song.subtitle : "", song.subtitle_lang)
			this.songs.push({
				id: song.id,
				title: title,
				subtitle: subtitle,
				skin: song.category in this.songSkin ? this.songSkin[song.category] : this.songSkin.default,
				stars: song.stars,
				category: song.category,
				preview: song.preview || 0,
				type: song.type,
				offset: song.offset,
				songSkin: song.song_skin || {},
				music: song.music,
				volume: song.volume,
				maker: song.maker
			})
		}
		this.songs.sort((a, b) => {
			var catA = a.category in this.songSkin ? this.songSkin[a.category] : this.songSkin.default
			var catB = b.category in this.songSkin ? this.songSkin[b.category] : this.songSkin.default
			if(catA.sort === catB.sort){
				return a.id > b.id ? 1 : -1
			}else{
				return catA.sort > catB.sort ? 1 : -1
			}
		})
		this.songs.push({
			title: strings.back,
			skin: this.songSkin.back,
			action: "back"
		})
		this.songs.push({
			title: strings.randomSong,
			skin: this.songSkin.random,
			action: "random",
			category: strings.random
		})
		if(touchEnabled){
			if(fromTutorial === "tutorial"){
				fromTutorial = false
			}
		}else{
			this.songs.push({
				title: strings.howToPlay,
				skin: this.songSkin.tutorial,
				action: "tutorial",
				category: strings.random
			})
		}
		this.songs.push({
			title: strings.aboutSimulator,
			skin: this.songSkin.about,
			action: "about",
			category: strings.random
		})
		this.songs.push({
			title: strings.gameSettings,
			skin: this.songSkin.settings,
			action: "settings",
			category: strings.random
		})
		if("webkitdirectory" in HTMLInputElement.prototype && !(/Android|iPhone|iPad/.test(navigator.userAgent))){
			this.browse = document.getElementById("browse")
			pageEvents.add(this.browse, "change", this.browseChange.bind(this))
			
			this.songs.push({
				title: assets.customSongs ? strings.defaultSongList : strings.browse,
				skin: this.songSkin.browse,
				action: "browse",
				category: strings.random
			})
		}
		this.songs.push({
			title: strings.back,
			skin: this.songSkin.back,
			action: "back"
		})
		
		this.songAsset = {
			marginTop: 90,
			marginLeft: 18,
			width: 82,
			selectedWidth: 382,
			fullWidth: 912,
			height: 452,
			fullHeight: 502,
			border: 6,
			innerBorder: 8,
			letterBorder: 12
		}
		
		this.diffOptions = [{
			text: strings.back,
			fill: "#efb058",
			iconName: "back",
			iconFill: "#f7d39c",
			letterSpacing: 4
		}, {
			text: strings.songOptions,
			fill: "#b2e442",
			iconName: "options",
			iconFill: "#d9f19f",
			letterSpacing: 0
		}]
		this.optionsList = [strings.none, strings.auto, strings.netplay]
		
		this.draw = new CanvasDraw()
		this.songTitleCache = new CanvasCache()
		this.selectTextCache = new CanvasCache()
		this.categoryCache = new CanvasCache()
		this.difficultyCache = new CanvasCache()
		this.sessionCache = new CanvasCache()
		this.currentSongCache = new CanvasCache()
		
		this.difficulty = [strings.easy, strings.normal, strings.hard, strings.oni]
		this.difficultyId = ["easy", "normal", "hard", "oni", "ura"]
		
		this.sessionText = {
			"sessionstart": strings.sessionStart,
			"sessionend": strings.sessionEnd
		}
		
		this.selectedSong = 0
		this.selectedDiff = 0
		assets.sounds["bgm_songsel"].playLoop(0.1, false, 0, 1.442, 3.506)
		
		if(!assets.customSongs && !fromTutorial && !("selectedSong" in localStorage) && !songId){
			fromTutorial = touchEnabled ? "about" : "tutorial"
		}
		if(p2.session){
			fromTutorial = false
		}
		
		var songIdIndex = -1
		if(fromTutorial){
			this.selectedSong = this.songs.findIndex(song => song.action === fromTutorial)
			this.playBgm(true)
		}else{
			if(songId){
				songIdIndex = this.songs.findIndex(song => song.id === songId)
				if(songIdIndex === -1){
					this.clearHash()
				}
			}
			if(songIdIndex !== -1){
				this.selectedSong = songIdIndex
			}else if(assets.customSongs){
				this.selectedSong = assets.customSelected
			}else if((!p2.session || fadeIn) && "selectedSong" in localStorage){
				this.selectedSong = Math.min(Math.max(0, localStorage["selectedSong"] |0), this.songs.length - 1)
			}
			assets.sounds[songIdIndex !== -1 ? "v_diffsel" : "v_songsel"].play()
			snd.musicGain.fadeOut()
			this.playBgm(false)
		}
		if("selectedDiff" in localStorage){
			this.selectedDiff = Math.min(Math.max(0, localStorage["selectedDiff"] |0), this.diffOptions.length + 3)
		}
		
		this.songSelect = document.getElementById("song-select")
		var cat = this.songs[this.selectedSong].category
		var sort = cat in this.songSkin ? this.songSkin[cat].sort : 7
		this.songSelect.style.backgroundImage = "url('" + assets.image["bg_genre_" + sort].src + "')"
		
		this.previewId = 0
		this.previewList = Array(5)
		
		var skipStart = fromTutorial || p2.session
		this.state = {
			screen: songIdIndex !== -1 ? "difficulty" : (fadeIn ? "titleFadeIn" : (skipStart ? "song" : "title")),
			screenMS: this.getMS(),
			move: 0,
			moveMS: 0,
			ura: 0,
			moveHover: null,
			locked: true,
			hasPointer: false,
			options: 0,
			selLock: false
		}
		this.songSelecting = {
			speed: 800,
			resize: 0.3,
			scrollDelay: 0.1
		}
		
		this.startPreview(true)
		
		this.pressedKeys = {}
		this.keyboard = new Keyboard({
			confirm: ["enter", "space", "don_l", "don_r"],
			back: ["escape"],
			left: ["left", "ka_l"],
			right: ["right", "ka_r"],
			up: ["up"],
			down: ["down"],
			session: ["backspace"],
			ctrl: ["ctrl"],
			shift: ["shift"]
		}, this.keyPress.bind(this))
		this.gamepad = new Gamepad({
			confirm: ["b", "start", "ls", "rs"],
			back: ["a"],
			left: ["l", "lb", "lt", "lsl"],
			right: ["r", "rb", "rt", "lsr"],
			up: ["u", "lsu"],
			down: ["d", "lsd"],
			session: ["back"],
			ctrl: ["y"],
			shift: ["x"]
		}, this.keyPress.bind(this))
		
		if(!assets.customSongs){
			this.startP2()
		}
		
		pageEvents.add(loader.screen, "mousemove", this.mouseMove.bind(this))
		pageEvents.add(loader.screen, "mouseleave", () => {
			this.state.moveHover = null
		})
		pageEvents.add(loader.screen, ["mousedown", "touchstart"], this.mouseDown.bind(this))
		pageEvents.add(this.canvas, "touchend", this.touchEnd.bind(this))
		if(touchEnabled && fullScreenSupported){
			this.touchFullBtn = document.getElementById("touch-full-btn")
			this.touchFullBtn.style.display = "block"
			pageEvents.add(this.touchFullBtn, "touchend", toggleFullscreen)
		}
		
		this.selectable = document.getElementById("song-sel-selectable")
		this.selectableText = ""
		
		this.redrawRunning = true
		this.redrawBind = this.redraw.bind(this)
		this.redraw()
		pageEvents.send("song-select")
		pageEvents.send("song-select-move", this.songs[this.selectedSong])
		if(songIdIndex !== -1){
			pageEvents.send("song-select-difficulty", this.songs[this.selectedSong])
		}
	}
	
	keyPress(pressed, name, event){
		if(pressed){
			if(!this.pressedKeys[name]){
				this.pressedKeys[name] = this.getMS() + 300
			}
		}else{
			this.pressedKeys[name] = 0
			return
		}
		if(name === "ctrl" || name === "shift" || !this.redrawRunning){
			return
		}
		if(this.state.screen === "song"){
			if(name === "confirm"){
				this.toSelectDifficulty()
			}else if(name === "back"){
				this.toTitleScreen()
			}else if(name === "session"){
				this.toSession()
			}else if(name === "left"){
				this.moveToSong(-1)
			}else if(name === "right"){
				this.moveToSong(1)
			}
		}else if(this.state.screen === "difficulty"){
			if(name === "confirm"){
				if(this.selectedDiff === 0){
					this.toSongSelect()
				}else if(this.selectedDiff === 1){
					this.toOptions(1)
				}else{
					this.toLoadSong(this.selectedDiff - this.diffOptions.length, this.pressedKeys["shift"], this.pressedKeys["ctrl"])
				}
			}else if(name === "back" || name === "session"){
				this.toSongSelect()
			}else if(name === "left"){
				this.moveToDiff(-1)
			}else if(name === "right"){
				this.moveToDiff(1)
			}else if(this.selectedDiff === 1 && (name === "up" || name === "down")){
				this.toOptions(name === "up" ? -1 : 1)
			}
		}
	}
	
	mouseDown(event){
		if(event.target === this.selectable || event.target.parentNode === this.selectable){
			this.selectable.focus()
		}else{
			getSelection().removeAllRanges()
			this.selectable.blur()
		}
		if(event.target !== this.canvas || !this.redrawRunning){
			return
		}
		if(event.type === "mousedown"){
			if(event.which !== 1){
				return
			}
			var mouse = this.mouseOffset(event.offsetX, event.offsetY)
			var shift = event.shiftKey
			var ctrl = event.ctrlKey
			var touch = false
		}else{
			event.preventDefault()
			var mouse = this.mouseOffset(event.touches[0].pageX, event.touches[0].pageY)
			var shift = false
			var ctrl = false
			var touch = true
		}
		if(this.state.screen === "song"){
			if(mouse.x > 641 && mouse.y > 603){
				this.toSession()
			}else{
				var moveBy = this.songSelMouse(mouse.x, mouse.y)
				if(moveBy === 0){
					this.toSelectDifficulty()
				}else if(moveBy !== null){
					this.moveToSong(moveBy)
				}
			}
		}else if(this.state.screen === "difficulty"){
			var moveBy = this.diffSelMouse(mouse.x, mouse.y)
			if(mouse.x < 183 || mouse.x > 1095 || mouse.y < 40 || mouse.y > 540){
				this.toSongSelect()
			}else if(moveBy === 0){
				this.selectedDiff = 0
				this.toSongSelect()
			}else if(moveBy === 1){
				this.toOptions(1)
			}else if(moveBy === "maker"){
				window.open(this.songs[this.selectedSong].maker.url)
			}else if(moveBy === this.diffOptions.length + 4){
				this.state.ura = !this.state.ura
				assets.sounds["se_ka"].play()
				if(this.selectedDiff === this.diffOptions.length + 4 && !this.state.ura){
					this.state.move = -1
				}
			}else if(moveBy !== null){
				this.toLoadSong(moveBy - this.diffOptions.length, shift, ctrl, touch)
			}
		}
	}
	touchEnd(event){
		event.preventDefault()
		if(this.state.screen === "song" && this.redrawRunning){
			var currentSong = this.songs[this.selectedSong]
			if(currentSong.action === "browse"){
				var mouse = this.mouseOffset(event.changedTouches[0].pageX, event.changedTouches[0].pageY)
				var moveBy = this.songSelMouse(mouse.x, mouse.y)
				if(moveBy === 0){
					this.toBrowse()
				}
			}
		}
	}
	mouseMove(event){
		var mouse = this.mouseOffset(event.offsetX, event.offsetY)
		var moveTo = null
		if(this.state.screen === "song"){
			if(mouse.x > 641 && mouse.y > 603 && p2.socket.readyState === 1 && !assets.customSongs){
				moveTo = "session"
			}else{
				var moveTo = this.songSelMouse(mouse.x, mouse.y)
				if(moveTo === null && this.state.moveHover === 0 && !this.songs[this.selectedSong].stars){
					this.state.moveMS = this.getMS() - this.songSelecting.speed
				}
			}
			this.state.moveHover = moveTo
		}else if(this.state.screen === "difficulty"){
			var moveTo = this.diffSelMouse(mouse.x, mouse.y)
			if(moveTo === null && this.state.moveHover === this.selectedDiff){
				this.state.moveMS = this.getMS() - 1000
			}
			this.state.moveHover = moveTo
		}
		this.pointer(moveTo !== null)
	}
	mouseOffset(offsetX, offsetY){
		return {
			x: (offsetX * this.pixelRatio - this.winW / 2) / this.ratio + 1280 / 2,
			y: (offsetY * this.pixelRatio - this.winH / 2) / this.ratio + 720 / 2
		}
	}
	pointer(enabled){
		if(!this.canvas){
			return
		}
		if(enabled && this.state.hasPointer === false){
			this.canvas.style.cursor = "pointer"
			this.state.hasPointer = true
		}else if(!enabled && this.state.hasPointer === true){
			this.canvas.style.cursor = ""
			this.state.hasPointer = false
		}
	}
	
	songSelMouse(x, y){
		if(this.state.locked === 0 && this.songAsset.marginTop <= y && y <= this.songAsset.marginTop + this.songAsset.height){
			x -= 1280 / 2
			var dir = x > 0 ? 1 : -1
			x = Math.abs(x)
			var selectedWidth = this.songAsset.selectedWidth
			if(!this.songs[this.selectedSong].stars){
				selectedWidth = this.songAsset.width
			}
			var moveBy = Math.ceil((x - selectedWidth / 2 - this.songAsset.marginLeft / 2) / (this.songAsset.width + this.songAsset.marginLeft)) * dir
			if(moveBy / dir > 0){
				return moveBy
			}else{
				return 0
			}
		}
		return null
	}
	diffSelMouse(x, y){
		if(this.state.locked === 0){
			if(223 < x && x < 367 && 118 < y && y < 422){
				return Math.floor((x - 223) / ((367 - 223) / 2))
			}else if(this.songs[this.selectedSong].maker && this.songs[this.selectedSong].maker.id > 0 && this.songs[this.selectedSong].maker.url && x > 230 && x < 485 && y > 432 && y < 519) {
				return "maker"
			}else if(550 < x && x < 1050 && 95 < y && y < 524){
				var moveBy = Math.floor((x - 550) / ((1050 - 550) / 5)) + this.diffOptions.length
				var currentSong = this.songs[this.selectedSong]
				if(this.state.ura && moveBy === this.diffOptions.length + 3 || currentSong.stars[moveBy - this.diffOptions.length]){
					return moveBy
				}
			}
		}
		return null
	}
	
	moveToSong(moveBy, fromP2){
		var ms = this.getMS()
		if(p2.session && !fromP2){
			if(!this.state.selLock && ms > this.state.moveMS + 800){
				this.state.selLock = true
				p2.send("songsel", {
					song: this.mod(this.songs.length, this.selectedSong + moveBy)
				})
			}
		}else if(this.state.locked !== 1 || fromP2){
			if(this.songs[this.selectedSong].stars && (this.state.locked === 0 || fromP2)){
				this.state.moveMS = ms
			}else{
				this.state.moveMS = ms - this.songSelecting.speed * this.songSelecting.resize
			}
			this.state.move = moveBy
			this.state.lastMove = moveBy
			this.state.locked = 1
			this.state.moveHover = null
			
			var lastMoveMul = Math.pow(Math.abs(moveBy), 1 / 4)
			var changeSpeed = this.songSelecting.speed * lastMoveMul
			var resize = changeSpeed * this.songSelecting.resize / lastMoveMul
			var scrollDelay = changeSpeed * this.songSelecting.scrollDelay
			var resize2 = changeSpeed - resize
			var scroll = resize2 - resize - scrollDelay * 2
			
			var soundsDelay = Math.abs((scroll + resize) / moveBy)
			
			for(var i = 0; i < Math.abs(moveBy) - 1; i++){
				assets.sounds["se_ka"].play((resize + i * soundsDelay) / 1000)
			}
			this.pointer(false)
		}
	}
	moveToDiff(moveBy){
		if(this.state.locked !== 1){
			this.state.move = moveBy
			this.state.moveMS = this.getMS() - 500
			this.state.locked = 1
			assets.sounds["se_ka"].play()
		}
	}
	
	browseChange(event){
		new ImportSongs(this, event)
	}
	
	toSelectDifficulty(fromP2){
		var currentSong = this.songs[this.selectedSong]
		if(p2.session && !fromP2 && currentSong.action !== "random"){
			if(this.songs[this.selectedSong].stars){
				if(!this.state.selLock){
					this.state.selLock = true
					p2.send("songsel", {
						song: this.selectedSong,
						selected: true
					})
				}
			}
		}else if(this.state.locked === 0 || fromP2){
			if(currentSong.stars){
				this.state.screen = "difficulty"
				this.state.screenMS = this.getMS()
				this.state.locked = true
				this.state.moveHover = null
				this.state.ura = 0
				if(this.selectedDiff === this.diffOptions.length + 4){
					this.selectedDiff = this.diffOptions.length + 3
				}
				
				assets.sounds["se_don"].play()
				assets.sounds["v_songsel"].stop()
				assets.sounds["v_diffsel"].play(0.3)
				pageEvents.send("song-select-difficulty", currentSong)
			}else if(currentSong.action === "back"){
				this.clean()
				this.toTitleScreen()
			}else if(currentSong.action === "random"){
				assets.sounds["se_don"].play()
				this.state.locked = true
				do{
					var i = Math.floor(Math.random() * this.songs.length)
				}while(!this.songs[i].stars)
				var moveBy = i - this.selectedSong
				setTimeout(() => {
					this.moveToSong(moveBy)
				}, 200)
				pageEvents.send("song-select-random")
			}else if(currentSong.action === "tutorial"){
				this.toTutorial()
			}else if(currentSong.action === "about"){
				this.toAbout()
			}else if(currentSong.action === "settings"){
				this.toSettings()
			}else if(currentSong.action === "browse"){
				this.toBrowse()
			}
		}
		this.pointer(false)
	}
	toSongSelect(fromP2){
		if(p2.session && !fromP2){
			if(!this.state.selLock){
				this.state.selLock = true
				p2.send("songsel", {
					song: this.selectedSong
				})
			}
		}else if(fromP2 || this.state.locked !== 1){
			this.state.screen = "song"
			this.state.screenMS = this.getMS()
			this.state.locked = true
			this.state.moveHover = null
			
			assets.sounds["v_diffsel"].stop()
			assets.sounds["se_cancel"].play()
		}
		this.clearHash()
		pageEvents.send("song-select-back")
	}
	toLoadSong(difficulty, shift, ctrl, touch){
		this.clean()
		var selectedSong = this.songs[this.selectedSong]
		assets.sounds["v_diffsel"].stop()
		assets.sounds["se_don"].play()
		
		try{
			if(assets.customSongs){
				assets.customSelected = this.selectedSong
			}else{
				localStorage["selectedSong"] = this.selectedSong
			}
			localStorage["selectedDiff"] = difficulty + this.diffOptions.length
		}catch(e){}
		
		if(difficulty === 3 && this.state.ura){
			difficulty = 4
		}
		var autoplay = false
		var multiplayer = false
		if(p2.session || this.state.options === 2){
			multiplayer = true
		}else if(this.state.options === 1){
			autoplay = true
		}else if(shift){
			autoplay = shift
		}else if(p2.socket.readyState === 1 && !assets.customSongs){
			multiplayer = ctrl
		}
		
		new LoadSong({
			"title": selectedSong.title,
			"folder": selectedSong.id,
			"difficulty": this.difficultyId[difficulty],
			"category": selectedSong.category,
			"type": selectedSong.type,
			"offset": selectedSong.offset,
			"songSkin": selectedSong.songSkin,
			"stars": selectedSong.stars[difficulty]
		}, autoplay, multiplayer, touch)
	}
	toOptions(moveBy){
		if(!p2.session){
			assets.sounds["se_ka"].play()
			this.selectedDiff = 1
			do{
				this.state.options = this.mod(this.optionsList.length, this.state.options + moveBy)
			}while((p2.socket.readyState !== 1 || assets.customSongs) && this.state.options === 2)
		}
	}
	toTitleScreen(){
		if(!p2.session){
			assets.sounds["se_cancel"].play()
			this.clean()
			setTimeout(() => {
				new Titlescreen()
			}, 500)
		}
	}
	toTutorial(){
		assets.sounds["se_don"].play()
		this.clean()
		setTimeout(() => {
			new Tutorial(true)
		}, 500)
	}
	toAbout(){
		assets.sounds["se_don"].play()
		this.clean()
		setTimeout(() => {
			new About(this.touchEnabled)
		}, 500)
	}
	toSettings(){
		assets.sounds["se_don"].play()
		this.clean()
		setTimeout(() => {
			new SettingsView(this.touchEnabled)
		}, 500)
	}
	toSession(){
		if(p2.socket.readyState !== 1 || assets.customSongs){
			return
		}
		if(p2.session){
			p2.send("gameend")
		}else{
			localStorage["selectedSong"] = this.selectedSong

			assets.sounds["se_don"].play()
			this.clean()
			setTimeout(() => {
				new Session(this.touchEnabled)
			}, 500)
		}
	}
	toBrowse(){
		if(assets.customSongs){
			assets.customSongs = false
			assets.songs = assets.songsDefault
			assets.sounds["se_don"].play()
			this.clean()
			setTimeout(() => {
				new SongSelect("browse", false, this.touchEnabled)
			}, 500)
			pageEvents.send("import-songs-default")
		}else{
			this.browse.click()
		}
	}
	
	redraw(){
		if(!this.redrawRunning){
			return
		}
		requestAnimationFrame(this.redrawBind)
		var ms = this.getMS()
		
		for(var key in this.pressedKeys){
			if(this.pressedKeys[key]){
				if(ms >= this.pressedKeys[key] + 50){
					this.keyPress(true, key)
					this.pressedKeys[key] = ms
				}
			}
		}
		
		if(!this.redrawRunning){
			return
		}
		
		var ctx = this.ctx
		var winW = innerWidth
		var winH = lastHeight
		if(winW / 32 > winH / 9){
			winW = winH / 9 * 32
		}
		this.pixelRatio = window.devicePixelRatio || 1
		var resolution = settings.getItem("resolution")
		if(resolution === "medium"){
			this.pixelRatio *= 0.75
		}else if(resolution === "low"){
			this.pixelRatio *= 0.5
		}else if(resolution === "lowest"){
			this.pixelRatio *= 0.25
		}
		winW *= this.pixelRatio
		winH *= this.pixelRatio
		var ratioX = winW / 1280
		var ratioY = winH / 720
		var ratio = (ratioX < ratioY ? ratioX : ratioY)
		if(this.winW !== winW || this.winH !== winH){
			this.canvas.width = winW
			this.canvas.height = winH
			ctx.scale(ratio, ratio)
			this.canvas.style.width = (winW / this.pixelRatio) + "px"
			this.canvas.style.height = (winH / this.pixelRatio) + "px"
			
			var borders = (this.songAsset.border + this.songAsset.innerBorder) * 2
			var songsLength = Math.ceil(winW / ratio / (this.songAsset.width + this.songAsset.marginLeft)) + 1
			
			this.songTitleCache.resize(
				(this.songAsset.width - borders + 1) * songsLength,
				this.songAsset.height - borders + 1,
				ratio + 0.2
			)
			
			this.currentSongCache.resize(
				(this.songAsset.width - borders + 1) * 2,
				this.songAsset.height - borders + 1,
				ratio + 0.2
			)
			
			var textW = strings.id === "en" ? 350 : 280
			this.selectTextCache.resize((textW + 53 + 60 + 1) * 2, this.songAsset.marginTop + 15, ratio + 0.5)
			
			var categories = 0
			var lastCategory
			this.songs.forEach(song => {
				var cat = (song.category || "") + song.skin.outline
				if(lastCategory !== cat){
					lastCategory = cat
					categories++
				}
			})
			this.categoryCache.resize(280, this.songAsset.marginTop + 1 , ratio + 0.5)
			
			this.difficultyCache.resize((44 + 56 + 2) * 5, 135 + 10, ratio + 0.5)
			
			var w = winW / ratio / 2
			this.sessionCache.resize(w, 39 * 2, ratio + 0.5)
			for(var id in this.sessionText){
				this.sessionCache.set({
					w: w,
					h: 38,
					id: id
				}, ctx => {
					this.draw.layeredText({
						ctx: ctx,
						text: this.sessionText[id],
						fontSize: 28,
						fontFamily: this.font,
						x: w / 2,
						y: 38 / 2,
						width: w - 30,
						align: "center",
						baseline: "middle"
					}, [
						{outline: "#000", letterBorder: 8},
						{fill: "#fff"}
					])
				})
			}
			
			this.selectableText = ""
		}else if(!document.hasFocus()){
			this.pointer(false)
			return
		}else{
			ctx.clearRect(0, 0, winW / ratio, winH / ratio)
		}
		this.winW = winW
		this.winH = winH
		this.ratio = ratio
		winW /= ratio
		winH /= ratio
		
		var frameTop = winH / 2 - 720 / 2
		var frameLeft = winW / 2 - 1280 / 2
		var songTop = frameTop + this.songAsset.marginTop
		var xOffset = 0
		var songSelMoving = false
		var screen = this.state.screen
		var selectedWidth = this.songAsset.width
		
		if(screen === "title" || screen === "titleFadeIn"){
			if(ms > this.state.screenMS + 1000){
				this.state.screen = "song"
				this.state.screenMS = ms + (ms - this.state.screenMS - 1000)
				this.state.moveMS = ms - this.songSelecting.speed * this.songSelecting.resize + (ms - this.state.screenMS)
				this.state.locked = 3
				this.state.lastMove = 1
			}else{
				this.state.moveMS = ms - this.songSelecting.speed * this.songSelecting.resize + (ms - this.state.screenMS - 1000)
			}
			if(ms > this.state.screenMS + 500){
				this.state.screen = "title"
				screen = "title"
			}
		}
		
		if(screen === "title" || screen === "titleFadeIn" || screen === "song"){
			var textW = strings.id === "en" ? 350 : 280
			this.selectTextCache.get({
				ctx: ctx,
				x: frameLeft,
				y: frameTop,
				w: textW + 53 + 60,
				h: this.songAsset.marginTop + 15,
				id: "song"
			}, ctx => {
				this.draw.layeredText({
					ctx: ctx,
					text: strings.selectSong,
					fontSize: 48,
					fontFamily: this.font,
					x: 53,
					y: 30,
					width: textW,
					letterSpacing: strings.id === "en" ? 0 : 2,
					forceShadow: true
				}, [
					{x: -2, y: -2, outline: "#000", letterBorder: 22},
					{},
					{x: 2, y: 2, shadow: [3, 3, 3]},
					{x: 2, y: 2, outline: "#ad1516", letterBorder: 10},
					{x: -2, y: -2, outline: "#ff797b"},
					{outline: "#f70808"},
					{fill: "#fff", shadow: [-1, 1, 3, 1.5]}
				])
			})
			
			var category = this.songs[this.selectedSong].category
			if(category){
				var selectedSong = this.songs[this.selectedSong]
				this.categoryCache.get({
					ctx: ctx,
					x: winW / 2 - 280 / 2,
					y: frameTop,
					w: 280,
					h: this.songAsset.marginTop,
					id: category + selectedSong.skin.outline
				}, ctx => {
					if(category in strings.categories){
						var categoryName = strings.categories[category]
					}else{
						var categoryName = category
					}
					this.draw.layeredText({
						ctx: ctx,
						text: categoryName,
						fontSize: 40,
						fontFamily: this.font,
						x: 280 / 2,
						y: 38,
						width: 255,
						align: "center",
						forceShadow: true
					}, [
						{outline: selectedSong.skin.outline, letterBorder: 12, shadow: [3, 3, 3]},
						{fill: "#fff"}
					])
				})
			}
		}
		
		if(screen === "song"){
			if(this.songs[this.selectedSong].stars){
				selectedWidth = this.songAsset.selectedWidth
			}
			
			var lastMoveMul = Math.pow(Math.abs(this.state.lastMove), 1 / 4)
			var changeSpeed = this.songSelecting.speed * lastMoveMul
			var resize = changeSpeed * this.songSelecting.resize / lastMoveMul
			var scrollDelay = changeSpeed * this.songSelecting.scrollDelay
			var resize2 = changeSpeed - resize
			var scroll = resize2 - resize - scrollDelay * 2
			var elapsed = ms - this.state.moveMS
			if(this.state.move && ms > this.state.moveMS + resize2 - scrollDelay){
				assets.sounds["se_ka"].play()
				var previousSelectedSong = this.selectedSong
				this.selectedSong = this.mod(this.songs.length, this.selectedSong + this.state.move)
				if(previousSelectedSong !== this.selectedSong){
					pageEvents.send("song-select-move", this.songs[this.selectedSong])
				}
				this.state.move = 0
				this.state.locked = 2
				localStorage["selectedSong"] = this.selectedSong
				
				if(this.songs[this.selectedSong].action !== "back"){
					var cat = this.songs[this.selectedSong].category
					var sort = cat in this.songSkin ? this.songSkin[cat].sort : 7
					this.songSelect.style.backgroundImage = "url('" + assets.image["bg_genre_" + sort].src + "')"
				}
			}
			if(this.state.moveMS && ms < this.state.moveMS + changeSpeed){
				xOffset = Math.min(scroll, Math.max(0, elapsed - resize - scrollDelay)) / scroll * (this.songAsset.width + this.songAsset.marginLeft)
				xOffset *= -this.state.move
				if(elapsed < resize){
					selectedWidth = this.songAsset.width + (((resize - elapsed) / resize) * (selectedWidth - this.songAsset.width))
				}else if(elapsed > resize2){
					this.playBgm(!this.songs[this.selectedSong].stars)
					this.state.locked = 1
					selectedWidth = this.songAsset.width + ((elapsed - resize2) / resize * (selectedWidth - this.songAsset.width))
				}else{
					songSelMoving = true
					selectedWidth = this.songAsset.width
				}
			}else{
				this.playBgm(!this.songs[this.selectedSong].stars)
				this.state.locked = 0
			}
		}else if(screen === "difficulty"){
			var currentSong = this.songs[this.selectedSong]
			if(this.state.locked){
				this.state.locked = 0
			}
			if(this.state.move){
				var hasUra = currentSong.stars[4]
				var previousSelection = this.selectedDiff
				do{
					if(hasUra && this.state.move > 0){
						this.selectedDiff += this.state.move
						if(this.selectedDiff > this.diffOptions.length + 4){
							this.state.ura = !this.state.ura
							if(this.state.ura){
								this.selectedDiff = previousSelection === this.diffOptions.length + 3 ? this.diffOptions.length + 4 : previousSelection
								break
							}else{
								this.state.move = -1
							}
						}
					}else{
						this.selectedDiff = this.mod(this.diffOptions.length + 5, this.selectedDiff + this.state.move)
					}
				}while(
					this.selectedDiff >= this.diffOptions.length && !currentSong.stars[this.selectedDiff - this.diffOptions.length]
					|| this.selectedDiff === this.diffOptions.length + 3 && this.state.ura
					|| this.selectedDiff === this.diffOptions.length + 4 && !this.state.ura
				)
				this.state.move = 0
			}else if(this.selectedDiff < 0 || this.selectedDiff >= this.diffOptions.length && !currentSong.stars[this.selectedDiff - this.diffOptions.length]){
				this.selectedDiff = 0
			}
		}
		
		if(songSelMoving){
			if(this.previewing !== null){
				this.endPreview()
			}
		}else if(screen !== "title" && screen !== "titleFadeIn" && ms > this.state.moveMS + 100){
			if(this.previewing !== this.selectedSong && "id" in this.songs[this.selectedSong]){
				this.startPreview()
			}
		}
		
		this.songFrameCache = {
			w: this.songAsset.width + this.songAsset.selectedWidth + this.songAsset.fullWidth + (15 + 1) * 3,
			h: this.songAsset.fullHeight + 16,
			ratio: ratio
		}
		
		if(screen === "title" || screen === "titleFadeIn" || screen === "song"){
			for(var i = this.selectedSong - 1; ; i--){
				var highlight = 0
				if(i - this.selectedSong === this.state.moveHover){
					highlight = 1
				}
				var index = this.mod(this.songs.length, i)
				var _x = winW / 2 - (this.selectedSong - i) * (this.songAsset.width + this.songAsset.marginLeft) - selectedWidth / 2 + xOffset
				if(_x + this.songAsset.width + this.songAsset.marginLeft < 0){
					break
				}
				this.drawClosedSong({
					ctx: ctx,
					x: _x,
					y: songTop,
					song: this.songs[index],
					highlight: highlight,
					disabled: p2.session && this.songs[index].action && this.songs[index].action !== "random"
				})
			}
			for(var i = this.selectedSong + 1; ; i++){
				var highlight = 0
				if(i - this.selectedSong === this.state.moveHover){
					highlight = 1
				}
				var index = this.mod(this.songs.length, i)
				var currentSong = this.songs[index]
				var _x = winW / 2 + (i - this.selectedSong - 1) * (this.songAsset.width + this.songAsset.marginLeft) + this.songAsset.marginLeft + selectedWidth / 2 + xOffset
				if(_x > winW){
					break
				}
				this.drawClosedSong({
					ctx: ctx,
					x: _x,
					y: songTop,
					song: this.songs[index],
					highlight: highlight,
					disabled: p2.session && this.songs[index].action && this.songs[index].action !== "random"
				})
			}
		}
		
		var currentSong = this.songs[this.selectedSong]
		var highlight = 0
		if(!currentSong.stars){
			highlight = 2
		}
		if(this.state.moveHover === 0){
			highlight = 1
		}
		var selectedSkin = this.songSkin.selected
		if(screen === "title" || screen === "titleFadeIn" || this.state.locked === 3){
			selectedSkin = currentSong.skin
			highlight = 2
		}else if(songSelMoving){
			selectedSkin = currentSong.skin
			highlight = 0
		}
		var selectedHeight = this.songAsset.height
		if(screen === "difficulty"){
			selectedWidth = this.songAsset.fullWidth
			selectedHeight = this.songAsset.fullHeight
			highlight = 0
		}
		
		if(this.currentSongTitle !== currentSong.title){
			this.currentSongTitle = currentSong.title
			this.currentSongCache.clear()
		}
		
		this.draw.songFrame({
			ctx: ctx,
			x: winW / 2 - selectedWidth / 2 + xOffset,
			y: songTop + this.songAsset.height - selectedHeight,
			width: selectedWidth,
			height: selectedHeight,
			border: this.songAsset.border,
			innerBorder: this.songAsset.innerBorder,
			background: selectedSkin.background,
			borderStyle: selectedSkin.border,
			highlight: highlight,
			noCrop: screen === "difficulty",
			animateMS: this.state.moveMS,
			cached: selectedWidth === this.songAsset.fullWidth ? 3 : (selectedWidth === this.songAsset.selectedWidth ? 2 : (selectedWidth === this.songAsset.width ? 1 : 0)),
			frameCache: this.songFrameCache,
			disabled: p2.session && currentSong.action && currentSong.action !== "random",
			innerContent: (x, y, w, h) => {
				ctx.strokeStyle = "#000"
				if(screen === "title" || screen === "titleFadeIn" || screen === "song"){
					var opened = ((selectedWidth - this.songAsset.width) / (this.songAsset.selectedWidth - this.songAsset.width))
					var songSel = true
				}else{
					var textW = strings.id === "en" ? 350 : 280
					this.selectTextCache.get({
						ctx: ctx,
						x: x - 144 - 53,
						y: y - 24 - 30,
						w: textW + 53 + 60,
						h: this.songAsset.marginTop + 15,
						id: "difficulty"
					}, ctx => {
						this.draw.layeredText({
							ctx: ctx,
							text: strings.selectDifficulty,
							fontSize: 46,
							fontFamily: this.font,
							x: 53,
							y: 30,
							width: textW,
							forceShadow: true
						}, [
							{x: -2, y: -2, outline: "#000", letterBorder: 23},
							{},
							{x: 2, y: 2, shadow: [3, 3, 3]},
							{x: 2, y: 2, outline: "#ad1516", letterBorder: 10},
							{x: -2, y: -2, outline: "#ff797b"},
							{outline: "#f70808"},
							{fill: "#fff", shadow: [-1, 1, 3, 1.5]}
						])
					})
					var opened = 1
					var songSel = false
					
					for(var i = 0; i < this.diffOptions.length; i++){
						var _x = x + 62 + i * 72
						var _y = y + 67
						ctx.fillStyle = this.diffOptions[i].fill
						ctx.lineWidth = 5
						this.draw.roundedRect({
							ctx: ctx,
							x: _x - 28,
							y: _y,
							w: 56,
							h: 298,
							radius: 24
						})
						ctx.fill()
						ctx.stroke()
						ctx.fillStyle = this.diffOptions[i].iconFill
						ctx.beginPath()
						ctx.arc(_x, _y + 28, 20, 0, Math.PI * 2)
						ctx.fill()
						this.draw.diffOptionsIcon({
							ctx: ctx,
							x: _x,
							y: _y + 28,
							iconName: this.diffOptions[i].iconName
						})
						
						var text = this.diffOptions[i].text
						if(this.diffOptions[i].iconName === "options" && (this.selectedDiff === i || this.state.options !== 0)){
							text = this.optionsList[this.state.options]
						}
						
						this.draw.verticalText({
							ctx: ctx,
							text: text,
							x: _x,
							y: _y + 57,
							width: 56,
							height: 220,
							fill: "#fff",
							outline: "#000",
							outlineSize: this.songAsset.letterBorder,
							letterBorder: 4,
							fontSize: 28,
							fontFamily: this.font,
							letterSpacing: this.diffOptions[i].letterSpacing
						})
						
						var highlight = 0
						if(this.state.moveHover === i){
							highlight = 2
						}else if(this.selectedDiff === i){
							highlight = 1
						}
						if(highlight){
							this.draw.highlight({
								ctx: ctx,
								x: _x - 32,
								y: _y - 3,
								w: 64,
								h: 304,
								animate: highlight === 1,
								animateMS: this.state.moveMS,
								opacity: highlight === 2 ? 0.8 : 1,
								radius: 24
							})
							if(this.selectedDiff === i && !this.touchEnabled){
								this.draw.diffCursor({
									ctx: ctx,
									font: this.font,
									x: _x,
									y: _y - 45
								})
							}
						}
					}
				}
				var drawDifficulty = (ctx, i, currentUra) => {
					if(currentSong.stars[i] || currentUra){
						if(songSel){
							var _x = x + 33 + i * 60
							var _y = y + 120
							ctx.fillStyle = currentUra ? "#006279" : "#ff9f18"
							ctx.beginPath()
							ctx.arc(_x, _y + 22, 22, -Math.PI, 0)
							ctx.arc(_x, _y + 266, 22, 0, Math.PI)
							ctx.fill()
							this.draw.diffIcon({
								ctx: ctx,
								diff: currentUra ? 4 : i,
								x: _x,
								y: _y - 8,
								scale: 1,
								border: 6
							})
						}else{
							var _x = x + 402 + i * 100
							var _y = y + 87
							this.draw.diffIcon({
								ctx: ctx,
								diff: i,
								x: _x,
								y: _y - 12,
								scale: 1.4,
								border: 6.5,
								noFill: true
							})
							ctx.fillStyle = "#aa7023"
							ctx.lineWidth = 4.5
							ctx.fillRect(_x - 35.5, _y + 2, 71, 380)
							ctx.strokeRect(_x - 35.5, _y + 2, 71, 380)
							ctx.fillStyle = currentUra ? "#006279" : "#fff"
							ctx.lineWidth = 2.5
							ctx.fillRect(_x - 28, _y + 19, 56, 351)
							ctx.strokeRect(_x - 28, _y + 19, 56, 351)
							this.draw.diffIcon({
								ctx: ctx,
								diff: currentUra ? 4 : i,
								x: _x,
								y: _y - 12,
								scale: 1.4,
								border: 4.5
							})
						}
						var offset = (songSel ? 44 : 56) / 2
						this.difficultyCache.get({
							ctx: ctx,
							x: _x - offset,
							y: songSel ? _y + 10 : _y + 23,
							w: songSel ? 44 : 56,
							h: (songSel ? 88 : 135) + 10,
							id: this.difficulty[currentUra ? 4 : i] + (songSel ? "1" : "0")
						}, ctx => {
							var ja = strings.id === "ja"
							this.draw.verticalText({
								ctx: ctx,
								text: this.difficulty[i],
								x: offset,
								y: 0,
								width: songSel ? 44 : 56,
								height: songSel ? (i === 1 && ja ? 66 : 88) : (ja ? 130 : (i === 1 && ja ? 110 : 135)),
								fill: currentUra ? "#fff" : "#000",
								fontSize: songSel ? 25 : (i === 2 && ja ? 45 : 40),
								fontFamily: this.font,
								outline: currentUra ? "#003C52" : false,
								outlineSize: currentUra ? this.songAsset.letterBorder : 0
							})
						})
						var songStarsArray = (currentUra ? currentSong.stars[4] : currentSong.stars[i]).toString().split(" ")
						var songStars = songStarsArray[0]
						var songBranch = songStarsArray[1] === "B"
						var elapsedMS = this.state.screenMS > this.state.moveMS || !songSel ? this.state.screenMS : this.state.moveMS
						var fade = ((ms - elapsedMS) % 2000) / 2000
						if(songBranch && fade > 0.25 && fade < 0.75){
							this.draw.verticalText({
								ctx: ctx,
								text: strings.songBranch,
								x: _x,
								y: _y + (songSel ? 110 : 185),
								width: songSel ? 44 : 56,
								height: songSel ? 160 : 170,
								fill: songSel && !currentUra ? "#c85200" : "#fff",
								fontSize: songSel ? 25 : 27,
								fontFamily: songSel ? "Meiryo, Microsoft YaHei, sans-serif" : this.font,
								outline: songSel ? false : "#f22666",
								outlineSize: songSel ? 0 : this.songAsset.letterBorder
							})
						}else{
							for(var j = 0; j < 10; j++){
								if(songSel){
									var yPos = _y + 113 + j * 17
								}else{
									var yPos = _y + 178 + j * 19.5
								}
								if(10 - j > songStars){
									ctx.fillStyle = currentUra ? "#187085" : (songSel ? "#e97526" : "#e7e7e7")
									ctx.beginPath()
									ctx.arc(_x, yPos, songSel ? 4.5 : 5, 0, Math.PI * 2)
									ctx.fill()
								}else{
									this.draw.diffStar({
										ctx: ctx,
										songSel: songSel,
										ura: currentUra,
										x: _x,
										y: yPos,
										ratio: ratio
									})
								}
							}
						}
						var currentDiff = this.selectedDiff - this.diffOptions.length
						if(this.selectedDiff === 4 + this.diffOptions.length){
							currentDiff = 3
						}
						if(i === currentSong.p2Cursor && p2.socket.readyState === 1){
							this.draw.diffCursor({
								ctx: ctx,
								font: this.font,
								x: _x,
								y: _y - (songSel ? 45 : 65),
								two: true,
								side: songSel ? false : (currentSong.p2Cursor === currentDiff),
								scale: songSel ? 0.7 : 1
							})
						}
						if(!songSel){
							var highlight = 0
							if(this.state.moveHover - this.diffOptions.length === i){
								highlight = 2
							}else if(currentDiff === i){
								highlight = 1
							}
							if(currentDiff === i && !this.touchEnabled){
								this.draw.diffCursor({
									ctx: ctx,
									font: this.font,
									x: _x,
									y: _y - 65,
									side: currentSong.p2Cursor === currentDiff && p2.socket.readyState === 1
								})
							}
							if(highlight){
								this.draw.highlight({
									ctx: ctx,
									x: _x - 32,
									y: _y + 14,
									w: 64,
									h: 362,
									animate: highlight === 1,
									animateMS: this.state.moveMS,
									opacity: highlight === 2 ? 0.8 : 1
								})
							}
						}
					}
				}
				for(var i = 0; currentSong.stars && i < 4; i++){
					var currentUra = i === 3 && (this.state.ura && !songSel || currentSong.stars[4] && songSel)
					if(songSel && currentUra){
						drawDifficulty(ctx, i, false)
						var elapsedMS = this.state.screenMS > this.state.moveMS ? this.state.screenMS : this.state.moveMS
						var fade = ((ms - elapsedMS) % 4000) / 4000
						var alphaFade = 0
						if(fade > 0.95){
							alphaFade = this.draw.easeOut(1 - (fade - 0.95) * 20)
						}else if(fade > 0.5){
							alphaFade = 1
						}else if(fade > 0.45){
							alphaFade = this.draw.easeIn((fade - 0.45) * 20)
						}
						this.draw.alpha(alphaFade, ctx, ctx => {
							drawDifficulty(ctx, i, true)
						}, winW, winH)
					}else{
						drawDifficulty(ctx, i, currentUra)
					}
				}
				
				var borders = (this.songAsset.border + this.songAsset.innerBorder) * 2
				var textW = this.songAsset.width - borders
				var textH = this.songAsset.height - borders
				var textX = Math.max(w - 37 - textW / 2, w / 2 - textW / 2)
				var textY = opened * 12 + (1 - opened) * 7
				
				if(currentSong.subtitle){
					this.currentSongCache.get({
						ctx: ctx,
						x: x + textX - textW,
						y: y + textY,
						w: textW,
						h: textH,
						id: "subtitle",
					}, ctx => {
						this.draw.verticalText({
							ctx: ctx,
							text: currentSong.subtitle,
							x: textW / 2,
							y: 7,
							width: textW,
							height: textH - 35,
							fill: "#fff",
							outline: "#000",
							outlineSize: 14,
							fontSize: 28,
							fontFamily: this.font,
							align: "bottom"
						})
					})
				}

				if(currentSong.maker || currentSong.maker === 0){
					if (songSel) {
						var _x = x + 38
						var _y = y + 10
						ctx.lineWidth = 5

						var grd = ctx.createLinearGradient(_x, _y, _x, _y+50);
						grd.addColorStop(0, '#fa251a');
						grd.addColorStop(1, '#ffdc33');

						ctx.fillStyle = grd;
						this.draw.roundedRect({
							ctx: ctx,
							x: _x - 28,
							y: _y,
							w: 130,
							h: 50,
							radius: 24
						})
						ctx.fill()
						ctx.stroke()
						ctx.beginPath()
						ctx.arc(_x, _y + 28, 20, 0, Math.PI * 2)
						ctx.fill()

						this.draw.layeredText({
							ctx: ctx,
							text: strings.creative.creative,
							fontSize: strings.id == "en" ? 30 : 34,
							fontFamily: this.font,
							align: "center",
							baseline: "middle",
							x: _x + 38,
							y: _y + (["ja", "en"].indexOf(strings.id) >= 0 ? 25 : 28),
							width: 110
						}, [
							{outline: "#fff", letterBorder: 8},
							{fill: "#000"}
						])
					} else if(currentSong.maker && currentSong.maker.id > 0 && currentSong.maker.name){
						var _x = x + 62
						var _y = y + 380
						ctx.lineWidth = 5

						var grd = ctx.createLinearGradient(_x, _y, _x, _y+50);
						grd.addColorStop(0, '#fa251a');
						grd.addColorStop(1, '#ffdc33');

						ctx.fillStyle = '#75E2EE';
						this.draw.roundedRect({
							ctx: ctx,
							x: _x - 28,
							y: _y,
							w: 250,
							h: 80,
							radius: 15
						})
						ctx.fill()
						ctx.stroke()
						ctx.beginPath()
						ctx.arc(_x, _y + 28, 20, 0, Math.PI * 2)
						ctx.fill()

						this.draw.layeredText({
							ctx: ctx,
							text: strings.creative.maker,
							fontSize: 24,
							fontFamily: this.font,
							align: "left",
							baseline: "middle",
							x: _x - 15,
							y: _y + 23
						}, [
							{outline: "#000", letterBorder: 8},
							{fill: "#fff"}
						])

						this.draw.layeredText({
							ctx: ctx,
							text: currentSong.maker.name,
							fontSize: 28,
							fontFamily: this.font,
							align: "center",
							baseline: "middle",
							x: _x + 100,
							y: _y + 56,
							width: 210
						}, [
							{outline: "#fff", letterBorder: 8},
							{fill: "#000"}
						])

						if(this.state.moveHover === "maker"){
							this.draw.highlight({
								ctx: ctx,
								x: _x - 32,
								y: _y - 3,
								w: 250 + 7,
								h: 80 + 7,
								opacity: 0.8,
								radius: 15
							})
						}
					}
				}
				
				if(!songSel && currentSong.stars[4]){
					var fade = ((ms - this.state.screenMS) % 1200) / 1200
					var _x = x + 402 + 4 * 100 + fade * 25
					var _y = y + 258
					ctx.fillStyle = "rgba(0, 0, 0, " + 0.2 * this.draw.easeInOut(1 - fade) + ")"
					ctx.beginPath()
					ctx.moveTo(_x - 35, _y - 25)
					ctx.lineTo(_x - 10, _y)
					ctx.lineTo(_x - 35, _y + 25)
					ctx.fill()
				}
				
				ctx.globalAlpha = 1 - Math.max(0, opened - 0.5) * 2
				ctx.fillStyle = selectedSkin.background
				ctx.fillRect(x, y, w, h)
				ctx.globalAlpha = 1
				var verticalTitle = ctx => {
					this.draw.verticalText({
						ctx: ctx,
						text: currentSong.title,
						x: textW / 2,
						y: 7,
						width: textW,
						height: textH - 35,
						fill: "#fff",
						outline: selectedSkin.outline,
						outlineSize: this.songAsset.letterBorder,
						fontSize: 40,
						fontFamily: this.font
					})
				}
				if(selectedSkin.outline === "#000"){
					this.currentSongCache.get({
						ctx: ctx,
						x: x + textX,
						y: y + textY - 7,
						w: textW,
						h: textH,
						id: "title",
					}, verticalTitle)
				}else{
					this.songTitleCache.get({
						ctx: ctx,
						x: x + textX,
						y: y + textY - 7,
						w: textW,
						h: textH,
						id: currentSong.title + selectedSkin.outline,
					}, verticalTitle)
				}
				if(!songSel && this.selectableText !== currentSong.title){
					this.draw.verticalText({
						ctx: ctx,
						text: currentSong.title,
						x: x + textX + textW / 2,
						y: y + textY,
						width: textW,
						height: textH - 35,
						fontSize: 40,
						fontFamily: this.font,
						selectable: this.selectable,
						selectableScale: this.ratio / this.pixelRatio
					})
					this.selectable.style.display = ""
					this.selectableText = currentSong.title
				}
			}
		})
		
		if(screen !== "difficulty" && this.selectableText){
			this.selectableText = ""
			this.selectable.style.display = "none"
		}
		
		if(songSelMoving){
			this.draw.highlight({
				ctx: ctx,
				x: winW / 2 - selectedWidth / 2,
				y: songTop,
				w: selectedWidth,
				h: selectedHeight,
				opacity: 0.8
			})
		}
		
		ctx.fillStyle = "#000"
		ctx.fillRect(0, frameTop + 595, 1280 + frameLeft * 2, 125 + frameTop)
		var x = 0
		var y = frameTop + 603
		var w = frameLeft + 638
		var h = 117 + frameTop
		this.draw.pattern({
			ctx: ctx,
			img: assets.image["bg_score_p1"],
			x: x,
			y: y,
			w: w,
			h: h,
			dx: frameLeft + 10,
			dy: frameTop + 15,
			scale: 1.55
		})
		ctx.fillStyle = "rgba(249, 163, 149, 0.5)"
		ctx.beginPath()
		ctx.moveTo(x, y)
		ctx.lineTo(x + w, y)
		ctx.lineTo(x + w - 4, y + 4)
		ctx.lineTo(x, y + 4)
		ctx.fill()
		ctx.fillStyle = "rgba(0, 0, 0, 0.25)"
		ctx.beginPath()
		ctx.moveTo(x + w, y)
		ctx.lineTo(x + w, y + h)
		ctx.lineTo(x + w - 4, y + h)
		ctx.lineTo(x + w - 4, y + 4)
		ctx.fill()
		x = frameLeft + 642
		if(p2.session){
			this.draw.pattern({
				ctx: ctx,
				img: assets.image["bg_score_p2"],
				x: x,
				y: y,
				w: w,
				h: h,
				dx: frameLeft + 15,
				dy: frameTop - 20,
				scale: 1.55
			})
			ctx.fillStyle = "rgba(138, 245, 247, 0.5)"
		}else{
			this.draw.pattern({
				ctx: ctx,
				img: assets.image["bg_settings"],
				x: x,
				y: y,
				w: w,
				h: h,
				dx: frameLeft + 11,
				dy: frameTop + 45,
				scale: 3.1
			})
			ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
		}
		ctx.beginPath()
		ctx.moveTo(x, y + h)
		ctx.lineTo(x, y)
		ctx.lineTo(x + w, y)
		ctx.lineTo(x + w, y + 4)
		ctx.lineTo(x + 4, y + 4)
		ctx.lineTo(x + 4, y + h)
		ctx.fill()
		if(screen !== "difficulty" && p2.socket.readyState === 1 && !assets.customSongs){
			var elapsed = (ms - this.state.screenMS) % 3100
			var fade = 1
			if(!p2.session && screen === "song"){
				if(elapsed > 2800){
					fade = (elapsed - 2800) / 300
				}else if(2000 < elapsed){
					if(elapsed < 2300){
						fade = 1 - (elapsed - 2000) / 300
					}else{
						fade = 0
					}
				}
			}
			if(fade > 0){
				if(fade < 1){
					ctx.globalAlpha = this.draw.easeIn(fade)
				}
				this.sessionCache.get({
					ctx: ctx,
					x: winW / 2,
					y: y + (h - 32) / 2,
					w: winW / 2,
					h: 38,
					id: p2.session ? "sessionend" : "sessionstart"
				})
				ctx.globalAlpha = 1
			}
			if(this.state.moveHover === "session"){
				this.draw.highlight({
					ctx: ctx,
					x: x,
					y: y,
					w: w,
					h: h,
					opacity: 0.8
				})
			}
		}
		
		if(screen === "titleFadeIn"){
			ctx.save()
			
			var elapsed = ms - this.state.screenMS
			ctx.globalAlpha = Math.max(0, 1 - elapsed / 500)
			ctx.fillStyle = "#000"
			ctx.fillRect(0, 0, winW, winH)
			
			ctx.restore()
		}
	}
	
	drawClosedSong(config){
		var ctx = config.ctx
		
		config.width = this.songAsset.width
		config.height = this.songAsset.height
		config.border = this.songAsset.border
		config.innerBorder = this.songAsset.innerBorder
		config.background = config.song.skin.background
		config.borderStyle = config.song.skin.border
		config.outline = config.song.skin.outline
		config.text = config.song.title
		config.animateMS = this.state.moveMS
		config.cached = 1
		config.frameCache = this.songFrameCache
		config.innerContent = (x, y, w, h) => {
			this.songTitleCache.get({
				ctx: ctx,
				x: x,
				y: y,
				w: w,
				h: h,
				id: config.text + config.outline,
			}, ctx => {
				this.draw.verticalText({
					ctx: ctx,
					text: config.text,
					x: w / 2,
					y: 7,
					width: w,
					height: h - 35,
					fill: "#fff",
					outline: config.outline,
					outlineSize: this.songAsset.letterBorder,
					fontSize: 40,
					fontFamily: this.font
				})
			})
		}
		this.draw.songFrame(config)
		if(config.song.p2Cursor && p2.socket.readyState === 1){
			this.draw.diffCursor({
				ctx: ctx,
				font: this.font,
				x: config.x + 48,
				y: config.y - 27,
				two: true,
				scale: 1,
				side: true
			})
		}
	}
	
	startPreview(loadOnly){
		var currentSong = this.songs[this.selectedSong]
		var id = currentSong.id
		var prvTime = currentSong.preview
		this.endPreview(true)
		
		if("id" in currentSong){
			var startLoad = this.getMS()
			if(loadOnly){
				var currentId = null
			}else{
				var currentId = this.previewId
				this.previewing = this.selectedSong
			}
			var songObj = this.previewList.find(song => song && song.id === id)
			
			if(songObj){
				if(!loadOnly){
					this.preview = songObj.preview_sound
					this.preview.gain = snd.previewGain
					this.previewLoaded(startLoad, songObj.preview_time, currentSong.volume)
				}
			}else{
				songObj = {id: id}
				
				var previewFilename = prvTime > 0 ? "/preview.mp3" : "/main.mp3"
				
				var loadPreview = previewFilename => {
					return snd.previewGain.load(gameConfig.songs_baseurl + id + previewFilename)
				}
				
				new Promise((resolve, reject) => {
					if(!currentSong.music){
						songObj.preview_time = 0
						loadPreview(previewFilename).catch(() => {
							songObj.preview_time = prvTime
							return loadPreview("/main.mp3")
						}).then(resolve, reject)
					}else if(currentSong.music !== "muted"){
						songObj.preview_time = prvTime
						snd.previewGain.load(currentSong.music, true).then(resolve, reject)
					}
				}).then(sound => {
					if(currentId === this.previewId){
						songObj.preview_sound = sound
						this.preview = sound
						this.previewLoaded(startLoad, songObj.preview_time, currentSong.volume)
						
						var oldPreview = this.previewList.shift()
						if(oldPreview){
							oldPreview.preview_sound.clean()
						}
						this.previewList.push(songObj)
					}else{
						sound.clean()
					}
				})
			}
		}
	}
	previewLoaded(startLoad, prvTime, volume){
		var endLoad = this.getMS()
		var difference = endLoad - startLoad
		var minDelay = 300
		var delay = minDelay - Math.min(minDelay, difference)
		snd.previewGain.setVolumeMul(volume || 1)
		this.preview.playLoop(delay / 1000, false, prvTime)
	}
	endPreview(){
		this.previewId++
		this.previewing = null
		if(this.preview){
			this.preview.stop()
		}
	}
	playBgm(enabled){
		if(enabled && !this.bgmEnabled){
			this.bgmEnabled = true
			snd.musicGain.fadeIn(0.4)
		}else if(!enabled && this.bgmEnabled){
			this.bgmEnabled = false
			snd.musicGain.fadeOut(0.4)
		}
	}
	
	onusers(response){
		this.songs.forEach(song => {
			song.p2Cursor = null
		})
		if(response && response.value){
			response.value.forEach(idDiff => {
				var id = idDiff.id |0
				var diff = idDiff.diff
				var diffId = this.difficultyId.indexOf(diff)
				if(diffId > 3){
					diffId = 3
				}
				if(diffId >= 0){
					var index = 0
					var currentSong = this.songs.find((song, i) => {
						index = i
						return song.id === id
					})
					if(currentSong){
						currentSong.p2Cursor = diffId
						if(p2.session && currentSong.stars){
							this.selectedSong = index
							this.state.move = 0
							if(this.state.screen !== "difficulty"){
								this.toSelectDifficulty(true)
							}
						}
					}
				}
			})
		}
	}
	onsongsel(response){
		if(response && response.value){
			var selected = false
			if("selected" in response.value){
				selected = response.value.selected
			}
			if("song" in response.value){
				var song = +response.value.song
				if(song >= 0 && song < this.songs.length){
					if(!selected){
						this.state.locked = true
						if(this.state.screen === "difficulty"){
							this.toSongSelect(true)
						}
						var moveBy = song - this.selectedSong
						if(moveBy){
							if(this.selectedSong < song){
								var altMoveBy = -this.mod(this.songs.length, this.selectedSong - song)
							}else{
								var altMoveBy = this.mod(this.songs.length, moveBy)
							}
							if(Math.abs(altMoveBy) < Math.abs(moveBy)){
								moveBy = altMoveBy
							}
							this.moveToSong(moveBy, true)
						}
					}else if(this.songs[song].stars){
						this.selectedSong = song
						this.state.move = 0
						if(this.state.screen !== "difficulty"){
							this.toSelectDifficulty(true)
						}
					}
				}
			}
		}
	}
	startP2(){
		this.onusers(p2.getMessage("users"))
		if(p2.session){
			this.onsongsel(p2.getMessage("songsel"))
		}
		pageEvents.add(p2, "message", response => {
			if(response.type == "users"){
				this.onusers(response)
			}
			if(p2.session && response.type == "songsel"){
				this.onsongsel(response)
				this.state.selLock = false
			}
		})
		if(p2.closed){
			p2.open()
		}
	}
	
	mod(length, index){
		return ((index % length) + length) % length
	}
	
	getLocalTitle(title, titleLang){
		if(titleLang){
			titleLang = titleLang.split("\n")
			titleLang.forEach(line => {
				var space = line.indexOf(" ")
				var id = line.slice(0, space)
				if(id === strings.id){
					title = line.slice(space + 1)
				}else if(titleLang.length === 1 && strings.id === "en" && !(id in allStrings)){
					title = line
				}
			})
		}
		return title
	}
	
	clearHash(){
		if(location.hash.toLowerCase().startsWith("#song=")){
			p2.hash("")
		}
	}
	
	getMS(){
		return Date.now()
	}
	
	clean(){
		this.keyboard.clean()
		this.gamepad.clean()
		this.clearHash()
		this.draw.clean()
		this.songTitleCache.clean()
		this.selectTextCache.clean()
		this.categoryCache.clean()
		this.difficultyCache.clean()
		this.sessionCache.clean()
		this.currentSongCache.clean()
		assets.sounds["bgm_songsel"].stop()
		if(!this.bgmEnabled){
			snd.musicGain.fadeIn()
			setTimeout(() => {
				snd.buffer.loadSettings()
			}, 500)
		}
		this.redrawRunning = false
		this.endPreview()
		this.previewList.forEach(song => {
			if(song){
				song.preview_sound.clean()
			}
		})
		pageEvents.remove(loader.screen, ["mousemove", "mouseleave", "mousedown", "touchstart"])
		pageEvents.remove(this.canvas, "touchend")
		pageEvents.remove(p2, "message")
		if(this.touchEnabled && fullScreenSupported){
			pageEvents.remove(this.touchFullBtn, "click")
			delete this.touchFullBtn
		}
		pageEvents.remove(this.browse, "change")
		delete this.browse
		delete this.selectable
		delete this.ctx
		delete this.canvas
	}
}
