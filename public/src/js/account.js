class Account{
	constructor(touchEnabled){
		this.touchEnabled = touchEnabled
		cancelTouch = false
		this.locked = false
		
		if(account.loggedIn){
			this.accountForm()
		}else{
			this.loginForm()
		}
		this.selected = this.items.length - 1
		
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
		
		pageEvents.send("account", account.loggedIn)
	}
	accountForm(){
		loader.changePage("account", true)
		this.mode = "account"
		
		this.setAltText(this.getElement("view-title"), account.username)
		this.items = []
		this.inputForms = []
		this.shownDiv = ""
		
		this.errorDiv = this.getElement("error-div")
		this.getElement("displayname-hint").innerText = strings.account.displayName
		this.displayname = this.getElement("displayname")
		this.displayname.placeholder = strings.account.displayName
		this.displayname.value = account.displayName
		this.inputForms.push(this.displayname)
		
		this.redrawRunning = true
		this.customdonRedrawBind = this.customdonRedraw.bind(this)
		this.start = new Date().getTime()
		this.frames = [
			0 ,0 ,0 ,0 ,1 ,2 ,3 ,4 ,5 ,6 ,6 ,5 ,4 ,3 ,2 ,1 ,
			0 ,0 ,0 ,0 ,1 ,2 ,3 ,4 ,5 ,6 ,6 ,5 ,4 ,3 ,2 ,1 ,
			0 ,0 ,0 ,0 ,1 ,2 ,3 ,4 ,5 ,6 ,6 ,5 ,7 ,8 ,9 ,10,
			11,11,11,11,10,9 ,8 ,7 ,13,12,12,13,14,15,16,17
		]
		this.customdonCache = new CanvasCache()
		this.customdonCache.resize(723 * 2, 1858, 1)
		this.customdonCanvas = this.getElement("customdon-canvas")
		this.customdonCtx = this.customdonCanvas.getContext("2d")
		this.customdonBodyFill = this.getElement("customdon-bodyfill")
		this.customdonBodyFill.value = account.don.body_fill
		var parent = this.customdonBodyFill.parentNode
		parent.insertBefore(document.createTextNode(strings.account.customdon.bodyFill), parent.firstChild)
		pageEvents.add(this.customdonBodyFill, ["change", "input"], this.customdonChange.bind(this))
		this.customdonFaceFill = this.getElement("customdon-facefill")
		this.customdonFaceFill.value = account.don.face_fill
		var parent = this.customdonFaceFill.parentNode
		parent.insertBefore(document.createTextNode(strings.account.customdon.faceFill), parent.firstChild)
		pageEvents.add(this.customdonFaceFill, ["change", "input"], this.customdonChange.bind(this))
		this.customdonResetBtn = this.getElement("customdon-reset")
		this.customdonResetBtn.value = strings.account.customdon.reset
		pageEvents.add(this.customdonResetBtn, ["click", "touchstart"], this.customdonReset.bind(this))
		this.customdonChange()
		this.customdonRedraw()
		
		this.accountPassButton = this.getElement("accountpass-btn")
		this.setAltText(this.accountPassButton, strings.account.changePassword)
		pageEvents.add(this.accountPassButton, ["click", "touchstart"], event => {
			this.showDiv(event, "pass")
		})
		this.accountPass = this.getElement("accountpass-form")
		for(var i = 0; i < this.accountPass.length; i++){
			this.accountPass[i].placeholder = strings.account.currentNewRepeat[i]
			this.inputForms.push(this.accountPass[i])
		}
		this.accountPassDiv = this.getElement("accountpass-div")
		
		this.accountDelButton = this.getElement("accountdel-btn")
		this.setAltText(this.accountDelButton, strings.account.deleteAccount)
		pageEvents.add(this.accountDelButton, ["click", "touchstart"], event => {
			this.showDiv(event, "del")
		})
		this.accountDel = this.getElement("accountdel-form")
		this.accountDel.password.placeholder = strings.account.verifyPassword
		this.inputForms.push(this.accountDel.password)
		this.accountDelDiv = this.getElement("accountdel-div")
		
		this.logoutButton = this.getElement("logout-btn")
		this.setAltText(this.logoutButton, strings.account.logout)
		pageEvents.add(this.logoutButton, ["mousedown", "touchstart"], this.onLogout.bind(this))
		this.items.push(this.logoutButton)
		
		this.endButton = this.getElement("view-end-button")
		this.setAltText(this.endButton, strings.account.cancel)
		pageEvents.add(this.endButton, ["mousedown", "touchstart"], this.onEnd.bind(this))
		this.items.push(this.endButton)
		
		this.saveButton = this.getElement("save-btn")
		this.setAltText(this.saveButton, strings.account.save)
		pageEvents.add(this.saveButton, ["mousedown", "touchstart"], this.onSave.bind(this))
		this.items.push(this.saveButton)
		
		for(var i = 0; i < this.inputForms.length; i++){
			pageEvents.add(this.inputForms[i], ["keydown", "keyup", "keypress"], this.onFormPress.bind(this))
		}
	}
	customdonChange(){
		var ctx = this.customdonCtx
		this.customdonCache.clear()
		var w = 722
		var h = 1858
		this.customdonCache.set({
			w: w, h: h, id: "bodyFill"
		}, ctx => {
			ctx.drawImage(assets.image["don_anim_normal_b1"], 0, 0)
			ctx.globalCompositeOperation = "source-atop"
			ctx.fillStyle = this.customdonBodyFill.value
			ctx.fillRect(0, 0, w, h)
		})
		this.customdonCache.set({
			w: w, h: h, id: "faceFill"
		}, ctx => {
			ctx.drawImage(assets.image["don_anim_normal_b2"], 0, 0)
			ctx.globalCompositeOperation = "source-atop"
			ctx.fillStyle = this.customdonFaceFill.value
			ctx.fillRect(0, 0, w, h)
			
			ctx.globalCompositeOperation = "source-over"
			this.customdonCache.get({
				ctx: ctx,
				x: 0, y: 0, w: w, h: h,
				id: "bodyFill"
			})
		})
	}
	customdonReset(event){
		if(event.type === "touchstart"){
			event.preventDefault()
		}
		this.customdonBodyFill.value = defaultDon.body_fill
		this.customdonFaceFill.value = defaultDon.face_fill
		this.customdonChange()
	}
	customdonRedraw(){
		if(!this.redrawRunning){
			return
		}
		requestAnimationFrame(this.customdonRedrawBind)
		if(!document.hasFocus()){
			return
		}
		var ms = new Date().getTime()
		var ctx = this.customdonCtx
		var frame = this.frames[Math.floor((ms - this.start) / 30) % this.frames.length]
		var w = 360
		var h = 184
		var sx = Math.floor(frame / 10) * (w + 2)
		var sy = (frame % 10) * (h + 2)
		ctx.clearRect(0, 0, w, h)
		this.customdonCache.get({
			ctx: ctx,
			sx: sx, sy: sy, sw: w, sh: h,
			x: -26, y: 0, w: w, h: h,
			id: "faceFill"
		})
		ctx.drawImage(assets.image["don_anim_normal_a"],
			sx, sy, w, h,
			-26, 0, w, h
		)
	}
	showDiv(event, div){
		if(event){
			if(event.type === "touchstart"){
				event.preventDefault()
			}else if(event.which !== 1){
				return
			}
		}
		if(this.locked){
			return
		}
		var otherDiv = this.shownDiv && this.shownDiv !== div
		var display = this.shownDiv === div ? "" : "block"
		this.shownDiv = display ? div : ""
		switch(div){
			case "pass":
				if(otherDiv){
					this.accountDelDiv.style.display = ""
				}
				this.accountPassDiv.style.display = display
				break
			case "del":
				if(otherDiv){
					this.accountPassDiv.style.display = ""
				}
				this.accountDelDiv.style.display = display
				break
		}
	}
	loginForm(register, fromSwitch){
		loader.changePage("login", true)
		this.mode = register ? "register" : "login"
		
		this.setAltText(this.getElement("view-title"), strings.account[this.mode])
		
		this.errorDiv = this.getElement("error-div")
		this.items = []
		this.form = this.getElement("login-form")
		this.getElement("username-hint").innerText = strings.account.username
		this.form.username.placeholder = strings.account.enterUsername
		this.getElement("password-hint").innerText = strings.account.password
		this.form.password.placeholder = strings.account.enterPassword
		this.password2 = this.getElement("password2-div")
		this.remember = this.getElement("remember-div")
		this.getElement("remember-label").appendChild(document.createTextNode(strings.account.remember))
		this.loginButton = this.getElement("login-btn")
		this.registerButton = this.getElement("register-btn")
		
		if(register){
			var pass2 = document.createElement("input")
			pass2.type = "password"
			pass2.name = "password2"
			pass2.required = true
			pass2.placeholder = strings.account.repeatPassword
			this.password2.appendChild(pass2)
			this.password2.style.display = "block"
			this.remember.style.display = "none"
			this.setAltText(this.loginButton, strings.account.registerAccount)
			this.setAltText(this.registerButton, strings.account.login)
		}else{
			this.setAltText(this.loginButton, strings.account.login)
			this.setAltText(this.registerButton, strings.account.register)
		}
		
		pageEvents.add(this.form, "submit", this.onLogin.bind(this))
		pageEvents.add(this.loginButton, ["mousedown", "touchstart"], this.onLogin.bind(this))
		
		pageEvents.add(this.registerButton, ["mousedown", "touchstart"], this.onSwitchMode.bind(this))
		this.items.push(this.registerButton)
		if(!register){
			this.items.push(this.loginButton)
		}
		
		for(var i = 0; i < this.form.length; i++){
			pageEvents.add(this.form[i], ["keydown", "keyup", "keypress"], this.onFormPress.bind(this))
		}
		
		this.endButton = this.getElement("view-end-button")
		this.setAltText(this.endButton, strings.account.back)
		pageEvents.add(this.endButton, ["mousedown", "touchstart"], this.onEnd.bind(this))
		this.items.push(this.endButton)
		if(fromSwitch){
			this.selected = 0
			this.endButton.classList.remove("selected")
			this.registerButton.classList.add("selected")
		}
	}
	getElement(name){
		return loader.screen.getElementsByClassName(name)[0]
	}
	setAltText(element, text){
		element.innerText = text
		element.setAttribute("alt", text)
	}
	keyPressed(pressed, name){
		if(!pressed || this.locked){
			return
		}
		var selected = this.items[this.selected]
		if(name === "confirm"){
			if(selected === this.endButton){
				this.onEnd()
			}else if(selected === this.registerButton){
				this.onSwitchMode()
			}else if(selected === this.loginButton){
				this.onLogin()
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
	onFormPress(event){
		event.stopPropagation()
		if(event.type === "keypress" && event.keyCode === 13){
			if(this.mode === "account"){
				this.onSave()
			}else{
				this.onLogin()
			}
		}
	}
	onSwitchMode(event){
		if(event){
			if(event.type === "touchstart"){
				event.preventDefault()
			}else if(event.which !== 1){
				return
			}
		}
		if(this.locked){
			return
		}
		this.clean(true)
		this.loginForm(this.mode === "login", true)
	}
	onLogin(event){
		if(event){
			if(event.type === "touchstart"){
				event.preventDefault()
			}else if(event.which !== 1){
				return
			}
		}
		if(this.locked){
			return
		}
		var obj = {
			username: this.form.username.value,
			password: this.form.password.value
		}
		if(!obj.username || !obj.password){
			this.error(strings.account.cannotBeEmpty.replace("%s", strings.account[!obj.username ? "username" : "password"]))
			return
		}
		if(this.mode === "login"){
			obj.remember = this.form.remember.checked
		}else{
			if(obj.password !== this.form.password2.value){
				this.error(strings.account.passwordsDoNotMatch)
				return
			}
		}
		this.request(this.mode, obj).then(response => {
			account.loggedIn = true
			account.username = response.username
			account.displayName = response.display_name
			account.don = response.don
			var loadScores = scores => {
				scoreStorage.load(scores)
				this.onEnd(false, true, true)
				pageEvents.send("login", account.username)
			}
			if(this.mode === "login"){
				this.request("scores/get", false, true).then(response => {
					loadScores(response.scores)
				}, () => {
					loadScores({})
				})
			}else{
				scoreStorage.save().catch(() => {}).finally(() => {
					this.onEnd(false, true, true)
					pageEvents.send("login", account.username)
				})
			}
		}, response => {
			if(response && response.status === "error" && response.message){
				if(response.message in strings.serverError){
					this.error(strings.serverError[response.message])
				}else{
					this.error(response.message)
				}
			}else{
				this.error(strings.account.error)
			}
		})
	}
	onLogout(){
		if(event){
			if(event.type === "touchstart"){
				event.preventDefault()
			}else if(event.which !== 1){
				return
			}
		}
		if(this.locked){
			return
		}
		account.loggedIn = false
		delete account.username
		delete account.displayName
		delete account.don
		var loadScores = () => {
			scoreStorage.load()
			this.onEnd(false, true)
			pageEvents.send("logout")
		}
		this.request("logout").then(loadScores, loadScores)
	}
	onSave(event){
		if(event){
			if(event.type === "touchstart"){
				event.preventDefault()
			}else if(event.which !== 1){
				return
			}
		}
		if(this.locked){
			return
		}
		this.clearError()
		var promises = []
		var noNameChange = false
		if(this.shownDiv === "pass"){
			var passwords = []
			for(var i = 0; i < this.accountPass.length; i++){
				passwords.push(this.accountPass[i].value)
			}
			if(passwords[1] === passwords[2]){
				promises.push(this.request("account/password", {
					current_password: passwords[0],
					new_password: passwords[1]
				}))
			}else{
				this.error(strings.account.newPasswordsDoNotMatch)
				return
			}
		}
		if(this.shownDiv === "del" && this.accountDel.password.value){
			noNameChange = true
			promises.push(this.request("account/remove", {
				password: this.accountDel.password.value
			}).then(() => {
				account.loggedIn = false
				delete account.username
				delete account.displayName
				delete account.don
				scoreStorage.load()
				pageEvents.send("logout")
				return Promise.resolve
			}))
		}
		var newName = this.displayname.value.trim()
		if(!noNameChange && newName !== account.displayName){
			promises.push(this.request("account/display_name", {
				display_name: newName
			}).then(response => {
				account.displayName = response.display_name
			}))
		}
		var bodyFill = this.customdonBodyFill.value
		var faceFill = this.customdonFaceFill.value
		if(!noNameChange && (bodyFill !== account.body_fill || this.customdonFaceFill.value !== account.face_fill)){
			promises.push(this.request("account/don", {
				body_fill: bodyFill,
				face_fill: faceFill
			}).then(response => {
				account.don = response.don
			}))
		}
		var error = false
		var errorFunc = response => {
			if(error){
				return
			}
			if(response && response.message){
				if(response.message in strings.serverError){
					this.error(strings.serverError[response.message])
				}else{
					this.error(response.message)
				}
			}else{
				this.error(strings.account.error)
			}
		}
		Promise.all(promises).then(() => {
			this.onEnd(false, true)
		}, errorFunc).catch(errorFunc)
	}
	onEnd(event, noSound, noReset){
		var touched = false
		if(event){
			if(event.type === "touchstart"){
				event.preventDefault()
				touched = true
			}else if(event.which !== 1){
				return
			}
		}
		if(this.locked){
			return
		}
		this.clean(false, noReset)
		assets.sounds["se_don"].play()
		setTimeout(() => {
			new SongSelect(false, false, touched)
		}, 500)
	}
	request(url, obj, get){
		this.lock(true)
		var doRequest = token => {
			return new Promise((resolve, reject) => {
				var request = new XMLHttpRequest()
				request.open(get ? "GET" : "POST", "api/" + url)
				pageEvents.load(request).then(() => {
					this.lock(false)
					if(request.status !== 200){
						reject()
						return
					}
					try{
						var json = JSON.parse(request.response)
					}catch(e){
						reject()
						return
					}
					if(json.status === "ok"){
						resolve(json)
					}else{
						reject(json)
					}
				}, () => {
					this.lock(false)
					reject()
				})
				if(!get){
					request.setRequestHeader("X-CSRFToken", token)
				}
				if(obj){
					request.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
					request.send(JSON.stringify(obj))
				}else{
					request.send()
				}
			})
		}
		if(get){
			return doRequest()
		}else{
			return loader.getCsrfToken().then(doRequest)
		}
	}
	lock(isLocked){
		this.locked = isLocked
		if(this.mode === "login" || this.mode === "register"){
			for(var i = 0; i < this.form.length; i++){
				this.form[i].disabled = isLocked
			}
		}else if(this.mode === "account"){
			for(var i = 0; i < this.inputForms.length; i++){
				this.inputForms[i].disabled = isLocked
			}
		}
	}
	error(text){
		this.errorDiv.innerText = text
		this.errorDiv.style.display = "block"
	}
	clearError(){
		this.errorDiv.innerText = ""
		this.errorDiv.style.display = ""
	}
	clean(eventsOnly, noReset){
		if(!eventsOnly){
			cancelTouch = true
			this.keyboard.clean()
			this.gamepad.clean()
		}
		if(this.mode === "account"){
			if(!noReset){
				this.accountPass.reset()
				this.accountDel.reset()
			}
			this.redrawRunning = false
			this.customdonCache.clean()
			pageEvents.remove(this.customdonBodyFill, ["change", "input"])
			pageEvents.remove(this.customdonFaceFill, ["change", "input"])
			pageEvents.remove(this.customdonResetBtn, ["click", "touchstart"])
			pageEvents.remove(this.accounPassButton, ["click", "touchstart"])
			pageEvents.remove(this.accountDelButton, ["click", "touchstart"])
			pageEvents.remove(this.logoutButton, ["mousedown", "touchstart"])
			pageEvents.remove(this.saveButton, ["mousedown", "touchstart"])
			for(var i = 0; i < this.inputForms.length; i++){
				pageEvents.remove(this.inputForms[i], ["keydown", "keyup", "keypress"])
			}
			delete this.errorDiv
			delete this.displayname
			delete this.frames
			delete this.customdonCanvas
			delete this.customdonCtx
			delete this.customdonBodyFill
			delete this.customdonFaceFill
			delete this.customdonResetBtn
			delete this.accountPassButton
			delete this.accountPass
			delete this.accountPassDiv
			delete this.accountDelButton
			delete this.accountDel
			delete this.accountDelDiv
			delete this.logoutButton
			delete this.saveButton
			delete this.inputForms
		}else if(this.mode === "login" || this.mode === "register"){
			if(!eventsOnly && !noReset){
				this.form.reset()
			}
			pageEvents.remove(this.form, "submit")
			pageEvents.remove(this.loginButton, ["mousedown", "touchstart"])
			pageEvents.remove(this.registerButton, ["mousedown", "touchstart"])
			for(var i = 0; i < this.form.length; i++){
				pageEvents.remove(this.registerButton, ["keydown", "keyup", "keypress"])
			}
			delete this.errorDiv
			delete this.form
			delete this.password2
			delete this.remember
			delete this.loginButton
			delete this.registerButton
		}
		pageEvents.remove(this.endButton, ["mousedown", "touchstart"])
		delete this.endButton
		delete this.items
	}
}
