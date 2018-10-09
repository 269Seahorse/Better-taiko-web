function toggleFullscreen(){
	var root = document.documentElement
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

var pageEvents = new PageEvents()
var snd = {}
var p2
var disableBlur = false
var loader = new Loader(() => {
	new Titlescreen()
})
