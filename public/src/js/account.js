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
		
		this.getElement("displayname-hint").innerText = strings.account.displayName
		this.displayname = this.getElement("displayname")
		this.displayname.placeholder = strings.account.displayName
		this.displayname.value = account.displayName
		this.inputForms.push(this.displayname)
		
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
			alert(strings.account.cannotBeEmpty.replace("%s", strings.account[!obj.username ? "username" : "password"]))
			return
		}
		if(this.mode === "login"){
			obj.remember = this.form.remember.checked
		}else{
			if(obj.password !== this.form.password2.value){
				alert(strings.account.passwordsDoNotMatch)
				return
			}
		}
		this.request(this.mode, obj).then(response => {
			account.loggedIn = true
			account.username = response.username
			account.displayName = response.display_name
			var loadScores = scores => {
				scoreStorage.load(scores)
				this.onEnd(false, true)
				pageEvents.send("login", account.username)
			}
			if(this.mode === "login"){
				this.request("scores/get").then(response => {
					loadScores(response.scores)
				}, () => {
					loadScores({})
				})
			}else{
				scoreStorage.save().catch(() => {}).finally(() => {
					this.onEnd(false, true)
					pageEvents.send("login", account.username)
				})
			}
		}, response => {
			if(response && response.status === "error" && response.message){
				alert(response.message)
			}else{
				alert(strings.account.error)
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
		var loadScores = scores => {
			Cookies.remove("token")
			scoreStorage.load()
			this.onEnd(false, true)
			pageEvents.send("logout")
		}
		this.request("logout").then(response => {
			loadScores()
		}, () => {
			loadScores()
		})
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
				alert(strings.account.passwordsDoNotMatch)
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
				Cookies.remove("token")
				scoreStorage.load()
				pageEvents.send("logout")
				return Promise.resolve
			}))
		}
		var newName = this.displayname.value.trim()
		if(!noNameChange && newName !== account.displayName){
			promises.push(this.request("account/display_name", {
				display_name: newName
			}))
		}
		var error = false
		var errorFunc = response => {
			if(error){
				return
			}
			if(response && response.message){
				alert(response.message)
			}else{
				alert(strings.account.error)
			}
		}
		Promise.all(promises).then(() => {
			this.onEnd(false, true)
		}, errorFunc).catch(errorFunc)
	}
	onEnd(event, noSound){
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
		this.clean()
		assets.sounds["se_don"].play()
		setTimeout(() => {
			new SongSelect(false, false, touched)
		}, 500)
	}
	request(url, obj){
		this.lock(true)
		return new Promise((resolve, reject) => {
			var request = new XMLHttpRequest()
			request.open(obj ? "POST" : "GET", "api/" + url)
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
			if(obj){
				request.setRequestHeader("Content-Type", "application/json;charset=UTF-8")
				request.send(JSON.stringify(obj))
			}else{
				request.send()
			}
		})
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
	clean(eventsOnly){
		if(!eventsOnly){
			cancelTouch = true
			this.keyboard.clean()
			this.gamepad.clean()
		}
		if(this.mode === "account"){
			pageEvents.remove(this.accounPassButton, ["click", "touchstart"])
			pageEvents.remove(this.accountDelButton, ["click", "touchstart"])
			pageEvents.remove(this.logoutButton, ["mousedown", "touchstart"])
			pageEvents.remove(this.saveButton, ["mousedown", "touchstart"])
			for(var i = 0; i < this.inputForms.length; i++){
				pageEvents.remove(this.inputForms[i], ["keydown", "keyup", "keypress"])
			}
			this.accountPass.reset()
			this.accountDel.reset()
			delete this.displayname
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
			if(!eventsOnly){
				this.form.reset()
			}
			pageEvents.remove(this.form, "submit")
			pageEvents.remove(this.loginButton, ["mousedown", "touchstart"])
			pageEvents.remove(this.registerButton, ["mousedown", "touchstart"])
			for(var i = 0; i < this.form.length; i++){
				pageEvents.remove(this.registerButton, ["keydown", "keyup", "keypress"])
			}
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
