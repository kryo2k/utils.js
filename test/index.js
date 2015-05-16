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

function setterTestIterator(setterFn, valueFn, debugging) {
  if(!utils.isFunction(setterFn)) {
    return utils.noop;
  }

  valueFn = utils.isFunction(valueFn) ? valueFn : utils.noopPassThru;

  var setterInterceptor = function () {
    var intercepted;
    return {
      callback: function (v)  {
        intercepted = v;
        return v;
      },
      getIntercepted: function () {
        return intercepted;
      }
    }
  }

  return function (test, index) {
    if(debugging)
      console.log('raw test (%d): %j', index, test);

    if(!utils.isArray(test) || test.length < 4) {

      if(debugging)
        console.log('invalid test format (%d), skipping.', index);

      return;
    }
    var
    defaultVal, testVal, expectVal, expectIntrVal, setterArgs = [],
    texpOffset = 0, interceptor = setterInterceptor(),
    scope = {}, prop = 'test';

    if(test.length > 4) { // use setter args (2nd+ test param, should always be an array)
      setterArgs = test.slice(1, test.length - 3);
      texpOffset = setterArgs.length;
    }

    defaultVal    = test[0];
    testVal       = test[texpOffset + 1];
    expectVal     = test[texpOffset + 2];
    expectIntrVal = test[texpOffset + 3];

    // inject prop name at the beginning of setter args.
    setterArgs.unshift(prop);

    // inject intercepter callback at the end of args.
    setterArgs.push(interceptor.callback);

    if(debugging)
      console.log('running test setup:', {
        setterArguments: setterArgs,
        defaultValue: defaultVal,
        testingValue: testVal,
        expectedValue: expectVal,
        expectInterceptValue: expectIntrVal
      });

    var
    testSetter = setterFn.apply(this, setterArgs);

    // set default value in mock scope object.
    scope[prop] = defaultVal;

    // expectations:
    expect(valueFn(testSetter.call(scope, testVal)))
      .to.equal(valueFn(expectVal));

    if(debugging)
      console.log('scope value: %j (%s)', scope[prop], valueFn(scope[prop]));

    expect(valueFn(scope[prop]))
      .to.equal(valueFn(expectVal));

    if(debugging)
      console.log('intercept value: %j (%s)', interceptor.getIntercepted(), valueFn(interceptor.getIntercepted()));

    expect(valueFn(interceptor.getIntercepted()))
      .to.equal(valueFn(expectIntrVal));
  };
}


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

// TFN: asBoolean
console.log('Testing: asBoolean..');

expect(utils.asBoolean()).to.equal(false);

[true, false].forEach(function (v) { // boolean passthru tests
  expect(utils.asBoolean(v)).to.equal(v);
});

[1].forEach(function (v) { // number -> boolean true tests
  expect(utils.asBoolean(v)).to.equal(true);
});

[0, 2, Infinity, NaN].forEach(function (v) { // number -> boolean false tests
  expect(utils.asBoolean(v)).to.equal(false);
});

['yes','true','1','on','enabled','enable'].forEach(function (v) { // string -> boolean true tests
  expect(utils.asBoolean(v)).to.equal(true);
});

['no','false','0','off','disabled','disable'].forEach(function (v) { // string -> boolean false tests
  expect(utils.asBoolean(v)).to.equal(false);
});

// TFN: asString
console.log('Testing: asString..');

expect(utils.asString()).to.equal('');
expect(utils.asString(null, 'hello')).to.equal('hello');
expect(utils.asString(undefined, 'hello')).to.equal('hello');

['1', 'true', 'hello world'].forEach(function (v) { // string passthru tests
  expect(utils.asString(v)).to.equal(v);
});

[1, Infinity, NaN, -2387].forEach(function (v) { // number -> string tests
  expect(utils.asString(v)).to.equal(String(v));
});

// TFN: asDate
console.log('Testing: asDate..');

var
now = new Date(),
nowStr;

[null, undefined, false, NaN, Infinity].forEach(function (test) { // now fallback test
  expect(utils.asDate(test, now)).to.equal(now);
});

now = new Date('2000-01-01T00:00:00.000Z');
nowStr = now.toISOString();

