## utilities.js
Simple collection of functions and algorithms for Javascript/NodeJS without any other dependencies.

*Currently only supports node.js, but can be easilly ported to any framework.*

### NodeJS Installation
```bash
npm install utilities.js
```

### Public Methods:
| Function Name  | Arguments | Description |
| -------------- | --------- | ----------- |
| noop           | *none*     | NO-OP function. Returns undefined. |
| noopPassThru   | (passThru) | NO-OP function. Returns first argument. |
| isNull         | (variable) | Checks if a variable is null. |
| isUndefined    | (variable) | Checks if a variable is undefined. |
| isNumber       | (variable) | Checks if a variable is strictly a number. |
| isBoolean      | (variable) | Checks if a variable is strictly a boolean. |
| isString       | (variable) | Checks if a variable is strictly a string. |
| isScalar       | (variable) | Checks if a variable is a scalar of type (number, boolean, string). NULL and Undefined are not permitted. |
| isFunction     | (variable) | Checks if a variable is strictly a function. |
| isArray        | (variable) | Checks if a variable is strictly an array  |
| isPrimitive    | (variable) | Identical to isScalar(), but permits undefined. |
| isPlainObject  | (variable) | Checks if a variable is strictly an instance of Object (or {}). Complex objects (Date, Array) will fail check. |
| isObject       | (variable) | Checks if a variable is any type of object (plain, or otherwise). |
| asNumber       | (variable, default) | Returns a variable in it's numeric form, or returns the supplied default (if a number is provided, else zero) if not a valid string or number. |
| round          | (number, precision) | Rounding function, with optional precision. Returns NaN if not a valid number. |
| clamp          | (number, min, max, precision) | Ensures a number is between a certain range with an optional precision. |
| logscale       | (n, nMin, nMax, vMin, vMax, precision) | Scales a number logarithmically. |
| linearscale    | (n, nMin, nMax, vMin, vMax, precision) | Scales a number linearlly. |
| random         | (min, max, precision) | Produces a random number between a certain range with an optional precision. |
| range          | (from, to, step, precision) | Produce an array of integers within a certain range. Optional step size, and precision. |
| getter         | (property, getterFn) | Returns a getter function. See more detail below. |
| setter         | (property, allowNull, setterFn) | Returns a setter function. ^ ditto. |
| setterBoolean  | (property, allowNull, setterFn) | Returns a boolean setter function. If value passed to function is not a boolean, property does not get set in scope. |
| setterNumber   | (property, min, max, precision, allowInfinite, allowNull, setterFn) | Returns a number setter function. If value passed to function is not a number, property does not get set in scope. Supports clamping, and precision. |
| setterInt      | (property, min, max, allowInfinite, allowNull, setterFn) | Returns a number setter function, which supports clamping, but precision is always 0 (whole numbers). |
| setterString   | (property, allowNull, setterFn) | Returns a string setter function. |
| setterScalar   | (property, allowNull, setterFn) | Returns a scalar setter function. |
| setterObject   | (property, instanceOf, allowNull, setterFn) | Returns an object setter function, with optional instance checking. |
| setterFunction | (property, allowNull, setterFn) | Returns a function setter function. |

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