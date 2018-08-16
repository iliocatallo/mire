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
    it('should be possible by promoting a function', function () {
        const add = Generic.of(function add(x, y) {
            return x + y;
        });

        expect(add.name).to.equal('add');
        expect(add.length).to.equal(2);
    });

    it('should be possible by specifying its name, arity and default handler', function () {
        const add = Generic.create({
            name: 'add',
            arity: 2,
            defaultHandler: (x, y) => x + y
        });

        expect(add.name).to.equal('add');
        expect(add.length).to.equal(2);
    });

    it('should be possible also when no name has been specified', function () {
        const add = Generic.create({
            arity: 2,
            defaultHandler: (x, y) => x + y
        });

        expect(add.name).to.equal('');
    });

    it('should be possible also when no arity has been specified', function () {
        const add = Generic.create({
            name: 'add',
            defaultHandler: (x, y) => x + y
        });

        expect(add.length).to.equal(0);
    });

    it('should be possible also when no default handler has been specified', function () {
        const add = Generic.create({
            name: 'add',
            arity: 2
        });

        expect(() => add(5, 6)).to.throw(Generic.NoMatchingError);
    });

    it('should be possible also when no parameters have been specified', function () {
        const add = Generic.create();
        
        expect(add.name).to.equal('');
        expect(add.length).to.equal(0);
        expect(() => add(5, 6)).to.throw(Generic.NoMatchingError);
    });
});

describe('[Generic] Applying a generic function to some arguments', function () {
    it('should be delegated to a matching handler', function () {
        const numberHandler = sinon.stub();
        const arrayHandler = sinon.stub();

        const add = Generic.create();
        add.addHandler([isNumber, isNumber], numberHandler);
        add.addHandler([isArray, isArray], arrayHandler);

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
});

describe('[Generic] Adding a handler function', function () {
    it('should override least-recent handlers with the same predicates', function () {
        const handler1 = sinon.stub();
        const handler2 = sinon.stub();

        const add = Generic.create();

        add.addHandler([isNumber, isNumber], handler1);
        add.addHandler([isNumber, isNumber], handler2);

        add(5, 6);

        /*jshint -W030 */
        expect(handler1).to.have.not.been.called;
        expect(handler2).to.have.been.calledWith(5, 6);
    });
});
