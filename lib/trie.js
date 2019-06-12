/*jshint node: true, esnext: true */
'use strict';

const {isFunction} = require('util');

/**
 * A Trie data structure.
 * @private
 **/
class Trie {

    /**
     * Creates an empty trie, i.e., a trie only consisting of its root node.
     **/
    constructor() {
        this._root = Node();
    }

    /**
     * Associates a value with a sequence of predicates.
     * @param {Array.<Function>} predicates - a sequence of predicates.
     * @param {*} value - the value associated with the predicates.
     **/
    setValue(predicates, value) {
        let current = this._root;
        for (const predicate of predicates) {
            current = addEdge(current, predicate);
        }
        current.value = value;
    }

    /**
     * Retrieves a value by predicate satisfaction.
     * @param {Array.<*>} features - a set of features to be tested.
     * @return {* | undefined} the first value whose predicates are satisfied by the input features; <tt>undefined</tt> otherwise.
     **/
    getValue(features) {
        let current = this._root;
        for (const feature of features) {
            const edge = findTraversableEdge(current, feature);
            if (!edge) {
                return undefined;
            }
            current = edge.node;
        }
        return current.value;
    }
}

/**
 * Edge data type.
 * @private
 * @param {Function} predicate - a predicate that assesses edge traversability.
 * @param {Node} node - the target node.
 **/
const Edge = (predicate, node) => ({
    predicate,
    node
});

/**
 * Node data type.
 * @private
 * @param {*} value - node's value.
 * @param {Array.<Edge>} edges - node's outgoing edges.
 **/
const Node = () => ({
    value: undefined,
    edges: []
});

/**
 * Adds an edge to a node.
 * @private
 * @param {Node} parent - the parent node where to attach the child node.
 * @param {Function} predicate - a predicate that assesses the edge traversability.
 * @return {Node} the new target node (or the already existing one, if any).
 **/
function addEdge(parent, predicate) {
    const edge = parent.edges.find(edge => edge.predicate === predicate);
    if (edge) {
        return edge.node;
    }

    const child = Node();
    parent.edges.push(Edge(predicate, child));
    return child;
}

/**
 * Finds a traversable edge of a node, if any.
 * @private
 * @param {Node} node - the node whose edges are going to be inspected.
 * @param {*} feature - the feature to be tested against the edges' predicate.
 * @return {Edge | undefined} the first matching edge; <tt>undefined</tt> otherwise.
 **/
function findTraversableEdge(node, feature) {
    for (let i = node.edges.length - 1; i >= 0; i--) {
        const edge = node.edges[i];
        if (edge.predicate(feature)) return edge;
    }
    return undefined;
}

module.exports = Trie;
