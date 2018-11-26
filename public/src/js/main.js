addEventListener("error", function(err){
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

function debug(){
	if(debugObj.state === "open"){
		debugObj.debug.clean()
		return "Debug closed"
	}else if(debugObj.state === "minimised"){
		debugObj.debug.restore()
		return "Debug restored"
	}else{
		debugObj.debug = new Debug()
		return "Debug opened"
	}
}

var root = document.documentElement
var fullScreenSupported = "requestFullscreen" in root || "webkitRequestFullscreen" in root || "mozRequestFullScreen" in root

var pageEvents = new PageEvents()
var snd = {}
var p2 = new P2Connection()
var disableBlur = false
var cancelTouch = true
var lastHeight
var debugObj = {
	state: "closed",
	debug: null
}
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
setInterval(resizeRoot, 100)
pageEvents.keyAdd(debugObj, "all", "down", event => {
	if((event.keyCode === 186 || event.keyCode === 59) && event.ctrlKey && event.shiftKey && !event.altKey){
		// Semicolon
		if(debugObj.state === "open"){
			debugObj.debug.minimise()
		}else if(debugObj.state === "minimised"){
			debugObj.debug.restore()
		}else{
			debugObj.debug = new Debug()
		}
	}
	if(event.keyCode === 82 && debugObj.debug && debugObj.controller){
		// R
		debugObj.controller.restartSong()
	}
})
if(location.hash.length === 6){
	p2.hashLock = true
}else{
	p2.hash("")
}

var loader = new Loader(() => {
	new Titlescreen()
})

