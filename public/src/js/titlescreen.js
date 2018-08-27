function Titlescreen(){
    
    var _this = this;
	$("body").css("font-family", "TnT");
	
	this.positionning = function(){
		
		var width =  0.70*$(window).width();
		var logoW = (width>=654) ? 654 : width;
		var logoH = logoW/2.18;
		
		$("#logo-big-cont").width(logoW);
		$("#logo-big-cont").height(logoH);
		$("#logo-big-cont").css("left", $(window).width()/2-($("#logo-big-cont").width()/2));
		$("#logo-big-cont").css("top", $(window).height()/2-($("#logo-big-cont").height()/2));
		
	}
    
    this.run = function(){
        
        $(document).keypress(function(e){
            if(e.keyCode==13 && $("#screen").find("#title-screen").html())
                _this.goNext();
        });

		$("#screen").find("#title-screen").click(function(){
			_this.goNext();
		});
		
		
		_this.positionning();
		$("#screen").find("#title-screen").show();
		$(window).resize(_this.positionning);		

		assets.sounds["title"].play();

    }
    
    this.goNext = function(){
    	assets.sounds["title"].pause();
    	assets.sounds["title"].currentTime = 0;

		assets.sounds["don"].play();
        new SongSelect();
    }
    
	$("#screen").load("/src/views/titlescreen.html", _this.run);
	
}