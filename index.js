/**
** Utilities.js
** @author Hans Doller <kryo2k@gmail.com>
**/
;(function (undefined) { 'use strict';

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

  function isNumberBetween(v, n1, n2) {
    if(!isNumber(v) || !isNumber(n1) || !isNumber(n2))  {
      return false;
    }

    return v >= Math.min(n1, n2) && v <= Math.max(n1, n2);
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

  function isObject(v, instanceCheck) { // matches all types of objects, unless instanceCheck is provided a function.

    var
    result = !isNull(v) && isObjectType(typeof v);

    if(result && isFunction(instanceCheck)) { // enfore instanceof checking
      if(false === v instanceof instanceCheck) {
        result = false;
      }
    }

    return result;
  }

  function isDate(v) { // matches only Date object instances
    return isObject(v, Date);
  }

  function isDateBetween(v, d1, d2) {
    if(!isDate(v) || !isDate(d1) || !isDate(d2))  {
      return false;
    }

    return isNumberBetween(+v,+d1,+d2);
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

  function asDate(v, fallbackDate) {
    if(isDate(v)) {
      return v;
    }

    return dateNow(v, fallbackDate);
  }

  function dateParse(v) {
    if(isNullUndefined(v) || isBoolean(v)) {
      return false;
    }

    if((isNumber(v) && isFinite(v)) || isString(v)) {
      var sane = new Date(v);

      if(isDate(sane)) {
        return sane;
      }
    }

    // send back a copy, if already a date object. Otherwise, send back false.
    return isDate(v) ? new Date(+v) : false;
  }

  function dateNow(now, fallback) {
    fallback = isDate(fallback) ? fallback : new Date();
    return dateParse(now) || fallback;
  }

  function dateSameYear(d1, d2) {
    if(!isDate(d1) || !isDate(d2)) {
      return false;
    }

    return d1.getFullYear() === d2.getFullYear();
  }

  function dateSameMonth(d1, d2) {
    return dateSameYear(d1, d2) && d1.getMonth() === d2.getMonth();
  }

  function dateSameDay(d1, d2) {
    return dateSameMonth(d1, d2) && d1.getDate() === d2.getDate();
  }

  function dateSameHour(d1, d2) {
    return dateSameDay(d1, d2) && d1.getHours() === d2.getHours();
  }

  function dateSameMinute(d1, d2) {
    return dateSameHour(d1, d2) && d1.getMinutes() === d2.getMinutes();
  }

  function dateSameSecond(d1, d2) {
    return dateSameMinute(d1, d2) && d1.getSeconds() === d2.getSeconds();
  }

  function dateSameMs(d1, d2) {
    return dateSameSecond(d1, d2) && d1.getMilliseconds() === d2.getMilliseconds();
  }

  function dateEquals(d1, d2, fallback) {
    if(isNullUndefined(d1) || isNullUndefined(d2)) {
      return false;
    }

    // deep compare date
    return dateSameMs(dateNow(d1, fallback), dateNow(d2, fallback));
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

  function extend() { // based on jquery's implementation (https://github.com/jquery/jquery/blob/master/src/core.js)
    var
    options, name, src, copy, copyIsArray, clone,
    target = arguments[0] || {}, i = 1,
    length = arguments.length,
    deep   = false;

    if ( isBoolean(target) ) {
      deep = target;

      // Skip the boolean and the target
      target = arguments[ i ] || {};
      i++;
    }

    // Handle case when target is a string or something (possible in deep copy)
    if ( !isObjectType(typeof target) && !isFunction(target) ) {
      target = {};
    }

    if(i === length) { // if nothing more to do, return current target
      return target;
    }

    for ( ; i < length; i++ ) {
      options = arguments[ i ];

      if( isNullUndefined(options) ) {
        continue; // Only deal with non-null/undefined values
      }

      // Extend the base object
      for ( name in options ) {
        src  = target[ name ];
        copy = options[ name ];

        // Prevent never-ending loop
        if ( target === copy ) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if ( deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy))) ) {

          if ( copyIsArray ) {
            copyIsArray = false;
            clone = src && isArray(src) ? src : [];

          } else {
            clone = src && isPlainObject(src) ? src : {};
          }

          // Never move original objects, clone them
          target[ name ] = extend( deep, clone, copy );

        // Don't bring in undefined values
        } else if ( copy !== undefined ) {
          target[ name ] = copy;
        }
      }
    }

    // Return the modified object
    return target;
  };

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

  function clampDate (date, min, max) {
    if(!isDate(date)) { return false; }
    return new Date( clamp (
      +date,
      isDate(min) ? +min : null,
      isDate(max) ? +max : null,
      0) );
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

  function shuffle(array) { // performs a shuffle in place
    if(!isArray(array)) {
      return false;
    }

    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  function shuffledCopy(array) {
    if(!isArray(array)) {
      return false;
    }
    return shuffle(array.slice());
  }

  function sorterNumber (reverse) {
    return function (a, b) {
      var
      vA = asNumber(a, Number.MIN_VALUE),
      vB = asNumber(b, Number.MIN_VALUE);
      if(vA > vB) return !!reverse ? -1 :  1;
      if(vA < vB) return !!reverse ?  1 : -1;
      return 0;
    };
  }

  function sorterArrayObject (spec, rawRecordFn) {
    rawRecordFn = isFunction(rawRecordFn)
      ? rawRecordFn
      : noopPassThru;

    var
    D_ASC   = 'asc',
    D_DESC  = 'desc',
    sorters = [],
    pushSorter = function (prop, dir) {
      if(dir !== D_ASC && dir !== D_DESC) return false;
      sorters.push({ property: prop, direction: dir });
      return true;
    },
    directionNorm = function (v) {
      if(isString(v)) {
        v = v.toLowerCase();
        return (v==='-1'||v==='-'||v==='desc'||v==='dsc') ? D_DESC : D_ASC;
      }
      else if(isNumber(v)) {
        return (v === -1) ? D_DESC : D_ASC;
      }
      return D_ASC;
    },
    stringSorterDef = function (str) {
      if(!isString(spec)) {
        return false;
      }

      str.split(/\s+/).forEach(function (part) {
        var
        dir = D_ASC, property;

        if(['-','+'].indexOf(part[0]) > -1) {
          dir = directionNorm(part[0]);
          property = part.substring(1);
        }
        else if(/^[a-z0-9\._-]+\:/i.test(part)) {
          var matches = part.match(/^([a-z0-9\._-]+)\:(.*)/);
          property = matches[1];
          dir      = directionNorm(matches[2]);
        }
        else {
          property = part;
        }

        pushSorter(property, dir);
      });

      return true;
    },
    objectSorterDef = function (obj) {
      if(!isPlainObject(obj)) {
        return false;
      }

      Object.keys(obj).forEach(function (v) {
        pushSorter(v, directionNorm(obj[v]));
      });

      return true;
    };

    if(!stringSorterDef(spec) && !objectSorterDef(spec)) {
      throw new Error('Invalid sorter spec was provided.');
    }

    return function (a, b) {
      var compare = 0, isAscending, vA, vB, property;
      sorters.every(function (sortBy) {
        property = sortBy.property;
        isAscending = (sortBy.direction === D_ASC);
        vA = objectFind(rawRecordFn(a), property, Number.MIN_VALUE);
        vB = objectFind(rawRecordFn(b), property, Number.MIN_VALUE);
        if(vA > vB) compare = isAscending ?  1 : -1;
        if(vA < vB) compare = isAscending ? -1 :  1;
        return compare === 0;
      });
      return compare;
    };
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

  function randomPluck(array, items, alwaysArray) {
    if(!isArray(array)) {
      return false;
    }

    items = clamp(asNumber(items, 1), 1);

    if(items === 1 && !alwaysArray) {
      return array[random(0, items.length - 1, 0)]
    }
    else {
      return shuffledCopy(array).slice(0, items);
    }
  }

  function randomDate(minAge, maxAge) {
    // ...
  }

  function randomArray(minLength, maxLength, itemCreatorFn) {
    // ...
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

  function chunkString (str, len) {
    if(!isString(str) || !str || !isNumber(len))
      return [];

    len = clamp(len, 1);

    var _size = Math.ceil(str.length/len),
        _ret  = new Array(_size),
        _offset;

    for (var _i=0; _i<_size; _i++) {
      _offset = _i * len;
      _ret[_i] = str.substring(_offset, _offset + len);
    }

    return _ret;
  }

  function objectHasProperty(obj, property) {
    if(!isObject(obj)) {
      return false;
    }

    if(isFunction(obj.has)) {
      var hasReturned = obj.has(property);
      return isBoolean(hasReturned) ? hasReturned : obj.hasOwnProperty(property);
    }

    // this is a looser form of making sure a property is defined.
    return typeof obj[property] !== 'undefined';
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

    searchDelimiter = (searchDelimiter === undefined || searchDelimiter === true) ? '.' : searchDelimiter;

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

  function fallbackNull(v) {
    return isNullUndefined(v) ? null : v;
  }

  function setter(prop, allowNull, cb) {
    cb = cb || noopPassThru;
    return function (v) {
      if(!allowNull && isNull(fallbackNull(v))) {
        return this[prop];
      }

      this[prop] = cb.call(this, v);

      return this[prop];
    };
  }

  function setterBoolean(prop, allowNull, cb) { // strictly set booleans
    cb = cb || noopPassThru;
    return setter(prop, allowNull, function (v) {
      if(isBoolean(v) || (!!allowNull && isNull(fallbackNull(v)))) {
        return cb.call(this, v);
      }

      return this[prop];
    });
  }

  function setterNumber(prop, min, max, precision, allowInfinite, allowNull, cb) {
    cb = cb || noopPassThru;
    return setter(prop, allowNull, function (v) {
      if(allowNull && isNull(fallbackNull(v))) {
        return cb.call(this, v);
      }

      if(!allowInfinite && !isFinite(v)) {
        return this[prop];
      }

      if(isNumber(v)) {
        return cb.call(this, clamp(v, min, max, precision));
      }

      return this[prop];
    });
  }

  function setterInt(prop, min, max, allowInfinite, allowNull, cb) { // strictly set integers (rounds floats to zero precision)
    return setterNumber(prop, min, max, 0, allowInfinite, allowNull, cb);
  }

  function setterString(prop, allowNull, cb) {
    cb = cb || noopPassThru;
    return setter(prop, allowNull, function (v) {
      if(isString(v) || (allowNull && isNull(fallbackNull(v)))) {
        return cb.call(this, v);
      }

      return this[prop];
    });
  }

  function setterScalar(prop, allowNull, cb) {
    cb = cb || noopPassThru;
    return setter(prop, allowNull, function (v) {
      if(isScalar(v) || (allowNull && isNull(fallbackNull(v)))) {
        return cb.call(this, v);
      }

      return this[prop];
    });
  }

  function setterFunction(prop, allowNull, cb) {
    cb = cb || noopPassThru;
    return setter(prop, allowNull, function (v) {
      if(isFunction(v) || (allowNull && isNull(fallbackNull(v)))) {
        return cb.call(this, v);
      }

      return this[prop];
    });
  }

  function setterObject(prop, instanceCheck, allowNull, cb) {
    cb = cb || noopPassThru;
    return setter(prop, allowNull, function (v) {
      if(allowNull && isNull(fallbackNull(v))) {
        return cb.call(this, v);
      }

      if(isObject(v, instanceCheck)) {
        return cb.call(this, v);
      }

      return this[prop];
    });
  }

  function setterPlainObject(prop, allowNull, cb) {
    cb = cb || noopPassThru;
    return setter(prop, allowNull, function (v) {
      if(allowNull && isNull(fallbackNull(v))) {
        return cb.call(this, v);
      }

      if(isPlainObject(v)) {
        return cb.call(this, v);
      }

      return this[prop];
    });
  }

  function setterEnum(prop, enumerables, allowNull, cb) {
    cb = cb || noopPassThru;

    // always convert to array, even if null/undefined.
    enumerables = isArray(enumerables) ? enumerables : [enumerables];

    return setter(prop, allowNull, function (v) {
      if(allowNull && isNull(fallbackNull(v))) {
        return cb.call(this, v);
      }

      var // check enumerables, find matching value index.
      enumIndex = enumerables.indexOf(v);

      if(enumIndex === -1) { // do not update, or notify cb.
        return this[prop];
      }

      // return original enumerable always
      return cb.call(this, enumerables[enumIndex]);
    });
  }

  function setterDate(prop, minDate, maxDate, allowNull, cb) {
    cb = cb || noopPassThru;
    return setter(prop, allowNull, function (v) {
      if(allowNull && isNull(fallbackNull(v))) {
        return cb.call(this, v);
      }

      var date = false;

      if(isDate(v)) {
        date = v;
      }
      else {
        date = dateParse(v);
      }

      if(!date) { // invalid date
        return this[prop];
      }

      // return a final clamped date copy
      return cb.call(this, clampDate(date, minDate, maxDate));
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
    isNumberBetween: isNumberBetween,
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
    isDateBetween: isDateBetween,
    asNumber: asNumber,
    asBoolean: asBoolean,
    asString: asString,
    asDate: asDate,
    dateParse: dateParse,
    dateNow: dateNow,
    dateSetHours: dateSetHours,
    dateSameYear: dateSameYear,
    dateSameMonth: dateSameMonth,
    dateSameDay: dateSameDay,
    dateSameHour: dateSameHour,
    dateSameMinute: dateSameMinute,
    dateSameSecond: dateSameSecond,
    dateSameMs: dateSameMs,
    dateEquals: dateEquals,
    dateFloor: dateFloor,
    dateCeil: dateCeil,
    extend: extend,
    round: round,
    clamp: clamp,
    clampDate: clampDate,
    logscale: logscale,
    linearscale: linearscale,
    shuffle: shuffle,
    shuffledCopy: shuffledCopy,
    sorterNumber: sorterNumber,
    sorterArrayObject: sorterArrayObject,
    random: random,
    randomPluck: randomPluck,
    range: range,
    chunkString: chunkString,
    objectHasProperty: objectHasProperty,
    objectGetValue: objectGetValue,
    objectSetValue: objectSetValue,
    objectFind: objectFind,
    fallbackNull: fallbackNull,
    getter: getter,
    setter: setter,
    setterBoolean: setterBoolean,
    setterNumber: setterNumber,
    setterInt: setterInt,
    setterString: setterString,
    setterScalar: setterScalar,
    setterObject: setterObject,
    setterPlainObject: setterPlainObject,
    setterFunction: setterFunction,
    setterEnum: setterEnum,
    setterDate: setterDate
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
}).call(this);