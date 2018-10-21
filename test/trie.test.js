/*jshint node: true, esnext: true */
/*global describe, before, beforeEach, it */
'use strict';

const chai     = require('chai'),
      sinon    = require('sinon'),
      Trie     = require('../lib/trie'),
      {expect} = chai;

chai.use(require('sinon-chai'));

describe('[Trie] Getting a value', function () {

    it('should succeed if the value exists and the input features match', function () {
        const pred1 = sinon.stub().returns(true);
        const pred2 = sinon.stub().returns(true);

        const trie = new Trie();
        trie.setValue([pred1, pred2], 'pred1-pred2-value');

        /*jshint -W030 */
        expect(trie.getValue(['feature1', 'feature2'])).to.equal('pred1-pred2-value');
        expect(pred1).to.have.been.calledOnce;
        expect(pred2).to.have.been.calledOnce;
        expect(pred2).to.have.been.calledAfter(pred1);
    });

    it('should result in undefined if the value does not exist', function () {
        const pred1 = sinon.stub().returns(true);
        const pred2 = sinon.stub().returns(true);

        const trie = new Trie();
        trie.setValue([pred1, pred2], 'pred1-pred2-value');

        /*jshint -W030 */
        expect(trie.getValue(['feature1', 'feature2', 'feature3'])).to.be.undefined;
        expect(pred1).to.have.been.calledOnce;
        expect(pred2).to.have.been.calledOnce;
        expect(pred2).to.have.been.calledAfter(pred1);
    });

    it('should result in undefined if the input features are not satisfied', function () {
        const pred1 = sinon.stub().returns(true);
        const pred2 = sinon.stub().returns(false);

        const trie = new Trie();
        trie.setValue([pred1, pred2], 'pred1-pred2-value');

        /*jshint -W030 */
        expect(trie.getValue(['feature1', 'feature2'])).to.be.undefined;
        expect(pred1).to.have.been.calledOnce;
        expect(pred2).to.have.been.calledOnce;
        expect(pred2).to.have.been.calledAfter(pred1);
    });
});

describe('[Trie] Setting a value', function () {

    it('should throw an Error if the first argument is not an array of predicates', function () {
        const notAPred = 'not-a-pred';

        const trie = new Trie();
        expect(() => trie.setValue([notAPred], 'not-a-pred-value')).to.throw();
    });

    it('should override previous values associated with the same predicates', function () {
        const pred1 = sinon.stub().returns(true);
        const pred2 = sinon.stub().returns(true);

        const trie = new Trie();
        trie.setValue([pred1, pred2], 'pred1-pred2-value');
        trie.setValue([pred1, pred2], 'new-pred1-pred2-value');

        expect(trie.getValue(['feature1', 'feature2'])).to.equal('new-pred1-pred2-value');
    });
});
