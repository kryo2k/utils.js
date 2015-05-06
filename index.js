/**
** Utilities.js
** @author Hans Doller <kryo2k@gmail.com>
**/
;(function (undefined) {'use strict';

  var
  noop = function () {},
  noopPassThru = function (v) { return v; };

  function isNull(v) {
    return v === null;
  }

  function isUndefined(v) {
    return v === undefined;
  }

  function isNullUndefined(v) {
    return isNull(v) || isUndefined(v);
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

  function isObjectType(str) {
    return str === 'object';
  }

  function isObject(v) { // matches all types of objects
    return !isNull(v) && isObjectType(typeof v);
  }

  function isDate(v) { // matches only Date object instances
    return isObject(v) && v instanceof Date;
  }

  function asNumber(v, defaultVal) {
    defaultVal = isNumber(defaultVal) ? defaultVal : 0;

    if ((v === null || isUndefined(v))) { return defaultVal; }
    if (isNumber(v)) { return v; }

    var n = parseFloat(v);
    if (isNaN(n)) { return defaultVal; }
    return n;
  }

  function asBoolean(v, defaultVal) {
    defaultVal = isBoolean(defaultVal) ? defaultVal : false;

    if(isNullUndefined(v)) {
      return defaultVal;
    }

    if(isBoolean(v)) { // return original value if is a boolean
      return v;
    }
    else if(isNumber(v)) { // return true if equal to 1
      return v === 1;
    }
    else if(isString(v)) { // return true  if matches one of the below
      return ['yes','true','1','on','enabled','enable'].indexOf(v.toLowerCase()) > -1;
    }

    return defaultVal;
  }

  function asString(v, defaultVal) {
    defaultVal = isString(defaultVal) ? defaultVal : '';

    if(isNullUndefined(v)) {
      return defaultVal;
    }

    if(isString(v)) { // return original value if is a string
      return v;
    }

    return String(v);
  }

  function asDate(v, defaultVal) {
    if(isDate(v)) {
      return v;
    }

    return dateNow(v, defaultVal);
  }

  function dateNow(now, fallback) {
    fallback = isDate(fallback) ? fallback : new Date();

    if((isNumber(now) && isFinite(now)) || isString(now)) {
      var sane = new Date(now);

      if(isDate(sane)) {
        return sane;
      }
    }

    return isDate(now)
      ? new Date(+now) // send back a copy, if already a date object!
      : fallback;      // send back fallback
  }

  function dateEquals(d1, d2, fallback) {
    if(isNullUndefined(d1) || isNullUndefined(d2)) {
      return false;
    }

    d1 = dateNow(d1, fallback);
    d2 = dateNow(d2, fallback);

    // compare the dates by the elements that matter.
    return d1.getFullYear()     === d2.getFullYear()
        && d1.getMonth()        === d2.getMonth()
        && d1.getDate()         === d2.getDate()
        && d1.getMinutes()      === d2.getMinutes()
        && d1.getSeconds()      === d2.getSeconds()
        && d1.getMilliseconds() === d2.getMilliseconds();
  }

  function dateSetHours(now, hours, minutes, seconds, milliseconds, useUTC, fallback) {
    now = dateNow(now, fallback);

    (!!useUTC ? now.setUTCHours : now.setHours)
      .call(now, hours, minutes, seconds, milliseconds);

    return now;
  }

  function dateFloor(now, useUTC, fallback) {
    return dateSetHours(now, 0, 0, 0, 0, useUTC, fallback);
  }

  function dateCeil(now, useUTC, fallback) {
    return dateSetHours(now, 23, 59, 59, 999, useUTC, fallback);
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

  function objectHasProperty(obj, property) {
    if(!isObject(obj)) {
      return false;
    }

    if(isFunction(obj.has)) {
      var hasReturned = obj.has(property);
      return isBoolean(hasReturned)
        // we got a boolean back
        ? hasReturned
        // fall back to native
        : obj.hasOwnProperty(property);
    }

    return obj.hasOwnProperty(property);
  }

  function objectGetValue(obj, property, defaultValue) {
    if(!objectHasProperty(obj, property)) {
      return defaultValue;
    }

    if(isFunction(obj.get)) {
      return obj.get(property);
    }

    return obj[property];
  }

  function objectSetValue(obj, property, value, rejectOverride) {
    if(!isObject(obj) || (!!rejectOverride && objectHasProperty(obj, property))) {
      return false;
    }

    if(isFunction(obj.set)) {
      obj.set(property, value);
    }
    else {
      obj[property] = value;
    }

    return true;
  }

  function objectFind(obj, search, defaultValue, searchDelimiter) {
    if(!isObject(obj)) {
      return defaultValue;
    }

    searchDelimiter = (searchDelimiter === undefined || searchDelimiter === true)
      ? '.'
      : searchDelimiter;

    var
    applyValue = defaultValue,
    deepSearch = null;

    if(isString(search) && isString(searchDelimiter) && search.indexOf(searchDelimiter) > -1) {
      deepSearch = search.split(searchDelimiter);
    }
    else if(isArray(search)) {
      deepSearch = search;
    }
    else if(isObject(search)) { // searching by object is not supported
      return defaultValue;
    }

    if(!isNull(deepSearch)) { // deep search property path array
      var
      nsTotal = deepSearch.length,
      nsTotalIndexes = nsTotal - 1,
      index = 0, root = obj;

      if(nsTotal === 0) {
        return defaultValue;
      }

      for(;;) { // loop thru path of properties
        search = deepSearch[index];
        root = objectGetValue(root, search, applyValue);

        if(index === nsTotalIndexes) { // end of query check:
          applyValue = root;
          break;
        }

        if(isObject(root)) { // next iteration
          index++;
          continue;
        }
        else // invalid type of deep searchable.
          break;
      }
    }
    else { // treat search as a property
      applyValue = objectGetValue(obj, search, applyValue);
    }

    return applyValue;
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
    return setter(prop, allowNull, function (v) {
      if(isBoolean(v) || (!!allowNull && isNull(v))) {
        return v;
      }

      return this[prop];
    });
  }

  function setterNumber(prop, min, max, precision, allowInfinite, allowNull, cb) {
    return setter(prop, allowNull, function (v) {
      if(allowNull && isNull(v)) {
        return v;
      }

      if(!allowInfinite && !isFinite(v)) {
        return this[prop];
      }

      if(isNumber(v)) {
        return clamp(v, min, max, precision);
      }

      return this[prop];
    });
  }

  function setterInt(prop, min, max, allowInfinite, allowNull, cb) { // strictly set integers (rounds floats to zero precision)
    return setterNumber(prop, min, max, 0, allowInfinite, allowNull, cb);
  }

  function setterString(prop, allowNull, cb) {
    return setter(prop, allowNull, function (v) {
      if(isString(v) || (allowNull && isNull(v))) {
        return v;
      }

      return this[prop];
    });
  }

  function setterScalar(prop, allowNull, cb) {
    return setter(prop, allowNull, function (v) {
      if(isScalar(v) || (allowNull && isNull(v))) {
        return v;
      }

      return this[prop];
    });
  }

  function setterFunction(prop, allowNull, cb) {
    return setter(prop, allowNull, function (v) {
      if(isFunction(v) || (allowNull && isNull(v))) {
        return v;
      }

      return this[prop];
    });
  }

  function setterObject(prop, instanceCheck, allowNull, cb) {
    return setter(prop, allowNull, function (v) {
      if(allowNull && isNull(v)) {
        return v;
      }

      if(isObject(v)) {
        if(isFunction(instanceCheck)) { // enfore instanceof checking
          if(v instanceof instanceCheck) {
            return v;
          }
          else {
            return this[prop];
          }
        }

        return v;
      }

      return this[prop];
    });
  }

  function setterDate(prop, allowNull, cb) {
    return setter(prop, allowNull, function (v) {
      if(allowNull && isNull(v)) {
        return v;
      }


      return this[prop];
    });
  }

  var
  utilities = { // export statically, that way all functions can be used without any binding.
    noop: noop,
    noopPassThru: noopPassThru,
    isNull: isNull,
    isUndefined: isUndefined,
    isNullUndefined: isNullUndefined,
    isNumber: isNumber,
    isBoolean: isBoolean,
    isString: isString,
    isScalar: isScalar,
    isFunction: isFunction,
    isArray: isArray,
    isPrimitive: isPrimitive,
    isPlainObject: isPlainObject,
    isObjectType: isObjectType,
    isObject: isObject,
    isDate: isDate,
    asNumber: asNumber,
    asBoolean: asBoolean,
    asString: asString,
    asDate: asDate,
    dateNow: dateNow,
    dateSetHours: dateSetHours,
    dateEquals: dateEquals,
    dateFloor: dateFloor,
    dateCeil: dateCeil,
    round: round,
    clamp: clamp,
    logscale: logscale,
    linearscale: linearscale,
    random: random,
    range: range,
    objectHasProperty: objectHasProperty,
    objectGetValue: objectGetValue,
    objectSetValue: objectSetValue,
    objectFind: objectFind,
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

  /**
  ** Shamelessly borrowed bits of the below from lodash 3.8.0,
  ** but it works well why change it! 8)
  **/

  /** Detect free variable `exports`. */
  var freeExports = isObjectType(typeof exports) && isObject(exports) && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = isObjectType(typeof module) && isObject(module) && !module.nodeType && module;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = freeExports && freeModule && isObjectType(typeof global) && isObject(global) && global.Object && global;

  /** Detect free variable `self`. */
  var freeSelf = isObjectType(typeof self) && isObject(self) && self.Object && self;

  /** Detect free variable `window`. */
  var freeWindow = isObjectType(typeof window) && isObject(window) && window.Object && window;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /**
   * Used as a reference to the global object.
   *
   * The `this` value is used if it is the global object to avoid Greasemonkey's
   * restricted `window` object, otherwise the `window` object is used.
   */
  var root = freeGlobal || ((freeWindow !== (this && this.window)) && freeWindow) || freeSelf || this;

  // Some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose utilities to the global object when an AMD loader is present to avoid
    // errors in cases where utilities is loaded by a script tag and not intended
    // as an AMD module. See http://requirejs.org/docs/errors.html#mismatch for
    // more details.
    root.utilities = utilities;

    // Define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module.
    define(function() {
      return utilities;
    });
  }
  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
  else if (freeExports && freeModule) {
    // Export for Node.js or RingoJS.
    if (moduleExports) {
      (freeModule.exports = utilities).utilities = utilities;
    }
    // Export for Narwhal or Rhino -require.
    else {
      freeExports.utilities = utilities;
    }
  }
  else {
    // Export for a browser or Rhino.
    root.utilities = utilities;
  }
}.call(this));