[ // string variations to date tests
  '2000-01-01T00:00:00.000Z',
  '01/01/2000 00:00:00.000Z',
  '2000-01-01 00:00:00.000Z',
  '2000-01-01 00:00Z'
].forEach(function (test) {
  expect(utils.asDate(test).toISOString()).to.equal(nowStr);
});

[ // number to date tests
  1234567890,
  3847837874,
  9819823747,
  9384971645,
  9182983745
].forEach(function (test) {

  now = new Date(test);
  nowStr = now.toISOString();

  expect(utils.asDate(test).toISOString()).to.equal(nowStr);
});

// TFN: dateParse
console.log('Testing: dateParse..');

[
  [null,      false],
  [undefined, false],
  [NaN,       false],
  [Infinity,  false],
  [false,     false]
].forEach(function (test) {
  expect(utils.dateParse(test[0])).to.equal(test[1]);
});

[
  [new Date(2000, 0, 1, 0, 0, 0, 0), new Date(2000, 0, 1, 0, 0, 0, 0)],
  ['2000-01-01 00:00:00.000',        new Date(2000, 0, 1, 0, 0, 0, 0)],
  [946684800000,                     new Date('2000-01-01T00:00:00.000Z')],
].forEach(function (test) {
  expect(utils.dateParse(test[0]).toISOString()).to.equal(test[1].toISOString());
});

// TFN: dateNow
console.log('Testing: dateNow..');

[ // date fallback tests
  [null,      new Date()],
  [undefined, new Date('2001-01-01T00:00:00.000Z')],
  [NaN,       new Date('2002-01-01T00:00:00.000Z')],
  [Infinity,  new Date('2003-01-01T00:00:00.000Z')],
  [false,     new Date('2004-01-01T00:00:00.000Z')]
].forEach(function (test) {
  expect(utils.dateNow(test[0], test[1])).to.equal(test[1]);
});

[ // string to date tests
  '2000-01-01T00:00:00.000Z',
  '01/01/2000 00:00:00.000Z',
  '2000-01-01 00:00:00.000Z',
  '2000-01-01 00:00Z'
].forEach(function (test) {
  now = new Date(test);
  nowStr = now.toISOString();
  expect(utils.dateNow(test).toISOString()).to.equal(nowStr);
});

[ // number to date tests
  1234567890,
  3847837874,
  9819823747,
  9384971645,
  9182983745
].forEach(function (test) {
  now = new Date(test);
  nowStr = now.toISOString();
  expect(utils.dateNow(test).toISOString()).to.equal(nowStr);
});

// TFN: dateEquals
console.log('Testing: dateEquals..');
[
  [[2000, 0, 1, 0, 0, 0, 0], [2000, 0, 1, 0, 0, 0, 0], true],
  [[2000, 0, 2, 0, 0, 0, 0], [2000, 0, 2, 0, 0, 0, 0], true],
  [[2000, 0, 3, 0, 0, 0, 0], [2000, 0, 3, 0, 0, 0, 0], true],
  [[2000, 0, 4, 0, 0, 0, 0], [2000, 0, 4, 0, 0, 0, 0], true],
  [[2000, 0, 5, 0, 0, 0, 0], [2000, 0, 5, 0, 0, 0, 0], true],
  [[2000, 0, 1, 0, 0, 0, 0], [2000, 0, 1, 0, 0, 0, 1], false],
  [[2000, 0, 2, 0, 0, 0, 0], [2000, 0, 2, 0, 0, 0, 1], false],
  [[2000, 0, 3, 0, 0, 0, 0], [2000, 0, 3, 0, 0, 0, 1], false],
  [[2000, 0, 4, 0, 0, 0, 0], [2000, 0, 4, 0, 0, 0, 1], false],
  [[2000, 0, 5, 0, 0, 0, 0], [2000, 0, 5, 0, 0, 0, 1], false]
].forEach(function (test) {
  var
  ad1 = test[0],
  ad2 = test[1],
  d1  = new Date(ad1[0], ad1[1], ad1[2], ad1[3], ad1[4], ad1[5], ad1[6]),
  d2  = new Date(ad2[0], ad2[1], ad2[2], ad2[3], ad2[4], ad2[5], ad2[6]);

  expect(utils.dateEquals(d1, d2)).to.equal(!!test[2]);
});

var
date1 = new Date(),
date2 = new Date(+date1),
date3 = new Date(date2 + 1);

