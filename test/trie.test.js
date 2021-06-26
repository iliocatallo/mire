/* jshint node: true, esversion: 6 */
/* global describe, it */
'use strict';

const chai     = require('chai'),
      Trie     = require('../lib/trie'),
      {expect} = chai;

describe('[Trie] Getting a value', function () {

    it('succeeds if the value exists and the input features match', function () {
        const trie = new Trie();
        const pred1 = a => a === 'feature1';
        const pred2 = b => b === 'feature2';

        trie.setValue([pred1, pred2], 'pred1-pred2-value');

        expect(trie.getValue(['feature1', 'feature2'])).to.equal('pred1-pred2-value');
    });

    it('results in undefined if the value does not exist', function () {
        const trie = new Trie();
        const pred1 = a => a === 'feature1';
        const pred2 = b => b === 'feature2';

        trie.setValue([pred1, pred2], 'pred1-pred2-value');

        expect(trie.getValue(['feature1'])).to.be.undefined;
        expect(trie.getValue(['feature1', 'feature2', 'feature3'])).to.be.undefined;
    });

    it('results in undefined if the input features are not satisfied', function () {
        const trie = new Trie();
        const pred1 = a => true
        const pred2 = b => false

        trie.setValue([pred1, pred2], 'pred1-pred2-value');

        expect(trie.getValue(['feature1', 'feature2'])).to.be.undefined;
    });
});

describe('[Trie] Setting a value', function () {

    it('overrides previous values associated with the same predicates', function () {
        const trie = new Trie();
        const pred1 = a => a === 'feature1';
        const pred2 = b => b === 'feature2';

        trie.setValue([pred1, pred2], 'pred1-pred2-value');
        trie.setValue([pred1, pred2], 'new-pred1-pred2-value');

        expect(trie.getValue(['feature1', 'feature2'])).to.equal('new-pred1-pred2-value');
    });
});
