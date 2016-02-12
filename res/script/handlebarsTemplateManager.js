

function HandlebarsTemplateManager() {
    
    var self = this;

    self._loadedTemplates = {};

    function _init() {

    };

    /**
     * Ensures the specified template is loaded, and calls the given onComplete
     * function when it's available.
     *
     * The onComplete function is passed three arguments: the compiled Handlebars template,
     * the template name, and the theme name.
     */
    self.getTemplate = function(theme, templateName, onComplete) {
        if (!(theme in self._loadedTemplates) || !(templateName in self._loadedTemplates[theme])) {
            _loadTemplate(theme, templateName, onComplete);
        }
        else {
            onComplete(self._loadedTemplates[theme][templateName], templateName, theme);
        }
    };

    function _loadTemplate(theme, templateName, onComplete) {
        //TODO: SECURITY: Probably need to do some checking against this, make sure they can't force
        // a request for an abritrary URL.
        var url = '/res/themes/' + theme + '/' + templateName + '.hbs';

        (theme in self._loadedTemplates) || (self._loadedTemplates[theme] = {});
        $.get(url)
            .done( function( data ) {
                var template = Handlebars.compile(data);
                self._loadedTemplates[theme][templateName] = template;
                onComplete(template, templateName, theme);
            });
    };

    _init();
}