[
  [date1, date1, null, true],
  [date1, date2, null, true],
  [date1, date3, null, false],
  [null,  null,  null, false],
  [undefined, undefined, null, false],
  [NaN, NaN,           date3, true],
  [Infinity, Infinity, date3, true]
].forEach(function (test) {
  expect(utils.dateEquals(test[0], test[1], test[2])).to.equal(!!test[3]);
});

// TFN: dateSetHours
console.log('Testing: dateSetHours..');

[
  [0, 0, 0, 0,      false],
  [6, 30, 59, 999,  false],
  [12, 0, 0, 0,     false],
  [18, 30, 59, 999, false],
  [23, 59, 59, 59,  false],
  [0, 0, 0, 0,      true],
  [6, 30, 59, 999,  true],
  [12, 0, 0, 0,     true],
  [18, 30, 59, 999, true],
  [23, 59, 59, 59,  true],
].forEach(function (test) {
  var
  now          = new Date(),
  hours        = test[0],
  minutes      = test[1],
  seconds      = test[2],
  milliseconds = test[3],
  useUTC       = !!test[4],
  testdate     = utils.dateSetHours(now, hours, minutes, seconds, milliseconds, useUTC);

  if(useUTC) { // set now to what we are expecting it to be (in UTC):
    now.setUTCHours(hours, minutes, seconds, milliseconds);
  }
  else { // set now to what we are expecting it to be (in Local TZ):
    now.setHours(hours, minutes, seconds, milliseconds);
  }

  // confirm result
  expect(testdate.getFullYear()).to.equal(now.getFullYear());
  expect(testdate.getMonth()).to.equal(now.getMonth());
  expect(testdate.getDate()).to.equal(now.getDate());
  expect(testdate.getMinutes()).to.equal(now.getMinutes());
  expect(testdate.getSeconds()).to.equal(now.getSeconds());
  expect(testdate.getMilliseconds()).to.equal(now.getMilliseconds());
});

// TFN: dateFloor
console.log('Testing: dateFloor..');

[
  [0, 0, 0, 0,      false],
  [6, 30, 59, 999,  false],
  [12, 0, 0, 0,     false],
  [18, 30, 59, 999, false],
  [23, 59, 59, 59,  false],
  [0, 0, 0, 0,      true],
  [6, 30, 59, 999,  true],
  [12, 0, 0, 0,     true],
  [18, 30, 59, 999, true],
  [23, 59, 59, 59,  true],
].forEach(function (test) {
  var
  fallback = new Date(),
  useUTC   = !!test[4],
  now      = utils.dateSetHours(null, test[0], test[1], test[2], test[3], useUTC, fallback),
  testdate = utils.dateFloor(now, useUTC, fallback);

  if(useUTC) { // set now to what we are expecting it to be (in UTC):
    now.setUTCHours(0, 0, 0, 0);
  }
  else { // set now to what we are expecting it to be (in Local TZ):
    now.setHours(0, 0, 0, 0);
  }

  // confirm result
  expect(testdate.getFullYear()).to.equal(now.getFullYear());
  expect(testdate.getMonth()).to.equal(now.getMonth());
  expect(testdate.getDate()).to.equal(now.getDate());
  expect(testdate.getMinutes()).to.equal(now.getMinutes());
  expect(testdate.getSeconds()).to.equal(now.getSeconds());
  expect(testdate.getMilliseconds()).to.equal(now.getMilliseconds());
});

// TFN: dateCeil
console.log('Testing: dateCeil..');

[
  [0, 0, 0, 0,      false],
  [6, 30, 59, 999,  false],
  [12, 0, 0, 0,     false],
  [18, 30, 59, 999, false],
  [23, 59, 59, 59,  false],
  [0, 0, 0, 0,      true],
  [6, 30, 59, 999,  true],
  [12, 0, 0, 0,     true],
  [18, 30, 59, 999, true],
  [23, 59, 59, 59,  true],
].forEach(function (test) {
  var
  fallback = new Date(),
  useUTC   = !!test[4],
  now      = utils.dateSetHours(null, test[0], test[1], test[2], test[3], useUTC, fallback),
  testdate = utils.dateCeil(now, useUTC, fallback);

  if(useUTC) { // set now to what we are expecting it to be (in UTC):
    now.setUTCHours(23, 59, 59, 999);
  }
  else { // set now to what we are expecting it to be (in Local TZ):
    now.setHours(23, 59, 59, 999);
  }

  // confirm result
  expect(testdate.getFullYear()).to.equal(now.getFullYear());
  expect(testdate.getMonth()).to.equal(now.getMonth());
  expect(testdate.getDate()).to.equal(now.getDate());
  expect(testdate.getMinutes()).to.equal(now.getMinutes());
  expect(testdate.getSeconds()).to.equal(now.getSeconds());
  expect(testdate.getMilliseconds()).to.equal(now.getMilliseconds());
});

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

