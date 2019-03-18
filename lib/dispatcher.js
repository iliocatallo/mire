/*jshint node: true, esnext: true */
'use strict';

const Trie = require('./trie');

/**
 * An argument dispatcher.
 * @private
 **/
class Dispatcher {

    /**
     * Constructs a dispatcher.
     **/
    constructor() {
        this._trie = new Trie();
    }

    /**
     * Gets the first handler capable of handling the arguments.
     * @param {Array.<*>} args - the arguments for which a handler is required.
     * @return {Function | undefined} the handler capable of handling the arguments; <tt>undefined</tt> otherwise.
     **/
    getHandler(args) {
        return this._trie.getValue(args);
    }

    /**
     * Adds a handler and its associated set of predicates.
     * @param {Array.<Function>} - the predicates used for dispatching the arguments.
     * @param {Function} - the function that handles matching arguments.
     **/
    addHandler(predicates, handler) {
        this._trie.setValue(predicates, handler);
    }
}

module.exports = Dispatcher;
