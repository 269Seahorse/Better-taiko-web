class Circle{
	constructor(id, ms, type, text, speed, endTime, requiredHits){
		this.id = id
		this.ms = ms
		this.type = type
		this.text = text
		this.speed = speed
		this.endTime = endTime ? endTime : ms + 150
		this.isPlayed = 0
		this.animating = false
		this.animT = 0
		this.score = 0
		this.lastFrame = ms + 100
		this.animationEnded = false
		this.status = -1
		this.timesHit = 0
		this.requiredHits = requiredHits ? requiredHits : 0
		this.rendaPlayed = false
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
	incFrame(){
		this.lastFrame += 20
	}
	animate(){
		this.animating = true
	}
	isAnimated(){
		return this.animating
	}
	getAnimT(){
		return this.animT
	}
	incAnimT(){
		this.animT += 0.05
	}
	updateStatus(status){
		this.status = status
	}
	getStatus(){
		return this.status
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
		this.isPlayed = big ? 2 : 1
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