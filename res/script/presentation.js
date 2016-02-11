

function Presentation(deck, ele) {

    var self = this;

    self._deck = deck;
    self._ele = ele;
    self._currentSlide = null;

    self._init = function() {
        self.gotoHash();
    };

    self.gotoFirstSlide = function() {
        self.gotoSlide(self._deck.firstSlide());
    };

    self.nextSlide = function() {
        self.gotoSlide(self._deck.slideAfter(self._currentSlide));
    };

    self.prevSlide = function() {
        self.gotoSlide(self._deck.slideBefore(self._currentSlide));
    };

    self.gotoHash = function() {
        if (location.hash != "") {
            self.gotoSlide(location.hash.substr(1));
        } else {
            //Do the default.
            self.gotoFirstSlide();
        }
    };

    self.gotoSlide = function(id) {
        self._currentSlide = id;
        self._deck.render(self._currentSlide, self._ele);
    };

    self.useAsNextSlideButton = function(ele) {
        $(ele).click(self.nextSlide);
        return self;
    };

    self.useAsPrevSlideButton = function(ele) {
        $(ele).click(self.prevSlide);
        return self;
    };

    self._init();
}

