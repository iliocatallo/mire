/*jshint node: true, esnext: true */
'use strict';

const Dispatcher = require('./dispatcher');

/**
 * Creates a generic function.
 * @param {Object} propertyObject - the property object of the generic function.
 * @param {string} [propertyObject.name = ''] - the name of the generic function.
 * @param {number} [propertyObject.arity = 0] - the arity of the generic function.
 * @param {Function} [propertyObject.defaultHandler = throwingHandler] - the default handler to use when no other handler matches the arguments.
 * @return {Function} a generic function.
 **/
function create({name, arity, defaultHandler} = {}) {

    name = name || '';
    arity = arity || 0;

    const dispatcher = new Dispatcher();

    const generic = function (...args) {
        const handler = dispatcher.getHandler(args) || defaultHandler || throwingHandler(generic);
        return handler(...args);
    };

    generic.when = generic.addHandler = function (predicates, handler) {
        dispatcher.setHandler(predicates, handler);
    };

    Object.defineProperty(generic, 'name', {value: name});
    Object.defineProperty(generic, 'length', {value: arity});

    return generic;
}

/**
 * Creates a generic function from a common function.
 * @param {Function} fn - the function that will be promoted to a generic function.
 * @return {Function} a generic function.
 **/
function of(fn) {
    return create({
        name: fn.name,
        arity: fn.length,
        defaultHandler: fn
    });
}

/**
 * Creates a handler that always throws, regardless of its arguments.
 * @private
 * @param {Function} generic - a generic function.
 * @return {Function} a handler that always throws.
 **/
function throwingHandler(generic) {
    return function (...args) {
        throw new NoMatchingError(generic, args);
    };
}

/**
 * An error for signaling when no matching could be found.
 **/
class NoMatchingError extends Error {

    /**
     * Creates a "no matching" error
     * @param {function} generic - the generic function for which no matching was found.
     * @param {Array.<*>} args - the arguments that did not match.
     **/
    constructor(generic, args) {
        super(`Generic function "${generic.name}" cannot be applied to arguments [${args}]`);
        /* istanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        this.generic = generic;
        this.args = args;
    }
}

module.exports = {
    create,
    of,
    NoMatchingError
};
