

var Class = new (function Class(){

    var self = this;

    /**
     * Create a bound method that invokes `method` on `target`.
     */
    function _bind(target, method) {
        return function() {
            return method.apply(target, arguments);
        }
    };

    /**
     * Creata a bound method that invokes `method` on `bindTo`,
     * and _attach_ the bound method to the `attachTo` object with
     * the given `methodName`.
     */
    function _bindTo(attachTo, bindTo, methodName, method) {
        attachTo[methodName] = _bind(bindTo, method);
    };

    /**
     * Given a dictionary of `methods`, `_bindTo` each one to the given
     * `bindTo` object, and _attach_ them to the given `attachTo`.
     */
    function _bindAll(attachTo, bindTo, methods) {
        var methodName;
        for(methodName in methods) {
            _bindTo(attachTo, bindTo, methodName, methods[methodName]);
        }
    };

    function _create(obj, name, methods, parent) {
        //Record this class as the object's class.
        obj.__class__ = self;

        //Bind and attach all methods.
        self.__instantiate__(obj, methods, parent);
        
        if('__init__' in obj) {
            obj.__init__(name, methods, parent);
        }
        return obj;
    };


    __methods__ = {

        /**
         * Instantiate an object, binding and attaching all of the given methods to it,
         * but only after instatiating the same object with the given parent class.
         */
        __instantiate__: function(obj, methods, parent) {
            var sup = new Object();
            if (typeof(parent) !== "undefined") {
                //Initially, bind and attach all methods from the parent class onto this object (transitively up the heirarchy).
                // Then we can override and extend these with the given dict of methods, below.
                parent.__instantiate__(obj, parent.__methods__, parent.__parent__);
            }

            //Now we override and extend the methods from the parent classes by updating the object
            // with those methods that were provided. We'll bind them to obj, and attach them to
            // obj as well.
            _bindAll(obj, obj, methods);
            obj.super = sup;
            return obj;
        },

        /**
         * The `create` meethod instantiates a new instance of this class.
         * So for the Class class, the `create` method creates new classes,
         * which are instances of the Class class.
         */
        create: function(name, methods, parent) {
            return _create(new Object(), name, methods, parent);
        },

        /**
         * The `__init__` method is always called after the instance is created,
         * passing the same arguments that were originally passed by the instatiating
         * code to the `create` function.
         *
         * This is the ideal place to set up initial values for instance variables.
         *
         * For the Class class, we instantiate a new class instance by setting the
         * class `__name__`, the `__parent__` class, and the `__methods__` dictionary.
         */
        __init__: function(name, methods, parent) {
            this.__name__ = name;
            this.__parent__ = parent;
            this.__methods__ = methods;
        }
    };

    //Bootstrap the methods, to start with.
    _bindAll(self, self, __methods__);

    //Class is an instance of the Class class.
    //Bootstrap the creation of an object.
    //TODO: The parent class should be Thing, but Thing doesn't exist yet.
    _create(self, "Class", __methods__);

})();

Thing = Class.create("Thing", {});

Class = Class.create("Class", Class.__methods__, Thing);

