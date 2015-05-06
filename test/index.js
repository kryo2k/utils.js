'use strict';

var
chai = require('chai'),
expect = chai.expect,
Assertion = chai.Assertion,
HashMap = require('hashmap'),
utils = require('../index');

Assertion.addMethod('nan', function (type) {
  var obj = this._obj;
  this.assert(
      typeof(obj) === 'number' && isNaN(this._obj)
    , "expected #{this} to be #{exp}"
    , "expected #{this} to not be #{exp}"
    , NaN          // expected
  );
});

Assertion.addMethod('between', function (from, to) {
  var obj = this._obj;

  // first, our instanceof check, shortcut
  new Assertion(this._obj).to.be.a('number')
    .and.is.not.nan();

  var
  rangeString = [String(from), String(to)].join(' and ');

  this.assert(
      obj >= from && obj <= to
    , "expected #{this} to be between " + rangeString
    , "expected #{this} to not be between " + rangeString
  );
});

// TFN: isNull
console.log('Testing: isNull..');

expect([ // test true conditions
  null
].map(utils.isNull))
  .to.not.contain(false);

expect([ // test false conditions
  false,
  '',
  Infinity,
  undefined,
  NaN
].map(utils.isNull))
  .to.not.contain(true);

// TFN: isUndefined
console.log('Testing: isUndefined..');

expect([ // test true conditions
  undefined
].map(utils.isUndefined))
  .to.not.contain(false);

expect([ // test false conditions
  null,
  false,
  '',
  Infinity,
  NaN
].map(utils.isUndefined))
  .to.not.contain(true);

// TFN: isNullUndefined
console.log('Testing: isNullUndefined..');

expect([ // test true conditions
  undefined,
  null
].map(utils.isNullUndefined))
  .to.not.contain(false);

expect([ // test false conditions
  false,
  '',
  Infinity,
  NaN,
  new Date
].map(utils.isNullUndefined))
  .to.not.contain(true);

// TFN: isNumber
console.log('Testing: isNumber..');

expect([ // test true conditions
  0,
  Infinity
].map(utils.isNumber))
  .to.not.contain(false);

expect([ // test false conditions
  NaN,
  null,
  undefined,
  false,
  true,
  '0'
].map(utils.isNumber))
  .to.not.contain(true);

// TFN: isBoolean
console.log('Testing: isBoolean..');

expect([ // test true conditions
  false,
  true
].map(utils.isBoolean))
  .to.not.contain(false);

expect([ // test false conditions
  NaN,
  null,
  undefined,
  '',
  0,
  1,
  Infinity
].map(utils.isBoolean))
  .to.not.contain(true);

// TFN: isString
console.log('Testing: isString..');

expect([ // test true conditions
  '',
  'hello world',
  '123'
].map(utils.isString))
  .to.not.contain(false);

expect([ // test false conditions
  NaN,
  null,
  undefined,
  false,
  true
].map(utils.isString))
  .to.not.contain(true);

// TFN: isScalar
console.log('Testing: isScalar..');

expect([ // test true conditions
  Infinity,
  '',
  0,
  false,
  true
].map(utils.isScalar))
  .to.not.contain(false);

expect([ // test false conditions
  NaN,
  null,
  undefined,
  {},
  [],
  new Date,
  new Array
].map(utils.isScalar))
  .to.not.contain(true);

// TFN: isPrimitive
console.log('Testing: isPrimitive..');

expect([ // test true conditions
  undefined,
  Infinity,
  '',
  0,
  false,
  true
].map(utils.isPrimitive))
  .to.not.contain(false);

expect([ // test false conditions
  NaN,
  null,
  {},
  [],
  new Date,
  new Array
].map(utils.isPrimitive))
  .to.not.contain(true);

// TFN: isFunction
console.log('Testing: isFunction..');

expect([ // test true conditions
  function(){}
].map(utils.isFunction))
  .to.not.contain(false);

expect([ // test false conditions
  NaN,
  null,
  undefined,
  Infinity,
  '',
  'hello',
  0,
  false,
  true
].map(utils.isFunction))
  .to.not.contain(true);

// TFN: isArray
console.log('Testing: isArray..');

expect([ // test true conditions
  [],
  new Array
].map(utils.isArray))
  .to.not.contain(false);