// TFN: clampDate
console.log('Testing: clampDate..');

[
  // no boundary tests
  [new Date(2000, 0, 1, 0, 0, 0, 0),        null,                               null,                                new Date(2000, 0, 1, 0, 0, 0, 0)],

  // minimum boundary tests
  [new Date(2000, 0, 1, 0, 0, 0, 0),        new Date(2000, 0, 1, 0, 0, 0, 0),   null,                                new Date(2000, 0, 1, 0, 0, 0, 0)],
  [new Date(2001, 0, 1, 0, 0, 0, 0),        new Date(2000, 0, 1, 0, 0, 0, 0),   null,                                new Date(2001, 0, 1, 0, 0, 0, 0)],
  [new Date(1999, 11, 31, 23, 59, 59, 999), new Date(2000, 0, 1, 0, 0, 0, 0),   null,                                new Date(2000, 0, 1, 0, 0, 0, 0)],

  // maximum boundary tests
  [new Date(2000, 0, 1, 0, 0, 0, 0),        null,                               new Date(1980, 0, 1, 0, 0, 0, 0),    new Date(1980, 0, 1, 0, 0, 0, 0)],
  [new Date(2020, 0, 1, 0, 0, 0, 0),        null,                               new Date(2010, 0, 1, 0, 0, 0, 1),    new Date(2010, 0, 1, 0, 0, 0, 1)],
  [new Date(1980, 0, 1, 0, 0, 0, 0),        null,                               new Date(2000, 0, 1, 0, 0, 0, 0),    new Date(1980, 0, 1, 0, 0, 0, 0)],

  // maximum and minimum boundary tests
  [new Date(1970, 0, 1, 0, 0, 0, 0),        new Date(1980, 0, 1, 0, 0, 0, 0),   new Date(1980, 0, 1, 5, 0, 0, 0),    new Date(1980, 0, 1, 0, 0, 0, 0)],
  [new Date(1980, 0, 1, 3, 0, 0, 0),        new Date(1980, 0, 1, 0, 0, 0, 0),   new Date(1980, 0, 1, 5, 0, 0, 0),    new Date(1980, 0, 1, 3, 0, 0, 0)],
  [new Date(1990, 0, 1, 0, 0, 0, 0),        new Date(1980, 0, 1, 0, 0, 0, 0),   new Date(1980, 0, 1, 5, 0, 0, 0),    new Date(1980, 0, 1, 5, 0, 0, 0)]

].forEach(function (test) {
  expect(utils.clampDate(test[0], test[1], test[2]).toISOString()).to.equal(test[3].toISOString());
});

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

[
// defaultVal allowNull testVal     expectVal   expectIntrVal
  [null,      false,    null,       null,       undefined],
  [null,      true,     null,       null,       null],
  [0,         false,    null,       0,          undefined],
  [0,         false,    1,          1,          1],
  [null,      false,    Infinity,   Infinity,   Infinity],
  [null,      false,    utils.noop, utils.noop, utils.noop],
  [null,      false,    'x',        'x',        'x']
].forEach(setterTestIterator(utils.setter));

// TFN: setterBoolean
console.log('Testing: setterBoolean..');

[
// defaultVal allowNull testVal     expectVal expectIntrVal
  [null,      false,    null,       null,     undefined],
  [null,      true,     null,       null,     null],
  [false,     false,    null,       false,    undefined],
  [true,      false,    null,       true,     undefined],
  [false,     false,    true,       true,     true],
  [true,      false,    false,      false,    false],
  [null,      false,    NaN,        null,     undefined],
  [null,      false,    Infinity,   null,     undefined],
  [null,      false,    new Date,   null,     undefined],
  [null,      false,    '1',        null,     undefined],
  [null,      false,    '0',        null,     undefined],
  [null,      false,    '',         null,     undefined],
].forEach(setterTestIterator(utils.setterBoolean));

