## utilities.js
Simple collection of functions and algorithms for Javascript/NodeJS without any other dependencies.

*Originally written for node.js, but am in the process of porting this to other platforms.*

### Installation

#### NodeJS
```bash
npm install utilities.js
npm test
```

#### Bower
```bash
bower install utilities.js
```

### Usage

#### NodeJS
```js
var
utils = require('utilities.js');
```

#### Bower & Web
```js
var
utils = window.utilities;
```

### Framework Ports & Wrappers

* [Angular $utilities Service](https://github.com/kryo2k/angular-utilities.js)

### Methods:
| Function Name     | Arguments | Description |
| ----------------- | --------- | ----------- |
| noop              | *none*     | NO-OP function. Returns undefined. |
| noopPassThru      | (passThru) | NO-OP function. Returns first argument. |
| isNull            | (variable) | Checks if a variable is null. |
| isUndefined       | (variable) | Checks if a variable is undefined. |
| isNullUndefined   | (variable) | Checks if a variable is null or undefined. |
| isNumber          | (variable) | Checks if a variable is strictly a number. |
| isBoolean         | (variable) | Checks if a variable is strictly a boolean. |
| isString          | (variable) | Checks if a variable is strictly a string. |
| isScalar          | (variable) | Checks if a variable is a scalar of type (number, boolean, string). NULL and Undefined are not permitted. |
| isFunction        | (variable) | Checks if a variable is strictly a function. |
| isArray           | (variable) | Checks if a variable is strictly an array  |
| isPrimitive       | (variable) | Identical to isScalar(), but permits undefined. |
| isPlainObject     | (variable) | Checks if a variable is strictly an instance of Object (or {}). Complex objects (Date, Array) will fail check. |
| isObjectType      | (string)   | Checks a string if it matches the native object type string ```"object"```.
| isObject          | (variable) | Checks if a variable is any type of object (plain, or otherwise). |
| isDate            | (variable) | Checks if a variable is specifically a Date object. |
| asNumber          | (variable, default) | Returns a variable in it's numeric form, or returns the supplied default (if a number is provided, else zero) if not a valid string or number. |
| asBoolean         | (variable, default) | Returns variable as a strict boolean type. If variable is ```null``` or ```undefined``` it will return the default value if it is a boolean, otherwise returns ```false```. If variable is an integer, it must equal exactly ```1``` to return ```true```, otherwise returns ```false```. If variable is a string, it must be one of (```yes```, ```true```, ```1```, ```on```, ```enabled```, ```enable```) to return ```true```, otherwise returns ```false```. If none of the above cases match, it will return default value (or ```false```). |
| asString          | (variable, default) | Returns variable as a strict string type. If variable is ```null``` or ```undefined``` it will return the default value if it is a string, otherwise returns ```""```. If variable is already a string, it returns the original string. Otherwise variable is cast directly to a string, using the native ```String(variable)```. |
| asDate            | (variable, fallbackDate) | Returns a variable as a strict date object type. If variable is already a date, it will return the same instance of that date object. Otherwise the variable will attempt to be parsed and a copy returned. If parsing was unsuccessful, it will return the fallbackDate (or a new Date).  |
| dateSetHours      | (now, hours, minutes, seconds, milliseconds, useUTC, fallbackDate) | Sets the hour portion of a date. Returns a new copy of the ```now``` after interpolation date. If ```now``` could not be loaded, the fallbackDate is used for setting hours. *Warning, no copy is made of the fallbackDate if used, this operation will change it's internal values.* |
| dateParse         | (variable) | Attempts to load variable as a date. If variable is already a real date object, it returns a copy of this object. If variable is a finite number or a string, it attempts to load it as a real date using native Date functions. If parsing was successful, the newly interpolated copy is returned. If the load was unsuccessful, this function returns ```false```. |
| dateNow           | (variable, fallbackDate) | If variable is a real date object, it returns a new copy of the date object. In any other case, it will attempt to parse the variable into a date. If parse was successful, it will return the interpolated copy. If unsuccessful, it will return the same instance of fallbackDate (if it is a real date object, or a new Date if otherwise). |
| dateEquals        | (date1, date2, fallbackDate)) | Compares value of date1 with date2 value to see if they match. This was not meant to detect if they are the exact same object instance, only that the values are equal. If either of the dates are ```NULL``` or ```undefined``` the function returns ```false```. If they could not be loaded (invalid String, Number, etc), the fallbackDate (or a new Date) is used in determining equality. |
| dateFloor         | (now, useUTC, fallbackDate) | Returns a copy of ```now``` with the time set to be the beginning of the day (example: "00:00:00.000"). *See above note about using fallbackDate if now fails to load.* |
| dateCeil          | (now, useUTC, fallbackDate) | Returns a copy of ```now``` with the time set to be the end of the day (example: "23:59:59.999"). *See above note about using fallbackDate if now fails to load.* |
| round             | (number, precision) | Rounding function, with optional precision. Returns NaN if not a valid number. |
| clamp             | (number, min, max, precision) | Ensures a number is between a certain range with an optional precision. |
| clampDate         | (date, min, max) | Ensures a date is between a certain range. If date is not a real date object, function returns ```false```. Min and Max are only used if they are real date objects, otherwise range is not capped by that limit. This function ALWAYS returns a copy of the original date when conditions are successful. |
| logscale          | (n, nMin, nMax, vMin, vMax, precision) | Scales a number logarithmically. |
| linearscale       | (n, nMin, nMax, vMin, vMax, precision) | Scales a number linearlly. |
| random            | (min, max, precision) | Produces a random number between a certain range with an optional precision. |
| range             | (from, to, step, precision) | Produce an array of integers within a certain range. Optional step size, and precision. |
| objectHasProperty | (obj, property) | Virtually the same as ```Object.hasOwnProperty```, but checks to see if object has a ```has(property)``` function. If it does, it calls it and checks if the result is a boolean. If so, returns the boolean, otherwise in all cases falls back to the native hasOwnProperty method. If obj is not an object, returns ```false```. This function is compatible with ```HashMap``` style objects. |
| objectGetValue    | (obj, property, defaultValue) | Gets a single object property value, with the option of providing a default value which is returned if the ```objectHasProperty```  check fails. This function also checks to see if a ```get(property)``` method exists. If so, it calls that function and returns it's value. Otherwise, falls back to returning the object's property using native JS. This function is compatible with ```HashMap``` style objects. |
| objectSetValue    | (obj, property, value, rejectOverride) | Sets a single object property value, with the option of skipping the update if already set. Overriding is allowed by default, to disable set rejectOverride to ```true```. This function is compatible with ```HashMap``` style objects. |
| objectFind        | (obj, search, defaultValue, searchDelimiter) | Similar to the objectGetValue function, but search can be defined as a delimited string, or as an array. This search acts like a property path to find an object's value or the value of one of it's child keys. To disable deep searching on string keys, set searchDelimiter to ```false```.  The default searchDelimiter is a period (```.```) character. This function is compatible with ```HashMap``` style objects. |
| getter            | (property, getterFn) | Returns a getter function. See more detail below. |
| setter            | (property, allowNull, setterFn) | Returns a setter function. ^ ditto. |
| setterBoolean     | (property, allowNull, setterFn) | Returns a boolean setter function. If value passed to function is not a boolean, property does not get set in scope. |
| setterNumber      | (property, min, max, precision, allowInfinite, allowNull, setterFn) | Returns a number setter function. If value passed to function is not a number, property does not get set in scope. Supports clamping, and precision. |
| setterInt         | (property, min, max, allowInfinite, allowNull, setterFn) | Returns a number setter function, which supports clamping, but precision is always 0 (whole numbers). |
| setterString      | (property, allowNull, setterFn) | Returns a string setter function. |
| setterScalar      | (property, allowNull, setterFn) | Returns a scalar setter function. |
| setterFunction    | (property, allowNull, setterFn) | Returns a function setter function. |
| setterObject      | (property, instanceOf, allowNull, setterFn) | Returns an object setter function, with optional instance checking. |
| setterDate        | (property, minDate, maxDate, allowNull, setterFn) | Returns a date object setter function. If a string or integer are passed as a value, it will normalize it into a Date object. Supports defining min and max dates. Both min and max are optional, and act independently -- but if being used, they must be real Date objects. |

