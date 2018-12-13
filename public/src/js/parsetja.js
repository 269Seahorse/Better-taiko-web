class ParseTja{
	constructor(file, difficulty, offset, metaOnly){
		this.data = []
		for(let line of file){
			line = line.replace(/\/\/.*/, "").trim()
			if(line !== ""){
				this.data.push(line)
			}
		}
		this.difficulty = difficulty
		this.offset = (offset || 0) * -1000
		this.soundOffset = 0
		this.noteTypes = [
			{name: false, txt: false},
			{name: "don", txt: "ドン"},
			{name: "ka", txt: "カッ"},
			{name: "daiDon", txt: "ドン(大)"},
			{name: "daiKa", txt: "カッ(大)"},
			{name: "drumroll", txt: "連打ーっ!!"},
			{name: "daiDrumroll", txt: "連打(大)ーっ!!"},
			{name: "balloon", txt: "ふうせん"},
			{name: false, txt: false},
			{name: "balloon", txt: "ふうせん"}
		]
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
		var metaNumbers = ["bpm", "offset", "demostart", "level"]
		var inSong = false
		var courses = {}
		var currentCourse = {}
		var courseName = this.difficulty
		for(var lineNum = 0; lineNum < this.data.length; lineNum++){
			var line = this.data[lineNum]
			
			if(line.slice(0, 1) === "#"){
				
				var name = line.slice(1).toLowerCase()
				if(name === "start" && !inSong){
					
					inSong = true
					for(var name in currentCourse){
						if(!(courseName in courses)){
							courses[courseName] = {}
						}
						courses[courseName][name] = currentCourse[name]
					}
					courses[courseName].start = lineNum + 1
					courses[courseName].end = this.data.length
					
				}else if(name === "end" && inSong){
					inSong = false
					courses[courseName].end = lineNum
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
					}else if(name === "balloon"){
						value = value ? value.split(",").map(digit => parseInt(digit)) : []
					}else if(this.inArray(name, metaNumbers)){
						value = parseFloat(value)
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
		var bpm = meta.bpm || 0
		if(bpm <= 0){
			bpm = 1
		}
		var scroll = 1
		var measure = 4
		this.beatInfo.beatInterval = 60000 / bpm
		var gogo = false
		var barLine = true
		
		var balloonID = 0
		var balloons = meta.balloon || []
		
		var lastDrumroll = false
		var branch = false
		var branchType
		var branchPreference = "m"
		
		var currentMeasure = []
		var firstNote = true
		var circles = []
		var circleID = 0
		
		var pushMeasure = () => {
			if(barLine){
				var note = currentMeasure[0]
				if(note){
					var speed = note.bpm * note.scroll / 60
				}else{
					var speed = bpm * scroll / 60
				}
				this.measures.push({
					ms: ms,
					originalMS: ms,
					speed: speed
				})
			}
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
							beatMS: 60000 / note.bpm
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
				
				if(!branch || branch && branchType === branchPreference){
					switch(name){
						case "gogostart":
							gogo = true
							break
						case "gogoend":
							gogo = false
							break
						case "bpmchange":
							bpm = parseFloat(value)
							break
						case "scroll":
							scroll = parseFloat(value)
							break
						case "measure":
							var [numerator, denominator] = value.split("/")
							measure = numerator / denominator * 4
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
					}
				}
				switch(name){
					case "branchstart":
						branch = true
						branchType = ""
						value = value.split(",")
						var forkType = value[0].toLowerCase()
						if(forkType === "r" || parseFloat(value[2]) <= 100){
							branchPreference = "m"
						}else if(parseFloat(value[1]) <= 100){
							branchPreference = "e"
						}else{
							branchPreference = "n"
						}
						break
					case "branchend":
					case "section":
						branch = false
						break
					case "n": case "e": case "m":
						branchType = name
						break
				}
				
			}else if(!branch || branch && branchType === branchPreference){
				
				var string = line.split("")
				
				for(let symbol of string){
					
					var error = false
					switch(symbol){
						
						case "0":
							currentMeasure.push({
								bpm: bpm,
								scroll: scroll
							})
							break
						case "1": case "2": case "3": case "4":
							var type = this.noteTypes[symbol]
							var circleObj = {
								type: type.name,
								txt: type.txt,
								gogo: gogo,
								bpm: bpm,
								scroll: scroll
							}
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
								scroll: scroll
							}
							if(lastDrumroll){
								if(symbol === "9"){
									currentMeasure.push({
										endDrumroll: lastDrumroll,
										bpm: bpm,
										scroll: scroll
									})
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
									scroll: scroll
								})
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
							error = true
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
		
		return circles
	}
}
