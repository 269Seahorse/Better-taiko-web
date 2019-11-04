class ParseTja{
	constructor(file, difficulty, stars, offset, metaOnly){
		this.data = []
		for(let line of file){
			line = line.replace(/\/\/.*/, "").trim()
			if(line !== ""){
				this.data.push(line)
			}
		}
		this.difficulty = difficulty
		this.stars = stars
		this.offset = (offset || 0) * -1000
		this.soundOffset = 0
		this.noteTypes = {
			"0": {name: false, txt: false},
			"1": {name: "don", txt: strings.note.don},
			"2": {name: "ka", txt: strings.note.ka},
			"3": {name: "daiDon", txt: strings.note.daiDon},
			"4": {name: "daiKa", txt: strings.note.daiKa},
			"5": {name: "drumroll", txt: strings.note.drumroll},
			"6": {name: "daiDrumroll", txt: strings.note.daiDrumroll},
			"7": {name: "balloon", txt: strings.note.balloon},
			"8": {name: false, txt: false},
			"9": {name: "balloon", txt: strings.note.balloon},
			"A": {name: "daiDon", txt: strings.note.daiDon},
			"B": {name: "daiKa", txt: strings.note.daiKa}
		}
		this.courseTypes = {
			"0": "easy",
			"1": "normal",
			"2": "hard",
			"3": "oni",
			"4": "ura",
			"edit": "ura"
		}
		
		this.metadata = this.parseMetadata()
		this.measures = []
		this.beatInfo = {}
		if(!metaOnly){
			this.circles = this.parseCircles()
		}
	}
	parseMetadata(){
		var metaNumbers = ["bpm", "offset", "demostart", "level", "scoremode", "scorediff"]
		var inSong = false
		var hasSong = false
		var courses = {}
		var currentCourse = {}
		var courseName = "oni"
		for(var lineNum = 0; lineNum < this.data.length; lineNum++){
			var line = this.data[lineNum]
			
			if(line.slice(0, 1) === "#"){
				
				var name = line.slice(1).toLowerCase()
				if(name === "start" && !inSong){
					
					inSong = true
					if(!hasSong){
						if(!(courseName in courses)){
							courses[courseName] = {}
						}
						for(var name in currentCourse){
							if(name !== "branch"){
								courses[courseName][name] = currentCourse[name]
							}
						}
						courses[courseName].start = lineNum + 1
						courses[courseName].end = this.data.length
					}
				}else if(name === "end" && inSong){
					inSong = false
					if(!hasSong){
						hasSong = true
						courses[courseName].end = lineNum
					}
				}else if(name.startsWith("branchstart") && inSong){
					courses[courseName].branch = true
				}
				
			}else if(!inSong){
				
				if(line.indexOf(":") > 0){
					
					var [name, value] = this.split(line, ":")
					name = name.toLowerCase().trim()
					value = value.trim()
					
					if(name === "course"){
						value = value.toLowerCase()
						if(value in this.courseTypes){
							courseName = this.courseTypes[value]
						}else{
							courseName = value
						}
						hasSong = false
					}else if(name === "balloon"){
						value = value ? value.split(",").map(digit => parseInt(digit)) : []
					}else if(this.inArray(name, metaNumbers)){
						value = parseFloat(value)
					}
					else if (name === "scoreinit") {
						value = value ? parseFloat(value.split(",")[0]) : 0; 
					}

					currentCourse[name] = value
				}
				
			}
		}
		return courses
	}
	inArray(string, array){
		return array.indexOf(string) >= 0
	}
	split(string, delimiter){
		var index = string.indexOf(delimiter)
		if(index < 0){
			return [string, ""]
		}
		return [string.slice(0, index), string.slice(index + delimiter.length)]
	}
	parseCircles(){
		var meta = this.metadata[this.difficulty]
		var ms = (meta.offset || 0) * -1000 + this.offset
		var bpm = Math.abs(meta.bpm) || 120
		var scroll = 1
		var measure = 4
		this.beatInfo.beatInterval = 60000 / bpm
		var gogo = false
		var barLine = true
		
		var balloonID = 0
		var balloons = meta.balloon || []
		
		var lastDrumroll = false
		
		var branch = false
		var branchObj = {}
		var currentBranch = false
		var branchSettings = {}
		var branchFirstMeasure = false
		var sectionBegin = true
		
		var currentMeasure = []
		var firstNote = true
		var circles = []
		var circleID = 0
		var regexAZ = /[A-Z]/
		
		var pushMeasure = () => {
			var note = currentMeasure[0]
			if(note){
				var speed = note.bpm * note.scroll / 60
			}else{
				var speed = bpm * scroll / 60
			}
			this.measures.push({
				ms: ms,
				originalMS: ms,
				speed: speed,
				visible: barLine,
				branch: currentBranch,
				branchFirst: branchFirstMeasure
			})
			branchFirstMeasure = false
			if(currentMeasure.length){
				for(var i = 0; i < currentMeasure.length; i++){
					var note = currentMeasure[i]
					if(firstNote && note.type){
						firstNote = false
						if(ms < 0){
							this.soundOffset = ms
							ms = 0
						}
					}
					note.start = ms
					if(note.endDrumroll){
						note.endDrumroll.endTime = ms
						note.endDrumroll.originalEndTime = ms
					}
					var msPerMeasure = 60000 * measure / note.bpm
					ms += msPerMeasure / currentMeasure.length
				}
				for(var i = 0; i < currentMeasure.length; i++){
					var note = currentMeasure[i]
					if(note.type){
						circleID++
						var circleObj = new Circle({
							id: circleID,
							start: note.start,
							type: note.type,
							txt: note.txt,
							speed: note.bpm * note.scroll / 60,
							gogoTime: note.gogo,
							endTime: note.endTime,
							requiredHits: note.requiredHits,
							beatMS: 60000 / note.bpm,
							branch: currentBranch,
							section: note.section
						})
						if(lastDrumroll === note){
							lastDrumroll = circleObj
						}
						
						circles.push(circleObj)
					}
				}
			}else{
				var msPerMeasure = 60000 * measure / bpm
				ms += msPerMeasure
			}
		}
		
		for(var lineNum = meta.start; lineNum < meta.end; lineNum++){
			var line = this.data[lineNum]
			if(line.slice(0, 1) === "#"){
				
				var line = line.slice(1).toLowerCase()
				var [name, value] = this.split(line, " ")
				
				switch(name){
					case "gogostart":
						gogo = true
						break
					case "gogoend":
						gogo = false
						break
					case "bpmchange":
						bpm = parseFloat(value) || bpm
						break
					case "scroll":
						scroll = Math.abs(parseFloat(value)) || scroll
						break
					case "measure":
						var [numerator, denominator] = value.split("/")
						measure = numerator / denominator * 4 || measure
						break
					case "delay":
						ms += (parseFloat(value) || 0) * 1000
						break
					case "barlineon":
						barLine = true
						break
					case "barlineoff":
						barLine = false
						break
					case "branchstart":
						branch = true
						currentBranch = false
						branchFirstMeasure = true
						branchSettings = {
							ms: ms,
							gogo: gogo,
							bpm: bpm,
							scroll: scroll,
							sectionBegin: sectionBegin
						}
						value = value.split(",")
						if(!this.branches){
							this.branches = []
						}
						var req = {
							advanced: parseFloat(value[1]) || 0,
							master: parseFloat(value[2]) || 0
						}
						if(req.advanced > 0){
							var active = req.master > 0 ? "normal" : "master"
						}else{
							var active = req.master > 0 ? "advanced" : "master"
						}
						branchObj = {
							ms: ms,
							originalMS: ms,
							active: active,
							type: value[0].trim().toLowerCase() === "r" ? "drumroll" : "accuracy",
							requirement: req
						}
						this.branches.push(branchObj)
						if(this.measures.length === 1 && branchObj.type === "drumroll"){
							for(var i = circles.length; i--;){
								var circle = circles[i]
								if(circle.endTime && circle.type === "drumroll" || circle.type === "daiDrumroll" || circle.type === "balloon"){
									this.measures.push({
										ms: circle.endTime,
										originalMS: circle.endTime,
										speed: circle.bpm * circle.scroll / 60,
										visible: false,
										branch: circle.branch
									})
									break
								}
							}
						}
						if(this.measures.length !== 0){
							this.measures[this.measures.length - 1].nextBranch = branchObj
						}
						break
					case "branchend":
						branch = false
						currentBranch = false
						break
					case "section":
						sectionBegin = true
						if(branch && !currentBranch){
							branchSettings.sectionBegin = true
						}
						break
					case "n": case "e": case "m":
						if(!branch){
							break
						}
						ms = branchSettings.ms
						gogo = branchSettings.gogo
						bpm = branchSettings.bpm
						scroll = branchSettings.scroll
						sectionBegin = branchSettings.sectionBegin
						branchFirstMeasure = true
						var branchName = name === "m" ? "master" : (name === "e" ? "advanced" : "normal")
						currentBranch = {
							name: branchName,
							active: branchName === branchObj.active
						}
						branchObj[branchName] = currentBranch
						break
				}
				
			}else{
				
				var string = line.toUpperCase().split("")
				
				for(let symbol of string){
					
					var error = false
					switch(symbol){
						
						case "0":
							currentMeasure.push({
								bpm: bpm,
								scroll: scroll
							})
							break
						case "1": case "2": case "3": case "4": case "A": case "B":
							var type = this.noteTypes[symbol]
							var circleObj = {
								type: type.name,
								txt: type.txt,
								gogo: gogo,
								bpm: bpm,
								scroll: scroll,
								section: sectionBegin
							}
							sectionBegin = false
							if(lastDrumroll){
								circleObj.endDrumroll = lastDrumroll
								lastDrumroll = false
							}
							currentMeasure.push(circleObj)
							break
						case "5": case "6": case "7": case "9":
							var type = this.noteTypes[symbol]
							var circleObj = {
								type: type.name,
								txt: type.txt,
								gogo: gogo,
								bpm: bpm,
								scroll: scroll,
								section: sectionBegin
							}
							sectionBegin = false
							if(lastDrumroll){
								if(symbol === "9"){
									currentMeasure.push({
										endDrumroll: lastDrumroll,
										bpm: bpm,
										scroll: scroll,
										section: sectionBegin
									})
									sectionBegin = false
									lastDrumroll = false
								}else{
									currentMeasure.push({
										bpm: bpm,
										scroll: scroll
									})
								}
								break
							}
							if(symbol === "7" || symbol === "9"){
								var hits = balloons[balloonID]
								if(!hits || hits < 1){
									hits = 1
								}
								circleObj.requiredHits = hits
								balloonID++
							}
							lastDrumroll = circleObj
							currentMeasure.push(circleObj)
							break
						case "8":
							if(lastDrumroll){
								currentMeasure.push({
									endDrumroll: lastDrumroll,
									bpm: bpm,
									scroll: scroll,
									section: sectionBegin
								})
								sectionBegin = false
								lastDrumroll = false
							}else{
								currentMeasure.push({
									bpm: bpm,
									scroll: scroll
								})
							}
							break
						case ",":
							pushMeasure()
							currentMeasure = []
							break
						default:
							if(regexAZ.test(symbol)){
								currentMeasure.push({
									bpm: bpm,
									scroll: scroll
								})
							}else{
								error = true
							}
							break
						
					}
					if(error){
						break
					}
				}
				
			}
		}
		pushMeasure()
		if(lastDrumroll){
			lastDrumroll.endTime = ms
			lastDrumroll.originalEndTime = ms
		}
		
		if(this.branches){
			circles.sort((a, b) => a.ms > b.ms ? 1 : -1)
			this.measures.sort((a, b) => a.ms > b.ms ? 1 : -1)
			circles.forEach((circle, i) => circle.id = i + 1)
		}
		this.scoreinit = meta.scoreinit;
		this.scorediff = meta.scorediff;
		if (this.scoreinit && this.scorediff) {
			this.scoremode = meta.scoremode || 1;
		} else { 
			this.scoremode = meta.scoremode || 2;
			var autoscore = new AutoScore(this.difficulty, this.stars, this.scoremode, circles);
			this.scoreinit = autoscore.ScoreInit;
			this.scorediff = autoscore.ScoreDiff;
		}
		return circles
	}
}
