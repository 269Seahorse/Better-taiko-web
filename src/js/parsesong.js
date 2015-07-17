function ParseSong(fileContent){
	
	var _this = this;
	var _data = fileContent;
	var _generalInfo={audioFilename:""};
	var _metadata={title:'', artist:''};
	var _difficulty={sliderMultiplier:0, sliderTickRate:0, approachRate:0};
	var _beatInfo={beatInterval:0, bpm:0};
	var _editor={distanceSpacing:0, beatDivisor:0, gridSize:0};
	var _circleID=0;
	var _circles=[];
	var _timingPoints=[];
	var _measures=[];
	
	this.getStartEndIndexes = function(type){

        var indexes = {start:0, end:0};
        
        while(indexes.start<_data.length){
            if(_data[indexes.start].match(type))
                break;
            else
                indexes.start++;
        }
        indexes.start++;
        
        indexes.end = indexes.start;
        while(indexes.end<_data.length){
            if(_data[indexes.end].match(/^\s*$/))
                break;
            else
                indexes.end++;
        }
        indexes.end--;
        
        return indexes;
    }
    
    this.parseDifficulty = function(){
        
        var indexes = _this.getStartEndIndexes("Difficulty");

        for(var i=indexes.start; i<= indexes.end; i++){
    
            var splitted = _data[i].split(":");
            var item = splitted[0];
            var key = splitted[1];
            
            switch(item){
             
                case 'SliderMultiplier':
                    _difficulty.sliderMultiplier = key;
                    break;
                case 'SliderTickRate':
                    _difficulty.sliderTickRate = key;
                    break;
                case 'ApproachRate':
                    _difficulty.approachRate = key;
                    break;
            }
        }
            
    }
        
    this.parseTiming = function(){
        
        var indexes = _this.getStartEndIndexes("TimingPoints");
        var lastBeatInterval = parseInt(_data[indexes.start].split(",")[1]);

        for(var i=indexes.start; i<= indexes.end; i++){
    
            var values = _data[i].split(",");
            
            var sliderMultiplier;
            if(i==indexes.start){
                _beatInfo.beatInterval=parseFloat(values[1]);
                _beatInfo.bpm=parseInt((1000/_beatInfo.beatInterval)*60);
                sliderMultiplier=1;
            }
            else{
                sliderMultiplier=Math.abs(parseFloat(values[1]))/100;
            }
            
            _timingPoints.push({
                start:parseInt(values[0]),
                sliderMultiplier:sliderMultiplier,
                measure:parseInt(values[2]),
            });
            
        }
        
        var measureNumber=0;
        for(var i=0; i<_timingPoints.length; i++){
            var limit = (_timingPoints[i+1]) ? _timingPoints[i+1].start : _circles[_circles.length-1].getMS();
            for(var j=_timingPoints[i].start; j<=limit; j+=_beatInfo.beatInterval){
                
                _measures.push({ms:j, x:$(window).width(), nb:measureNumber});
                measureNumber++;
                if(measureNumber==_timingPoints[i].measure+1){
                    measureNumber=0;
                }
                
            }
        }
        
    }
	
	this.parseGeneralInfo = function(){
        
        var indexes = _this.getStartEndIndexes("General");
        
        for(var i=indexes.start; i<= indexes.end; i++){
    
            var splitted = _data[i].split(":");
            var item = splitted[0];
            var key = splitted[1];
            
            switch(item){
             
                case 'SliderMultiple':
                    _generalInfo.audioFilename = key;
                    break;
            }
        }

    }
    
    this.parseMetadata = function(){
        
        var indexes = _this.getStartEndIndexes("Metadata");
        
        for(var i=indexes.start; i<= indexes.end; i++){
    
            var splitted = _data[i].split(":");
            var item = splitted[0];
            var key = splitted[1];
            
            switch(item){
             
                case 'TitleUnicode':
                    _metadata.title = key;
                    break;
                    
                case 'ArtistUnicode':
                    _metadata.artist = key;
                    break;
            }
        }
    }
    
    this.parseEditor = function(){
        
        var indexes = _this.getStartEndIndexes("Editor");
        
        for(var i=indexes.start; i<= indexes.end; i++){
    
            var splitted = _data[i].split(":");
            var item = splitted[0];
            var key = splitted[1];
            
            switch(item){
             
                case 'DistanceSpacing':
                    _editor.distanceSpacing = parseFloat(key);
                    break;
                    
                case 'BeatDivisor':
                    _editor.beatDivisor = parseInt(key);
                    break;
                    
                case 'GridSize':
                    _editor.gridSize = parseInt(key);
                    break;
            }
        }
        
    }
    
    this.parseCircles = function(){
        
        var indexes = _this.getStartEndIndexes("HitObjects");

        for(var i=indexes.start; i<= indexes.end; i++){
					
            _circleID++;
            var values = _data[i].split(",");
            
            var type;
            var txt;
            var emptyValue=false;
                
            switch(values[4]){
                case '0':
                    type="don";
                    txt="ドン";
                    break;
                case '2':
                    type="ka";
                    txt="カッ";
                    break;
                case '4':
                    type="daiDon";
                    txt="ドン";
                    break;
                case '6':
                    type="daiKa";
                    txt="カッ";
                    break;
                case '8':
                    type="ka";
                    txt="カッ";
                    break;
                case '10':
                    type="ka";
                    txt="カッ";
                    break;
                case '12':
                    type="daiKa";
                    txt="カッ";
                    break;
                case '14':
                    type="daiKa";
                    txt="カッ";
                    break;
                default:
                    emptyValue=true;
                    break;
				}
				if(!emptyValue)
				    _circles.push(new Circle(_circleID, parseInt(values[2]),type,txt));
        }
    }
	
	_this.parseGeneralInfo(); 
	_this.parseMetadata();
	_this.parseCircles();
	_this.parseEditor();
	_this.parseTiming();
	_this.parseDifficulty();

	this.getData = function(){
		return {
			generalInfo: _generalInfo,
			metaData: _metadata,
			editor: _editor,
			beatInfo: _beatInfo,
			difficulty: _difficulty,
			timingPoints: _timingPoints,
			circles: _circles,
			measures: _measures
		};
	}
}