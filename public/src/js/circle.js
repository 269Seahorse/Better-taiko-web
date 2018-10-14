class Circle{
	constructor(config){
		// id, ms, type, text, speed, endTime, requiredHits
		this.id = config.id
		this.ms = config.start
		this.originalMS = this.ms
		this.type = config.type
		this.text = config.txt
		this.speed = config.speed
		this.endTime = config.endTime || this.ms
		this.originalEndTime = this.endTime
		this.isPlayed = 0
		this.animating = false
		this.animT = 0
		this.score = 0
		this.lastFrame = this.ms + 100
		this.animationEnded = false
		this.timesHit = 0
		this.requiredHits = config.requiredHits || 0
		this.rendaPlayed = false
		this.gogoTime = config.gogoTime
		this.gogoChecked = false
		this.beatMS = config.beatMS
	}
	getMS(){
		return this.ms
	}
	getEndTime(){
		return this.endTime
	}
	getType(){
		return this.type
	}
	getLastFrame(){
		return this.lastFrame
	}
	animate(ms){
		this.animating = true
		this.animT = ms
	}
	isAnimated(){
		return this.animating
	}
	getAnimT(){
		return this.animT
	}
	getPlayed(){
		return this.isPlayed
	}
	isAnimationFinished(){
		return this.animationEnded
	}
	endAnimation(){
		this.animationEnded = true
	}
	played(score, big){
		this.score = score
		this.isPlayed = score <= 0 ? score - 1 : (big ? 2 : 1)
	}
	hit(){
		this.timesHit++
	}
	getScore(){
		return this.score
	}
	getID(){
		return this.id
	}
	getText(){
		return this.text
	}
	getSpeed(){
		return this.speed
	}
}