/*jshint node: true, esnext: true */
'use strict';

const {isFunction, inspect} = require('util'),
      Dispatcher            = require('./dispatcher');

/**
 * Creates a generic function.
 * @param {Object} propertyObject - the property object of the generic function.
 * @param {string} [propertyObject.name = ''] - the name of the generic function.
 * @param {number} [propertyObject.length = 0] - the length of the generic function.
 * @param {Function} [propertyObject.defaultHandler = throwingHandler] - the default handler to use when no other handler matches the arguments.
 * @return {Function} a generic function.
 **/
function create(opt = {}) {
    const {name, length, defaultHandler} = opt;
    if (defaultHandler && !isFunction(defaultHandler)) {
        throw new TypeError(`Expecting default handler to be a function, got ${inspect(defaultHandler)} instead`);
    }
    return createValidated({
        name: name || '',
        length: length || 0,
        defaultHandler: defaultHandler
    });
}

/**
 * Creates a generic function from a common function.
 * @param {Function} fn - the function that will be promoted to a generic function.
 * @return {Function} a generic function.
 **/
function of(fn) {
    if (!isFunction(fn)) {
        throw new TypeError(`Expecting a a function, got ${inspect(fn)} instead`);
    }
    return createValidated({
        name: fn.name,
        length: fn.length,
        defaultHandler: fn
    });
}

/**
 * Creates a generic function from validated options.
 * @private
 * @param {Object} opt - the option object of the generic function.
 * @param {string} [opt.name = ''] - the name of the generic function.
 * @param {number} [opt.length = 0] - the length of the generic function.
 * @param {Function} [opt.defaultHandler = throwingHandler] - the default handler to use when no other handler matches the arguments.
 * @return {Function} a generic function.
 **/
function createValidated({name, length, defaultHandler}) {

    const dispatcher = new Dispatcher();

    const generic = function (...args) {
        const handler = dispatcher.getHandler(args.slice(0, length)) || defaultHandler || throwingHandler(generic);
        return handler(...args);
    };

    generic.when = function (predicates, handler) {
        dispatcher.setHandler(predicates, handler);
    };

    Object.defineProperty(generic, 'name', {value: name});
    Object.defineProperty(generic, 'length', {value: length});

    return generic;
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