// TFN: setterNumber
console.log('Testing: setterNumber..');

[
// defaultVal min   max   precision allowInfinite allowNull   testVal       expectVal    expectIntrVal
  // boundary edge testing
  [1,         0,    1,    0,        false,        false,      0,            0,           0],
  [0,         0,    1,    0,        false,        false,      1,            1,           1],
  [1,         0,    1,    0,        false,        false,      0,            0,           0],

  // boundary overlap testing
  [1,         0,    1,    0,        false,        false,      -1,           0,           0],
  [1,         0,    1,    0,        true,         false,      -Infinity,    0,           0],
  [1,         0,    1,    0,        false,        false,      2,            1,           1],
  [1,         0,    1,    0,        true,         false,      Infinity,     1,           1],

  // precision testing
  [0,         0,    1,    0,        false,        false,      0.4,          0,           0],
  [0,         0,    1,    0,        false,        false,      0.5,          1,           1],
  [0,         0,    1,    1,        false,        false,      0.5,          0.5,         0.5],
  [0,         0,    1,    2,        false,        false,      0.05,         0.05,        0.05],
  [0,         0,    1,    3,        false,        false,      0.005,        0.005,       0.005],
  [0,         0,    1,    4,        false,        false,      0.0005,       0.0005,      0.0005],
  [0,         0,    1,    5,        false,        false,      0.00005,      0.00005,     0.00005],
  [0,         0,    1,    6,        false,        false,      0.000005,     0.000005,    0.000005],
  [0,         0,    1,    7,        false,        false,      0.0000005,    0.0000005,   0.0000005],
  [0,         0,    1,    8,        false,        false,      0.00000005,   0.00000005,  0.00000005],
  [0,         0,    1,    9,        false,        false,      0.000000005,  0.000000005, 0.000000005],

  // normal input (no clamping)
  [0,         null, null, 0,        false,        false,      100,          100,         100],
  [0,         null, null, 0,        false,        false,      -100,         -100,        -100],
  [0,         null, null, 0,        true,         false,      Infinity,     Infinity,    Infinity],
  [null,      null, null, 0,        false,        true,       null,         null,        null],

  // blocking  input tests
  [0,         null, null, 0,        false,        false,      Infinity,     0,           undefined],
  [0,         null, null, 0,        false,        false,      NaN,          0,           undefined],
  [0,         null, null, 0,        false,        false,      false,        0,           undefined],
  [null,      null, null, 0,        false,        false,      null,         null,        undefined]
].forEach(setterTestIterator(utils.setterNumber));

// TFN: setterInt
console.log('Testing: setterInt..');

[
// defaultVal min   max   allowInfinite allowNull   testVal       expectVal    expectIntrVal
  [1,         0,    1,    false,        false,      0,            0,           0],
  [0,         0,    1,    false,        false,      1,            1,           1],
  [0,         0,    1,    false,        false,      0.4,          0,           0],
  [0,         0,    1,    false,        false,      0.5,          1,           1],
  [0,         null, null, false,        false,      100,          100,         100],
  [0,         null, null, false,        false,      -100,         -100,        -100],
  [0,         null, null, false,        false,      Infinity,     0,           undefined],
  [0,         null, null, false,        false,      NaN,          0,           undefined],
  [0,         null, null, false,        false,      false,        0,           undefined],
  [0,         null, null, true,         false,      Infinity,     Infinity,    Infinity],
  [null,      null, null, false,        false,      null,         null,        undefined],
  [null,      null, null, false,        true,       null,         null,        null],
].forEach(setterTestIterator(utils.setterInt));

// TFN: setterString
console.log('Testing: setterString..');

[
// defaultVal allowNull testVal     expectVal expectIntrVal
  ['',        false,    null,       '',       undefined],
  [null,      false,    null,       null,     undefined],
  ['',        true,     null,       null,     null],
  ['',        true,     NaN,        '',       undefined],
  ['',        true,     Infinity,   '',       undefined],
  ['',        true,     false,      '',       undefined],
  ['',        true,     true,       '',       undefined],
  ['',        true,     new Date(), '',       undefined],
  ['hello',   false,    'hi',       'hi',     'hi']
].forEach(setterTestIterator(utils.setterString));

