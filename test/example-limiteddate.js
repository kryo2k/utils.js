var
utils = require('../index.js');

var // unit test stuff
chai = require('chai'),
expect = chai.expect;

///// begin example
var
PROP_DATE = '_date',
PROP_DATEMIN = '_dateMin',
PROP_DATEMAX = '_dateMax';

function LimitedDate(date, min, max) {
  this.date    = date;
  this.dateMin = min;
  this.dateMax = max;
}

Object.defineProperties(LimitedDate.prototype, {
  dateMin: {
    get: utils.getter(PROP_DATEMIN),
    set: utils.setterDate(PROP_DATEMIN, null, null, true)
  },
  dateMax: {
    get: utils.getter(PROP_DATEMAX),
    set: utils.setterDate(PROP_DATEMAX, null, null, true)
  },
  date: {
    get: utils.getter(PROP_DATE),

    // force the date to be with-in our range:
    set: utils.setterDate(PROP_DATE, null, null, false, function (date) {
      return utils.clampDate(date, this.dateMin, this.dateMax);
    })
  }
});

///// end example

var
msMinimum = Date.parse('2001-01-01 00:00:00'),
msMaximum = Date.parse('2020-01-01 00:00:00'),
limitedDate = new LimitedDate(null, msMinimum, msMaximum);

[
  Date.parse('2001-01-01 00:00:00'),
  Date.parse('2002-01-01 00:00:00'),
  Date.parse('2005-01-01 00:00:00'),
  Date.parse('2008-08-08 12:45:23.493'),
  Date.parse('2016-01-01 00:00:00'),
  Date.parse('2020-01-01 00:00:00')
].forEach(function (dateMs) {
  var shouldBeDate = (new Date(dateMs)).toISOString();

  limitedDate.date = dateMs;

  expect(limitedDate.date.toISOString()).to.equal(shouldBeDate);
});