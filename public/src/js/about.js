class About{
	constructor(touchEnabled){
		this.touchEnabled = touchEnabled
		loader.changePage("about")
		cancelTouch = false
		
		this.endButton = document.getElementById("tutorial-end-button")
		this.diagTxt = document.getElementById("diag-txt")
		this.version = document.getElementById("version-link").href
		this.tutorialOuter = document.getElementById("tutorial-outer")
		if(touchEnabled){
			this.tutorialOuter.classList.add("touch-enabled")
		}
		this.linkGithub = document.getElementById("link-github")
		this.linkEmail = document.getElementById("link-email")
		
		pageEvents.add(this.linkGithub, ["click", "touchend"], this.linkButton)
		pageEvents.add(this.linkEmail, ["click", "touchend"], this.linkButton)
		pageEvents.once(this.endButton, ["mousedown", "touchstart"]).then(this.onEnd.bind(this))
		pageEvents.keyOnce(this, 13, "down").then(this.onEnd.bind(this))
		
		this.gamepad = new Gamepad({
			"confirm": ["start", "b", "ls", "rs"]
		}, this.onEnd.bind(this))
		
		this.addDiag()
	}
	onEnd(event){
		var touched = false
		if(event && event.type === "touchstart"){
			event.preventDefault()
			touched = true
		}
		this.clean()
		assets.sounds["don"].play()
		localStorage.setItem("tutorial", "true")
		setTimeout(() => {
			new SongSelect("about", false, touched)
		}, 500)
	}
	addDiag(){
		var diag = []
		
		diag.push("```")
		diag.push("Taiko-Web version: " + this.version)
		diag.push("User agent: " + navigator.userAgent)
		diag.push("Screen size: " + innerWidth + "x" + innerHeight + ", outer: " + outerWidth + "x" + outerHeight + ", ratio: " + (window.devicePixelRatio || 1).toFixed(2))
		if(this.touchEnabled){
			diag.push("Touch enabled: true")
		}
		if(!fullScreenSupported){
			diag.push("Full screen supported: false")
		}
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
		var errorObj = {}
		if(localStorage["lastError"]){
			try{
				errorObj = JSON.parse(localStorage["lastError"])
			}catch(e){}
		}
		if(errorObj.timestamp && errorObj.stack){
			if(errorObj.timestamp + 1000 * 60 * 60 * 24 > (+new Date)){
				diag.push("Last error: " + errorObj.stack)
				diag.push("Error date: " + new Date(errorObj.timestamp).toGMTString())
			}else{
				localStorage.removeItem("lastError")
			}
		}
		diag.push("```")
		
		var body = this.diagTxt.contentWindow.document.body
		body.innerText = diag.join("\n")
		
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
		if(!this.touchEnabled){
			body.setAttribute("onfocus", `
				var selection = getSelection()
				selection.removeAllRanges()
				var range = document.createRange()
				range.selectNodeContents(document.body)
				selection.addRange(range)
			`)
		}
	}
	linkButton(event){
		event.currentTarget.getElementsByTagName("a")[0].click()
	}
	clean(){
		cancelTouch = true
		this.gamepad.clean()
		pageEvents.remove(this.linkGithub, ["click", "touchend"])
		pageEvents.remove(this.linkEmail, ["click", "touchend"])
		pageEvents.remove(this.endButton, ["mousedown", "touchstart"])
		pageEvents.keyRemove(this, 13)
		delete this.endButton
		delete this.diagTxt
		delete this.version
		delete this.tutorialOuter
		delete this.linkGithub
		delete this.linkEmail
	}
}
