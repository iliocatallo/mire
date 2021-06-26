/* jshint node: true, esversion: 6 */
/* global describe, it */
'use strict';

const chai     = require('chai'),
      Generic  = require('../lib/generic'),
      {expect} = chai;

const isNumber = x => Number(parseFloat(x)) === x;
const isArray = xs => Array.isArray(xs);

describe('[Generic] Creating a generic function', function () {
    it('is possible by specifying its name, length and default handler', function () {
        const sum = Generic.create({
            name: 'sum',
            length: 2,
            defaultHandler: (x, y) => x + y
        });

        expect(sum.name).to.equal('sum');
        expect(sum.length).to.equal(2);
    });

    it('is possible also when no name has been specified', function () {
        const sum = Generic.create({
            length: 2,
            defaultHandler: (x, y) => x + y
        });

        expect(sum.name).to.equal('');
    });

    it('is possible also when no length has been specified', function () {
        const sum = Generic.create({
            name: 'sum',
            defaultHandler: (x, y) => x + y
        });

        expect(sum.length).to.equal(0);
    });

    it('is possible also when no default handler has been specified', function () {
        const sum = Generic.create({
            name: 'sum',
            length: 2
        });

        expect(() => sum(5, 6)).to.throw(Generic.NoMatchingError);
    });

    it('is possible also when no parameters have been specified', function () {
        const sum = Generic.create();

        expect(sum.name).to.equal('');
        expect(sum.length).to.equal(0);
        expect(() => sum(5, 6)).to.throw(Generic.NoMatchingError);
    });

    it('is not possible if the default handler is not a function', function () {
        expect(() => Generic.create({defaultHandler: true})).to.throw(TypeError);
        expect(() => Generic.create({defaultHandler: 5})).to.throw(TypeError);
        expect(() => Generic.create({defaultHandler: 'string'})).to.throw(TypeError);
        expect(() => Generic.create({defaultHandler: Symbol()})).to.throw(TypeError);
        expect(() => Generic.create({defaultHandler: {a: 1, b: 2}})).to.throw(TypeError);
        expect(() => Generic.create({defaultHandler: [1, 2, 3]})).to.throw(TypeError);
    });
});

describe('[Generic] Promoting a function to a generic function', function () {

    it('is possible when the argument is indeed a function', function () {
        const sum = Generic.of(function sum(x, y) {
            return x + y;
        });

        expect(sum.name).to.equal('sum');
        expect(sum.length).to.equal(2);
    });

    it('is not possible when the argument is not a function', function () {
        expect(() => Generic.of(true)).to.throw(TypeError);
        expect(() => Generic.of(5)).to.throw(TypeError);
        expect(() => Generic.of('string')).to.throw(TypeError);
        expect(() => Generic.of(Symbol())).to.throw(TypeError);
        expect(() => Generic.of({a: 1, b: 2})).to.throw(TypeError);
        expect(() => Generic.of([1, 2, 3])).to.throw(TypeError);
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

        expect(numberResult).to.equal(11)
        expect(arrayResult).to.deep.equal([10, 6])
    });

    it('falls back to the default handler when arguments do not match', function () {
        const sum = Generic.create({
            defaultHandler: (x, y) => x + y
        });

        const numberResult = sum(5, 6);
        const stringResult = sum('abcd', 'EFGH')

        expect(numberResult).to.equal(11)
        expect(stringResult).to.equal('abcdEFGH')
    });

    it('accepts a variable number of arguments', function () {
        const sum = Generic.create({
            length: 2
        });
        sum.when([isNumber, isNumber], (x, y) => x + y)

        const numberResult = sum(5, 6, 'extra')

        expect(numberResult).to.equal(11);
    });
});

describe('[Generic] Extending a generic function', function () {
    it('overrides least-recent handlers with the same predicates', function () {
        const sum = Generic.create({
            length: 1
        });

        sum.when([isNumber], x => x + 2);
        sum.when([isNumber], x => x + 10);
        const numberResult = sum(5);

        expect(numberResult).to.equal(15)
    });

    it('is not possible if the first argument is not an array of predicates of the right length', function () {
        const sum = Generic.create({
            length: 2
        });
        const handler = (x, y) => x + y;

        expect(() => sum.when('not-an-array', handler)).to.throw(TypeError);
        expect(() => sum.when([isNumber], handler)).to.throw(TypeError);
        expect(() => sum.when(['not-fn', 'not-fn'], handler)).to.throw(TypeError);
        expect(() => sum.when(['not-fn', isNumber], handler)).to.throw(TypeError);
        expect(() => sum.when([isNumber, 'not-fn'], handler)).to.throw(TypeError);
    });

    it('is not possible if the second argument is not a function', function () {
        const sum = Generic.create({
            length: 2
        });

        expect(() => sum.when([isNumber, isNumber], 'not-a-fn')).to.throw(TypeError);
    });
});