expect([ // test false conditions
  NaN,
  null,
  undefined,
  Infinity,
  '',
  'hello',
  0,
  false,
  true
].map(utils.isArray))
  .to.not.contain(true);

// TFN: isPlainObject
console.log('Testing: isPlainObject..');

expect([ // test true conditions
  {},
  new Object
].map(utils.isPlainObject))
  .to.not.contain(false);

expect([ // test false conditions
  new Date,
  '',
  Infinity,
  null,
  undefined
].map(utils.isPlainObject))
  .to.not.contain(true);

// TFN: isObject
console.log('Testing: isObject..');

expect([ // test true conditions
  {},
  new Object,
  new Date
].map(utils.isObject))
  .to.not.contain(false);

expect([ // test false conditions
  '',
  Infinity,
  null,
  undefined
].map(utils.isObject))
  .to.not.contain(true);

// TFN: asNumber
console.log('Testing: asNumber..');

expect(utils.asNumber(-1, 1)).to.equal(-1);
expect(utils.asNumber(0, 1)).to.equal(0);
expect(utils.asNumber({}, 1)).to.equal(1);
expect(utils.asNumber(undefined, 1)).to.equal(1);
expect(utils.asNumber(null, 1)).to.equal(1);
expect(utils.asNumber(NaN, 1)).to.equal(1);
expect(utils.asNumber(Infinity, 1)).to.equal(Infinity);

// TFN: round
console.log('Testing: round..');

expect(utils.round()).to.be.nan();
expect(utils.round(null)).to.be.nan();
expect(utils.round(NaN)).to.be.nan();
expect(utils.round(0.49)).to.equal(0);
expect(utils.round(0.51, 0)).to.equal(1);
expect(utils.round(0.54, 1)).to.equal(0.5);
expect(utils.round(0.55, 1)).to.equal(0.6);
expect(utils.round(0.56, 1)).to.equal(0.6);
expect(utils.round(0.51, 2)).to.equal(0.51);
expect(utils.round(0.511, 3)).to.equal(0.511);
expect(utils.round(0.5111, 3)).to.equal(0.511);

// TFN: clamp
console.log('Testing: clamp..');

expect(utils.clamp(NaN)).to.be.nan();
expect(utils.clamp(null)).to.be.nan();
expect(utils.clamp(false)).to.be.nan();
expect(utils.clamp(0)).to.equal(0);

expect(utils.clamp(100)).to.equal(100);
expect(utils.clamp(100, 1, 10)).to.equal(10);
expect(utils.clamp(-100, null, 0)).to.equal(-100);
expect(utils.clamp(-100, 0)).to.equal(0);
expect(utils.clamp(100, 0)).to.equal(100);

// TFN: logscale
console.log('Testing: logscale..');

expect(utils.logscale(0, 0, 2, 100, 10000)).to.equal(100);
expect(utils.logscale(1, 0, 2, 100, 10000, 0)).to.equal(1000);
expect(utils.logscale(2, 0, 2, 100, 10000)).to.equal(10000);

// TFN: logscale
console.log('Testing: linearscale..');

expect(utils.linearscale(1, 1, 5, 0, 1)).to.equal(0);
expect(utils.linearscale(2, 1, 5, 0, 1, 2)).to.equal(0.25);
expect(utils.linearscale(3, 1, 5, 0, 1, 2)).to.equal(0.5);
expect(utils.linearscale(4, 1, 5, 0, 1, 2)).to.equal(0.75);
expect(utils.linearscale(5, 1, 5, 0, 1)).to.equal(1);

// TFN: random
console.log('Testing: random..');

for(var i = 0; i < 1000; i++) {
  expect(utils.random(1, 10, 0))
    .to.be.between(1, 10);
}

// TFN: range
console.log('Testing: range..');

expect(utils.range(1, 5, 1)).to.eql([1, 2, 3, 4, 5]);
expect(utils.range(0, 6, 2)).to.eql([0, 2, 4, 6]);
expect(utils.range(0, 1, 0.25, 2)).to.eql([0, 0.25, 0.5, 0.75, 1]);

// TFN: objectHasProperty
console.log('Testing: objectHasProperty..');

