class Circle{
	constructor(config){
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
		this.timesKa = 0
		this.requiredHits = config.requiredHits || 0
		this.rendaPlayed = false
		this.gogoTime = config.gogoTime || false
		this.gogoChecked = false
		this.beatMS = config.beatMS
		this.fixedPos = config.fixedPos
		this.branch = config.branch
		this.section = config.section
	}
	animate(ms){
		this.animating = true
		this.animT = ms
	}
	played(score, big){
		this.score = score
		this.isPlayed = score <= 0 ? score - 1 : (big ? 2 : 1)
	}
	hit(keysKa){
		this.timesHit++
		if(keysKa){
			this.timesKa++
		}
	}
}