/*jshint node: true, esnext: true */
/*global describe, before, beforeEach, it */
'use strict';

const chai          = require('chai'),
      sinon         = require('sinon'),
      Dispatcher    = require('../lib/dispatcher'),
      {expect}      = chai;

chai.use(require('sinon-chai'));

describe('[Dispatcher] Setting a handler function', function () {
    it('should be delegated to the underlying trie', function () {
        const trie = {
            setValue: sinon.stub()
        };

        const dispatcher = new Dispatcher();
        dispatcher._trie = trie;

        dispatcher.setHandler(['pred1', 'pred2'], 'handler');
        expect(trie.setValue).to.have.been.calledWith(['pred1', 'pred2'], 'handler');
    });
});

describe('[Dispatcher] Getting a handler function', function () {
    it('should be delegated to the underlying trie', function () {
        const trie = {
            getValue: sinon.stub()
        };

        const dispatcher = new Dispatcher();
        dispatcher._trie = trie;

        dispatcher.getHandler(['arg1', 'arg2']);
        expect(trie.getValue).to.have.been.calledWith(['arg1', 'arg2']);
    });
});
