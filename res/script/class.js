

function module_init() {

    var _QuasiClass = new (function Class(){

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

        //These are the methods that will be provided by the Class class for instances
        //of type Class.
        __methods__ = {

            bindAll: function(attachTo, bindTo, methods) {
                return _bindAll(attachTo, bindTo, methods);
            },

            /**
             * Instantiate the given object as an instance of this type, binding and attaching all methods provided by this class
             * and the parent classes to the given object.
             */
            __instantiate__: function(obj) {
                var sup = new Object();
                if (typeof(this.__parent__) !== "undefined") {
                    //Initially, bind and attach all methods from the parent class onto this object (transitively up the heirarchy).
                    // Then we can override and extend these with the given dict of methods, below.
                    this.__parent__.__instantiate__(obj);
                }

                //Now we override and extend the methods from the parent classes by updating the object
                // with those methods that were provided. We'll bind them to obj, and attach them to
                // obj as well.
                _bindAll(obj, obj, this.__methods__);
                obj.super = sup;
                return obj;
            },

            /**
             * The `create` method is provided by the Class class for instantiating
             * a new instance of this class.
             * 
             * So for the Class class, the `create` method creates new classes,
             * which are instances of the Class class.
             *
             * The arguments passed to this method are the ones passed to the
             * `__init__` method. For the Class class, these arguments are the name
             * of the class, the dictionary of methods, and the parent class.
             */
            create: function() {
                return _create(this, new Object(), arguments);
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

        /**
         * `self` is the Class object for which an new instance of that class is
         * being created.
         *
         * `obj` is the object being created, and is returned.
         *
         * `init_args` are the arguments passed by instantiating code to the
         * Class object's create method, which will be passed on to the created
         * object's __init__ method.
         */
        function _create(self, obj, init_args) {
            //Record this class as the object's class.
            obj.__class__ = self;

            //Bind and attach all methods provided by this class to the given object.
            self.__instantiate__(obj);
            
            //Use the class-specific __init__ method to setup the object.
            if('__init__' in obj) {
                obj.__init__.apply(obj, init_args);
            }
            return obj;
        };

        //Bootstrap the methods, to start with.
        // I.e., bind and attach all of the method provided by the Class class to this
        // instance of the Class class. This instance is the Class object that represents
        // the Class class. It's of type Class. Are you with me?
        //
        // We need to do this because when we call create, it's going to call __instantiate__.
        _bindAll(self, self, __methods__);

        //Class is an instance of the Class class.
        //Bootstrap the creation of this object.
        // 
        // The first arg is the Class object for which an instance is being created,
        // which is this object itself. We're instantiating an object of the Class class.
        //
        // The second arg is the object being instantiated, which, again, is this object.
        //
        // The third argument is the array of __init__ arguments: name, methods, and parent
        // class. Currently, the parent class is undefined, eventually, it will extend
        // the Supra class, Thing, but that's not defined yet.
        _create(self, self, ["_QuasiClass", __methods__, undefined]);


    })();

    Thing = _QuasiClass.create("_ThingMeta_", {
        __instantiate__: function(obj) {
            //Since this is the top-level meta class, it's not going to try to go up any higher.
            this.bindAll(obj, obj, this.__methods__);
            obj.super = obj;
            return obj;
        }
    }, _QuasiClass).create("Thing", {});
    //Thing is the top-level class, so it's its own super class. This is cheating a little, but it works:
    // call it botstrapping. And it's critical that Thing is an instance of ThingMeta for this to work.
    Thing.__parent__ = Thing;

    //Now recreate Class as a subclass of Thing, because everything is a Thing.
    Class = _QuasiClass.create("Class", _QuasiClass.__methods__, Thing);
    //And class is of type Class, so bootstrap that, too. Am I useing that work right?
    Class.__class__ = Class;

    //Lastly, we created "ThingMeta" as a subclass of the first Class, we want to replace that.
    Thing.__class__.__class__ = Class;

    return Thing;
}


var Thing = module_init();

