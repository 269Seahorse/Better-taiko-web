class SongSelect{
	constructor(fromTutorial, fadeIn, touchEnabled){
		this.touchEnabled = touchEnabled
		
		loader.changePage("songselect")
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
				background: "#9afbe1",
				border: ["#d6ffff", "#6bae9c"],
				outline: "#31ae94"
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
		this.font = "TnT"
		
		this.songs = []
		for(let song of assets.songs){
			this.songs.push({
				id: song.id,
				title: song.title,
				skin: song.category in this.songSkin ? this.songSkin[song.category] : this.songSkin.default,
				stars: song.stars,
				category: song.category,
				preview: song.preview || 0
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
			title: "もどる",
			skin: this.songSkin.back,
			action: "back"
		})
		this.songs.push({
			title: "ランダムに曲をえらぶ",
			skin: this.songSkin.random,
			action: "random",
			category: "ランダム"
		})
		if(touchEnabled){
			fromTutorial = false
		}else{
			this.songs.push({
				title: "あそびかた説明",
				skin: this.songSkin.tutorial,
				action: "tutorial",
				category: "ランダム"
			})
		}
		this.songs.push({
			title: "もどる",
			skin: this.songSkin.back,
			action: "back"
		})
		
		this.songAsset = {
			marginTop: 90,
			marginLeft: 18,
			width: 82,
			selectedWidth: 382,
			height: 452,
			border: 6,
			innerBorder: 8,
			letterBorder: 12
		}
		
		this.draw = new CanvasDraw()
		
		this.difficulty = ["かんたん", "ふつう", "むずかしい", "おに"]
		this.difficultyId = ["easy", "normal", "hard", "oni"]
		
		this.selectedSong = 0
		this.selectedDiff = 0
		assets.sounds["bgm_songsel"].playLoop(0.1, false, 0, 1.442, 3.506)
		
		if(touchEnabled || !fromTutorial && "selectedSong" in localStorage){
			if("selectedSong" in localStorage){
				this.selectedSong = Math.min(Math.max(0, localStorage["selectedSong"] |0), this.songs.length)
			}
			assets.sounds["song-select"].play()
			snd.musicGain.fadeOut()
			this.playBgm(false)
		}else{
			this.selectedSong = this.songs.findIndex(song => song.action === "tutorial")
			this.playBgm(true)
		}
		if("selectedDiff" in localStorage){
			this.selectedDiff = Math.min(Math.max(0, localStorage["selectedDiff"] |0), 4)
		}
		
		this.songSelect = document.getElementById("song-select")
		var cat = this.songs[this.selectedSong].category
		var sort = cat in this.songSkin ? this.songSkin[cat].sort : 7
		this.songSelect.style.backgroundImage = "url('" + assets.image["bg_genre_" + sort].src + "')"
		
		this.previewId = 0
		this.state = {
			screen: fromTutorial ? "song" : (fadeIn ? "titleFadeIn" : "title"),
			screenMS: this.getMS(),
			move: 0,
			moveMS: 0,
			moveHover: null,
			locked: true,
			hasPointer: false
		}
		this.songSelecting = {
			speed: 800,
			resize: 0.3,
			scrollDelay: 0.1
		}
		
		this.startPreview(true)
		
		this.pressedKeys = {}
		this.gamepad = new Gamepad({
			"13": ["b", "start", "ls", "rs"],
			"8": ["a"],
			"37": ["l", "lb", "lt"],
			"39": ["r", "rb", "rt"],
			"ctrl": ["y"],
			"shift": ["x"]
		})
		
		this.startP2()
		
		this.redrawRunning = true
		this.redrawBind = this.redraw.bind(this)
		this.redraw()
		pageEvents.keyAdd(this, "all", "down", this.keyDown.bind(this))
		pageEvents.add(this.canvas, "mousemove", this.mouseMove.bind(this))
		pageEvents.add(this.canvas, "mousedown", this.mouseDown.bind(this))
		pageEvents.add(this.canvas, "touchstart", this.mouseDown.bind(this))
		if(touchEnabled){
			this.touchFullBtn = document.getElementById("touch-full-btn")
			this.touchFullBtn.style.display = "block"
			pageEvents.add(this.touchFullBtn, "click", toggleFullscreen)
		}
	}
	
	keyDown(event, code){
		if(code){
			var modifiers = {
				shift: this.pressedKeys["shift"],
				ctrl: this.pressedKeys["ctrl"]
			}
		}else{
			code = event.keyCode
			var modifiers = {
				shift: event.shiftKey,
				ctrl: event.ctrlKey
			}
		}
		if(code === "ctrl" || code === "shift"){
			return
		}
		var key = {
			confirm: code == 13 || code == 32 || code == 86 || code == 66,
			// Enter, Space, V, B
			cancel: code == 27 || code == 8,
			// Esc, Backspace
			left: code == 37 || code == 67,
			// Left, C
			right: code == 39 || code == 78
			// Right, N
		}
		if(key.cancel && event){
			event.preventDefault()
		}
		if(this.state.screen === "song"){
			if(key.confirm){
				this.toSelectDifficulty()
			}else if(key.cancel){
				this.toTitleScreen()
			}else if(key.left){
				this.moveToSong(-1)
			}else if(key.right){
				this.moveToSong(1)
			}
		}else if(this.state.screen === "difficulty"){
			if(key.confirm){
				if(this.selectedDiff === 0){
					this.toSongSelect()
				}else{
					this.toLoadSong(this.selectedDiff - 1, modifiers.shift, modifiers.ctrl)
				}
			}else if(key.cancel){
				this.toSongSelect()
			}else if(key.left){
				this.moveToDiff(-1)
			}else if(key.right){
				this.moveToDiff(1)
			}
		}
	}
	
	mouseDown(event){
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
			var moveBy = this.songSelMouse(mouse.x, mouse.y)
			if(moveBy === 0){
				this.toSelectDifficulty()
			}else if(moveBy !== null){
				this.moveToSong(moveBy)
			}
		}else if(this.state.screen === "difficulty"){
			var moveBy = this.diffSelMouse(mouse.x, mouse.y)
			if(
				moveBy === 0
				|| mouse.x < 55 || mouse.x > 967
				|| mouse.y < 40 || mouse.y > 540
			){
				this.toSongSelect()
			}else if(moveBy !== null){
				this.toLoadSong(moveBy - 1, shift, ctrl, touch)
			}
		}
	}
	mouseMove(event){
		var mouse = this.mouseOffset(event.offsetX, event.offsetY)
		var moveTo = null
		if(this.state.screen === "song"){
			var moveTo = this.songSelMouse(mouse.x, mouse.y)
			if(moveTo === null && this.state.moveHover === 0 && !this.songs[this.selectedSong].stars){
				this.state.moveMS = this.getMS() - this.songSelecting.speed
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
			x: (offsetX * this.pixelRatio - this.winW / 2) / this.ratio + 1024 / 2,
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
			x -= 1024 / 2
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
			if(100 < x && x < 160 && 120 < y && y < 420){
				return 0
			}else if(434 < x && x < 810 && 95 < y && y < 524){
				var moveBy = Math.floor((x - 434) / ((810 - 434) / 4)) + 1
				var currentSong = this.songs[this.selectedSong]
				if(currentSong.stars[moveBy - 1]){
					return moveBy
				}
			}
		}
		return null
	}
	
	moveToSong(moveBy){
		if(this.state.locked !== 1){
			var ms = this.getMS()
			if(this.songs[this.selectedSong].stars && this.state.locked === 0){
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
				assets.sounds["ka"].play((resize + i * soundsDelay) / 1000)
			}
			this.pointer(false)
		}
	}
	moveToDiff(moveBy){
		if(this.state.locked !== 1){
			this.state.move = moveBy
			this.state.moveMS = this.getMS() - 500
			this.state.locked = 1
			assets.sounds["ka"].play()
		}
	}
	toSelectDifficulty(){
		if(this.state.locked === 0){
			var currentSong = this.songs[this.selectedSong]
			if(currentSong.stars){
				this.state.screen = "difficulty"
				this.state.screenMS = this.getMS()
				this.state.locked = true
				this.state.moveHover = null
				
				assets.sounds["don"].play()
				assets.sounds["song-select"].stop()
				assets.sounds["diffsel"].play(0.3)
			}else if(currentSong.action === "back"){
				this.clean()
				this.toTitleScreen()
			}else if(currentSong.action === "random"){
				assets.sounds["don"].play()
				this.state.locked = true
				do{
					var i = Math.floor(Math.random() * this.songs.length)
				}while(!this.songs[i].stars)
				var moveBy = i - this.selectedSong
				setTimeout(() => {
					this.moveToSong(moveBy)
				}, 200)
			}else if(currentSong.action === "tutorial"){
				this.toTutorial()
			}
			this.pointer(false)
		}
	}
	toSongSelect(){
		if(this.state.locked !== 1){
			this.state.screen = "song"
			this.state.screenMS = this.getMS()
			this.state.locked = true
			this.state.moveHover = null
			
			assets.sounds["diffsel"].stop()
			assets.sounds["cancel"].play()
		}
	}
	toLoadSong(difficulty, shift, ctrl, touch){
		this.clean()
		var selectedSong = this.songs[this.selectedSong]
		assets.sounds["diffsel"].stop()
		assets.sounds["don"].play()
		
		localStorage["selectedSong"] = this.selectedSong
		localStorage["selectedDiff"] = difficulty + 1
		
		new loadSong({
			"title": selectedSong.title,
			"folder": selectedSong.id,
			"difficulty": this.difficultyId[difficulty],
			"category": selectedSong.category
		}, shift, ctrl, touch)
	}
	toTitleScreen(){
		assets.sounds["cancel"].play()
		this.clean()
		setTimeout(() => {
			new Titlescreen()
		}, 500)
	}
	toTutorial(){
		assets.sounds["don"].play()
		this.clean()
		setTimeout(() => {
			new Tutorial(true)
		}, 500)
	}
	
	redraw(){
		if(!this.redrawRunning){
			return
		}
		requestAnimationFrame(this.redrawBind)
		var ms = this.getMS()
		
		this.gamepad.play((pressed, keyCode) => {
			if(pressed){
				if(!this.pressedKeys[keyCode]){
					this.pressedKeys[keyCode] = ms + 300
					this.keyDown(false, keyCode)
				}
			}else{
				this.pressedKeys[keyCode] = 0
			}
		})
		for(var key in this.pressedKeys){
			if(this.pressedKeys[key]){
				if(ms >= this.pressedKeys[key] + 50){
					this.keyDown(false, key)
					this.pressedKeys[key] = ms
				}
			}
		}
		
		if(!this.redrawRunning){
			return
		}
		
		var ctx = this.ctx
		var winW = innerWidth
		var winH = innerHeight
		if(winW / 32 > winH / 9){
			winW = winH / 9 * 32
		}
		this.pixelRatio = window.devicePixelRatio || 1
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
			this.draw.layeredText({
				ctx: ctx,
				text: "曲をえらぶ",
				fontSize: 48,
				fontFamily: this.font,
				x: frameLeft + 53,
				y: frameTop + 30,
				letterSpacing: 2
			}, [
				{x: -2, y: -2, outline: "#000", letterBorder: 22},
				{},
				{x: 2, y: 2, shadow: [3, 3, 3]},
				{x: 2, y: 2, outline: "#ad1516", letterBorder: 10},
				{x: -2, y: -2, outline: "#ff797b"},
				{outline: "#f70808"},
				{fill: "#fff", shadow: [-1, 1, 3, 1.5]}
			])
			
			var category = this.songs[this.selectedSong].category
			if(category){
				this.draw.layeredText({
					ctx: ctx,
					text: category,
					fontSize: 40,
					fontFamily: this.font,
					x: winW / 2,
					y: frameTop + 38,
					width: 255,
					align: "center"
				}, [
					{outline: this.songs[this.selectedSong].skin.outline, letterBorder: 12, shadow: [3, 3, 3]},
					{fill: "#fff"}
				])
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
				assets.sounds["ka"].play()
				this.selectedSong = this.mod(this.songs.length, this.selectedSong + this.state.move)
				this.state.move = 0
				this.state.locked = 2
				
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
				this.state.locked = 0
			}
		}else if(screen === "difficulty"){
			var currentSong = this.songs[this.selectedSong]
			if(this.state.locked){
				this.state.locked = 0
			}
			if(this.state.move){
				do{
					this.selectedDiff = this.mod(5, this.selectedDiff + this.state.move)
				}while(this.selectedDiff !== 0 && !currentSong.stars[this.selectedDiff - 1])
				this.state.move = 0
			}else if(!currentSong.stars[this.selectedDiff - 1]){
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
					highlight: highlight
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
					highlight: highlight
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
			selectedWidth = 912
			selectedHeight = 502
			highlight = 0
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
			innerContent: (x, y, w, h) => {
				ctx.strokeStyle = "#000"
				if(screen === "title" || screen === "titleFadeIn" || screen === "song"){
					var opened = ((selectedWidth - this.songAsset.width) / (this.songAsset.selectedWidth - this.songAsset.width))
					var songSel = true
				}else{
					this.draw.layeredText({
						ctx: ctx,
						text: "むずかしさをえらぶ",
						fontSize: 46,
						fontFamily: this.font,
						x: x - 144,
						y: y - 24,
						width: 280
					}, [
						{x: -2, y: -2, outline: "#000", letterBorder: 23},
						{shadow: [3, 3, 3]},
						{x: 2, y: 2},
						{x: 2, y: 2, outline: "#ad1516", letterBorder: 10},
						{x: -2, y: -2, outline: "#ff797b"},
						{outline: "#f70808"},
						{fill: "#fff", shadow: [-1, 1, 3, 1.5]}
					])
					var opened = 1
					var songSel = false
					var _x = x + 62
					var _y = y + 67
					ctx.fillStyle = "#efb058"
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
					ctx.fillStyle = "#f7d39c"
					ctx.beginPath()
					ctx.arc(_x, _y + 28, 20, 0, Math.PI * 2)
					ctx.fill()
					this.draw.diffOptionsIcon({
						ctx: ctx,
						x: _x,
						y: _y + 28
					})
					
					this.draw.verticalText({
						ctx: ctx,
						text: "もどる",
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
						letterSpacing: 4
					})
					var highlight = 0
					if(this.state.moveHover === 0){
						highlight = 2
					}else if(this.selectedDiff === 0){
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
						if(this.selectedDiff === 0){
							this.draw.diffCursor({
								ctx: ctx,
								font: this.font,
								x: _x,
								y: _y - 45
							})
						}
					}
				}
				for(var i = 0; currentSong.stars && i < 4; i++){
					if(currentSong.stars[i]){
						if(songSel){
							var _x = x + 33 + i * 60
							var _y = y + 120
							ctx.fillStyle = "#ff9f18"
							ctx.beginPath()
							ctx.arc(_x, _y + 22, 22, -Math.PI, 0)
							ctx.arc(_x, _y + 266, 22, 0, Math.PI)
							ctx.fill()
							this.draw.diffIcon({
								ctx: ctx,
								diff: i,
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
							ctx.fillStyle = "#fff"
							ctx.lineWidth = 2.5
							ctx.fillRect(_x - 28, _y + 19, 56, 351)
							ctx.strokeRect(_x - 28, _y + 19, 56, 351)
							this.draw.diffIcon({
								ctx: ctx,
								diff: i,
								x: _x,
								y: _y - 12,
								scale: 1.4,
								border: 4.5
							})
						}
						this.draw.verticalText({
							ctx: ctx,
							text: this.difficulty[i],
							x: _x,
							y: songSel ? _y + 10 : _y + 23,
							width: songSel ? 44 : 56,
							height: songSel ? (i === 1 ? 66 : 88) : (i === 0 ? 130 : i === 1 ? 110 : 135),
							fill: "#000",
							fontSize: songSel ? 25 : (i === 2 ? 45 : 40),
							fontFamily: this.font
						})
						for(var j = 0; j < 10; j++){
							if(songSel){
								var yPos = _y + 113 + j * 17
							}else{
								var yPos = _y + 178 + j * 19.5
							}
							if(10 - j > currentSong.stars[i]){
								ctx.fillStyle = songSel ? "#e97526" : "#e7e7e7"
								ctx.beginPath()
								ctx.arc(_x, yPos, songSel ? 4.5 : 5, 0, Math.PI * 2)
								ctx.fill()
							}else{
								this.draw.diffStar({
									ctx: ctx,
									songSel: songSel,
									x: _x,
									y: yPos
								})
							}
						}
						if(i === currentSong.p2Cursor){
							this.draw.diffCursor({
								ctx: ctx,
								font: this.font,
								x: _x,
								y: _y - (songSel ? 45 : 65),
								two: true,
								side: songSel ? false : (currentSong.p2Cursor === this.selectedDiff - 1),
								scale: songSel ? 0.7 : 1
							})
						}
						if(!songSel){
							var highlight = 0
							var currentDiff = this.selectedDiff - 1
							if(this.state.moveHover - 1 === i){
								highlight = 2
							}else if(currentDiff === i){
								highlight = 1
							}
							if(currentDiff === i){
								this.draw.diffCursor({
									ctx: ctx,
									font: this.font,
									x: _x,
									y: _y - 65,
									side: currentSong.p2Cursor === currentDiff
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
				ctx.globalAlpha = 1 - Math.max(0, opened - 0.5) * 2
				ctx.fillStyle = selectedSkin.background
				ctx.fillRect(x,y,w,h)
				ctx.globalAlpha = 1
				var textX = Math.max(w - 37, w / 2)
				var textY = opened * 12 + (1 - opened) * 7
				this.draw.verticalText({
					ctx: ctx,
					text: currentSong.title,
					x: x + textX,
					y: y + textY,
					width: w,
					height: h - 35,
					fill: "#fff",
					outline: selectedSkin.outline,
					outlineSize: this.songAsset.letterBorder,
					fontSize: 40,
					fontFamily: this.font
				})
			}
		})
		
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
		config.innerContent = (x, y, w, h) => {
			this.draw.verticalText({
				ctx: ctx,
				text: config.text,
				x: x + w / 2,
				y: y + 7,
				width: w,
				height: h - 35,
				fill: "#fff",
				outline: config.outline,
				outlineSize: this.songAsset.letterBorder,
				fontSize: 40,
				fontFamily: this.font
			})
		}
		this.draw.songFrame(config)
		if(config.song.p2Cursor){
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
			var songObj = assets.songs.find(song => song.id == id)
			
			if(songObj.sound){
				if(!loadOnly){
					this.preview = songObj.sound
					this.preview.gain = snd.previewGain
					this.previewLoaded(startLoad, prvTime)
				}
			}else{
				snd.previewGain.load("/songs/" + id + "/main.mp3").then(sound => {
					if(currentId === this.previewId){
						songObj.sound = sound
						this.preview = sound
						this.previewLoaded(startLoad, prvTime)
					}
				})
			}
		}
	}
	previewLoaded(startLoad, prvtime){
		var endLoad = this.getMS()
		var difference = endLoad - startLoad
		var minDelay = 300
		var delay = minDelay - Math.min(minDelay, difference)
		this.preview.playLoop(delay / 1000, false, prvtime / 1000)
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
		if(response){
			response.forEach(idDiff => {
				var id = idDiff.id |0
				var diff = idDiff.diff
				var diffId = this.difficultyId.indexOf(diff)
				if(diffId >= 0){
					var currentSong = this.songs.find(song => song.id === id)
					currentSong.p2Cursor = diffId
				}
			})
		}
	}
	startP2(){
		this.onusers(p2.getMessage("users"))
		pageEvents.add(p2, "message", response => {
			if(response.type == "users"){
				this.onusers(response.value)
			}
		})
		if(p2.closed){
			p2.open()
		}
	}
	
	mod(length, index){
		return ((index % length) + length) % length
	}
	
	getMS(){
		return +new Date
	}
	
	clean(){
		assets.sounds["bgm_songsel"].stop()
		if(!this.bgmEnabled){
			snd.musicGain.fadeIn()
			setTimeout(() => {
				snd.musicGain.fadeIn()
			}, 500)
		}
		this.redrawRunning = false
		this.endPreview()
		pageEvents.keyRemove(this, "all")
		pageEvents.remove(this.canvas, "mousemove")
		pageEvents.remove(this.canvas, "mousedown")
		pageEvents.remove(this.canvas, "touchstart")
		if(this.touchEnabled){
			pageEvents.remove(this.touchFullBtn, "click")
			delete this.touchFullBtn
		}
		delete this.ctx
		delete this.canvas
	}
}