// TFN: setterScalar
console.log('Testing: setterScalar..');

[
// defaultVal allowNull testVal     expectVal expectIntrVal
  [1,         false,    null,       1,        undefined],
  [null,      false,    null,       null,     undefined],
  [1,         true,     null,       null,     null],
  [1,         true,     new Date(), 1,        undefined],
  ['hello',   false,    'hi',       'hi',     'hi'],
  [false,     false,    null,       false,    undefined],
  [false,     false,    true,       true,     true],
  [null,      false,    false,      false,    false]
].forEach(setterTestIterator(utils.setterScalar));

// TFN: setterObject
console.log('Testing: setterObject..');

var
MOCK_SO_1 = {},
MOCK_SO_2 = {},
MOCK_SO_3 = { experimental: true },
MOCK_SO_4 = new Date;

[
// defaultVal instanceCheck allowNull testVal    expectVal  expectIntrVal
  [MOCK_SO_1, null,         false,    null,      MOCK_SO_1, undefined],
  [null,      null,         false,    null,      null,      undefined],
  [MOCK_SO_1, null,         true,     null,      null,      null],
  [MOCK_SO_1, Object,       false,    MOCK_SO_2, MOCK_SO_2, MOCK_SO_2],
  [MOCK_SO_1, Date,         false,    MOCK_SO_3, MOCK_SO_1, undefined],
  [MOCK_SO_1, Number,       false,    Infinity,  MOCK_SO_1, undefined],
  [MOCK_SO_1, Number,       false,    NaN,       MOCK_SO_1, undefined],
  [MOCK_SO_1, Date,         false,    MOCK_SO_4, MOCK_SO_4, MOCK_SO_4]
].forEach(setterTestIterator(utils.setterObject));

// TFN: setterPlainObject
console.log('Testing: setterPlainObject..');

var
MOCK_SPO_1 = {},
MOCK_SPO_2 = {},
MOCK_SPO_3 = { experimental: true },
MOCK_SPO_4 = new Date;

[
// defaultVal  allowNull testVal     expectVal   expectIntrVal
  [MOCK_SPO_1, false,    null,       MOCK_SPO_1, undefined],
  [null,       false,    null,       null,       undefined],
  [MOCK_SPO_1, true,     null,       null,       null],
  [MOCK_SPO_1, false,    MOCK_SPO_2, MOCK_SPO_2, MOCK_SPO_2],
  [MOCK_SPO_1, false,    MOCK_SPO_3, MOCK_SPO_3, MOCK_SPO_3],
  [MOCK_SPO_1, false,    Infinity,   MOCK_SPO_1, undefined],
  [MOCK_SPO_1, false,    NaN,        MOCK_SPO_1, undefined],
  [MOCK_SPO_1, false,    MOCK_SPO_4, MOCK_SPO_1, undefined]
].forEach(setterTestIterator(utils.setterPlainObject));

// TFN: setterFunction
console.log('Testing: setterFunction..');

[
// defaultVal  allowNull testVal             expectVal           expectIntrVal
  [utils.noop, false,    null,               utils.noop,         undefined],
  [null,       false,    null,               null,               undefined],
  [utils.noop, false,    utils.noopPassThru, utils.noopPassThru, utils.noopPassThru],
  [utils.noop, true,     null,               null,               null],
  [utils.noop, false,    null,               utils.noop,         undefined],
  [utils.noop, false,    Infinity,           utils.noop,         undefined],
  [utils.noop, false,    Date,               Date,               Date],
  [utils.noop, false,    Array,              Array,              Array],
  [utils.noop, false,    Object,             Object,             Object]
].forEach(setterTestIterator(utils.setterFunction));

// TFN: setterEnum
console.log('Testing: setterEnum..');

