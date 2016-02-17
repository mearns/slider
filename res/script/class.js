

/*
 *
 * All objects are of class Thing.
 *
 * Classes are objects, of class Class, i.e. All classes extend from Thing.
 *
 * A meta class is the type of a Class class, so a class is an instance of its meta-class.
 * All meta classes extend from Class. Class is its own metaclass.
 *
 */

function module_init() {

    var __debug__ = false;

    function _bind(target, method, methodName, description) {
        var f = function() {
            //TODO: Can we use a real logging library?
            if (__debug__) {
                console.log("Invoking method '" + methodName + "', described as '" +  description + "', bound to:", target);
            }
            return method.apply(target, arguments);
        }
        f.methodName = methodName;
        f.target = target;
        f.description = description;
        return f;
    };

    function _bindSuper(target, method, methodName, description) {
        return _bind(target, function() {
            var sup = this.super;
            this.super = sup.super;
            var ret =method.apply(this, arguments);
            this.super = sup;
            return ret;
        }, methodName, description);
    }

    /**
     * Creata a bound method that invokes `method` on `bindTo`,
     * and _attach_ the bound method to the `attachTo` object with
     * the given `methodName`.
     */
    function _bindTo(attachTo, bindTo, methodName, method, description, bindFunc) {
        if (typeof(bindFunc) === 'undefined') {
            bindFunc = _bind;
        }
        attachTo[methodName] = bindFunc(bindTo, method, methodName, description);
    };

    /**
     * Given a dictionary of `methods`, `_bindTo` each one to the given
     * `bindTo` object, and _attach_ them to the given `attachTo`.
     */
    function _bindAll(attachTo, bindTo, methods, description, bindFunc) {
        var methodName;
        for(methodName in methods) {
            _bindTo(attachTo, bindTo, methodName, methods[methodName], description, bindFunc);
        }
    };

    /**
     * Helper method to create an instance of a class.
     *
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
        self.__instantiate__(obj, obj);
        
        //Use the class-specific __init__ method to setup the object.
        if('__init__' in obj) {
            obj.__init__.apply(obj, init_args);
        }
        return obj;
    };

    function _newObject(className) {
        var func = new Function(
            "return function " + className + "(){};"
        )();
        return new func();
    };

    var methodsProvidedByThing = {

        //Object methods
        getClass: function() {
            return this.__class__;
        },

        getClassName: function() {
            return this.__class__.__name__;
        }

    };

    var methodsProvidedByClass = {

        /**
         * Instantiate the given object as an instance of this type, binding and attaching all methods provided by this class
         * and the parent classes to the given object.
         */
        __instantiate__: function(attachTo, bindTo, bindFunc) {
            //TODO: Super can probably be a true object (i.e., a Thing).
            var sup = _newObject("Super_" + this.__name__);
            //TODO: Should never be undefined, The Class::__init__ method should check for undefined and make it Thing.
            if (typeof(this.__parent__) !== "undefined") {
                //Initially, bind and attach all methods from the parent class onto this object (transitively up the heirarchy).
                // Then we can override and extend these with the given dict of methods, below.
                this.__parent__.__instantiate__(attachTo, bindTo, bindFunc);
                this.__parent__.__instantiate__(sup, bindTo, _bindSuper);
            }

            //Now we override and extend the methods from the parent classes by updating the object
            // with those methods that were provided. We'll bind them to obj, and attach them to
            // obj as well.
            _bindAll(attachTo, bindTo, this.__methods__, 'Method provided by ' + this.__name__, bindFunc);
            attachTo.super = sup;
            return attachTo;
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
            return _create(this, _newObject(this.__name__), arguments);
        },

        /**
         * Create a subclass of this object. The meta class is the same as
         * this object's metaclass, unless specified.
         */
        subclass: function(name, methods, metaclass) {
            if (typeof(metaclass) === "undefined") {
                metaClass = this.getParentClass();
            }
            return metaClass.create(name, methods, this);
        },


        //TODO: Test.
        subclass: function(name, methods) {
            return this.__class__.create(name, methods, this);
        },

        getParentClass: function() {
            return this.__parent__;
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

    var Thing = _newObject("ThingClass");
    var Class = _newObject("Class");

    /// Bootsrap the creation of the Class class.

    //Class is an object, so it has all the methods provided by Thing.
    _bindAll(Class, Class, methodsProvidedByThing, 'Methods bootstrapped for Class from Thing.');

    //Then add in the methods specific to the Class type.
    _bindAll(Class, Class, methodsProvidedByClass, 'Methods bootstrapped for Class from Class.');

    //Init the object. It's a subclass of Thing (everything is).
    Class.__init__("Class", methodsProvidedByClass, Thing);

    //Class is it's own class.
    Class.__class__ = Class;


    /// Bootsrap the creation of the Thing class.
    
    //Thing is an object, so it has all the methods provided by Thing.
    _bindAll(Thing, Thing, methodsProvidedByThing, 'Methods bootstrapped for Thing from Thing.');

    //Thing is also a Class, so it has all the methods provided by Class.
    _bindAll(Thing, Thing, methodsProvidedByClass, 'Methods bootstrapped for Thing from Class.');

    //Except Thing needs a different __instantiate__ method, which doesn't try to
    // go up any higher, so it doesn't go up forever.
    var instantiateAThing = function(attachTo, bindTo, bindFunc) {
        //Now we override and extend the methods from the parent classes by updating the object
        // with those methods that were provided. We'll bind them to obj, and attach them to
        // obj as well.
        _bindAll(attachTo, bindTo, this.__methods__, 'Methods added by ThingClass from ' + this.__name__, bindFunc);

        //An instance of Thing is it's own super object, since Thing is it's own parent class.
        //FIXME: Does this work right?
        attachTo.super = attachTo;
        return attachTo;
    };
    Thing.__instantiate__ = _bind(Thing, instantiateAThing, "instantiateAThing");

    //It also needs to override the subclass method, so that subclasses use Class
    // as the metaclass, instead of ThingClass.
    var subclassThing = function(name, methods, metaclass) {
        if (typeof(metaclass) === "undefined") {
            metaClass = Class;
        }
        return metaClass.create(name, methods, this);
    };
    Thing.subclass = _bind(Thing, subclassThing, "subclassThing");


    //Init the object, as a class. It is it's own parent class (because all classes
    // extend from Thing).
    Thing.__init__("Thing", methodsProvidedByThing, Thing);

    //Because it has a different __instantiate__ method, it must have gotten that method from somewhere 
    // other than Class, because it had to override the one provided by Class. So it must have a
    // different meta class. Let's create that.
    Thing.__class__ = Class.subclass("ThingClass", {
        __instantiate__: instantiateAThing,
        subclass: subclassThing
    });

    return Thing;
}


var Thing = module_init();

