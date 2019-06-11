<div align="center">
    <img src="https://www.dropbox.com/s/8ti7tq6b3o0mzgc/mire.png?raw=1" width="200"/>
</div>

<div align="center">
  <a href="https://travis-ci.org/iliocatallo/mire">
    <img src="https://travis-ci.org/iliocatallo/mire.svg?branch=master" alt="Travis CI"/>
  </a>
  <a href="https://coveralls.io/github/iliocatallo/mire">
    <img src="https://coveralls.io/repos/github/iliocatallo/mire/badge.svg?branch=master" alt="Coverage"/>
  </a>
  <a href="https://david-dm.org/iliocatallo/mire" title="Dependencies status">
    <img src="https://david-dm.org/iliocatallo/mire/status.svg"/>
  </a>
</div>

## Table of contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Reference](#reference)
- [Acknowledgments](#acknowledgments)

## Introduction

Mire is a JavaScript library for the creation of _generic functions_, that is, functions capable of handling different types of data. Mire functionalities are exposed via a `Generic` object, which mimics the look and feel of standard JavaScript global objects, such as `Array`. Once created, a generic function can be extended so as to handle arguments of disparate types.

```javascript
const Generic = require('mire'),
      isArray = Array.isArray;

const sum = Generic.of(function sum(x, y) {
    return x + y;
});

sum.when([isArray, isArray], function sumArrays(xs, ys) {
    return xs.map((x, i) => x + ys[i]);
});

sum(5, 6); // => 11
sum([7, 2], [3, 4]); // => [10, 6]
```

## Installation

Mire can be installed via npm with the following command:

```
npm install mire
```

## Reference

#### `Generic.create`

Creates a generic function by specifying its name, length and default handler. All parameters are optional. In the absence of a specific indication, the new generic function falls back to a default handler that always throws a `NoMatchingError`.

```javascript
const Generic = require('mire');

// name: '', length: 0, throwing handler
const sum = Generic.create();

// name: 'sum', length: 0, throwing handler
const sum = Generic.create({name: 'sum'});

// name: 'sum', length: 2, throwing handler
const sum = Generic.create({name: 'sum', length: 2});

// name: 'sum', length: 2, explicit default handler
const sum = Generic.create({name: 'sum', length: 2, defaultHandler: (x, y) => x + y});
```

#### `Generic.of`

Creates a generic function starting from a function. The new generic function has the same name and length as the input function. In other words, `Generic.of` promotes a function to a generic function in the same way `Array.of` promotes a single value to an array.

```javascript
const Generic = require('mire');

const sum = Generic.of(function sum(x, y) {
    return x + y;
});
```

#### `GenericFunction.when`

A generic function can be extended at any time in order to handle a new combination of argument types. This is achieved by specifying a handler function, together with the related dispatching predicates. Note that an existing handler may get overwritten by new handlers with the same predicates.

```javascript
const Generic = require('mire'),
      isArray = Array.isArray;

const sum = Generic.of(function sum(x, y) {
    return x + y;
});

sum.when([isArray, isArray], function sumArrays(xs, ys) {
    return xs.map((x, i) => x + ys[i]);
});
```

#### `Generic.NoMatchingError`

When no default handler is passed to `Generic.create`, Mire falls back to a default handler that always throws a `NoMatchingError` error. Errors of such a type expose a `generic` property that points to the generic function at hand, as well as an `args` property, containing the arguments that did not match.

```javascript
const Generic = require('mire');

const sum = Generic.create();
try {
    sum(5, 6);
} catch (err) {
    // err is an instance of Generic.NoMatchingError
    // err.generic points to sum
    // err.args is [5, 6]
}
```

## Acknowledgments

The amazing Mire logo was created by [@adrygariglio](https://github.com/adrygariglio). Mire adapts to JavaScript the approach to generic functions presented in MIT 6.945.