expect(utils.objectHasProperty()).to.eql(false);
expect(utils.objectHasProperty({ key: true }, 'key')).to.eql(true);
expect(utils.objectHasProperty({ key: true }, 'key1')).to.eql(false);

// TFN: objectGetValue
console.log('Testing: objectGetValue..');

expect(utils.objectGetValue()).to.eql(undefined);
expect(utils.objectGetValue({ key: true }, 'key')).to.eql(true);
expect(utils.objectGetValue({ key: true }, 'key1')).to.eql(undefined);
expect(utils.objectGetValue({ key: true }, 'key1', false)).to.eql(false);

var
testObject = {};
testObject[undefined] = true;
testObject[null]      = true;

expect(utils.objectGetValue(testObject, undefined, false)).to.eql(true);
expect(utils.objectGetValue(testObject, null, false)).to.eql(true);

// TFN: objectSetValue
console.log('Testing: objectSetValue..');

expect(utils.objectSetValue()).to.eql(false);
expect(utils.objectSetValue({})).to.eql(true); // sets object[undefined] = undefined;
expect(utils.objectSetValue(testObject, undefined, false, true)).to.eql(false);
expect(utils.objectSetValue(testObject, null, false, true)).to.eql(false);

// TFN: range
console.log('Testing: objectFind..');

expect(utils.objectFind()).to.eql(undefined);
expect(utils.objectFind({}, null)).to.eql(undefined);
expect(utils.objectFind({}, null, null)).to.eql(null);
expect(utils.objectFind({}, null, false)).to.eql(false);
expect(utils.objectFind({key: true}, 'key')).to.eql(true);
expect(utils.objectFind({key: undefined}, 'key', false)).to.eql(undefined);
expect(utils.objectFind({key1: { key2: true}}, 'key1.key2')).to.eql(true);
expect(utils.objectFind({key1: { key2: true}}, ['key1','key2'])).to.eql(true);
expect(utils.objectFind({key1: { key2: { key3: true }}}, 'key1.key2.key3')).to.eql(true);
expect(utils.objectFind({key1: { key2: { key3: true }}}, ['key1','key2','key3'])).to.eql(true);
expect(utils.objectFind({key1: { key2: { key3: true }}}, 'keyX.key2.key3')).to.eql(undefined);
expect(utils.objectFind({key1: { key2: { key3: true }}}, 'key1.keyX.key3')).to.eql(undefined);
expect(utils.objectFind({key1: { key2: { key3: true }}}, 'key1.key2.keyX')).to.eql(undefined);
expect(utils.objectFind({key1: { key2: { key3: true }}}, 'keyX.key2.key3', false)).to.eql(false);
expect(utils.objectFind({key1: { key2: { key3: true }}}, 'key1.keyX.key3', false)).to.eql(false);
expect(utils.objectFind({key1: { key2: { key3: true }}}, 'key1.key2.keyX', false)).to.eql(false);
expect(utils.objectFind({'key1.key2': true}, 'key1.key2')).to.eql(undefined);
expect(utils.objectFind({'key1.key2': true}, 'key1.key2', false, false)).to.eql(true);

var
testKey1 = '1', testVal1 = 'something',
testKey2 = 1,   testVal2 = 'something else',
testMap  = new HashMap(testKey1, testVal1, testKey2, testVal2),
testMixed = { key: new HashMap(testMap, testMap) };

expect(utils.objectFind(testMap, testKey1)).to.eql(testVal1);
expect(utils.objectFind(testMap, testKey2)).to.eql(testVal2);

expect(utils.objectFind(testMixed, ['key', testMap, testKey1])).to.eql(testVal1);
expect(utils.objectFind(testMixed, ['key', testMap, testKey2])).to.eql(testVal2);

// TFN: getter
console.log('Testing: getter..');

(function (scope, prop, toBe) {
  expect(utils.getter(prop).call(scope)).to.equal(toBe);
})({ test: true }, 'test', true);

// TFN: setter
console.log('Testing: setter..');

(function (scope, prop, setTo) { // not-null setter

  // not-null test
  expect(utils.setter(prop).call(scope, setTo)).to.equal(setTo);
  expect(scope[prop]).to.equal(setTo);

  // do null test (currently, scope[prop] === setTo)
  expect(utils.setter(prop).call(scope, null)).to.equal(setTo);
  expect(scope[prop]).to.equal(setTo);

})({}, 'test', true);

