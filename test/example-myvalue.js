var
utils = require('../index.js');

var // unit test stuff
chai = require('chai'),
expect = chai.expect;

///// begin example

var // @private
PROP_VALUE = '_value'; // Can also be a symbol. @see Symbol()

function MyValue(value) {
  this.value = value;
}

Object.defineProperties(MyValue.prototype, {
  value: { // definition of public name property. (read/write supported)

    // get the current value of PROP_VALUE (default: undefined)
    get: utils.getter(PROP_VALUE),

    // set the current value of PROP_VALUE, allow nulls.
    set: utils.setter(PROP_VALUE, true)
  }
});

///// end example

var
myValueObj = new MyValue(),
testValues = [null, undefined, '1', 1, false, {}, new Date()];

expect(myValueObj.value).to.equal(undefined);

testValues.forEach(function (tval) {
  expect(myValueObj.value = tval).to.equal(tval);
  expect(myValueObj.value).to.equal(tval);
});