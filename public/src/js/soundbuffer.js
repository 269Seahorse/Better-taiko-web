class SoundBuffer{
	constructor(){
		var AudioContext = window.AudioContext || window.webkitAudioContext
		this.context = new AudioContext()
		pageEvents.add(window, ["click", "touchend"], this.pageClicked.bind(this))
		this.gainList = []
	}
	load(url, local, gain){
		if(local){
			var reader = new FileReader()
			var loadPromise = pageEvents.load(reader).then(event => {
				return event.target.result
			})
			reader.readAsArrayBuffer(url)
		}else{
			var loadPromise = loader.ajax(url, request => {
				request.responseType = "arraybuffer"
			})
		}
		return loadPromise.then(response => {
			return new Promise((resolve, reject) => {
				return this.context.decodeAudioData(response, resolve, reject)
			}).catch(error => {
				throw [error, url]
			})
		}).then(buffer => {
			return new Sound(gain || {soundBuffer: this}, buffer)
		})
	}
	createGain(channel){
		var gain = new SoundGain(this, channel)
		this.gainList.push(gain)
		return gain
	}
	setCrossfade(gain1, gain2, median){
		if(!Array.isArray(gain1)){
			gain1 = [gain1]
		}
		if(!Array.isArray(gain2)){
			gain2 = [gain2]
		}
		gain1.forEach(gain => gain.setCrossfade(1 - median))
		gain2.forEach(gain => gain.setCrossfade(median))
	}
	getTime(){
		return this.context.currentTime
	}
	convertTime(time, absolute){
		time = (time || 0)
		if(time < 0){
			time = 0
		}
		return time + (absolute ? 0 : this.getTime())
	}
	createSource(sound){
		var source = this.context.createBufferSource()
		source.buffer = sound.buffer
		source.connect(sound.gain.gainNode || this.context.destination)
		return source
	}
	pageClicked(){
		if(this.context.state === "suspended"){
			this.context.resume()
		}
	}
	saveSettings(){
		for(var i = 0; i < this.gainList.length; i++){
			var gain = this.gainList[i]
			gain.defaultVol = gain.volume
		}
	}
	loadSettings(){
		for(var i = 0; i < this.gainList.length; i++){
			var gain = this.gainList[i]
			gain.setVolume(gain.defaultVol)
		}
	}
}
class SoundGain{
	constructor(soundBuffer, channel){
		this.soundBuffer = soundBuffer
		this.gainNode = soundBuffer.context.createGain()
		if(channel){
			var index = channel === "left" ? 0 : 1
			this.merger = soundBuffer.context.createChannelMerger(2)
			this.merger.connect(soundBuffer.context.destination)
			this.gainNode.connect(this.merger, 0, index)
		}else{
			this.gainNode.connect(soundBuffer.context.destination)
		}
		this.setVolume(1)
	}
	load(url, local){
		return this.soundBuffer.load(url, local, this)
	}
	convertTime(time, absolute){
		return this.soundBuffer.convertTime(time, absolute)
	}
	setVolume(amount){
		this.gainNode.gain.value = amount * amount
		this.volume = amount
	}
	setVolumeMul(amount){
		this.setVolume(amount * this.defaultVol)
	}
	setCrossfade(amount){
		this.setVolume(Math.sqrt(Math.sin(Math.PI / 2 * amount)))
	}
	fadeIn(duration, time, absolute){
		this.fadeVolume(0, this.volume * this.volume, duration, time, absolute)
	}
	fadeOut(duration, time, absolute){
		this.fadeVolume(this.volume * this.volume, 0, duration, time, absolute)
	}
	fadeVolume(vol1, vol2, duration, time, absolute){
		time = this.convertTime(time, absolute)
		this.gainNode.gain.linearRampToValueAtTime(vol1, time)
		this.gainNode.gain.linearRampToValueAtTime(vol2, time + (duration || 0))
	}
	mute(){
		this.gainNode.gain.value = 0
	}
	unmute(){
		this.setVolume(this.volume)
	}
}
class Sound{
	constructor(gain, buffer){
		this.gain = gain
		this.buffer = buffer
		this.soundBuffer = gain.soundBuffer
		this.duration = buffer.duration
		this.timeouts = new Set()
		this.sources = new Set()
	}
	copy(gain){
		return new Sound(gain, this.buffer)
	}
	getTime(){
		return this.soundBuffer.getTime()
	}
	convertTime(time, absolute){
		return this.soundBuffer.convertTime(time, absolute)
	}
	setTimeouts(time){
		return new Promise(resolve => {
			var relTime = time - this.getTime()
			if(relTime > 0){
				var timeout = setTimeout(() => {
					this.timeouts.delete(timeout)
					resolve()
				}, relTime * 1000)
				this.timeouts.add(timeout)
			}else{
				resolve()
			}
		})
	}
	clearTimeouts(){
		this.timeouts.forEach(timeout => {
			clearTimeout(timeout)
			this.timeouts.delete(timeout)
		})
	}
	playLoop(time, absolute, seek1, seek2, until){
		time = this.convertTime(time, absolute)
		seek1 = seek1 || 0
		if(typeof seek2 === "undefined"){
			seek2 = seek1
		}
		until = until || this.duration
		if(seek1 >= until || seek2 >= until){
			return
		}
		this.loop = {
			started: time + until - seek1,
			seek: seek2,
			until: until
		}
		this.play(time, true, seek1, until)
		this.addLoop()
		this.loop.interval = setInterval(() => {
			this.addLoop()
		}, 100)
	}
	addLoop(){
		while(this.getTime() > this.loop.started - 1){
			this.play(this.loop.started, true, this.loop.seek, this.loop.until)
			this.loop.started += this.loop.until - this.loop.seek
		}
	}
	play(time, absolute, seek, until){
		time = this.convertTime(time, absolute)
		var source = this.soundBuffer.createSource(this)
		seek = seek || 0
		until = until || this.duration
		this.setTimeouts(time).then(() => {
			this.cfg = {
				started: time,
				seek: seek,
				until: until
			}
		})
		source.start(time, Math.max(0, seek || 0), Math.max(0, until - seek))
		source.startTime = time
		this.sources.add(source)
		source.onended = () => {
			this.sources.delete(source)
		}
	}
	stop(time, absolute){
		time = this.convertTime(time, absolute)
		this.sources.forEach(source => {
			try{
				source.stop(Math.max(source.startTime, time))
			}catch(e){}
		})
		this.setTimeouts(time).then(() => {
			if(this.loop){
				clearInterval(this.loop.interval)
			}
			this.clearTimeouts()
		})
	}
	pause(time, absolute){
		if(this.cfg){
			time = this.convertTime(time, absolute)
			this.stop(time, true)
			this.cfg.pauseSeek = time - this.cfg.started + this.cfg.seek
		}
	}
	resume(time, absolute){
		if(this.cfg){
			if(this.loop){
				this.playLoop(time, absolute, this.cfg.pauseSeek, this.loop.seek, this.loop.until)
			}else{
				this.play(time, absolute, this.cfg.pauseSeek, this.cfg.until)
			}
		}
	}
	clean(){
		delete this.buffer
	}
}
