
//Listen for keypresses
$('html').bind('keydown', function(e) {
    console.log(e.keyCode);
    switch(e.keyCode) {
        case 37:    //left-arrow
            Slider.prevSlide();
            break;
        case 39:    //right-arrow
            Slider.nextSlide();
            break;
        case 36:    //home
            Slider.gotoFirstSlide();
            break;
    }
});

