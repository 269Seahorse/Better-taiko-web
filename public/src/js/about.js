class About{
	constructor(touchEnabled){
		this.touchEnabled = touchEnabled
		loader.changePage("about", true)
		cancelTouch = false
		
		this.endButton = this.getElement("view-end-button")
		this.diagTxt = document.getElementById("diag-txt")
		this.version = document.getElementById("version-link").href
		this.tutorialOuter = this.getElement("view-outer")
		if(touchEnabled){
			this.tutorialOuter.classList.add("touch-enabled")
		}
		this.linkIssues = document.getElementById("link-issues")
		this.linkEmail = document.getElementById("link-email")
		
		var tutorialTitle = this.getElement("view-title")
		tutorialTitle.innerText = strings.aboutSimulator
		tutorialTitle.setAttribute("alt", strings.aboutSimulator)
		var tutorialContent = this.getElement("view-content")
		strings.about.bugReporting.forEach(string => {
			tutorialContent.appendChild(document.createTextNode(string))
			tutorialContent.appendChild(document.createElement("br"))
		})
		var span = document.createElement("span")
		span.classList.add("text-warn")
		span.innerText = strings.about.diagnosticWarning
		tutorialContent.appendChild(span)
		this.endButton.innerText = strings.tutorial.ok
		this.endButton.setAttribute("alt", strings.tutorial.ok)
		
		var versionUrl = gameConfig._version.url
		this.getLink(this.linkIssues).href = versionUrl + "issues"

		var contactEmail = gameConfig.email
		if (typeof contactEmail === 'string') {
			this.linkEmail.setAttribute("alt", contactEmail)
			this.getLink(this.linkEmail).href = "mailto:" + contactEmail
			this.getLink(this.linkEmail).text = contactEmail
		} else {
			this.linkEmail.style.display = "none"
		}

		pageEvents.add(this.linkIssues, ["click", "touchend"], this.linkButton.bind(this))
		pageEvents.add(this.linkEmail, ["click", "touchend"], this.linkButton.bind(this))
		pageEvents.add(this.endButton, ["mousedown", "touchstart"], this.onEnd.bind(this))
		this.items = [this.linkIssues, this.linkEmail, this.endButton]
		this.selected = 2
		
		this.keyboard = new Keyboard({
			confirm: ["enter", "space", "don_l", "don_r"],
			previous: ["left", "up", "ka_l"],
			next: ["right", "down", "ka_r"],
			back: ["escape"]
		}, this.keyPressed.bind(this))
		this.gamepad = new Gamepad({
			"confirm": ["b", "ls", "rs"],
			"previous": ["u", "l", "lb", "lt", "lsu", "lsl"],
			"next": ["d", "r", "rb", "rt", "lsd", "lsr"],
			"back": ["start", "a"]
		}, this.keyPressed.bind(this))
		
		pageEvents.send("about", this.addDiag())
	}
	getElement(name){
		return loader.screen.getElementsByClassName(name)[0]
	}
	keyPressed(pressed, name){
		if(!pressed){
			return
		}
		var selected = this.items[this.selected]
		if(name === "confirm"){
			if(selected === this.endButton){
				this.onEnd()
			}else{
				this.getLink(selected).click()
				pageEvents.send("about-link", selected)
				assets.sounds["se_don"].play()
			}
		}else if(name === "previous" || name === "next"){
			selected.classList.remove("selected")
			this.selected = this.mod(this.items.length, this.selected + (name === "next" ? 1 : -1))
			this.items[this.selected].classList.add("selected")
			assets.sounds["se_ka"].play()
		}else if(name === "back"){
			this.onEnd()
		}
	}
	mod(length, index){
		return ((index % length) + length) % length
	}
	onEnd(event){
		var touched = false
		if(event){
			if(event.type === "touchstart"){
				event.preventDefault()
				touched = true
			}else if(event.which !== 1){
				return
			}
		}
		this.clean()
		assets.sounds["se_don"].play()
		localStorage.setItem("tutorial", "true")
		setTimeout(() => {
			new SongSelect("about", false, touched)
		}, 500)
	}
	addDiag(){
		var diag = []
		
		diag.push("```")
		diag.push("Taiko-Web version: " + this.version)
		diag.push("URL: " + location.href)
		diag.push("User agent: " + navigator.userAgent)
		diag.push("Screen size: " + innerWidth + "x" + innerHeight + ", outer: " + outerWidth + "x" + outerHeight + ", ratio: " + (window.devicePixelRatio || 1).toFixed(2))
		if(this.touchEnabled){
			diag.push("Touch enabled: true")
		}
		if(!fullScreenSupported){
			diag.push("Full screen supported: false")
		}
		diag.push("Blur performance: " + perf.blur + "ms, all images: " + perf.allImg + "ms")
		diag.push("Page load: " + (perf.load / 1000).toFixed(1) + "s")
		if("getGamepads" in navigator){
			var gamepads = navigator.getGamepads()
			for(var i = 0; i < gamepads.length; i++){
				if(gamepads[i]){
					var gamepadDiag = []
					gamepadDiag.push(gamepads[i].id)
					gamepadDiag.push("buttons: " + 	gamepads[i].buttons.length)
					gamepadDiag.push("axes: " + gamepads[i].axes.length)
					diag.push("Gamepad #" + (i + 1) + ": " + gamepadDiag.join(", "))
				}
			}
		}
		var userLangStr = " (none)"
		if("languages" in navigator){
			var userLang = navigator.languages.slice()
			if(userLang[0] !== navigator.language){
				userLang.unshift(navigator.language)
			}
			if(userLang.length !== 0){
				userLangStr = " (" + userLang.join(", ") + ")"
			}
		}
		diag.push("Language: " + strings.id + userLangStr)
		var errorObj = {}
		if(localStorage["lastError"]){
			try{
				errorObj = JSON.parse(localStorage["lastError"])
			}catch(e){}
		}
		if(errorObj.timestamp && errorObj.stack){
			if(errorObj.timestamp + 1000 * 60 * 60 * 24 > Date.now()){
				diag.push("Last error: " + errorObj.stack)
				diag.push("Error date: " + new Date(errorObj.timestamp).toGMTString())
			}else{
				localStorage.removeItem("lastError")
			}
		}
		diag.push("```")
		var diag = diag.join("\n")
		
		if(navigator.userAgent.indexOf("Android") >= 0){
			var iframe = document.createElement("iframe")
			this.diagTxt.appendChild(iframe)
			var body = iframe.contentWindow.document.body
			body.innerText = diag
			
			body.setAttribute("style", `
				font-family: monospace;
				margin: 2px 0 0 2px;
				white-space: pre-wrap;
				word-break: break-all;
				cursor: text;
			`)
			body.setAttribute("onblur", `
				getSelection().removeAllRanges()
			`)
		}else{
			this.textarea = document.createElement("textarea")
			this.textarea.readOnly = true
			this.textarea.value = diag
			this.diagTxt.appendChild(this.textarea)
			if(!this.touchEnabled){
				pageEvents.add(this.textarea, "focus", () => {
					this.textarea.select()
				})
				pageEvents.add(this.textarea, "blur", () => {
					getSelection().removeAllRanges()
				})
			}
		}
		
		var issueBody = strings.about.issueTemplate + "\n\n\n\n" + diag
		this.getLink(this.linkEmail).href += "?body=" + encodeURIComponent(issueBody.replace(/\n/g, "<br>\r\n"))
		
		return diag
	}
	getLink(target){
		return target.getElementsByTagName("a")[0]
	}
	linkButton(event){
		if(event.target === event.currentTarget){
			this.getLink(event.currentTarget).click()
			pageEvents.send("about-link", event.currentTarget)
			assets.sounds["se_don"].play()
		}
	}
	clean(){
		cancelTouch = true
		this.keyboard.clean()
		this.gamepad.clean()
		pageEvents.remove(this.linkIssues, ["click", "touchend"])
		pageEvents.remove(this.linkEmail, ["click", "touchend"])
		pageEvents.remove(this.endButton, ["mousedown", "touchstart"])
		if(this.textarea){
			pageEvents.remove(this.textarea, ["focus", "blur"])
		}
		pageEvents.keyRemove(this, "all")
		delete this.endButton
		delete this.diagTxt
		delete this.version
		delete this.tutorialOuter
		delete this.linkIssues
		delete this.linkEmail
		delete this.textarea
	}
}
