/*jshint node: true, esnext: true */
/*global describe, before, beforeEach, it */
'use strict';

const chai     = require('chai'),
      sinon    = require('sinon'),
      Generic  = require('../lib/generic'),
      {expect} = chai;

chai.use(require('sinon-chai'));

const isNumber = x => Number(parseFloat(x)) === x;
const isArray = xs => Array.isArray(xs);

describe('[Generic] Creating a generic function', function () {
    it('should be possible by specifying its name, length and default handler', function () {
        const add = Generic.create({
            name: 'add',
            length: 2,
            defaultHandler: (x, y) => x + y
        });

        expect(add.name).to.equal('add');
        expect(add.length).to.equal(2);
    });

    it('should be possible also when no name has been specified', function () {
        const add = Generic.create({
            length: 2,
            defaultHandler: (x, y) => x + y
        });

        expect(add.name).to.equal('');
    });

    it('should be possible also when no length has been specified', function () {
        const add = Generic.create({
            name: 'add',
            defaultHandler: (x, y) => x + y
        });

        expect(add.length).to.equal(0);
    });

    it('should be possible also when no default handler has been specified', function () {
        const add = Generic.create({
            name: 'add',
            length: 2
        });

        expect(() => add(5, 6)).to.throw(Generic.NoMatchingError);
    });

    it('should be possible also when no parameters have been specified', function () {
        const add = Generic.create();

        expect(add.name).to.equal('');
        expect(add.length).to.equal(0);
        expect(() => add(5, 6)).to.throw(Generic.NoMatchingError);
    });

    it('should not be possible if the default handler is not a function', function () {
        expect(() => Generic.create({defaultHandler: true})).to.throw(TypeError);
        expect(() => Generic.create({defaultHandler: 5})).to.throw(TypeError);
        expect(() => Generic.create({defaultHandler: 'string'})).to.throw(TypeError);
        expect(() => Generic.create({defaultHandler: Symbol()})).to.throw(TypeError);
        expect(() => Generic.create({defaultHandler: {a: 1, b: 2}})).to.throw(TypeError);
        expect(() => Generic.create({defaultHandler: [1, 2, 3]})).to.throw(TypeError);
    });
});

describe('[Generic] Promoting a function to a generic function', function () {

    it('should be possible when the argument is a function', function () {
        const add = Generic.of(function add(x, y) {
            return x + y;
        });

        expect(add.name).to.equal('add');
        expect(add.length).to.equal(2);
    });

    it('should not be possible when the argument is not a function', function () {
        expect(() => Generic.of(true)).to.throw(TypeError);
        expect(() => Generic.of(5)).to.throw(TypeError);
        expect(() => Generic.of('string')).to.throw(TypeError);
        expect(() => Generic.of(Symbol())).to.throw(TypeError);
        expect(() => Generic.of({a: 1, b: 2})).to.throw(TypeError);
        expect(() => Generic.of([1, 2, 3])).to.throw(TypeError);
    });
});

describe('[Generic] Applying a generic function to some arguments', function () {
    it('should be delegated to a matching handler', function () {
        const numberHandler = sinon.stub();
        const arrayHandler = sinon.stub();

        const add = Generic.create({length: 2});
        add.when([isNumber, isNumber], numberHandler);
        add.when([isArray, isArray], arrayHandler);

        add(5, 6);
        add([4, 2], [7, 6]);

        expect(numberHandler).to.have.been.calledWith(5, 6);
        expect(arrayHandler).to.have.been.calledWith([4, 2], [7, 6]);
    });

    it('should fall back to the default handler when arguments do not match', function () {
        const defaultHandler = sinon.stub();
        const add = Generic.create({defaultHandler});

        add(5, 6);

        expect(defaultHandler).to.have.been.calledWith(5, 6);
    });

    it('should accept a variable number of arguments', function () {
        const add = Generic.create({length: 2});
        add.when([isNumber, isNumber], function (x, y) { return x + y; });

        expect(add(5, 6, "extra")).to.equal(11);
    });
});

describe('[Generic] Extending a generic function', function () {
    it('should override least-recent handlers with the same predicates', function () {
        const handler1 = sinon.stub();
        const handler2 = sinon.stub();

        const add = Generic.create({length: 2});

        add.when([isNumber, isNumber], handler1);
        add.when([isNumber, isNumber], handler2);

        add(5, 6);

        /*jshint -W030 */
        expect(handler1).to.have.not.been.called;
        expect(handler2).to.have.been.calledWith(5, 6);
    });

    it('should not be possible if the first argument is not an array of predicates of the right length', function () {
        const add = Generic.create({length: 2});

        expect(() => add.when('not-an-array', (x, y) => x + y)).to.throw(TypeError);
        expect(() => add.when([isNumber], (x, y) => x + y)).to.throw(TypeError);
        expect(() => add.when(['not-fn', 'not-fn'], (x, y) => x + y)).to.throw(TypeError);
        expect(() => add.when(['not-fn', isNumber], (x, y) => x + y)).to.throw(TypeError);
        expect(() => add.when([isNumber, 'not-fn'], (x, y) => x + y)).to.throw(TypeError);
    });

    it('should not be possible if the second argument is not a function', function () {
        const add = Generic.create({length: 2});

        expect(() => add.when([isNumber, isNumber], 'not-a-fn')).to.throw(TypeError);
    });
});
