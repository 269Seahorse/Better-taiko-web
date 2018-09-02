function Tutorial() {
    var _this = this;

    this.run = function() {
        bgm = new BufferedLoop(
            {url: '/assets/audio/bgm_setsume.ogg', duration: 1.054},
            {url: '/assets/audio/bgm_setsume_loop.ogg', duration: 15}
        );
        bgm.play();

        $('#tutorial-end-button').click(function(){
            bgm.pause();
            assets.sounds['don'].playAsset();

            localStorage.setItem('tutorial', 'true');
            new SongSelect();
        });
    };

    $('#screen').load('/src/views/tutorial.html', _this.run);
};
