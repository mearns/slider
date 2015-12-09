

function Slider() {

    var self = this;

    //Get a list of all slides on the page.
    self.slides = $('section.slide');
    self.currentSlide = null;

    self.gotoFirstSlide = function() {
        self.setCurrentSlide(self.slides[0]);
    };

    self.setCurrentSlide = function(selector) {
        var slide = $(selector);
        console.log("Setting current slide to: ", selector, slide);
        if(slide.length == 1) {
            var slide = slide[0];
            var idx = self.slides.index(slide);
            if(idx >= 0) {
                self.currentSlide = slide;
                
                //Hide the others
                self.slides.not(slide).hide()

                //Show the current.
                $slide = $(slide);
                $slide.show();

                //Update the location bar.
                location.hash = $slide.attr('id');

                return;
            }
        }

        //Invalid selector. If we have a current slide, just update everything so that's still current (e.g., the location bar).
        if (self.currentSlide != null) {
            self.setCurrentSlide(self.currentSlide);
        }
        //We don't have a current slide, select the first one.
        else if(self.slides.length > 0) {
            self.setCurrentSlide('#' + $(self.slides[0]).attr('id'));
        }
        //We don't have any slides!
        else {
            //Oh well.
            location.hash = null;
        }
    };

    self.prevSlide = function() {
        var idx = self.slides.index(self.currentSlide) - 1;
        console.log("Previous slide: ", idx);
        if(idx >= 0) {
            self.setCurrentSlide(self.slides[idx]);
        }
    };

    self.nextSlide = function() {
        var idx = self.slides.index(self.currentSlide) + 1;
        if(idx < self.slides.length) {
            self.setCurrentSlide(self.slides[idx]);
        }
    };


    self.gotoHash = function() {
        if (location.hash != "") {
            self.setCurrentSlide(location.hash);
        } else {
            //Do the default.
            self.setCurrentSlide(null);
        }
    };

    self.useAsNextSlideButton = function(ele) {
        $(ele).click(self.nextSlide);
        return self;
    };

    self.useAsPrevSlideButton = function(ele) {
        $(ele).click(self.prevSlide);
        return self;
    };

    //In case document is already ready:
    self.gotoHash();

    //When the document is ready, goto the location specified in the hash.
    $(document).ready(self.gotoHash);

    //And anytime the hash changes.
    $(window).on('hashchange', self.gotoHash);
}

var Slider = new Slider();

