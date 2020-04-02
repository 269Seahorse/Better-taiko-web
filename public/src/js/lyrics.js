class Lyrics{
	constructor(file, songOffset, div, parsed){
		this.div = div
		this.stroke = document.createElement("div")
		this.stroke.classList.add("stroke")
		div.appendChild(this.stroke)
		this.fill = document.createElement("div")
		this.fill.classList.add("fill")
		div.appendChild(this.fill)
		this.current = 0
		this.shown = -1
		this.songOffset = songOffset || 0
		this.vttOffset = 0
		this.rLinebreak = /\n|\r\n/
		this.lines = parsed ? file : this.parseFile(file)
		this.length = this.lines.length
	}
	parseFile(file){
		var lines = []
		var commands = file.split(/\n\n|\r\n\r\n/)
		var arrow = " --> "
		for(var i in commands){
			var matches = commands[i].match(this.rLinebreak)
			if(matches){
				var cmd = commands[i].slice(0, matches.index)
				var value = commands[i].slice(matches.index + 1)
			}else{
				var cmd = commands[i]
				var value = ""
			}
			if(cmd.startsWith("WEBVTT")){
				var nameValue = cmd.slice(7).split(";")
				for(var j in nameValue){
					var [name, value] = nameValue[j].split(":")
					if(name.trim().toLowerCase() === "offset"){
						this.vttOffset = (parseFloat(value.trim()) || 0) * 1000
					}
				}
			}else{
				var time = null
				var index = cmd.indexOf(arrow)
				if(index !== -1){
					time = cmd
				}else{
					var matches = value.match(this.rLinebreak)
					if(matches){
						var value1 = value.slice(0, matches.index)
						index = value1.indexOf(arrow)
						if(index !== -1){
							time = value1
							value = value.slice(index)
						}
					}
				}
				if(time !== null){
					var start = time.slice(0, index)
					var end = time.slice(index + arrow.length)
					var index = end.indexOf(" ")
					if(index !== -1){
						end = end.slice(0, index)
					}
					var text = value.trim()
					var textLang = ""
					var firstLang = -1
					var index2 = -1
					while(true){
						var index1 = text.indexOf("<lang ", index2 + 1)
						if(firstLang === -1){
							firstLang = index1
						}
						if(index1 !== -1){
							index2 = text.indexOf(">", index1 + 6)
							if(index2 === -1){
								break
							}
							var lang = text.slice(index1 + 6, index2).toLowerCase()
							if(strings.id === lang){
								var index3 = text.indexOf("<lang ", index2 + 1)
								if(index3 !== -1){
									textLang = text.slice(index2 + 1, index3)
								}else{
									textLang = text.slice(index2 + 1)
								}
							}
						}else{
							break
						}
					}
					if(!textLang){
						textLang = firstLang === -1 ? text : text.slice(0, firstLang)
					}
					lines.push({
						start: this.convertTime(start),
						end: this.convertTime(end),
						text: textLang
					})
				}
			}
		}
		return lines
	}
	convertTime(time){
		if(time.startsWith("-")){
			var mul = -1
			time = time.slice(1)
		}else{
			var mul = 1
		}
		var array = time.split(":")
		if(array.length === 2){
			var h = 0
			var m = array[0]
			var s = array[1]
		}else{
			var h = parseInt(array[0])
			var m = array[1]
			var s = array[2]
		}
		var index = s.indexOf(",")
		if(index !== -1){
			s = s.slice(0, index) + "." + s.slice(index + 1)
		}
		return ((h * 60 + parseInt(m)) * 60 + parseFloat(s)) * 1000 * mul
	}
	update(ms){
		if(this.current >= this.length){
			return
		}
		ms += this.songOffset + this.vttOffset
		var currentLine = this.lines[this.current]
		while(currentLine && ms > currentLine.end){
			currentLine = this.lines[++this.current]
		}
		if(this.shown !== this.current){
			if(currentLine && ms >= currentLine.start){
				this.setText(this.lines[this.current].text)
				this.shown = this.current
			}else if(this.shown !== -1){
				this.setText("")
				this.shown = -1
			}
		}
	}
	setText(text){
		this.stroke.innerHTML = this.fill.innerHTML = ""
		var hasRuby = false
		while(text){
			var matches = text.match(this.rLinebreak)
			var index1 = matches ? matches.index : -1
			var index2 = text.indexOf("<ruby>")
			if(index1 !== -1 && (index2 === -1 || index2 > index1)){
				this.textNode(text.slice(0, index1))
				this.linebreakNode()
				text = text.slice(index1 + matches[0].length)
			}else if(index2 !== -1){
				hasRuby = true
				this.textNode(text.slice(0, index2))
				text = text.slice(index2 + 6)
				var index = text.indexOf("</ruby>")
				if(index !== -1){
					var ruby = text.slice(0, index)
					text = text.slice(index + 7)
				}else{
					var ruby = text
					text = ""
				}
				var index = ruby.indexOf("<rt>")
				if(index !== -1){
					var node1 = ruby.slice(0, index)
					ruby = ruby.slice(index + 4)
					var index = ruby.indexOf("</rt>")
					if(index !== -1){
						var node2 = ruby.slice(0, index)
					}else{
						var node2 = ruby
					}
				}else{
					var node1 = ruby
					var node2 = ""
				}
				this.rubyNode(node1, node2)
			}else{
				this.textNode(text)
				break
			}
		}
	}
	insertNode(func){
		this.stroke.appendChild(func())
		this.fill.appendChild(func())
	}
	textNode(text){
		this.insertNode(() => document.createTextNode(text))
	}
	linebreakNode(){
		this.insertNode(() => document.createElement("br"))
	}
	rubyNode(node1, node2){
		this.insertNode(() => {
			var ruby = document.createElement("ruby")
			var rt = document.createElement("rt")
			ruby.appendChild(document.createTextNode(node1))
			rt.appendChild(document.createTextNode(node2))
			ruby.appendChild(rt)
			return ruby
		})
	}
	setScale(ratio){
		this.div.style.setProperty("--scale", ratio)
	}
	offsetChange(songOffset, vttOffset){
		if(typeof songOffset !== "undefined"){
			this.songOffset = songOffset
		}
		if(typeof vttOffset !== "undefined"){
			this.vttOffset = vttOffset
		}
		this.setText("")
		this.current = 0
		this.shown = -1
	}
	clean(){
		if(this.shown !== -1){
			this.setText("")
		}
		delete this.div
		delete this.stroke
		delete this.fill
		delete this.lines
	}
}
