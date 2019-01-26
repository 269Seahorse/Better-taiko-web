function browserSupport(){
	var tests = {
		"Arrow function": function(){
			eval("()=>{}")
			return true
		},
		"AudioContext": function(){
			if("AudioContext" in window || "webkitAudioContext" in window){
				return typeof (window.AudioContext || window.webkitAudioContext) === "function"
			}
			return false
		},
		"Class": function(){
			eval("class a{}")
			return true
		},
		"Array.find": function(){
			return "find" in Array.prototype && "findIndex" in Array.prototype
		},
		"Path2D SVG": function(){
			var canvas = document.createElement("canvas")
			canvas.width = 1
			canvas.height = 1
			var ctx = canvas.getContext("2d")
			var path = new Path2D("M0 0H1V1H0")
			ctx.fill(path)
			return ctx.getImageData(0, 0, 1, 1).data[3] !== 0
		},
		"Promise": function(){
			if("Promise" in window && "resolve" in window.Promise && "reject" in window.Promise && "all" in window.Promise && "race" in window.Promise){
				var resolve
				new window.Promise(function(r){resolve = r})
				return typeof resolve === "function"
			}
			return false
		},
		"CSS calc": function(){
			var el = document.createElement("a")
			el.style.width = "calc(1px)"
			return el.style.length !== 0
		},
		"let statement": function(){
			eval("let a")
			return true
		},
		"CSS custom property": function(){
			var el = document.createElement("a")
			el.style.setProperty("--a", 1)
			return el.style.length !== 0
		}
	}
	failedTests = []
	for(var name in tests){
		var result = false
		try{
			result = tests[name]()
		}catch(e){}
		if(result === false){
			failedTests.push(name)
		}
	}
	if(failedTests.length !== 0){
		showUnsupported()
	}
}
function showUnsupported(strings){
	if(!strings){
		var lang
		try{
			if("localStorage" in window && window.localStorage.lang && window.localStorage.lang in allStrings){
				lang = window.localStorage.lang
			}
			if(!lang && "languages" in navigator){
				var userLang = navigator.languages.slice()
				userLang.unshift(navigator.language)
				for(var i in userLang){
					for(var j in allStrings){
						if(allStrings[j].regex.test(userLang[i])){
							lang = j
						}
					}
				}
			}
		}catch(e){}
		if(!lang){
			lang = "en"
		}
		strings = allStrings[lang]
	}
	
	var div = document.getElementById("unsupportedBrowser")
	if(div){
		div.parentNode.removeChild(div)
	}
	div = document.createElement("div")
	div.id = "unsupportedBrowser"
	
	var warn = document.createElement("div")
	warn.id = "unsupportedWarn"
	warn.innerText = "!"
	div.appendChild(warn)
	var hide = document.createElement("div")
	hide.id = "unsupportedHide"
	hide.innerText = "x"
	div.appendChild(hide)
	
	var span = document.createElement("span")
	var browserWarning = strings.browserSupport.browserWarning.split("%s")
	for(var i = 0; i < browserWarning.length; i++){
		if(i !== 0){
			var link = document.createElement("a")
			link.innerText = strings.browserSupport.details
			span.appendChild(link)
		}
		span.appendChild(document.createTextNode(browserWarning[i]))
	}
	div.appendChild(span)
	
	var details = document.createElement("div")
	details.id = "unsupportedDetails"
	details.appendChild(document.createTextNode(strings.browserSupport.failedTests))
	
	var ul = document.createElement("ul")
	for(var i = 0; i < failedTests.length; i++){
		var li = document.createElement("li")
		li.innerText = failedTests[i]
		ul.appendChild(li)
	}
	details.appendChild(ul)
	
	var supportedBrowser = strings.browserSupport.supportedBrowser.split("%s")
	for(var i = 0; i < supportedBrowser.length; i++){
		if(i !== 0){
			var chrome = document.createElement("a")
			chrome.href = "https://www.google.com/chrome/"
			chrome.innerText = "Google Chrome"
			details.appendChild(chrome)
		}
		details.appendChild(document.createTextNode(supportedBrowser[i]))
	}
	
	div.appendChild(details)
	
	document.body.appendChild(div)
	var divClick = function(event){
		if(event.type === "touchstart"){
			event.preventDefault()
			getSelection().removeAllRanges()
		}
		div.classList.remove("hidden")
	}
	div.addEventListener("click", divClick)
	div.addEventListener("touchstart", divClick)
	var toggleDetails = function(event){
		if(event.type === "touchstart"){
			event.preventDefault()
		}
		if(details.style.display === "block"){
			details.style.display = ""
		}else{
			details.style.display = "block"
		}
	}
	link.addEventListener("click", toggleDetails)
	link.addEventListener("touchstart", toggleDetails)
	var hideClick = function(event){
		if(event.type === "touchstart"){
			event.preventDefault()
		}
		event.stopPropagation()
		div.classList.add("hidden")
	}
	hide.addEventListener("click", hideClick)
	hide.addEventListener("touchstart", hideClick)
	chrome.addEventListener("touchend", function(event){
		event.preventDefault()
		chrome.click()
	})
	var touchText = function(){
		div.style.fontSize = "4em"
		removeEventListener("touchstart", touchText)
	}
	addEventListener("touchstart", touchText)
}
var failedTests
browserSupport()
