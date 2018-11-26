function browserSupport(){
	var tests = {
		"Arrow function": function(){
			eval("()=>{}")
			return true
		},
		"AudioContext": function(){
			return "AudioContext" in window || "webkitAudioContext" in window
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
		},
		"CSS Calc": function(){
			var el = document.createElement("a")
			el.style.width = "calc(1px)"
			return el.style.length !== 0
		}
	}
	var failedTests = []
	for(var name in tests){
		var result = false
		try{
			result = tests[name]()
		}catch(e){}
		if(result === false){
			failedTests.push("<li>" + name + "</li>")
		}
	}
	if(failedTests.length !== 0){
		var div = document.createElement("div")
		div.id = "unsupportedBrowser"
		
		div.innerHTML =
'<div id="unsupportedHide">x</div>\
<span>You are running an unsupported browser (\
<a id="unsupportedLink">Details...</a>)</span>\
<div id="unsupportedDetails">\
The following tests have failed:\
<ul>'
+ failedTests.join("")
+ '</ul>\
Please use a supported browser such as \
<a href="https://www.google.com/chrome/" target="_blank" id="unsupportedChrome">Google Chrome</a>\
</div>'
		
		document.body.appendChild(div)
		var link = document.getElementById("unsupportedLink")
		var details = document.getElementById("unsupportedDetails")
		var hide = document.getElementById("unsupportedHide")
		var chrome = document.getElementById("unsupportedChrome")
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
	}
}
browserSupport()
