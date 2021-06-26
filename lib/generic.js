/* jshint node: true, esversion: 6 */
'use strict';

const {isFunction, inspect} = require('util'),
      Dispatcher            = require('./dispatcher'),
      {isArray}             = Array;

/**
 * Creates a generic function.
 * @param {Object} opt - the option object of the generic function.
 * @param {string} [opt.name = ''] - the name of the generic function.
 * @param {number} [opt.length = 0] - the length of the generic function.
 * @param {Function} [opt.defaultHandler = throwingHandler] - the default handler to be used when no other handler matches the arguments.
 * @return {Function} a generic function.
 **/
function create(opt = {}) {
    const {name, length, defaultHandler} = opt;
    if (defaultHandler && !isFunction(defaultHandler)) {
        throw defaultHandlerNotAFunctionError(defaultHandler);
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
        throw promotingNotAFunctionError(fn);
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
 * @param {Object} opt - the validated option object of the generic function.
 * @param {string} [opt.name = ''] - the name of the generic function.
 * @param {number} [opt.length = 0] - the length of the generic function.
 * @param {Function} [opt.defaultHandler = throwingHandler] - the default handler to be used when no other handler matches the arguments.
 * @return {Function} a generic function.
 **/
function createValidated({name, length, defaultHandler}) {

    const dispatcher = new Dispatcher();

    const generic = function (...args) {
        const handler = dispatcher.getHandler(args.slice(0, length)) || defaultHandler || throwingHandler(generic);
        return handler(...args);
    };

    generic.when = function when(predicates, handler) {
        if (!isArray(predicates) || predicates.length != length) {
            throw notAnArrayOfPredicatesError(predicates, length);
        }

        let pos = 0;
        for (const predicate of predicates) {
            if (!isFunction(predicate)) {
                throw notAPredicateError(predicate, pos);
            }
            ++pos;
        }

        if (!isFunction(handler)) {
            throw handlerNotAFunctionError(handler);
        }

        dispatcher.setHandler(predicates, handler);
    };

    Reflect.defineProperty(generic, 'name', {value: name});
    Reflect.defineProperty(generic, 'length', {value: length});

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
     * Creates a "no matching" error.
     * @param {function} generic - the generic function for which no matching was found.
     * @param {Array.<*>} args - the arguments that did not match.
     **/
    constructor(generic, args) {
        super(`Generic function "${generic.name}" cannot be applied to arguments ${inspect(args)}`);
        /* istanbul ignore else */
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
        this.generic = generic;
        this.args = args;
    }
}

/**
 * Constructs a type error to signal that what provided as default handler is not a function.
 * @private
 * @param {*} defaultHandler - what has been erroneusly passed as the default handler.
 * @return {TypeError} a type error with an informing error message.
 **/
function defaultHandlerNotAFunctionError(defaultHandler) {
    const msg = `Expecting the default handler to be a function, got ${inspect(defaultHandler)} instead`;
    return new TypeError(msg);
}

/**
 * Constructs a type error to signal that there was an attempt to promote
 * something other than a function.
 * @private
 * @param {*} fn - what has been erroneusly passed as a function.
 * @return {TypeError} a type error with an informing error message.
 **/
function promotingNotAFunctionError(fn) {
    const msg = `Expecting a function, got ${inspect(fn)} instead`;
    return new TypeError(msg);
}

/**
 * Constructs a type error to signal that what provided as handler is not a function.
 * @private
 * @param {*} handler - what has been erroneusly passed as an handler.
 * @return {TypeError} a type error with an informing error message.
 **/
function handlerNotAFunctionError(handler) {
    const msg = `Expecting a function as second argument, got ${inspect(handler)} instead`;
    return new TypeError(msg);
}

/**
 * Constructs a type error to signal that what provided is not an array of predicates.
 * @private
 * @param {*} predicates - what has been erroneusly passed as an array of predicates.
 * @param {number} length - the expect length of the predicate array.
 * @return {TypeError} a type error with an informing error message.
 **/
function notAnArrayOfPredicatesError(predicates, length) {
    const msg = `Expecting an array of predicates of length ${length} as first argument, got ${inspect(predicates)} instead`;
    return new TypeError(msg);
}

/**
 * Constructs a type error to signal that what provided is not a predicate.
 * @private
 * @param {*} predicate - what has been erroneusly passed as part of an array of predicates.
 * @param {number} pos - the position in the array of predicates.
 * @return {TypeError} a type error with an informing error message.
 **/
function notAPredicateError(predicate, pos) {
    const msg = `Expecting a predicate function at position ${pos}, got ${inspect(predicate)} instead`;
    return new TypeError(msg);
}

module.exports = {
    create,
    of,
    NoMatchingError
};
