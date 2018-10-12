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
var root = document.documentElement
var fullScreenSupported = "requestFullscreen" in root || "webkitRequestFullscreen" in root || "mozRequestFullScreen" in root

var pageEvents = new PageEvents()
var snd = {}
var p2
var disableBlur = false
var loader = new Loader(() => {
	new Titlescreen()
})
