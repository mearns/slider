
function Card(content) {

    var self = this;

    self._content = content;
    self._ids = [];

    self._init = function() {};

    self.getIds = function() {
        return self._ids;
    };

    /**
     * Renders this slide to the given parent element.
     */
    self.render = function(ele) {
        console.log("rendering to ", ele);
        $(ele).html(self._content);
        console.log("rendered: " + self._content);
    };


    self._init();

}
