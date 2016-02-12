

var Class = function(name, methods, superClass) {

    var self = this;

    self.__methods__ = methods;
    self.__name__ = name;
    self.__parent__ = superClass;

    function _init() {
    };

    function _bind(target, method) {
        return function() {
            return method.apply(target, arguments);
        }
    };

    function _bindTo(attachTo, bindTo, methodName, method) {
        attachTo[methodName] = _bind(bindTo, method);
    };

    function _bindAll(attachTo, bindTo, methods) {
        var methodName;
        for(methodName in self.__methods__) {
            _bindTo(attachTo, bindTo, methodName, methods[methodName]);
        }
    };

    self.__init__ = function(obj) {
        var sup = new Object();
        if (typeof(self.__parent__) !== "undefined") {
            self.__parent__.__init__(obj);
            self.__parent__.__init__(sup);
        }
        _bindAll(obj, obj, self.__methods__);
        obj.super = sup;
        return obj;
    };

    self.create = function() {
        var obj = new Object();
        obj.__class__ = self;
        return self.__init__(obj);
    };


    _init();

}