(function (scope, prop) { // null-allowed setter

  expect(utils.setter(prop, true).call(scope, null)).to.equal(null);
  expect(scope[prop]).to.equal(null);

})({ test: true }, 'test');

// TFN: setterBoolean
console.log('Testing: setterBoolean..');

[true, false].forEach(function (v) { // acceptable conditions
  var prop = 'test', scope = {};
  expect(utils.setterBoolean(prop).call(scope, v)).to.equal(v);
  expect(scope[prop]).to.equal(v);
});

[null, true, false].forEach(function (v) { // acceptable conditions
  var prop = 'test', scope = {};
  expect(utils.setterBoolean(prop, true).call(scope, v)).to.equal(v);
  expect(scope[prop]).to.equal(v);
});

[null, NaN, 0, ''].forEach(function (v) { // blocked conditions
  var
  prop = 'test',
  defValue = true,
  scope = {};
  scope[prop] = defValue;
  expect(utils.setterBoolean(prop).call(scope, v)).to.equal(defValue);
  expect(scope[prop]).to.equal(defValue);
});

// TFN: setterNumber
console.log('Testing: setterNumber..');

[0, -1, 1].forEach(function (v) { // all-number conditions
  var prop = 'test', scope = {};
  expect(utils.setterNumber(prop).call(scope, v)).to.equal(v);
  expect(scope[prop]).to.equal(v);
});

[0, -1, 1, Infinity].forEach(function (v) { // all-number (including infinity) conditions
  var prop = 'test', scope = {};
  expect(utils.setterNumber(prop, null, null, null, true).call(scope, v)).to.equal(v);
  expect(scope[prop]).to.equal(v);
});

[null, NaN, Infinity, false, true, ''].forEach(function (v) { // blocked conditions
  var
  prop = 'test',
  defValue = 0,
  scope = {};
  scope[prop] = defValue;
  expect(utils.setterNumber(prop).call(scope, v)).to.equal(defValue);
  expect(scope[prop]).to.equal(defValue);
});

// TFN: setterInt
console.log('Testing: setterInt..');

[0, -1, 1].forEach(function (v) { // all-integer conditions
  var prop = 'test', scope = {};
  expect(utils.setterInt(prop).call(scope, v)).to.equal(v);
  expect(scope[prop]).to.equal(v);
});

[0, -1, 1, Infinity].forEach(function (v) { // all-number (including infinity) conditions
  var prop = 'test', scope = {};
  expect(utils.setterInt(prop, null, null, true).call(scope, v)).to.equal(v);
  expect(scope[prop]).to.equal(v);
});

[null, NaN, Infinity, false, true, ''].forEach(function (v) { // blocked conditions
  var
  prop = 'test',
  defValue = 0,
  scope = {};
  scope[prop] = defValue;
  expect(utils.setterInt(prop).call(scope, v)).to.equal(defValue);
  expect(scope[prop]).to.equal(defValue);
});

// TFN: setterString
console.log('Testing: setterString..');

['', ' ', 'hello'].forEach(function (v) { // all-string conditions
  var prop = 'test', scope = {};
  expect(utils.setterString(prop).call(scope, v)).to.equal(v);
  expect(scope[prop]).to.equal(v);
});

['', ' ', null].forEach(function (v) { // all-string conditions including null
  var prop = 'test', scope = {};
  expect(utils.setterString(prop, true).call(scope, v)).to.equal(v);
  expect(scope[prop]).to.equal(v);
});

[null, NaN, Infinity, false, true, new Date].forEach(function (v) { // blocked conditions
  var
  prop = 'test',
  defValue = 'string',
  scope = {};
  scope[prop] = defValue;
  expect(utils.setterString(prop).call(scope, v)).to.equal(defValue);
  expect(scope[prop]).to.equal(defValue);
});

// TFN: setterScalar
console.log('Testing: setterScalar..');

// TFN: setterObject
console.log('Testing: setterObject..');

// TFN: setterFunction
console.log('Testing: setterFunction..');

// test readme examples
require('./example-myvalue');