### Getters & Setters
When prototyping classes in pure JS, these functions are useful when defining method properties of the class' prototype. Here are some examples:

#### Example class: MyValue
Adding a property to a class which has no type-checking (pass thru).

```js
var
utils = require('utilities.js');

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

var myValue = new MyValue('hello');
console.log(myValue.value); // 'hello'
```

#### Example class: LimitedDate
Adding a property to a class which should always be a date. Can optionally support a boundary range for date values.

```js
var
utils = require('utilities.js');

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

    // get the current value of PROP_DATE (default: undefined)
    get: utils.getter(PROP_DATE),

    // force the date to be with-in our range:
    set: utils.setterDate(PROP_DATE, null, null, false, function (date) {
      return utils.clampDate(date, this.dateMin, this.dateMax);
    })
  }
});

var limitedDate = new LimitedDate(new Date(), Date.parse('2001-01-01 00:00:00'), Date.parse('2020-01-01 00:00:00'));
console.log(limitedDate.date);
```

### Disclaimer
*These functions have been tested extensively in nodejs, and include unit tests. Nevertheless, if bugs are found, please report them and I'll pull in patches it! I hold no responsibility for any damages this code might incur if used in a production environment. This library is still in an experimental phase.*

### Credits
These functions are a combination of ones I've written personally, and others which have been adapted from online research, forums, open source frameworks, and refactoring efforts in my own projects. I try to keep this library as framework agnostic as possible, so it is possible to use in any Javascript environment without dependencies.

Authored By: Hans G. Doller <kryo2k@gmail.com>

#### Noteworthy Mentions & Inspirations
* Lodash
* NodeJS utils
* Stackoverflow.com and it's userbase.