class SongSelect{
	constructor(fromTutorial){
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
				background: "#fa91ff",
				border: ["#ffdfff", "#b068b2"],
				outline: "#b221bb"
			},
			"tutorial": {
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
			"ボーカロイド": {
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
		this.font = "DFPKanTeiRyu-XB"
		
		this.songs = []
		for(let song of assets.songs){
			this.songs.push({
				id: song.id,
				title: song.title,
				skin: this.songSkin[song.category || "default"],
				stars: song.stars,
				category: song.category,
				preview: song.preview || 0
			})
		}
		this.songs.sort((a, b) => {
			var sortA = this.songSkin[a.category || "default"].sort
			var sortB = this.songSkin[b.category || "default"].sort
			if(sortA === sortB){
				return a.id > b.id ? 1 : -1
			}else{
				return sortA > sortB ? 1 : -1
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
			action: "random"
		})
		this.songs.push({
			title: "あそびかた説明",
			skin: this.songSkin.tutorial,
			action: "tutorial"
		})
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
		this.diffStar = new Path2D("M3 17 5 11 0 6h6l3-6 3 6h6l-5 5 2 6-6-3")
		this.longVowelMark = new Path2D("m1 5c2 3 1 17 .5 25 0 5 6 5 6.5 0C9 22 9 6 7 3 4-2-1 2 1 5")
		
		this.diffIconPath = [[{w: 40, h: 33},{
			fill: "#ff2803",
			d: new Path2D("m27 10c9-9 21 9 5 11 10 9-6 18-12 7C14 39-2 30 8 21-8 19 4 1 13 10 6-4 34-3 27 10Z")
		},{
			fill: "#ffb910",
			noStroke: true,
			d: new Path2D("m12 15c5 1 7 0 8-4 1 4 3 5 8 4-4 3-4 5-2 8-4-4-8-4-12 0 2.2-3 2-5-2-8")
		}],[{w: 48, h: 31},{
			fill: "#8daf51",
			d: new Path2D("m24 0c-3 0-4 3-5 6-2 6-2 11 0 17 0 0 1 4 5 8 4-4 5-8 5-8C31 17 31 12 29 6 28 3 27 0 24 0M37 2c4 3 7 6 8 8 2 4 3 6 2 13C43 21 39 18 39 18 35 15 32 12 30 8 27 0 32-2 37 2M11 2C7 5 4 8 3 10 1 14 0 16 1 23 5 21 9 18 9 18 13 15 16 12 18 8 21 0 16-2 11 2")
		}],[{w: 56, h: 37},{
			fill: "#784439",
			d: new Path2D("m26 34v-2c-10 1-12 0-12-7 4-3 8-5 14-5 6 0 10 2 14 5 0 7-2 8-12 7V34Z")
		},{
			fill: "#000",
			noStroke: true,
			d: new Path2D("m18 19v9h8v-9m4 9h8v-9h-8")
		},{
			fill: "#414b2b",
			d: new Path2D("M8 26C3 26-3 21 2 11 6 5 11 4 18 10c0-6 4-10 10-10 6 0 10 4 10 10 7-6 12-5 16 1 5 10-1 15-6 15-5 0-10-7-20-7-10 0-15 7-20 7")
		}],[{w: 29, h: 27},{
			fill: "#db1885",
			d: new Path2D("m18 9c1 3 4 4 7 3 0 4 1 11 4 16H0c3-5 4-12 4-16 3 1 6 0 7-3z")
		},{
			fill: "#fff",
			d: new Path2D("m6 0.5-2 11c4 1.5 6-0.5 6.5-3zm17 0-4.5 8C19 11 21 13 25 11.5ZM5.5 17.5C4.5 23.5 9 25 11 22Zm18 0L18 22c2 3 6.5 1.5 5.5-4.5z")
		}]]
		this.regex = {
			comma: /[,.]/,
			ideographicComma: /[、。]/,
			apostrophe: /['＇]/,
			brackets: /[\(（\)）「」『』]/,
			tilde: /[\-－~～]/,
			tall: /[bｂdｄfｆh-lｈ-ｌtｔ0-9０-９]/,
			uppercase: /[A-ZＡ-Ｚ!！]/,
			lowercase: /[a-zａ-ｚ･]/,
			latin: /[A-ZＡ-Ｚ!！a-zａ-ｚ･]/,
			smallHiragana: /[ぁぃぅぇぉっゃゅょァィゥェォッャュョ]/,
			hiragana: /[\u3040-\u30ff]/,
			todo: /[トド]/
		}
		
		this.difficulty = ["かんたん", "ふつう", "むずかしい", "おに"]
		this.difficultyId = ["easy", "normal", "hard", "oni"]
		
		this.selectedSong = 0
		this.selectedDiff = 0
		assets.sounds["bgm_songsel"].playLoop(0.1, false, 0, 1.442, 3.506)
		
		if(fromTutorial || !"selectedSong" in localStorage){
			this.selectedSong = this.songs.findIndex(song => song.action === "tutorial")
		}else{
			if("selectedSong" in localStorage){
				this.selectedSong = Math.min(Math.max(0, localStorage["selectedSong"] |0), this.songs.length)
			}
			assets.sounds["song-select"].play()
		}
		if("selectedDiff" in localStorage){
			this.selectedDiff = Math.min(Math.max(0, localStorage["selectedDiff"] |0), 4)
		}
		
		this.previewId = 0
		this.state = {
			screen: fromTutorial ? "song" : "title",
			screenMS: this.getMS(),
			move: 0,
			moveMS: 0,
			moveHover: null,
			locked: true
		}
		this.songSelecting = {
			speed: 800,
			resize: 0.3,
			scrollDelay: 0.1
		}
		
		this.startPreview(true)
		
		this.pressedKeys = {}
		this.gamepad = new Gamepad({
			"13": ["b", "start"],
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
		if(code === "ctrl" && code === "shift"){
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
		if(event.which !== 1){
			return
		}
		var mouse = this.mouseOffset(event)
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
				this.toLoadSong(moveBy - 1, event.shiftKey, event.ctrlKey)
			}
		}
	}
	mouseMove(event){
		var mouse = this.mouseOffset(event)
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
	}
	mouseOffset(event){
		return {
			x: (event.offsetX * this.pixelRatio - this.winW / 2) / this.ratio + 1024 / 2,
			y: (event.offsetY * this.pixelRatio - this.winH / 2) / this.ratio + 720 / 2
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
	toLoadSong(difficulty, shift, ctrl){
		this.clean()
		var selectedSong = this.songs[this.selectedSong]
		assets.sounds["diffsel"].stop()
		assets.sounds["don"].play()
		
		localStorage["selectedSong"] = this.selectedSong
		localStorage["selectedDiff"] = difficulty + 1
		
		new loadSong({
			"title": selectedSong.title,
			"folder": selectedSong.id,
			"difficulty": this.difficultyId[difficulty]
		}, shift, ctrl)
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
		}else if(winH / 9 > winW / 16){
			winH = winW / 16 * 9
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
		
		if(screen === "title"){
			if(ms > this.state.screenMS + 1000){
				this.state.screen = "song"
				this.state.screenMS = ms + (ms - this.state.screenMS - 1000)
				this.state.moveMS = ms - this.songSelecting.speed * this.songSelecting.resize + (ms - this.state.screenMS)
				this.state.locked = 3
				this.state.lastMove = 1
			}else{
				this.state.moveMS = ms - this.songSelecting.speed * this.songSelecting.resize + (ms - this.state.screenMS - 1000)
			}
		}
		
		if(screen === "title" || screen === "song"){
			this.drawLayeredText({
				text: "曲をえらぶ",
				fontSize: 48,
				fontFamily: this.font,
				x: frameLeft + 53,
				y: frameTop + 30,
				letterSpacing: 2
			}, [
				{x: -2, y: -2, outline: "#000", letterBorder: 22},
				{},
				{x: 2, y: 2, shadow: true},
				{x: -2, y: -2, outline: "#ff797b", letterBorder: 10},
				{x: 2, y: 2, outline: "#ad1516"},
				{outline: "#f70808"},
				{fill: "#fff"}
			])
			
			var category = this.songs[this.selectedSong].category
			if(category){
				this.drawLayeredText({
					text: category,
					fontSize: 40,
					fontFamily: this.font,
					x: winW / 2,
					y: frameTop + 38,
					width: 255,
					center: true
				}, [
					{outline: this.songs[this.selectedSong].skin.outline, letterBorder: 12, shadow: true},
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
			}
			if(this.state.moveMS && ms < this.state.moveMS + changeSpeed){
				xOffset = Math.min(scroll, Math.max(0, elapsed - resize - scrollDelay)) / scroll * (this.songAsset.width + this.songAsset.marginLeft)
				xOffset *= -this.state.move
				if(elapsed < resize){
					selectedWidth = this.songAsset.width + (((resize - elapsed) / resize) * (selectedWidth - this.songAsset.width))
				}else if(elapsed > resize2){
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
		}else if(screen !== "title" && ms > this.state.moveMS + 100){
			if(this.previewing !== this.selectedSong && "id" in this.songs[this.selectedSong]){
				this.startPreview()
			}
		}
		
		if(screen === "title" || screen === "song"){
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
		if(screen === "title" || this.state.locked === 3){
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
		
		this.drawSongFrame({
			x: winW / 2 - selectedWidth / 2 + xOffset,
			y: songTop + this.songAsset.height - selectedHeight,
			width: selectedWidth,
			height: selectedHeight,
			background: selectedSkin.background,
			border: selectedSkin.border,
			highlight: highlight,
			noCrop: screen === "difficulty",
			innerContent: (x, y, w, h) => {
				ctx.strokeStyle = "#000"
				if(screen === "title" || screen === "song"){
					var opened = ((selectedWidth - this.songAsset.width) / (this.songAsset.selectedWidth - this.songAsset.width))
					var songSel = true
				}else{
					this.drawLayeredText({
						text: "むずかしさをえらぶ",
						fontSize: 46,
						fontFamily: this.font,
						x: x - 144,
						y: y - 24,
						width: 280
					}, [
						{x: -2, y: -2, outline: "#000", letterBorder: 23},
						{shadow: true},
						{x: 2, y: 2},
						{x: -2, y: -2, outline: "#ff797b", letterBorder: 12},
						{x: 2, y: 2, outline: "#ad1516"},
						{outline: "#f70808"},
						{fill: "#fff"}
					])
					var opened = 1
					var songSel = false
					var _x = x + 62
					var _y = y + 67
					ctx.fillStyle = "#efb058"
					ctx.lineWidth = 5
					this.drawRoundedRect({
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
					this.drawDiffOptionsIcon({x: _x, y: _y + 28})
					
					this.drawVerticalText({
						text: "もどる",
						x: _x,
						y: _y + 57,
						width: 56,
						height: 220,
						fill: "#fff",
						outline: "#000",
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
						this.drawHighlight({
							x: _x - 32,
							y: _y - 3,
							w: 64,
							h: 304,
							animate: highlight === 1,
							opacity: highlight === 2 ? 0.8 : 1,
							radius: 24
						})
						if(this.selectedDiff === 0){
							this.drawDiffCursor({
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
							this.drawDiffIcon({
								diff: i,
								x: _x,
								y: _y - 8,
								scale: 1,
								border: 6
							})
						}else{
							var _x = x + 402 + i * 100
							var _y = y + 87
							this.drawDiffIcon({
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
							this.drawDiffIcon({
								diff: i,
								x: _x,
								y: _y - 12,
								scale: 1.4,
								border: 4.5
							})
						}
						this.drawVerticalText({
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
								ctx.save()
								ctx.fillStyle = songSel ? "#fff" : "#f72568"
								if(songSel){
									ctx.shadowColor = "#fff"
									ctx.shadowBlur = 10
									ctx.translate(_x - 9, yPos - 9)
								}else{
									ctx.translate(_x - 10.5, yPos - 9.5)
									ctx.scale(1.1, 1.1)
								}
								ctx.fill(this.diffStar)
								ctx.restore()
							}
						}
						if(i === currentSong.p2Cursor){
							this.drawDiffCursor({
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
								this.drawDiffCursor({
									x: _x,
									y: _y - 65,
									side: currentSong.p2Cursor === currentDiff
								})
							}
							if(highlight){
								this.drawHighlight({
									x: _x - 32,
									y: _y + 14,
									w: 64,
									h: 362,
									animate: highlight === 1,
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
				this.drawVerticalText({
					text: currentSong.title,
					x: x + textX,
					y: y + textY,
					width: w,
					height: h - 35,
					fill: "#fff",
					outline: selectedSkin.outline,
					fontSize: 40,
					fontFamily: this.font
				})
			}
		})
		
		if(songSelMoving){
			this.drawHighlight({
				x: winW / 2 - selectedWidth / 2,
				y: songTop,
				w: selectedWidth,
				h: selectedHeight,
				opacity: 0.8
			})
		}
	}
	
	drawRoundedRect(config){
		var ctx = this.ctx
		var x = config.x
		var y = config.y
		var w = config.w
		var h = config.h
		var r = config.radius
		ctx.beginPath()
		ctx.arc(x + r, y + r, r, Math.PI, Math.PI * 1.5)
		ctx.arc(x + w - r, y + r, r, Math.PI * 1.5, 0)
		ctx.arc(x + w - r, y + h - r, r, 0, Math.PI / 2)
		ctx.arc(x + r, y + h - r, r, Math.PI / 2, Math.PI)
		ctx.lineTo(x, y + r)
	}
	
	drawClosedSong(config){
		config.width = this.songAsset.width
		config.height = this.songAsset.height
		config.background = config.song.skin.background
		config.border = config.song.skin.border
		config.outline = config.song.skin.outline
		config.text = config.song.title
		config.innerContent = (x, y, w, h) => {
			this.drawVerticalText({
				text: config.text,
				x: x + w / 2,
				y: y + 7,
				width: w,
				height: h - 35,
				fill: "#fff",
				outline: config.outline,
				fontSize: 40,
				fontFamily: this.font
			})
		}
		this.drawSongFrame(config)
		if(config.song.p2Cursor){
			this.drawDiffCursor({
				x: config.x + 48,
				y: config.y - 27,
				two: true,
				scale: 1,
				side: true
			})
		}
	}
	
	drawSongFrame(config){
		var ctx = this.ctx
		var x = config.x
		var y = config.y
		var w = config.width
		var h = config.height
		var border = this.songAsset.border
		var innerBorder = this.songAsset.innerBorder
		var allBorders = border + innerBorder
		var innerX = x + allBorders
		var innerY = y + allBorders
		var innerW = w - allBorders * 2
		var innerH = h - allBorders * 2
		
		ctx.save()
		
		ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
		ctx.shadowBlur = 10
		ctx.shadowOffsetX = 5
		ctx.shadowOffsetY = 5
		ctx.fillStyle = "#000"
		ctx.fillRect(x, y, w, h)
		
		ctx.restore()
		ctx.save()
		
		{
			let _x = x + border
			let _y = y + border
			let _w = w - border * 2
			let _h = h - border * 2
			ctx.fillStyle = config.border[1]
			ctx.fillRect(_x, _y, _w, _h)
			ctx.fillStyle = config.border[0]
			ctx.beginPath()
			ctx.moveTo(_x, _y)
			ctx.lineTo(_x + _w, _y)
			ctx.lineTo(_x + _w - innerBorder, _y + innerBorder)
			ctx.lineTo(_x + innerBorder, _y + _h - innerBorder)
			ctx.lineTo(_x, _y + _h)
			ctx.fill()
		}
		ctx.fillStyle = config.background
		ctx.fillRect(innerX, innerY, innerW, innerH)
		
		ctx.save()
		
		ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
		ctx.lineWidth = 3
		ctx.strokeRect(innerX, innerY, innerW, innerH)
		if(!config.noCrop){
			ctx.beginPath()
			ctx.rect(innerX, innerY, innerW, innerH)
			ctx.clip()
		}
		
		config.innerContent(innerX, innerY, innerW, innerH)
		
		ctx.restore()
		
		if(config.highlight){
			this.drawHighlight({
				x: x,
				y: y,
				w: w,
				h: h,
				animate: config.highlight === 2,
				opacity: config.highlight === 1 ? 0.8 : 1
			})
		}
		
		ctx.restore()
	}
	
	drawHighlight(config){
		var ctx = this.ctx
		ctx.save()
		var _x = config.x + 3.5
		var _y = config.y + 3.5
		var _w = config.w - 7
		var _h = config.h - 7
		var rect = () => {
			if(config.radius){
				this.drawRoundedRect({x: _x, y: _y, w: _w, h: _h, radius: config.radius})
				ctx.stroke()
			}else{
				ctx.strokeRect(_x, _y, _w, _h)
			}
		}
		if(config.animate){
			ctx.globalAlpha = this.fade((this.getMS() - this.state.moveMS) % 2000 / 2000)
		}else if(config.opacity){
			ctx.globalAlpha = config.opacity
		}
		ctx.strokeStyle = "rgba(255, 249, 1, 0.45)"
		ctx.lineWidth = 14
		rect()
		ctx.strokeStyle = "rgba(255, 249, 1, .8)"
		ctx.lineWidth = 8
		rect()
		ctx.strokeStyle = "#fff"
		ctx.lineWidth = 6
		rect()
		
		ctx.restore()
	}
	fade(pos){
		if(pos < 0.5){
			pos = 1 - pos
		}
		return (1 - Math.cos(Math.PI * pos * 2)) / 2
	}
	
	drawVerticalText(config){
		var ctx = this.ctx
		var inputText = config.text
		var mul = config.fontSize / 40
		var ura = false
		
		if(inputText.endsWith(" (裏)")){
			inputText = inputText.slice(0, -4)
			ura = true
		}else if(inputText.endsWith("（裏）")){
			inputText = inputText.slice(0, -3)
			ura = true
		}
		var string = inputText.split("")
		var drawn = []
		
		var r = this.regex
		for(let symbol of string){
			if(symbol === " "){
				// Space
				drawn.push({text: symbol, x: 0, y: 0, h: 18})
			}else if(symbol === "ー"){
				// Long-vowel mark
				drawn.push({svg: this.longVowelMark, x: -4, y: 5, h: 33, scale: [mul, mul]})
			}else if(r.comma.test(symbol)){
				// Comma, full stop
				drawn.push({text: symbol, x: 16, y: -7, h: 0, scale: [1.2, 0.7]})
			}else if(r.ideographicComma.test(symbol)){
				// Ideographic comma, full stop
				drawn.push({text: symbol, x: 16, y: -16, h: 18})
			}else if(r.apostrophe.test(symbol)){
				// Apostrophe
				drawn.push({text: ",", x: 20, y: -39, h: 0, scale: [1.2, 0.7]})
			}else if(r.brackets.test(symbol)){
				// Rotated brackets
				drawn.push({text: symbol, x: 0, y: -5, h: 25, rotate: true})
			}else if(r.tilde.test(symbol)){
				// Rotated hyphen, tilde
				if(symbol === "~"){
					symbol = "～"
				}
				drawn.push({text: symbol, x: 0, y: 2, h: 35, rotate: true})
			}else if(r.tall.test(symbol)){
				// Tall latin script lowercase, numbers
				drawn.push({text: symbol, x: 0, y: 4, h: 34, scale: [1.05, 0.9]})
			}else if(r.uppercase.test(symbol)){
				// Latin script upper case
				drawn.push({text: symbol, x: 0, y: 1, h: 31.5})
			}else if(r.lowercase.test(symbol)){
				// Latin script lower case
				drawn.push({text: symbol, x: 0, y: -1, h: 28, scale: [1.05, 0.9]})
			}else if(r.smallHiragana.test(symbol)){
				// Small hiragana, small katakana
				drawn.push({text: symbol, x: 0, y: -8, h: 25, right: true})
			}else if(r.hiragana.test(symbol)){
				// Hiragana, katakana
				drawn.push({text: symbol, x: 0, y: 5, h: 38, right: r.todo.test(symbol)})
			}else{
				// Kanji, other
				drawn.push({text: symbol, x: 0, y: 3, h: 39, right: true})
			}
		}
		
		var drawnHeight = 0
		for(let symbol of drawn){
			if(config.letterSpacing){
				symbol.h += config.letterSpacing
			}
			drawnHeight += symbol.h * mul
		}
		
		ctx.save()
		ctx.translate(config.x, config.y)
		
		var scale = 1
		if(config.height){
			var height = config.height - (ura ? 52 * mul : 0)
			if(drawnHeight > height){
				scale = height / drawnHeight
				ctx.scale(1, scale)
			}
		}
		
		if(ura){
			// Circled ura
			drawn.push({text: "裏", x: 0, y: 18, h: 52, ura: true, scale: [1, 1 / scale]})
		}
		
		var actions = []
		if(config.outline){
			actions.push("stroke")
		}
		if(config.fill){
			actions.push("fill")
		}
		for(let action of actions){
			ctx.font = config.fontSize + "px " + config.fontFamily
			ctx.textBaseline = "top"
			if(action === "stroke"){
				ctx.strokeStyle = config.outline
				ctx.lineWidth = this.songAsset.letterBorder * mul
				ctx.lineJoin = "round"
				ctx.miterLimit = 1
			}else if(action === "fill"){
				ctx.fillStyle = config.fill
			}
			var offsetY = 0
			
			for(let symbol of drawn){
				var saved = false
				var currentX = symbol.x
				if(symbol.right){
					currentX += 20 * mul
				}
				var currentY = offsetY + symbol.y * mul
				if(symbol.rotate || symbol.scale || symbol.svg || symbol.ura){
					saved = true
					ctx.save()
					
					if(symbol.rotate){
						ctx.translate(currentX + 20 * mul, currentY + 20 * mul)
						ctx.rotate(Math.PI / 2)
					}else{
						ctx.translate(currentX, currentY)
					}
					if(symbol.scale){
						ctx.scale(symbol.scale[0], symbol.scale[1])
						ctx.lineWidth = ctx.lineWidth / symbol.scale[0]
					}
					currentX = 0
					currentY = 0
				}
				if(symbol.svg){
					ctx[action](symbol.svg)
				}else{
					if(symbol.right){
						ctx.textAlign = "right"
					}else{
						ctx.textAlign = "center"
					}
					if(symbol.ura){
						ctx.font = (30 * mul) + "px Meiryo"
						ctx.textBaseline = "center"
						ctx.beginPath()
						ctx.arc(currentX, currentY + (21.5 * mul), (18 * mul), 0, Math.PI * 2)
						if(action === "stroke"){
							ctx.fillStyle = config.outline
							ctx.fill()
						}else if(action === "fill"){
							ctx.strokeStyle = config.fill
							ctx.lineWidth = 2.5 * mul
							ctx.fillText(symbol.text, currentX, currentY)
						}
						ctx.stroke()
					}else{
						ctx[action + "Text"](symbol.text, currentX, currentY)
					}
				}
				offsetY += symbol.h * mul
				if(saved){
					ctx.restore()
				}
			}
		}
		ctx.restore()
	}
	
	drawLayeredText(config, layers){
		var ctx = this.ctx
		var mul = config.fontSize / 40
		ctx.save()
		
		var string = config.text.split("")
		var drawn = []
		
		var r = this.regex
		for(let symbol of string){
			if(symbol === "-"){
				drawn.push({text: symbol, x: -4, y: 0, w: 28, scale: [0.8, 1]})
			}else if(r.latin.test(symbol)){
				// Latin script
				drawn.push({text: symbol, x: 0, y: 0, w: 32})
			}else if(r.smallHiragana.test(symbol)){
				// Small hiragana, small katakana
				drawn.push({text: symbol, x: 0, y: 0, w: 30})
			}else if(r.hiragana.test(symbol)){
				// Hiragana, katakana
				drawn.push({text: symbol, x: 0, y: 0, w: 35})
			}else{
				drawn.push({text: symbol, x: 0, y: 0, w: 39})
			}
		}
		
		var drawnWidth = 0
		for(let symbol of drawn){
			if(config.letterSpacing){
				symbol.w += config.letterSpacing
			}
			drawnWidth += symbol.w
		}
		
		ctx.translate(config.x, config.y)
		var scale = 1
		if(config.width && drawnWidth > config.width){
			scale = config.width / drawnWidth
			ctx.scale(scale, 1)
		}
		ctx.font = config.fontSize + "px " + config.fontFamily
		ctx.textBaseline = "top"
		ctx.textAlign = "center"
		
		for(let layer of layers){
			var action = "strokeText"
			if(layer.outline){
				ctx.strokeStyle = layer.outline
				ctx.lineJoin = "round"
				ctx.miterLimit = 1
			}
			if(layer.letterBorder){
				ctx.lineWidth = layer.letterBorder
			}
			if(layer.fill){
				ctx.fillStyle = layer.fill
				action = "fillText"
			}
			if(layer.shadow){
				ctx.save()
				ctx.shadowColor = "rgba(0, 0, 0, 0.5)"
				ctx.shadowBlur = 3
				ctx.shadowOffsetX = 3
				ctx.shadowOffsetY = 3
			}
			var offsetX = 0
			for(let symbol of drawn){
				var saved = false
				var currentX = offsetX + symbol.x + (layer.x || 0) + symbol.w / 2
				var currentY = symbol.y + (layer.y || 0)
				if(config.center){
					currentX -= drawnWidth / 2
				}
				if(symbol.scale){
					saved = true
					ctx.save()
					ctx.translate(currentX, currentY)
					ctx.scale(symbol.scale[0], symbol.scale[1])
					currentX = 0
					currentY = 0
				}
				ctx[action](symbol.text, currentX, currentY)
				if(saved){
					ctx.restore()
				}
				offsetX += symbol.w * mul
			}
			if(layer.shadow){
				ctx.restore()
			}
		}
		ctx.restore()
	}
	
	drawDiffIcon(config){
		var ctx = this.ctx
		var scale = config.scale
		ctx.save()
		ctx.lineWidth = config.border
		ctx.strokeStyle = "#000"
		var icon = this.diffIconPath[config.diff]
		ctx.translate(config.x - icon[0].w * scale / 2, config.y - icon[0].h * scale / 2)
		ctx.scale(scale, scale)
		for(var i = 1; i < icon.length; i++){
			if(!icon[i].noStroke){
				ctx.stroke(icon[i].d)
			}
		}
		if(!config.noFill){
			for(var i = 1; i < icon.length; i++){
				ctx.fillStyle = icon[i].fill
				ctx.fill(icon[i].d)
			}
		}
		ctx.restore()
	}
	
	drawDiffOptionsIcon(config){
		var ctx = this.ctx
		ctx.save()
		ctx.translate(config.x - 21, config.y - 21)
		
		var drawLine = y => {
			ctx.beginPath()
			ctx.moveTo(12, y)
			ctx.arc(20.5, 25, 8.5, Math.PI, Math.PI * 2, true)
			ctx.lineTo(29, 18)
			ctx.stroke()
		}
		var drawTriangle = noFill => {
			ctx.beginPath()
			ctx.moveTo(29, 5)
			ctx.lineTo(21, 19)
			ctx.lineTo(37, 19)
			ctx.closePath()
			if(!noFill){
				ctx.fill()
			}
		}
		ctx.strokeStyle = "#000"
		ctx.lineWidth = 12
		drawLine(9)
		ctx.lineWidth = 5
		drawTriangle(true)
		ctx.stroke()
		ctx.lineWidth = 7
		ctx.fillStyle = "#fff"
		ctx.strokeStyle = "#fff"
		drawLine(11)
		drawTriangle()
		ctx.translate(-1.5, -0.5)
		ctx.fillStyle = "#23a6e1"
		ctx.strokeStyle = "#23a6e1"
		ctx.globalCompositeOperation = "darken"
		drawLine(11)
		drawTriangle()
		
		ctx.restore()
	}
	
	drawDiffCursor(config){
		var ctx = this.ctx
		ctx.save()
		if(config.scale){
			ctx.translate(config.x, config.y)
			ctx.scale(config.scale, config.scale)
			ctx.translate(-48, -64)
		}else{
			ctx.translate(config.x - 48, config.y - 64)
		}
		
		ctx.fillStyle = config.two ? "#65cdcd" : "#ff411c"
		ctx.strokeStyle = "#000"
		ctx.lineWidth = 6
		ctx.beginPath()
		if(!config.side){
			var textX = config.two ? 20 : 17
			ctx.moveTo(48, 120)
			ctx.arc(48, 48.5, 45, Math.PI * 0.58, Math.PI * 0.42)
		}else if(config.two){
			var textX = 70
			ctx.moveTo(56, 115)
			ctx.arc(98, 48.5, 45, Math.PI * 0.75, Math.PI * 0.59)
		}else{
			var textX = -33
			ctx.moveTo(39, 115)
			ctx.arc(-2, 48.5, 45, Math.PI * 0.41, Math.PI * 0.25)
		}
		ctx.closePath()
		ctx.fill()
		ctx.stroke()
		this.drawLayeredText({
			text: config.two ? "2P" : "1P",
			fontSize: 43,
			fontFamily: this.font,
			x: textX,
			y: 26,
			width: 54,
			letterSpacing: -4
		}, [
			{outline: "#fff", letterBorder: 11},
			{fill: "#000"}
		])
		
		ctx.restore()
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
		snd.musicGain.fadeOut(0.4)
		var endLoad = this.getMS()
		var difference = endLoad - startLoad
		var minDelay = 300
		var delay = minDelay - Math.min(minDelay, difference)
		this.preview.playLoop(delay / 1000, false, prvtime / 1000)
	}
	endPreview(noFadeIn){
		if(!noFadeIn){
			snd.musicGain.fadeIn(0.4)
		}
		this.previewId++
		this.previewing = null
		if(this.preview){
			this.preview.stop()
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
		snd.musicGain.fadeIn()
		setTimeout(() => {
			snd.musicGain.fadeIn()
		}, 500)
		this.redrawRunning = false
		this.endPreview()
		pageEvents.keyRemove(this, "all")
		pageEvents.remove(this.canvas, "mousemove")
		pageEvents.remove(this.canvas, "mousedown")
		delete this.ctx
		delete this.canvas
	}
}