[
// defaultVal  enumerables        allowNull   testVal      expectVal  expectIntrVal
  [null,       [1, 2, 3],         false,      1,           1,         1],
  [null,       [1, 2, 3],         true,       null,        null,      null],
  [1,          [1, 2, 3],         false,      null,        1,         undefined],
  [null,       [true, false],     false,      false,       false,     false],
  [null,       [true, false],     false,      NaN,         null,      undefined],
  [null,       [true, false],     false,      Infinity,    null,      undefined],
  [false,      [true, false],     false,      Infinity,    false,     undefined],
  [true,       [true, false],     false,      Infinity,    true,      undefined]
].forEach(setterTestIterator(utils.setterEnum));

// TFN: setterDate
console.log('Testing: setterDate..');

var
MOCK_SD_BS = new Date(2000,  0,  1,  0,  0,  0,   0),
MOCK_SD_BE = new Date(2000, 11, 31, 23, 59, 59, 999),
MOCK_SD_D1 = new Date(2000,  0,  1,  0,  0,  0,   1),
MOCK_SD_D2 = new Date(2000,  0,  1, 23, 59, 59, 998),
MOCK_SD_D3 = new Date(1999, 11, 31, 23, 59, 59, 999),
MOCK_SD_D4 = new Date(2001,  0,  1,  0,  0,  0,   0),
MOCK_SD_D5 = new Date(2000,  6, 12, 12, 15, 23, 347),
MOCK_SD_S1 = '2000-01-01 00:00:00.001',
MOCK_SD_S2 = '2000-01-01 23:59:59.998',
MOCK_SD_S3 = '1999-12-31 23:59:59.999',
MOCK_SD_S4 = '2001-01-01 00:00:00.000',
MOCK_SD_S5 = '2000-07-12 12:15:23.347';

[
// defaultVal  min         max         allowNull testVal     expectVal   expectIntrVal
  [MOCK_SD_D1, null,       null,       false,    null,       MOCK_SD_D1, undefined],
  [MOCK_SD_D1, null,       null,       true,     null,       null,       null],
  [null,       null,       null,       false,    null,       null,       undefined],
  [null,       null,       null,       false,    false,      null,       undefined],
  [null,       null,       null,       false,    true,       null,       undefined],
  [null,       null,       null,       false,    Infinity,   null,       undefined],
  [null,       null,       null,       false,    NaN,        null,       undefined],
  [null,       MOCK_SD_BS, null,       false,    MOCK_SD_BS, MOCK_SD_BS, MOCK_SD_BS],
  [null,       null,       MOCK_SD_BE, false,    MOCK_SD_BE, MOCK_SD_BE, MOCK_SD_BE],
  [null,       MOCK_SD_BS, MOCK_SD_BE, false,    MOCK_SD_D1, MOCK_SD_D1, MOCK_SD_D1],
  [null,       MOCK_SD_BS, MOCK_SD_BE, false,    MOCK_SD_S1, MOCK_SD_D1, MOCK_SD_D1],
  [null,       MOCK_SD_BS, MOCK_SD_BE, false,    MOCK_SD_D2, MOCK_SD_D2, MOCK_SD_D2],
  [null,       MOCK_SD_BS, MOCK_SD_BE, false,    MOCK_SD_S2, MOCK_SD_D2, MOCK_SD_D2],
  [null,       MOCK_SD_BS, MOCK_SD_BE, false,    MOCK_SD_D5, MOCK_SD_D5, MOCK_SD_D5],
  [null,       MOCK_SD_BS, MOCK_SD_BE, false,    MOCK_SD_S5, MOCK_SD_D5, MOCK_SD_D5],
  [null,       MOCK_SD_BS, MOCK_SD_BE, false,    MOCK_SD_D3, MOCK_SD_BS, MOCK_SD_BS],
  [null,       MOCK_SD_BS, MOCK_SD_BE, false,    MOCK_SD_S3, MOCK_SD_BS, MOCK_SD_BS],
  [null,       MOCK_SD_BS, MOCK_SD_BE, false,    MOCK_SD_S4, MOCK_SD_BE, MOCK_SD_BE],
  [null,       MOCK_SD_BS, MOCK_SD_BE, false,    MOCK_SD_S4, MOCK_SD_BE, MOCK_SD_BE]
].forEach(setterTestIterator(utils.setterDate, function (v) {
  if(!utils.isDate(v)) return v;
  return v.toISOString();
}));

// test readme examples
console.log('Testing: Example (MyValue)..');
require('./example-myvalue');

console.log('Testing: Example (LimitedDate)..');
require('./example-limiteddate');