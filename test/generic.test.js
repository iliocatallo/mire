/* jshint node: true, esversion: 6 */
/* global describe, it */
'use strict';

const assert   = require('assert').strict,
      Generic  = require('../lib/generic');

const isNumber = x => Number(parseFloat(x)) === x;
const isArray = xs => Array.isArray(xs);

describe('[Generic] Creating a generic function', function () {
    it('is possible by specifying its name, length and fallback handler', function () {
        const sum = Generic.create({
            name: 'sum',
            length: 2,
            fallback: (x, y) => x + y
        });

        assert.equal(sum.name, 'sum');
        assert.equal(sum.length, 2);
    });

    it('is possible also when no name has been specified', function () {
        const sum = Generic.create({
            length: 2,
            fallback: (x, y) => x + y
        });

        assert.equal(sum.name, '');
    });

    it('is possible also when no length has been specified', function () {
        const sum = Generic.create({
            name: 'sum',
            fallback: (x, y) => x + y
        });

        assert.equal(sum.length, 0);
    });

    it('is possible also when no fallback handler has been specified', function () {
        const sum = Generic.create({
            name: 'sum',
            length: 2
        });

        assert.throws(() => sum(5, 6), Generic.NoMatchingError);
    });

    it('is possible also when no parameters have been specified', function () {
        const sum = Generic.create();

        assert.equal(sum.name, '');
        assert.equal(sum.length, 0);
        assert.throws(() => sum(5, 6), Generic.NoMatchingError);
    });

    it('is not possible if the fallback handler is not a function', function () {
        assert.throws(() => Generic.create({fallback: true}), TypeError);
        assert.throws(() => Generic.create({fallback: 5}), TypeError);
        assert.throws(() => Generic.create({fallback: 'string'}), TypeError);
        assert.throws(() => Generic.create({fallback: Symbol()}), TypeError);
        assert.throws(() => Generic.create({fallback: {a: 1, b: 2}}), TypeError);
        assert.throws(() => Generic.create({fallback: [1, 2, 3]}), TypeError);
    });
});

describe('[Generic] Promoting a function to a generic function', function () {

    it('is possible when the argument is a function', function () {
        const sum = Generic.of(function sum(x, y) {
            return x + y;
        });

        assert.equal(sum.name, 'sum');
        assert.equal(sum.length, 2);
    });

    it('is not possible when the argument is not a function', function () {
        assert.throws(() => Generic.of(true), TypeError);
        assert.throws(() => Generic.of(5), TypeError);
        assert.throws(() => Generic.of('string'), TypeError);
        assert.throws(() => Generic.of(Symbol()), TypeError);
        assert.throws(() => Generic.of({a: 1, b: 2}), TypeError);
        assert.throws(() => Generic.of([1, 2, 3]), TypeError);
    });
});

describe('[Generic] Applying a generic function to some arguments', function () {
    it('is delegated to a matching handler', function () {
        const sum = Generic.create({
            length: 2
        });
        sum.when([isNumber, isNumber], (x, y) => x + y);
        sum.when([isArray, isArray], (xs, ys) => xs.map((x, i) => x + ys[i]));

        const numberResult = sum(5, 6);
        const arrayResult = sum([7, 2], [3, 4]);

        assert.equal(numberResult, 11);
        assert.deepEqual(arrayResult, [10, 6]);
    });

    it('defaults to the fallback handler when arguments do not match', function () {
        const sum = Generic.create({
            fallback: (x, y) => x + y
        });

        const numberResult = sum(5, 6);
        const stringResult = sum('abcd', 'EFGH');

        assert.equal(numberResult, 11);
        assert.equal(stringResult, 'abcdEFGH');
    });

    it('accepts a variable number of arguments', function () {
        const sum = Generic.create({
            length: 2
        });
        sum.when([isNumber, isNumber], (x, y) => x + y);

        const numberResult = sum(5, 6, 'extra');

        assert.equal(numberResult, 11);
    });
});

describe('[Generic] Extending a generic function', function () {
    it('overrides the possible handler associated with the same predicates', function () {
        const sum = Generic.create({
            length: 1
        });

        sum.when([isNumber], x => x + 2);
        sum.when([isNumber], x => x + 10);
        const numberResult = sum(5);

        assert.equal(numberResult, 15);
    });

    it('is not possible if the first argument is not an array of predicates of the right length', function () {
        const sum = Generic.create({
            length: 2
        });
        const handler = (x, y) => x + y;

        assert.throws(() => sum.when([isNumber], handler), TypeError);
        assert.throws(() => sum.when('not-an-array', handler), TypeError);
        assert.throws(() => sum.when(['not-fn', 'not-fn'], handler), TypeError);
        assert.throws(() => sum.when(['not-fn', isNumber], handler), TypeError);
        assert.throws(() => sum.when([isNumber, 'not-fn'], handler), TypeError);
    });

    it('is not possible if the second argument is not a function', function () {
        const sum = Generic.create({
            length: 2
        });

        assert.throws(() => sum.when([isNumber, isNumber], 'not-a-fn'), TypeError);
    });
});
