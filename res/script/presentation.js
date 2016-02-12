

function Presentation(deck, ele) {

    var self = this;

    self._deck = deck;
    self._ele = $(ele)[0];
    self._currentId = null;
    self._currentBuffer = null;

    function _init() {
        $(document).keypress(function(event) {
            switch(event.keyCode) {
                case 37:    //left
                    self.prevSlide();
                    event.preventDefault();
                    break;
                case 39:    //right
                    self.nextSlide();
                    event.preventDefault();
                    break;
            }
        });

        $(window).on('hashchange', function() {
            self.gotoHash();
        });
        self.gotoHash();
    };

    self.gotoFirstSlide = function() {
        self.gotoSlide(self._deck.firstSlide());
    };

    self.nextSlide = function() {
        self.gotoSlide(self._deck.slideAfter(self._currentId));
    };

    self.prevSlide = function() {
        self.gotoSlide(self._deck.slideBefore(self._currentId));
    };

    self.gotoHash = function() {
        if (location.hash != "") {
            var id = location.hash.substr(1);
            if (id != self._currentId) {
                self.gotoSlide(id);
            }
        } else {
            //Do the default.
            self.gotoFirstSlide();
        }
    };

    function _animateSlides($outgoing, $incoming) {
        console.log("Animating", $outgoing, $incoming);
        var duration = 500;

        $incoming.css("left", "105%");
        self._ele.appendChild($incoming[0]);

        if($outgoing !== null) {
            $outgoing.css("left", "0");
            $outgoing.animate(
                {left: "-105%"},
                {
                    duration: duration,
                    queue: false,
                    complete: function() {
                        self._ele.removeChild($outgoing[0]);
                    }
                }
            );
        }

        $incoming.animate(
            {left: "0%"},
            {
                duration: duration,
                queue: false,
                complete: function() {
                    $incoming.removeClass("_incoming");
                }
            }
        );
    };


    self.gotoSlide = function(id) {
        var id = self._deck.getSlide(id);
        if(id !== null) {
            self._currentId = id;
        }
        var newHash = '#' + self._currentId;
        if(location.hash != newHash) {
            location.hash = newHash;
        }

        var $outgoing = null;
        if (self._currentBuffer !== null) {
            $outgoing = $(self._currentBuffer);
            $outgoing.addClass("_outgoing");
        }

        //Full-sized buffer to hold the incoming slide.
        var incoming = document.createElement("div");
        incoming.className = "buffer _incoming";

        //The incoming slide itself.
        var inslide = document.createElement("div");
        inslide.className = "slide";
        self._deck.render(self._currentId, inslide);
        incoming.appendChild(inslide);
        
        self._currentBuffer = incoming;

        var $incoming = $(incoming);
        _animateSlides($outgoing, $incoming);
    };

    self.useAsNextSlideButton = function(ele) {
        $(ele).click(self.nextSlide);
        return self;
    };

    self.useAsPrevSlideButton = function(ele) {
        $(ele).click(self.prevSlide);
        return self;
    };

    _init();
}

