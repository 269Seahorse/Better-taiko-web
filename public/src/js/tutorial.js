function Tutorial() {
    var _this = this;

    this.run = function() {
        assets.sounds["bgm_setsume"].playLoop(0.1, false, 0, 1.054, 16.054)

        $('#tutorial-end-button').click(function(){
            assets.sounds["bgm_setsume"].stop();
            assets.sounds["don"].play();

            localStorage.setItem('tutorial', 'true');
            new SongSelect();
        });
    };

    $('#screen').load('/src/views/tutorial.html', _this.run);
};
