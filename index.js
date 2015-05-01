'use strict';

var
noop = function () {},
noopPassThru = function (v) { return v; };

function isNull(v) {
  return v === null;
}

function isUndefined(v) {
  return v === undefined;
}

function isString(v) {
  return typeof(v) === 'string';
}

function isBoolean(v) {
  return typeof(v) === 'boolean';
}

function isNumber(v) {
  return !isNaN(v) && typeof(v) === 'number';
}

function isScalar(v) {
  return !isNull(v) && (isString(v) || isNumber(v) || isBoolean(v));
}

function isPrimitive(v) {
  return !isNull(v) && (isString(v) || isNumber(v) || isBoolean(v) || isUndefined(v));
}

function isFunction(v) {
  return typeof(v) === 'function';
}

function isArray(v) {
  return Array.isArray(v);
}

function isPlainObject(v) { // only matches {} not new (Date|Buffer|Array...)
  return Object.prototype.toString.call(v) === '[object Object]';
}

function isObject(v) { // matches all types of objects
  return !isNull(v) && typeof(v) === 'object';
}

function asNumber(v, defaultVal) {
  defaultVal = isNumber(defaultVal) ? defaultVal : 0;

  if ((v === null || isUndefined(v))) { return defaultVal; }
  if (isNumber(v)) { return v; }

  var n = parseFloat(v);
  if (isNaN(n)) { return defaultVal; }
  return n;
}

function logZero(v, changeTo) {
  if(!isNumber(v)) { return NaN; }
  if(!isNumber(changeTo)) {
    changeTo = 0.000001;
  }

  return v === 0 ? changeTo : v;
}

function round (v, precision) {
  if(!isNumber(v)) { return NaN; }

  precision = Math.abs(Math.round(isNaN(precision) ? 0 : precision));
  var f = Math.pow(10, precision);
  v = Math.round(v * f) / f;
  return v;
}

function clamp (v, min, max, precision) {
  if (!isNumber(v)) { return NaN; }
  if (isNumber(min)) { v = Math.max(v, min); }
  if (isNumber(max)) { v = Math.min(v, max); }
  if (isNumber(precision)) { v = round(v, precision); }
  return v;
}

function logscale(n, nMin, nMax, vMin, vMax, precision) {

  n    = asNumber(n);
  nMin = asNumber(nMin);
  nMax = asNumber(nMax, 1);
  vMin = asNumber(vMin);
  vMax = asNumber(vMax, 1);

  // clamp the original number between range:
  n = clamp(n, nMin, nMax, precision);

  // prevent javascript weirdness around boundaries
  if(n === nMin) return vMin;
  if(n === nMax) return vMax;

  var
  lmin = Math.log(vMin),
  lmax = Math.log(vMax),
  scale = (lmax-lmin) / (nMax-nMin),
  v = Math.exp(lmin + (scale * (n-nMin)));

  // ensure we never exceed boundaries
  // (also handles rounding if precision is provided):
  return clamp(v, vMin, vMax, precision);
}

function linearscale(n, nMin, nMax, vMin, vMax, precision) {

  n    = asNumber(n);
  nMin = asNumber(nMin);
  nMax = asNumber(nMax, 1);
  vMin = asNumber(vMin);
  vMax = asNumber(vMax, 1);

  // clamp the original number between range:
  n = clamp(n, nMin, nMax, precision);

  // prevent javascript weirdness around boundaries
  if(n === nMin) return vMin;
  if(n === nMax) return vMax;

  var
  scale = (vMax - vMin) / (nMax - nMin),
  v = vMin + (scale * (n - nMin));

  // ensure we never exceed boundaries
  // (also handles rounding if precision is provided):
  return clamp(v, vMin, vMax, precision);
}

function random(min, max, precision) {
  min = asNumber(min, 0);
  max = asNumber(max, 1);

  var
  v = min + (Math.random() * (max - min));

  if (isNumber(precision)) {
    v = round(v, precision);
  }

  return v;
}

