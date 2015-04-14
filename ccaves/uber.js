(function(global, factory) {
    if (typeof define === 'function' && define.amd)
        define([], factory);
    else if (typeof exports === 'object')
        module.exports = factory();
    else
        global.Class = factory();
}(this, function() {

    // simple Object.create() polyfill
    var object_create = (function() {
        if (typeof Object.create === 'function')
            return Object.create;

        var Temp = function(){}
        return function(prototype) {
            Temp.prototype = prototype;
            var result = new Temp();
            Temp.prototype = null;
            return result;
        }
    })();

    // Function.prototype.bind() replacement, does not support currying
    function bind(func, scope) {
        return function() {
            return func.apply(scope, arguments);
        }
    }

    // Copy all methods from one object to another binding them to a given scope
    // If no scope or destination is specified bind them in place to thier own instance
    function uber_copy(from, to, scope) {
        if (typeof to === 'undefined') to = from;
        if (typeof scope === 'undefined') scope = from;
        for (var x in from)
            if (typeof from[x] === 'function')
                to[x] = bind(from[x], scope);
        return to;
    }

    // create the Class object
    var Class = function(){}

    // the magic extend() function
    Class.extend = function ext(blueprint, options) {
        // set up the options
        options = options || {};
        if (typeof options.auto === 'undefined') options.auto = true;
        if (typeof options.lock === 'undefined') options.lock = true;

        var parent = this.prototype,
            proto = object_create(parent);

        var child = function() {
            // automatic instantiation
            if (options.auto && !(this instanceof child)) {
                var result = object_create(child.prototype);
                child.apply(result, arguments);
                return result;
            }

            // guarantee scope
            if (options.lock) uber_copy(this);

            // uber reference to the parent class
            this.uber = uber_copy(parent, bind(parent.constructor, this), this);

            // call the constructor property
            if (typeof this.constructor === 'function')
                this.constructor.apply(this, arguments);
        }

        // extend our clone with the provided blueprint
        // pass a reference to the parent prototype for easy reference
        blueprint.call(proto, parent);

        // set the child's prototype and allow it to be extended
        child.prototype = proto;
        child.extend = bind(ext, child);
        return child;
    }

    return Class;

}));