
function Card(content, templateManager) {

    var self = this;

    self._templateManager = templateManager;
    self._content = content;
    self._theme = "default";
    self._template = "default";
    self._ids = [];

    self._init = function() {};

    self.getIds = function() {
        return self._ids;
    };

    /**
     * Renders this slide to the given parent element.
     */
    self.render = function(ele) {
        self._templateManager.getTemplate(self._theme, self._template, function(template) {
            $(ele).html(template({
                body: self._content
            }));
        });
    };


    self._init();

}
