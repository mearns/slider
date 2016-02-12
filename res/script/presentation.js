

function Presentation(deck, ele) {

    var self = this;

    self._deck = deck;
    self._ele = $(ele)[0];
    self._currentId = null;
    self._currentSlide = null;

    self._init = function() {

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
            self.gotoSlide(location.hash.substr(1));
        } else {
            //Do the default.
            self.gotoFirstSlide();
        }
    };

    function _animateSlides($outgoing, $incoming) {
        console.log("Animating", $outgoing, $incoming);

        var duration = 300;
        if($outgoing !== null) {
        
            $outgoing.css('left', '');
            $outgoing.animate(
                {right: "100%"},
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

        var $curr = null;
        if (self._currentSlide !== null) {
            $curr = $(self._currentSlide);
            $curr.addClass("_outgoing");
        }

        var incoming = document.createElement("div");
        incoming.className = "slide _incoming";
        self._deck.render(self._currentId, incoming);
        self._ele.appendChild(incoming);
        self._currentSlide = incoming;

        var $incoming = $(incoming);
        _animateSlides($curr, $incoming);
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