function range(from, to, step, precision) {
  var
  arr = [];

  if(!isNumber(from)) {
    return arr;
  }

  if(!isNumber(to)) {
    arr.push(from);
    return arr;
  }

  var
  min = Math.min(from, to),
  max = Math.max(from, to);

  step = isNumber(step) ? Math.abs(step) : 1;

  if(!isNumber(precision)) {
    precision = 0;
  }

  while(min <= max) {
    arr.push(min);
    min = round(min + step, precision);
  }

  return arr;
}

function getter(prop, cb) {
  cb = cb || noopPassThru;
  return function () {
    return cb.call(this, this[prop]);
  };
}

function setter(prop, allowNull, cb) {
  cb = cb || noopPassThru;
  return function (v) {
    if(!allowNull && isNull(v)) {
      return this[prop];
    }

    this[prop] = cb.call(this, v);

    return this[prop];
  };
}

function setterBoolean(prop, allowNull, cb) { // strictly set booleans
  var msetter = setter(prop, allowNull, cb);
  return function (v) {
    if(allowNull && isNull(v)) {
      return msetter.call(this, v);
    }

    if(isBoolean(v)) {
      return msetter.call(this, v);
    }

    return this[prop];
  };
}

function setterNumber(prop, min, max, precision, allowInfinite, allowNull, cb) {
  var msetter = setter(prop, allowNull, cb);
  return function (v) {
    if(allowNull && isNull(v)) {
      return msetter.call(this, v);
    }

    if(!allowInfinite && !isFinite(v)) {
      return this[prop];
    }

    if(isNumber(v)) {
      return msetter.call(this, clamp(v, min, max, precision));
    }

    return this[prop];
  };
}

function setterInt(prop, min, max, allowInfinite, allowNull, cb) { // strictly set integers (rounds floats to zero precision)
  return setterNumber(prop, min, max, 0, allowInfinite, allowNull, cb);
}

function setterString(prop, allowNull, cb) {
  var msetter = setter(prop, allowNull, cb);
  return function (v) {
    if(allowNull && isNull(v)) {
      return msetter.call(this, v);
    }

    if(isString(v)) {
      return msetter.call(this, v);
    }

    return this[prop];
  };
}

function setterScalar(prop, allowNull, cb) {
  var msetter = setter(prop, allowNull, cb);
  return function (v) {
    if(allowNull && isNull(v)) {
      return msetter.call(this, v);
    }

    if(isScalar(v)) {
      return msetter.call(this, v);
    }

    return this[prop];
  };
}

function setterObject(prop, instanceOf, allowNull, cb) {
  var msetter = setter(prop, allowNull, cb);
  return function (v) { instanceOf
    if(allowNull && isNull(v)) {
      return msetter.call(this, v);
    }

    if(isObject(v)) {
      if(isFunction(instanceOf) && !v instanceof instanceOf) { // check constructor
        return this[prop];
      }

      return msetter.call(this, v);
    }

    return this[prop];
  };
}

function setterFunction(prop, allowNull, cb) {
  var msetter = setter(prop, allowNull, cb);
  return function (v) {
    if(allowNull && isNull(v)) {
      return msetter.call(this, v);
    }

    if(isFunction(v)) {
      return msetter.call(this, v);
    }

    return this[prop];
  };
}

module.exports = {
  noop: noop,
  noopPassThru: noopPassThru,
  isNull: isNull,
  isUndefined: isUndefined,
  isNumber: isNumber,
  isBoolean: isBoolean,
  isString: isString,
  isScalar: isScalar,
  isFunction: isFunction,
  isArray: isArray,
  isPrimitive: isPrimitive,
  isPlainObject: isPlainObject,
  isObject: isObject,
  asNumber: asNumber,
  round: round,
  clamp: clamp,
  logscale: logscale,
  linearscale: linearscale,
  random: random,
  range: range,
  getter: getter,
  setter: setter,
  setterBoolean: setterBoolean,
  setterNumber: setterNumber,
  setterInt: setterInt,
  setterString: setterString,
  setterScalar: setterScalar,
  setterObject: setterObject,
  setterFunction: setterFunction
};