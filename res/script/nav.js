var slides = $('section.slide');
var current_slide;

function set_current_slide(selector) {
    var slide = $(selector);
    console.log("Setting current slide to: ", selector, slide);
    if(slide.length == 1) {
        var slide = slide[0];
        current_slide = slide;
        $slide = $(slide);
        slides.not(slide).hide()
        $slide.show();
        location.hash = $slide.attr('id');
    } else if (current_slide != null) {
        set_current_slide(current_slide);
    } else {
        set_current_slide('#' + $(slides[0]).attr('id'));
    }
}

function previous_slide() {
    var idx = slides.index(current_slide) - 1;
    console.log("Previous slide: ", idx);
    if(idx >= 0) {
        set_current_slide(slides[idx]);
    }
}

function next_slide() {
    var idx = slides.index(current_slide) + 1;
    if(idx < slides.length) {
        set_current_slide(slides[idx]);
    }
}

$('#prev-slide').click(previous_slide);
$('#next-slide').click(next_slide);

function goto_hash() {
    if (location.hash != "") {
        set_current_slide(location.hash);
    } else if (slides.length > 0) {
        set_current_slide(null);
    }
}

$(document).ready(goto_hash);
$(window).on('hashchange', goto_hash);

