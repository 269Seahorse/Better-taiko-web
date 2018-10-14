addEventListener("error", err => {
	var stack
	if("error" in err){
		stack = err.error.stack
	}else{
		stack = err.message + "\n    at " + err.filename + ":" + err.lineno + ":" + err.colno
	}
	localStorage["lastError"] = JSON.stringify({
		timestamp: +new Date,
		stack: stack
	})
})

function toggleFullscreen(){
	if("requestFullscreen" in root){
		if(document.fullscreenElement){
			document.exitFullscreen()
		}else{
			root.requestFullscreen()
		}
	}else if("webkitRequestFullscreen" in root){
		if(document.webkitFullscreenElement){
			document.webkitExitFullscreen()
		}else{
			root.webkitRequestFullscreen()
		}
	}else if("mozRequestFullScreen" in root){
		if(document.mozFullScreenElement){
			document.mozCancelFullScreen()
		}else{
			root.mozRequestFullScreen()
		}
	}
}

function resizeRoot(){
	if(lastHeight !== innerHeight){
		lastHeight = innerHeight
		root.style.height = innerHeight + "px"
	}
}

var root = document.documentElement
var fullScreenSupported = "requestFullscreen" in root || "webkitRequestFullscreen" in root || "mozRequestFullScreen" in root

var pageEvents = new PageEvents()
var snd = {}
var p2
var disableBlur = false
var cancelTouch = true
var lastHeight
var perf = {
	blur: 0,
	allImg: 0,
	load: 0
}

pageEvents.add(root, ["touchstart", "touchmove", "touchend"], event => {
	if(event.cancelable && cancelTouch){
		event.preventDefault()
	}
})
var versionDiv = document.getElementById("version")
var versionLink = document.getElementById("version-link")
pageEvents.add(versionDiv, ["click", "touchend"], () => {
	versionLink.click()
})
resizeRoot()
pageEvents.add(window, "resize", resizeRoot)

var loader = new Loader(() => {
	new Titlescreen()
})
