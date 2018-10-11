class ParseOsu{
	constructor(fileContent, offset){
		this.osu = {
			OFFSET: 0,
			MSPERBEAT: 1,
			METER: 2,
			SAMPLESET: 3,
			SAMPLEINDEX: 4,
			VOLUME: 5,
			INHERITED: 6,
			KIAIMODE: 7,
			
			X: 0,
			Y: 1,
			TIME: 2,
			TYPE: 3,
			HITSOUND: 4,
			EXTRAS: 5,
			ENDTIME: 5,
			
			CIRCLE: 1,
			SLIDER: 2,
			NEWCOMBO: 4,
			SPINNER: 8,
			
			NORMAL: 1,
			WHISTLE: 2,
			FINISH: 4,
			CLAP: 8,
			
			CURVEPOINTS: 0,
			REPEAT: 1,
			PIXELLENGTH: 2,
			EDGEHITSOUNDS: 3,
			EDGEADDITIONS: 4
		}
		this.data = []
		for(let line of fileContent){
			line = line.replace(/\/\/.*/, "").trim()
			if(line !== ""){
				this.data.push(line)
			}
		}
		this.offset = (offset || 0) * -1000
		this.soundOffset = 0
		this.beatInfo = {
			beatInterval: 0,
			lastBeatInterval: 0,
			bpm: 0
		}
		this.generalInfo = this.parseGeneralInfo()
		this.metadata = this.parseMetadata()
		this.editor = this.parseEditor()
		this.difficulty = this.parseDifficulty()
		this.timingPoints = this.parseTiming()
		this.circles = this.parseCircles()
		this.measures = this.parseMeasures()
	}
	getStartEndIndexes(type){
		var indexes = {
			start: 0,
			end: 0
		}
		while(indexes.start < this.data.length){
			if(this.data[indexes.start] === "[" + type + "]"){
				break
			}
			indexes.start++
		}
		indexes.start++
		indexes.end = indexes.start
		while(indexes.end < this.data.length){
			if(this.data[indexes.end].match(/^\[\w+\]$/)){
				break
			}
			indexes.end++
		}
		indexes.end--
		return indexes
	}
	parseDifficulty(){
		var difficulty = {
			sliderMultiplier: 0,
			sliderTickRate: 0,
			approachRate: 0
		}
		var indexes = this.getStartEndIndexes("Difficulty")
		for(var i = indexes.start; i <= indexes.end; i++){
			var [item, key] = this.data[i].split(":")
			switch(item){
				case "SliderMultiplier":
					difficulty.sliderMultiplier = key
					difficulty.originalMultiplier = key
					break
				case "SliderTickRate":
					difficulty.sliderTickRate = key
					break
				case "ApproachRate":
					difficulty.approachRate = key
					break
				case "OverallDifficulty":
					difficulty.overallDifficulty = key
					break
			}
		}
		return difficulty
	}
	parseTiming(){
		var timingPoints = []
		var indexes = this.getStartEndIndexes("TimingPoints")
		var lastBeatInterval = parseInt(this.data[indexes.start].split(",")[1])
		for(var i = indexes.start; i<= indexes.end; i++){
			var values = this.data[i].split(",")
			var start = parseInt(values[this.osu.OFFSET])
			var msOrPercent = parseFloat(values[this.osu.MSPERBEAT])
			if(i == indexes.start){
				start = 0
				this.beatInfo.beatInterval = msOrPercent
				this.beatInfo.bpm = Math.floor(1000 / this.beatInfo.beatInterval * 60)
			}
			if(msOrPercent < 0){
				var sliderMultiplier = this.difficulty.lastMultiplier / Math.abs(msOrPercent / 100)
			}else{
				var sliderMultiplier = 1000 / msOrPercent
				if(i == 0){
					this.difficulty.originalMultiplier = sliderMultiplier
				}
				this.difficulty.lastMultiplier = sliderMultiplier
			}
			timingPoints.push({
				start: start + this.offset,
				sliderMultiplier: sliderMultiplier,
				measure: parseInt(values[this.osu.METER]),
				gogoTime: parseInt(values[this.osu.KIAIMODE]),
				beatMS: 1000 / this.difficulty.lastMultiplier
			})
		}
		return timingPoints
	}
	parseMeasures(){
		var measures = []
		var measureNumber = 0
		for(var i = 0; i<this.timingPoints.length; i++){
			if(this.timingPoints[i + 1]){
				var limit = this.timingPoints[i + 1].start - this.offset
			}else{
				var limit = this.circles[this.circles.length - 1].getMS() - this.offset
			}
			for(var start = this.timingPoints[i].start; start <= limit; start += this.beatInfo.beatInterval){
				if(measureNumber === 0){
					measures.push({
						ms: start + this.offset,
						speed: this.timingPoints[i].sliderMultiplier
					})
				}
				measureNumber = (measureNumber + 1) % (this.timingPoints[i].measure + 1)
			}
		}
		return measures
	}
	parseGeneralInfo(){
		var generalInfo = {
			audioFilename: "",
			audioWait: 0
		}
		var indexes = this.getStartEndIndexes("General")
		for(var i = indexes.start; i<= indexes.end; i++){
			var [item, key] = this.data[i].split(":")
			switch(item){
				case "SliderMultiple":
					generalInfo.audioFilename = key
					break
				case "AudioWait":
					generalInfo.audioWait = parseInt(key)
					break
			}
		}
		return generalInfo
	}
	parseMetadata(){
		var metadata = {
			title: "",
			artist: ""
		}
		var indexes = this.getStartEndIndexes("Metadata")
		for(var i = indexes.start; i <= indexes.end; i++){
			var [item, key] = this.data[i].split(":")
			switch(item){
				case "TitleUnicode":
					metadata.title = key
					break
				case "ArtistUnicode":
					metadata.artist = key
					break
			}
		}
		return metadata
	}
	parseEditor(){
		var editor = {
			distanceSpacing: 0,
			beatDivisor: 0,
			gridSize: 0
		}
		var indexes = this.getStartEndIndexes("Editor")
		for(var i = indexes.start; i <= indexes.end; i++){
			var [item, key] = this.data[i].split(":")
			switch(item){
				case "DistanceSpacing":
					editor.distanceSpacing = parseFloat(key)
					break
				case "BeatDivisor":
					editor.beatDivisor = parseInt(key)
					break
				case "GridSize":
					editor.gridSize = parseInt(key)
					break
			}
		}
		return editor
	}
	difficultyRange(difficulty, min, mid, max){
		if(difficulty > 5){
			return mid + (max - mid) * (difficulty - 5) / 5
		}
		if(difficulty < 5){
			return mid - (mid - min) * (5 - difficulty) / 5
		}
		return mid
	}
	parseCircles(){
		var circles = []
		var circleID = 0
		var indexes = this.getStartEndIndexes("HitObjects")
		for(var i = indexes.start; i <= indexes.end; i++){
			circleID++
			var values = this.data[i].split(",")
			var emptyValue = false
			var start = parseInt(values[this.osu.TIME])
			var speed = this.difficulty.originalMultiplier
			var gogoTime = false
			var osuType = parseInt(values[this.osu.TYPE])
			var hitSound = parseInt(values[this.osu.HITSOUND])
			var beatLength = speed
			var lastMultiplier = this.difficulty.lastMultiplier
			var beatMS = this.beatInfo.beatInterval
			if(circleID === 1 && start + this.offset < 0){
				var offset = start + this.offset
				this.soundOffset = offset
				this.offset -= offset
			}
			
			for(var j = 0; j < this.timingPoints.length; j++){
				var timingPoint = this.timingPoints[j]
				if(timingPoint.start - this.offset > start){
					break
				}
				speed = timingPoint.sliderMultiplier
				gogoTime = timingPoint.gogoTime
				beatMS = timingPoint.beatMS
			}
			
			if(osuType & this.osu.SPINNER){
				
				var endTime = parseInt(values[this.osu.ENDTIME])
				var hitMultiplier = this.difficultyRange(this.difficulty.overallDifficulty, 3, 5, 7.5) * 1.65
				var requiredHits = Math.floor(Math.max(1, (endTime - start) / 1000 * hitMultiplier))
				circles.push(new Circle({
					id: circleID,
					start: start + this.offset,
					type: "balloon",
					txt: "ふうせん",
					speed: speed,
					endTime: endTime + this.offset,
					requiredHits: requiredHits,
					gogoTime: gogoTime,
					beatMS: beatMS
				}))
				
			}else if(osuType & this.osu.SLIDER){
				
				var extras = values.slice(this.osu.EXTRAS)
				
				var distance = parseFloat(extras[this.osu.PIXELLENGTH])
				var velocity = this.difficulty.sliderMultiplier * speed / 10
				var endTime = start + distance / velocity
				
				if(hitSound & this.osu.FINISH){
					type = "daiDrumroll"
					txt = "連打(大)ーっ!!"
				}else{
					type = "drumroll"
					txt = "連打ーっ!!"
				}
				circles.push(new Circle({
					id: circleID,
					start: start + this.offset,
					type: type,
					txt: txt,
					speed: speed,
					endTime: endTime + this.offset,
					gogoTime: gogoTime,
					beatMS: beatMS
				}))
				
			}else if(osuType & this.osu.CIRCLE){
				var type
				var txt
				
				if(hitSound & this.osu.FINISH){
					if(hitSound & this.osu.WHISTLE || hitSound & this.osu.CLAP){
						type = "daiKa"
						txt = "カッ(大)"
					}else if(hitSound & this.osu.NORMAL || hitSound === this.osu.FINISH){
						type = "daiDon"
						txt = "ドン(大)"
					}else{
						emptyValue = true
					}
				}else if(hitSound & this.osu.WHISTLE || hitSound & this.osu.CLAP){
					type = "ka"
					txt = "カッ"
				}else if(hitSound & this.osu.NORMAL || hitSound === 0){
					type = "don"
					txt = "ドン"
				}else{
					emptyValue = true
				}
				if(!emptyValue){
					circles.push(new Circle({
						id: circleID,
						start: start + this.offset,
						type: type,
						txt: txt,
						speed: speed,
						gogoTime: gogoTime,
						beatMS: beatMS
					}))
				}
			}else{
				emptyValue = true
			}
			if(emptyValue){
				console.warn("Unknown note type found on line " + (i + 1) + ": " + this.data[i])
			}
		}
		return circles
	}
}
