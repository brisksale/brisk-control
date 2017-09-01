(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global['brisk-control'] = factory());
}(this, (function () { 'use strict';

var fastProto = null;
//%HasFastProperties
// --allow-natives-syntax to check whether an object has fast properties.
function FastObject(o) {
	if (fastProto !== null && typeof fastProto.property) {
		var result = fastProto;
		fastProto = FastObject.prototype = null;
		return result;
	}
	fastProto = FastObject.prototype = o == null ? Object.create(null) : o;
	return new FastObject;
}

// Initialize the inline property cache of FastObject
FastObject();

function toFastProperties(o) {
	return FastObject(o);
}

/**
 * 
 * this file was based of of ramdas toString function
 * I choose to do this to remove all dependencies from this library 
 * so it may look like this file is over doing it a bit. But thats ok.
 */

var arity = function arity(n, fn) {
  switch (n) {
    case 0:
      return function () {
        return fn.apply(this, arguments);
      };
    case 1:
      return function (a0) {
        return fn.apply(this, arguments);
      };
    case 2:
      return function (a0, a1) {
        return fn.apply(this, arguments);
      };
    case 3:
      return function (a0, a1, a2) {
        return fn.apply(this, arguments);
      };
    case 4:
      return function (a0, a1, a2, a3) {
        return fn.apply(this, arguments);
      };
    case 5:
      return function (a0, a1, a2, a3, a4) {
        return fn.apply(this, arguments);
      };
    case 6:
      return function (a0, a1, a2, a3, a4, a5) {
        return fn.apply(this, arguments);
      };
    case 7:
      return function (a0, a1, a2, a3, a4, a5, a6) {
        return fn.apply(this, arguments);
      };
    case 8:
      return function (a0, a1, a2, a3, a4, a5, a6, a7) {
        return fn.apply(this, arguments);
      };
    case 9:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8) {
        return fn.apply(this, arguments);
      };
    case 10:
      return function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        return fn.apply(this, arguments);
      };
    default:
      throw new Error('First argument to arity must be a non-negative integer no greater than ten');
  }
};

var arrayFromIterator = function arrayFromIterator(iter) {
  var list = [];
  var next;
  while (!(next = iter.next()).done) {
    list.push(next.value);
  }
  return list;
};

var complement = function complement(f) {
  return function () {
    return !f.apply(this, arguments);
  };
};

var _filter = function _filter(fn, list) {
  var idx = 0;
  var len = list.length;
  var result = [];
  while (idx < len) {
    if (fn(list[idx])) {
      result[result.length] = list[idx];
    }
    idx += 1;
  }
  return result;
};

// String(x => x) evaluates to "x => x", so the pattern may not match.
var functionName = function functionName(f) {
  // String(x => x) evaluates to "x => x", so the pattern may not match.
  var match = String(f).match(/^function (\w*)/);
  return match == null ? '' : match[1];
};

function has(prop, obj) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var _isArguments = function () {
  var toString = Object.prototype.toString;
  return toString.call(arguments) === '[object Arguments]' ? function _isArguments(x) {
    return toString.call(x) === '[object Arguments]';
  } : function _isArguments(x) {
    return has('callee', x);
  };
}();


var _isArray = Array.isArray || function _isArray(val) {
  return val != null && val.length >= 0 && Object.prototype.toString.call(val) === '[object Array]';
};

var _isObject = function _isObject(x) {
  return Object.prototype.toString.call(x) === '[object Object]';
};

var _isString = function _isString(x) {
  return Object.prototype.toString.call(x) === '[object String]';
};

var _isTransformer = function _isTransformer(obj) {
  return typeof obj['@@transducer/step'] === 'function';
};

var _map = function _map(fn, functor) {
  var idx = 0;
  var len = functor.length;
  var result = Array(len);
  while (idx < len) {
    result[idx] = fn(functor[idx]);
    idx += 1;
  }
  return result;
};

var _quote = function _quote(s) {
  var escaped = s.replace(/\\/g, '\\\\').replace(/[\b]/g, '\\b')    // \b matches word boundary; [\b] matches backspace
    .replace(/\f/g, '\\f').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\v/g, '\\v').replace(/\0/g, '\\0');
  return '"' + escaped.replace(/"/g, '\\"') + '"';
};

var _toISOString = function () {
  var pad = function pad(n) {
    return (n < 10 ? '0' : '') + n;
  };
  return typeof Date.prototype.toISOString === 'function' ? function _toISOString(d) {
    return d.toISOString();
  } : function _toISOString(d) {
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + ':' + pad(d.getUTCMinutes()) + ':' + pad(d.getUTCSeconds()) + '.' + (d.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) + 'Z';
  };
}();

var _xfBase = {
  init: function () {
    return this.xf['@@transducer/init']();
  },
  result: function (result) {
    return this.xf['@@transducer/result'](result);
  }
};

var _xwrap = function () {
  function XWrap(fn) {
    this.f = fn;
  }
  XWrap.prototype['@@transducer/init'] = function () {
    throw new Error('init not implemented on XWrap');
  };
  XWrap.prototype['@@transducer/result'] = function (acc) {
    return acc;
  };
  XWrap.prototype['@@transducer/step'] = function (acc, x) {
    return this.f(acc, x);
  };
  return function _xwrap(fn) {
    return new XWrap(fn);
  };
}();

function isFunction(x) {
  return Object.prototype.toString.call(x) === '[object Function]';
}

var _curry2 = function _curry2(fn) {
  return function f2(a, b) {
    switch (arguments.length) {
      case 0:
        return f2;
      case 1:
        return function (_b) {
          return fn(a, _b);
        };
      default:
        return fn(a, b);
    }
  };
};

var _dispatchable = function _dispatchable(methodNames, xf, fn) {
  return function () {
    if (arguments.length === 0) {
      return fn();
    }
    var args = Array.prototype.slice.call(arguments, 0);
    var obj = args.pop();
    if (!_isArray(obj)) {
      var idx = 0;
      while (idx < methodNames.length) {
        if (typeof obj[methodNames[idx]] === 'function') {
          return obj[methodNames[idx]].apply(obj, args);
        }
        idx += 1;
      }
      if (_isTransformer(obj)) {
        var transducer = xf.apply(null, args);
        return transducer(obj);
      }
    }
    return fn.apply(this, arguments);
  };
};

var _isArrayLike = function isArrayLike(x) {
  if (_isArray(x)) {
    return true;
  }
  if (!x) {
    return false;
  }
  if (typeof x !== 'object') {
    return false;
  }
  if (_isString(x)) {
    return false;
  }
  if (x.nodeType === 1) {
    return !!x.length;
  }
  if (x.length === 0) {
    return true;
  }
  if (x.length > 0) {
    return x.hasOwnProperty(0) && x.hasOwnProperty(x.length - 1);
  }
  return false;
};

var _xfilter = function () {
  function XFilter(f, xf) {
    this.xf = xf;
    this.f = f;
  }
  XFilter.prototype['@@transducer/init'] = _xfBase.init;
  XFilter.prototype['@@transducer/result'] = _xfBase.result;
  XFilter.prototype['@@transducer/step'] = function (result, input) {
    return this.f(input) ? this.xf['@@transducer/step'](result, input) : result;
  };
  return _curry2(function _xfilter(f, xf) {
    return new XFilter(f, xf);
  });
}();

var bind = function bind(fn, thisObj) {
  return arity(fn.length, function () {
    return fn.apply(thisObj, arguments);
  });
};

var identical = function identical(a, b) {
  // SameValue algorithm
  if (a === b) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    return a !== 0 || 1 / a === 1 / b;
  } else {
    // Step 6.a: NaN == NaN
    return a !== a && b !== b;
  }
};

var keys = function () {
  // cover IE < 9 keys issues
  var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');
  var nonEnumerableProps = [
    'constructor',
    'valueOf',
    'isPrototypeOf',
    'toString',
    'propertyIsEnumerable',
    'hasOwnProperty',
    'toLocaleString'
  ];
  // Safari bug
  var hasArgsEnumBug = function () {
    'use strict';
    return arguments.propertyIsEnumerable('length');
  }();
  var contains = function contains(list, item) {
    var idx = 0;
    while (idx < list.length) {
      if (list[idx] === item) {
        return true;
      }
      idx += 1;
    }
    return false;
  };
  return typeof Object.keys === 'function' && !hasArgsEnumBug ? function keys(obj) {
    return Object(obj) !== obj ? [] : Object.keys(obj);
  } : function keys(obj) {
    if (Object(obj) !== obj) {
      return [];
    }
    var prop, nIdx;
    var ks = [];
    var checkArgsLength = hasArgsEnumBug && _isArguments(obj);
    for (prop in obj) {
      if (has(prop, obj) && (!checkArgsLength || prop !== 'length')) {
        ks[ks.length] = prop;
      }
    }
    if (hasEnumBug) {
      nIdx = nonEnumerableProps.length - 1;
      while (nIdx >= 0) {
        prop = nonEnumerableProps[nIdx];
        if (has(prop, obj) && !contains(ks, prop)) {
          ks[ks.length] = prop;
        }
        nIdx -= 1;
      }
    }
    return ks;
  }
}();

var type = function type(val) {
  return val === null ? 'Null' : val === undefined ? 'Undefined' : Object.prototype.toString.call(val).slice(8, -1);
};

// Values of other types are only equal if identical.
var _equals = function _equals(a, b, stackA, stackB) {
  if (identical(a, b)) {
    return true;
  }
  if (type(a) !== type(b)) {
    return false;
  }
  if (a == null || b == null) {
    return false;
  }
  if (typeof a['fantasy-land/equals'] === 'function' || typeof b['fantasy-land/equals'] === 'function') {
    return typeof a['fantasy-land/equals'] === 'function' && a['fantasy-land/equals'](b) && typeof b['fantasy-land/equals'] === 'function' && b['fantasy-land/equals'](a);
  }
  if (typeof a.equals === 'function' || typeof b.equals === 'function') {
    return typeof a.equals === 'function' && a.equals(b) && typeof b.equals === 'function' && b.equals(a);
  }
  switch (type(a)) {
    case 'Arguments':
    case 'Array':
    case 'Object':
      if (typeof a.constructor === 'function' && functionName(a.constructor) === 'Promise') {
        return a === b;
      }
      break;
    case 'Boolean':
    case 'Number':
    case 'String':
      if (!(typeof a === typeof b && identical(a.valueOf(), b.valueOf()))) {
        return false;
      }
      break;
    case 'Date':
      if (!identical(a.valueOf(), b.valueOf())) {
        return false;
      }
      break;
    case 'Error':
      return a.name === b.name && a.message === b.message;
    case 'RegExp':
      if (!(a.source === b.source && a.global === b.global && a.ignoreCase === b.ignoreCase && a.multiline === b.multiline && a.sticky === b.sticky && a.unicode === b.unicode)) {
        return false;
      }
      break;
    case 'Map':
    case 'Set':
      if (!_equals(arrayFromIterator(a.entries()), arrayFromIterator(b.entries()), stackA, stackB)) {
        return false;
      }
      break;
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
      break;
    case 'ArrayBuffer':
      break;
    default:
      // Values of other types are only equal if identical.
      return false;
  }
  var keysA = keys(a);
  if (keysA.length !== keys(b).length) {
    return false;
  }
  var idx = stackA.length - 1;
  while (idx >= 0) {
    if (stackA[idx] === a) {
      return stackB[idx] === b;
    }
    idx -= 1;
  }
  stackA.push(a);
  stackB.push(b);
  idx = keysA.length - 1;
  while (idx >= 0) {
    var key = keysA[idx];
    if (!(has(key, b) && _equals(b[key], a[key], stackA, stackB))) {
      return false;
    }
    idx -= 1;
  }
  stackA.pop();
  stackB.pop();
  return true;
};

var _reduce = function () {
  function _arrayReduce(xf, acc, list) {
    var idx = 0;
    var len = list.length;
    while (idx < len) {
      acc = xf['@@transducer/step'](acc, list[idx]);
      if (acc && acc['@@transducer/reduced']) {
        acc = acc['@@transducer/value'];
        break;
      }
      idx += 1;
    }
    return xf['@@transducer/result'](acc);
  }
  function _iterableReduce(xf, acc, iter) {
    var step = iter.next();
    while (!step.done) {
      acc = xf['@@transducer/step'](acc, step.value);
      if (acc && acc['@@transducer/reduced']) {
        acc = acc['@@transducer/value'];
        break;
      }
      step = iter.next();
    }
    return xf['@@transducer/result'](acc);
  }
  function _methodReduce(xf, acc, obj, methodName) {
    return xf['@@transducer/result'](obj[methodName](bind(xf['@@transducer/step'], xf), acc));
  }
  var symIterator = typeof Symbol !== 'undefined' ? Symbol.iterator : '@@iterator';
  return function _reduce(fn, acc, list) {
    if (typeof fn === 'function') {
      fn = _xwrap(fn);
    }
    if (_isArrayLike(list)) {
      return _arrayReduce(fn, acc, list);
    }
    if (typeof list['fantasy-land/reduce'] === 'function') {
      return _methodReduce(fn, acc, list, 'fantasy-land/reduce');
    }
    if (list[symIterator] != null) {
      return _iterableReduce(fn, acc, list[symIterator]());
    }
    if (typeof list.next === 'function') {
      return _iterableReduce(fn, acc, list);
    }
    if (typeof list.reduce === 'function') {
      return _methodReduce(fn, acc, list, 'reduce');
    }
    throw new TypeError('reduce: list must be array or iterable');
  };
}();

function equals(a, b) {
  return _equals(a, b, [], []);
}

var filter = _dispatchable(['filter'], _xfilter, function (pred, filterable) {
  return _isObject(filterable) ? _reduce(function (acc, key) {
    if (pred(filterable[key])) {
      acc[key] = filterable[key];
    }
    return acc;
  }, {}, keys(filterable)) : // else
    _filter(pred, filterable);
});

var reject = function reject(pred, filterable) {
  return filter(complement(pred), filterable);
};

var _indexOf = function _indexOf(list, a, idx) {
  var inf, item;
  // Array.prototype.indexOf doesn't exist below IE9
  if (typeof list.indexOf === 'function') {
    switch (typeof a) {
      case 'number':
        if (a === 0) {
          // manually crawl the list to distinguish between +0 and -0
          inf = 1 / a;
          while (idx < list.length) {
            item = list[idx];
            if (item === 0 && 1 / item === inf) {
              return idx;
            }
            idx += 1;
          }
          return -1;
        } else if (a !== a) {
          // NaN
          while (idx < list.length) {
            item = list[idx];
            if (typeof item === 'number' && item !== item) {
              return idx;
            }
            idx += 1;
          }
          return -1;
        }
        // non-zero numbers can utilise Set
        return list.indexOf(a, idx);
      // all these types can utilise Set
      case 'string':
      case 'boolean':
      case 'function':
      case 'undefined':
        return list.indexOf(a, idx);
      case 'object':
        if (a === null) {
          // null can utilise Set
          return list.indexOf(a, idx);
        }
    }
  }
  // anything else not covered above, defer to R.equals
  while (idx < list.length) {
    if (equals(list[idx], a)) {
      return idx;
    }
    idx += 1;
  }
  return -1;
};

var _contains = function _contains(a, list) {
  return _indexOf(list, a, 0) >= 0;
};

//  mapPairs :: (Object, [String]) -> [String]
var _toString = function _toString(x, seen) {
  var recur = function recur(y) {
    var xs = seen.concat([x]);
    return _contains(y, xs) ? '<Circular>' : _toString(y, xs);
  };
  //  mapPairs :: (Object, [String]) -> [String]
  var mapPairs = function (obj, keys) {
    return _map(function (k) {
      return _quote(k) + ': ' + recur(obj[k]);
    }, keys.slice().sort());
  };
  switch (Object.prototype.toString.call(x)) {
    case '[object Arguments]':
      return '(function() { return arguments; }(' + _map(recur, x).join(', ') + '))';
    case '[object Array]':
      return '[' + _map(recur, x).concat(mapPairs(x, reject(function (k) {
        return /^\d+$/.test(k);
      }, keys(x)))).join(', ') + ']';
    case '[object Boolean]':
      return typeof x === 'object' ? 'new Boolean(' + recur(x.valueOf()) + ')' : x.toString();
    case '[object Date]':
      return 'new Date(' + (isNaN(x.valueOf()) ? recur(NaN) : _quote(_toISOString(x))) + ')';
    case '[object Null]':
      return 'null';
    case '[object Number]':
      return typeof x === 'object' ? 'new Number(' + recur(x.valueOf()) + ')' : 1 / x === -Infinity ? '-0' : x.toString(10);
    case '[object String]':
      return typeof x === 'object' ? 'new String(' + recur(x.valueOf()) + ')' : _quote(x);
    case '[object Undefined]':
      return 'undefined';
    default:
      if (typeof x.toString === 'function') {
        var repr = x.toString();
        if (repr !== '[object Object]') {
          return repr;
        }
      }
      return '{' + mapPairs(x, keys(x)).join(', ') + '}';
  }
};

function toString(val) {
  return _toString(val, []);
}

function concat(a, b) {
  if (_isArray(a)) {
    if (_isArray(b)) {
      return a.concat(b);
    }
    throw new TypeError(toString(b) + ' is not an array');
  }
  if (_isString(a)) {
    if (_isString(b)) {
      return a + b;
    }
    throw new TypeError(toString(b) + ' is not a string');
  }
  if (a != null && _isFunction(a['fantasy-land/concat'])) {
    return a['fantasy-land/concat'](b);
  }
  if (a != null && _isFunction(a.concat)) {
    return a.concat(b);
  }
  throw new TypeError(toString(a) + ' does not have a method named "concat" or "fantasy-land/concat"');
}

var $bimap = 'fantasy-land/bimap';
var $chain = 'fantasy-land/chain';
var $map = 'fantasy-land/map';
var $ap = 'fantasy-land/ap';

var bimap = function (lmapper, rmapper, m) { return m[$bimap](lmapper, rmapper); };

var chain = function (chainer, m) { return m[$chain](chainer); };

var map = function (mapper, m) { return m[$map](mapper); };

var ap = function (values, func) { return func[$ap](values); };

var concatLeft = function(other){
  return other.isLeft ? new Left(concat(this.value, other.value)) : other
};

var mapLeft = function(f){
  return this
};

var bimapLeft = function(f, g){
  return new Left(f(this.value));
};

var chainLeft = function(f){
  return this
};

var altLeft = function(other){
  return other
};

var reduceLeft = function (f, x) {
  return x
};

var traverseLeft =  function(typeRep, f){
  var this$1 = this;

  return typeRep === Array 
              ? [this] 
              : typeRep === Function
                ? function (x) { return this$1; }
                : typeRep['fantasy-land/of'](this)
};

var extendLeft = function(f){
  return this
};

var eitherLeft =  function(l, r){
  return l(this.value)
};

function Left(x){
  this.value = x;
  this.isRight = false;
  this.isLeft = true;
  if(isSemiGroup(x)){
    this['fantasy-land/concat'] = concatLeft;
    this.concat = concatLeft;
  }
}

Left.prototype = Object.create(Maybe.prototype);

Left.prototype.map = mapLeft;

Left.prototype['fantasy-land/map'] = mapLeft;

Left.prototype['fantasy-land/bimap'] = bimapLeft;

Left.prototype.bimap = bimapLeft;

Left.prototype.chain = chainLeft;

Left.prototype['fantasy-land/chain'] = chainLeft;

Left.prototype.alt = altLeft;

Left.prototype['fantasy-land/alt'] = altLeft;

Left.prototype.reduce = reduceLeft;

Left.prototype['fantasy-land/reduce'] = reduceLeft;

Left.prototype.traverse = traverseLeft;

Left.prototype['fantasy-land/traverse'] = traverseLeft;

Left.prototype.extend = extendLeft;

Left.prototype['fantasy-land/extend'] = extendLeft;

Left.prototype.either = eitherLeft;

Left.prototype.toString = function(){
  return ("Left(" + (toString(this.value)) + ")")
};

//v8 optimization
toFastProperties(Left);
toFastProperties(Left.prototype);

var concatRight = function(other){
  return other.isLeft ? this : new Right(concat(this.value, other.value))
};

var mapRight = function(f){
  return new Right(f(this.value))
};

var bimapRight = function(f, g){
  return new Right(g(this.value));
};

var chainRight = function(f){
  return f(this.value)
};

var altRight = function(other){
  return this
};

var reduceRight = function (f, x) {
  return f(x, this.value)
};

var traverseRight = function(typeRep, f){
  return new Right(f(this.value))
};
var extendRight = function(f){
  return new Right(f(this));
};

var eitherRight =  function(l, r){
  return r(this.value)
};

function Right(x){
  this.value = x;
  this.isLeft = false;
  this.isRight = true;
  if(isSemiGroup(x)){
    this['fantasy-land/concat'] = concatRight;
    this.concat = concatRight;
  }
}

Right.prototype = Object.create(Maybe.prototype);

Right.prototype.map = mapRight;

Right.prototype['fantasy-land/map'] = mapRight;

Right.prototype['fantasy-land/bimap'] = bimapRight;

Right.prototype.bimap = bimapRight;

Right.prototype.chain = chainRight;

Right.prototype['fantasy-land/chain'] = chainRight;

Right.prototype.alt = altRight;

Right.prototype['fantasy-land/alt'] = altRight;

Right.prototype.reduce = reduceRight;

Right.prototype['fantasy-land/reduce'] = reduceRight;

Right.prototype.traverse = traverseRight;

Right.prototype['fantasy-land/traverse'] = traverseRight;

Right.prototype.extend = extendRight;

Right.prototype['fantasy-land/extend'] = extendRight;

Right.prototype.either = eitherRight;

Right.prototype.toString = function(){
  return ("Right(" + (toString(this.value)) + ")")
};

//v8 optimization
toFastProperties(Right);
toFastProperties(Right.prototype);

var isSemiGroup$1 = function (x) { return isFunction(x.concat) ||  isFunction(x['fantasy-land/concat']); }; 

var concatJust = function(other){
  return other.isNothing ? this : new Just$1(concat(this.value, other.value))
};

var equalJust = function(other){
  return other.isJust && equals(this.value, other.value)
};
var lteJust = function(other){
  return other.isJust && (this.value <= other.value)
};

var mapJust = function(f){
  return new Just$1(f(this.value))
};

var apJust = function(other){
  return other.isJust ? this.map(other.value) : other
};

var chainJust = function(f){
  return f(this.value)
};

var altJust = function(other){
  return this
};

var reduceJust = function(f, x){
  return f(x, this.value)
};

var traverseJust = function(typeRep, f){
  return new Just$1(f(this.value))
};

var extendJust = function(f){
  return new Just$1(f(this))
};

function Just$1(x){
  this.value = x;
  this.isNothing = false;
  this.isJust = true;
  if(isSemiGroup$1(x)){
    this['fantasy-land/concat'] = concatJust;
    this.concat = concatJust;
  }
}

Just$1.prototype = Object.create(Maybe$1.prototype);

Just$1.prototype.equals = equalJust;

Just$1.prototype['fantasy-land/equals'] = equalJust;

Just$1.prototype.lte = lteJust;

Just$1.prototype['fantasy-land/lte'] = lteJust;

Just$1.prototype.map = mapJust;

Just$1.prototype['fantasy-land/map'] = mapJust;

Just$1.prototype.ap = apJust;

Just$1.prototype['fantasy-land/ap'] = apJust;

Just$1.prototype.chain = chainJust;

Just$1.prototype['fantasy-land/chain'] = chainJust;

Just$1.prototype.alt = altJust;

Just$1.prototype['fantasy-land/alt'] = altJust;

Just$1.prototype.reduce = reduceJust;

Just$1.prototype['fantasy-land/reduce'] = reduceJust;

Just$1.prototype.traverse = traverseJust;

Just$1.prototype['fantasy-land/traverse'] = traverseJust;

Just$1.prototype.extend = extendJust;

Just$1.prototype['fantasy-land/extend'] = extendJust;

Just$1.prototype.getOrElse = function(x){
  return this.value
};

Just$1.prototype.toString = function(){
  return ("Just(" + (toString(this.value)) + ")")
};

//v8 optimization
toFastProperties(Just$1);
toFastProperties(Just$1.prototype);

var concatNothing = function(other){
  return other
};

var equalNothing = function(other){
  return other.isNothing
};

var lteNothing = function(other){
  return true
};

var mapNothing = function(f){
  return this
};

var apNothing = function(other){
  return this
};

var chainNothing = function(f){
  return this
};

var altNothing = function(other){
  return other
};

var reduceNothing = function(f, x){
  return x
};

var traverseNothing = function(typeRep, f){
  var this$1 = this;

  return typeRep === Array 
              ? [this] 
              : typeRep === Function
                ? function (x) { return this$1; }
                : typeRep['fantasy-land/of'](this)
};

var extendNothing = function(f){
  return this
};

function Nothing$1(){
  this.isNothing = true;
  this.isJust = false;
  this['fantasy-land/concat'] = concatNothing;
  this.concat = concatNothing;
}

Nothing$1.prototype = Object.create(Maybe$1.prototype);

Nothing$1.prototype.equals = equalNothing;

Nothing$1.prototype['fantasy-land/equals'] = equalNothing;

Nothing$1.prototype.lte = lteNothing;

Nothing$1.prototype['fantasy-land/lte'] = lteNothing;

Nothing$1.prototype.map = mapNothing;

Nothing$1.prototype['fantasy-land/map'] = mapNothing;

Nothing$1.prototype.ap = apNothing;

Nothing$1.prototype['fantasy-land/ap'] = apNothing;

Nothing$1.prototype.chain = chainNothing;

Nothing$1.prototype['fantasy-land/chain'] = chainNothing;

Nothing$1.prototype.alt = altNothing;

Nothing$1.prototype['fantasy-land/alt'] = altNothing;

Nothing$1.prototype.reduce = reduceNothing;

Nothing$1.prototype['fantasy-land/reduce'] = reduceNothing;

Nothing$1.prototype.traverse = traverseNothing;

Nothing$1.prototype['fantasy-land/traverse'] = traverseNothing;

Nothing$1.prototype.extend = extendNothing;

Nothing$1.prototype['fantasy-land/extend'] = extendNothing;

Nothing$1.prototype.getOrElse = function(x){
  return x
};

Nothing$1.prototype.toString = function(){
  return "Nothing"
};

//v8 optimization
toFastProperties(Nothing$1);
toFastProperties(Nothing$1.prototype);

//these are just util curry functions for the use of the library.
//they are built for performance and dont have the same functinality as ramda
function c2(){
  var this$1 = this;
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  var fresh = [];
  var i = 0;
  var j = this.params.length;
  var total = j + args.length;
  while(i < total){
    if(i < j) { fresh.push(this$1.params[i]); }
    else { fresh.push(args[i - j]); }
    i = i + 1;
  }
  switch(fresh.length){
    case 1: return function (x) { return this$1.f(fresh[0], x); }
    case 2: return this.f(fresh[0], fresh[1]);
    default: return c2.bind({f:this.f, params:fresh}) 
  }
}

function c3(){
  var this$1 = this;
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  var fresh = [];
  var i = 0;
  var j = this.params.length;
  var total = j + args.length;
  while(i < total){
    if(i < j) { fresh.push(this$1.params[i]); }
    else { fresh.push(args[i - j]); }
    i = i + 1;
  }
  switch(fresh.length){
    case 2: return function (x) { return this$1.f(fresh[0], fresh[1], x); }
    case 3: return this.f(fresh[0], fresh[1], fresh[2]);
    default: return c3.bind({f:this.f, params:fresh}) 
  }
}

function cN(){
  var this$1 = this;
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  var fresh = [];
  var i = 0;
  var j = this.params.length;
  var total = j + args.length;
  while(i < total){
    if(i < j) { fresh.push(this$1.params[i]); }
    else { fresh.push(args[i - j]); }
    i = i + 1;
  }
  switch(fresh.length){
    case this.size - 1: return function (x) { return (ref = this$1).f.apply(ref, fresh.concat( [x] ))
      var ref; };
    case this.size: return (ref = this).f.apply(ref, fresh);
    default: return cN.bind({f:this.f, params:fresh, size:this.size}) 
  }
  var ref;
}

function curryN(n,f){
  var meta = {
    f:f,
    params: [],
    size:n
  };
  switch(n){
    case 2: return c2.bind(meta);
    case 3: return c3.bind(meta);
    default: return cN.bind(meta);
  } 
}

var Left$1 = Either.Left;
var Right$1 = Either.Right;

var maybe_type = 'brisk-control/Maybe';

function Maybe$1(){}

Maybe$1.prototype.inspect = function() { 
  return this.toString(); 
};

Maybe$1['@@type'] = maybe_type;

var nothing = new Nothing$1();

Maybe$1.Nothing = nothing;

Maybe$1.Just = function(x){
  return new Just$1(x)
};

Maybe$1['fantasy-land/of'] = function(x){
  return new Just$1(x)
};

Maybe$1.of = function(x){
  return new Just$1(x)
};

var returnNothing = function(){
  return nothing
};

Maybe$1['fantasy-land/empty'] = returnNothing; 

Maybe$1.empty = returnNothing; 

Maybe$1['fantasy-land/zero'] = returnNothing;

Maybe$1.zero = returnNothing;

Maybe$1.isJust = function(maybe){
  return maybe.isJust
};

Maybe$1.fromMaybe = function(x, maybe) {
  if (arguments.length === 1) { return function (maybe) { return maybe.isJust ? maybe.value : x; }; }
  return maybe.isJust ? maybe.value : x;
};

Maybe$1.maybeToNullable = function(maybe){
  return maybe.isJust ? maybe.value : null
};

Maybe$1.toMaybe = function(x){
  return x == null ? nothing : new Just$1(x);
};

Maybe$1.maybe = function (x, f, maybe) {
  if (arguments.length === 1) { return curryN(2, function (f, maybe) { return Maybe$1.fromMaybe(x, maybe.map(f)); }); }
  if (arguments.length === 2) { return function (maybe) { return Maybe$1.fromMaybe(x, maybe.map(f)); }; }
  return Maybe$1.fromMaybe(x, maybe.map(f));
};

Maybe$1.maybeToEither = function(x, maybe){
  if (arguments.length === 1) { return function (maybe) { return maybe.isNothing ? Left$1(x) : Right$1(maybe.value); }; }
  return maybe.isNothing ? Left$1(x) : Right$1(maybe.value);
};
//encase justs
//v8 optimization
toFastProperties(Maybe$1);
toFastProperties(Maybe$1.prototype);

var Just = Maybe$1.Just;
var Nothing = Maybe$1.Nothing;

var either_type = 'brisk-control/Either';

var equalEither = function(other){
  return this.isLeft === other.isLeft && equals(this.value, other.value);
};

var lteEither = function (other) {
  return this.isLeft === other.isLeft ?
    this.value <= other.value :
    this.isLeft;
};

var apEither = function(other){
  return other.isRight ? this.map(other.value) : other;
};

function Either(){}

Either.prototype.inspect = function() { 
  return this.toString(); 
};

Either.prototype.equals = equalEither;

Either.prototype['fantasy-land/equals'] = equalEither;

Either.prototype.lte = lteEither;

Either.prototype['fantasy-land/lte'] = lteEither;

Either.prototype.ap = apEither;

Either.prototype['fantasy-land/ap'] = apEither;

Either['@@type'] = either_type;

Either.isLeft = function(either){
  return either.isLeft
};

Either.isRight = function(either){
  return either.isRight
};


Either.fromEither = function(x, either) {
  if (arguments.length === 1) { return function (either) { return either.isRight ? either.value : x; }; }
  return either.isRight ? either.value : x;
};

Either.toEither = function(x, y){
  return y == null ? new Left(x) : new Right(y);
};

Either.either = function (l, r, either) {
  if (arguments.length === 1) { return curryN(2, function (r, either) { return either.isLeft ? l(either.value) : r(either.value); }); }
  if (arguments.length === 2) { return function (either) { return either.isLeft ? l(either.value) : r(either.value); }; }
  return either.isLeft ? l(either.value) : r(either.value);
};
Either.tagBy = function(pred, a){
  if (arguments.length === 1) { return function (a) { return pred(a) ? new Right(a) : new Left(a); }; }
  return pred(a) ? new Right(a) : new Left(a);
};

Either.Left = function(value){
  return new Left(value)
};

Either.Right = function(value){
  return new Right(value)
};

Either['fantasy-land/of'] = function(value){
  return new Right(value)
};

Either.of = function(value){
  return new Right(value)
};

Either.eitherToMaybe = function(either){
  return either.isLeft ? Nothing : Just(either.value);
};

// look into lefts rights encase
//v8 optimization
toFastProperties(Either);
toFastProperties(Either.prototype);

function checkn(n) {
    if(typeof n !== 'number') {
      throw new TypeError(
        'inspectf expects its first argument to be a number'
      );
    }
  }

  function checkf(f) {
    if(typeof f !== 'function') {
      throw new TypeError(
        'inspectf expects its second argument to be a function'
      );
    }
  }

  var RSPACE = /^ */;
  var RCODE = /\s*[^\s]/;
  var RTABS = /\t/g;
  var REOL = /\n\r?/;

  function isCode(line) {
    return RCODE.test(line);
  }

  function getPadding(line) {
    return line.match(RSPACE)[0].length;
  }

  function guessIndentation(lines) {
    var filtered = lines.filter(isCode);
    var paddings = filtered.map(getPadding);
    var depth = paddings.reduce(Math.min, Infinity);
    var tabsize = paddings
    .map(function(x) { return x - depth; })
    .find(function(x) { return x > 1; }) || 2;
    return {depth: depth, tabsize: tabsize};
  }

  function pad(n) {
    return (new Array(n + 1)).join(' ');
  }

  function show(f, indentation) {
    return f.toString().replace(RTABS, indentation);
  }

  function toLines(s) {
    return s.split(REOL);
  }

  function fixIndentation(lines, indentation) {
    var info = guessIndentation(lines.slice(1));
    var RPAD = new RegExp(pad(info.tabsize), 'g');
    return lines.map(function(line) {
      return line.slice(Math.min(info.depth, getPadding(line)))
      .replace(RPAD, '\t').replace(RTABS, indentation);
    }).join('\n');
  }

  function inspectf(n, f) {
    checkn(n);
    if(arguments.length < 2) {
      return function inspectf$partial(f) { return inspectf(n, f); };
    }
    checkf(f);
    if(f.toString !== Function.prototype.toString) {return f.toString();}
    var i = pad(n), shown = show(f, i), lines = toLines(shown, i);
    if(lines.length < 2) {return shown;}
    return fixIndentation(lines, i);
  }

var startPosPad = function (sf, s) { return s.replace(/^/gm, sf).replace(sf, ''); };

var showFunction = function (f) { return startPosPad('  ', inspectf(2, f)); };

var emptyFn = function emptyFn() { };

function BaseAction(computation){
  this._computation = computation;
}

BaseAction.prototype = Object.create(Action.prototype);

BaseAction.prototype._exec = function(rej, res) {
  var open = true;
  var f = this._computation(function(x) {
    if (open) {
      open = false;
      rej(x);
    }
  }, function(x) {
    if (open) {
      open = false;
      res(x);
    }
  });
  
  return open === false ? emptyFn :
    function cancel() {
      open && f && f();
      open = false;
    };
};

BaseAction.prototype.toString = function() {
  return ("Action(" + (showFunction(this._computation)) + ")");
};

//v8 optimization
toFastProperties(BaseAction);
toFastProperties(BaseAction.prototype);

function Identity(value) {
  this._value = value;
}

Identity.prototype = Object.create(Action.prototype);

Identity.prototype.extractRight = function() {
  return [this._value];
};

Identity.prototype._exec = function(rej, res) {
  res(this._value);
  return emptyFn;
};

Identity.prototype.toString = function(){
  return ("Action.of(" + (toString(this._value)) + ")");
};

//v8 optimization
toFastProperties(Identity);
toFastProperties(Identity.prototype);

//__________________________________________________________//

function ApplicativeAction(mval, mfunc) {
  this._mval = mval;
  this._mfunc = mfunc;
}

ApplicativeAction.prototype = Object.create(Action.prototype);

ApplicativeAction.prototype._exec = function(rej, res) {
  var inst = this;
  var cancel;
  var r = inst._mval._exec(rej, function(x) {
    cancel = inst._mfunc._exec(rej, function(f) {
      cancel = emptyFn;
      res(f(x));
    });
  });
  return cancel || (cancel = r, function () { return cancel && cancel(); });
};

ApplicativeAction.prototype.toString = function(){
  return ((this._mval.toString()) + ".ap(" + (this._mfunc.toString()) + ")");
};

//v8 optimization
toFastProperties(ApplicativeAction);
toFastProperties(ApplicativeAction.prototype);

//___________________________________________________________//

function MapAction(parent, mapper) {
  this._parent = parent;
  this._mapper = mapper;
}

MapAction.prototype = Object.create(Action.prototype);

MapAction.prototype._exec = function(rej, res) {
  var inst = this;
  return inst._parent._exec(rej, function(x) {
    res(inst._mapper(x));
  });
};

MapAction.prototype.toString = function(){
  return ((this._parent.toString()) + ".map(" + (showFunction(this._mapper)) + ")");
};

//v8 optimization
toFastProperties(MapAction);
toFastProperties(MapAction.prototype);

//___________________________________________________________//

function BimapAction(parent, lmapper, rmapper) {
  this._parent = parent;
  this._lmapper = lmapper;
  this._rmapper = rmapper;
}

BimapAction.prototype = Object.create(Action.prototype);

BimapAction.prototype._exec = function(rej, res) {
  var inst = this;
  return inst._parent._exec(function(x) {
    rej(inst._lmapper(x));
  }, function(x) {
    res(inst._rmapper(x));
  });
};

BimapAction.prototype.toString = function(){
  return ((this._parent.toString()) + ".bimap(" + (showFunction(this._lmapper)) + ", " + (showFunction(this._rmapper)) + ")");
};

//v8 optimization
toFastProperties(BimapAction);
toFastProperties(BimapAction.prototype);

//___________________________________________________________//

function ChainAction(parent, chainer) {
  this._parent = parent;
  this._chainer = chainer;
}

ChainAction.prototype = Object.create(Action.prototype);

ChainAction.prototype._exec = function(rej, res) {
  var inst = this;
  var cancel;
  var r = inst._parent._exec(rej, function(x) {
    var m = inst._chainer(x);
    cancel = m._exec(rej, res);
  });
  return cancel || (cancel = r, function () { return cancel && cancel(); });
};

ChainAction.prototype.toString = function() {
  return ((this._parent.toString()) + ".chain(" + (showFunction(this._chainer)) + ")");
};

//v8 optimization
toFastProperties(ChainAction);
toFastProperties(ChainAction.prototype);

function ChainRejAction(parent, chainer) {
  this._parent = parent;
  this._chainer = chainer;
}

ChainRejAction.prototype = Object.create(Action.prototype);

ChainRejAction.prototype._exec = function(rej, res) {
  var inst = this;
  var cancel;
  var r = inst._parent._exec(function(x) {
    var m = inst._chainer(x);
    cancel = m._exec(rej, res);
  }, res);
  return cancel || (cancel = r, function() { cancel ? cancel() : null; });
};

(ChainRejAction.prototype).toString = function() {
  return ((this._parent.toString()) + ".chainRej(" + (showFunction(this._chainer)) + ")");
};

//v8 optimization
toFastProperties(ChainRejAction);
toFastProperties(ChainRejAction.prototype);

function MapRejAction(parent, mapper) {
  this._parent = parent;
  this._mapper = mapper;
}

MapRejAction.prototype = Object.create(Action.prototype);

MapRejAction.prototype._exec = function(rej, res) {
  var inst = this;
  return inst._parent._exec(function(x) {
    rej(inst._mapper(x));
  }, res);
};

(MapRejAction.prototype).toString = function() {
  return ((this._parent.toString()) + ".mapRej(" + (showFunction(this._mapper)) + ")");
};

//v8 optimization
toFastProperties(MapRejAction);
toFastProperties(MapRejAction.prototype);

function ActionReject(reason) {
  this._reason = reason;
}

ActionReject.prototype = Object.create(Action.prototype);

ActionReject.prototype.extractLeft = function() {
  return [this._reason];
};

ActionReject.prototype._exec = function(rej) {
  rej(this._reason);
  return emptyFn;
};

(ActionReject.prototype).toString = function() {
  return ("Action.reject(" + (toString(this._reason)) + ")");
};

//v8 optimization
toFastProperties(ActionReject);
toFastProperties(ActionReject.prototype);

function ActionRejectAfter(time, reason) {
  this._time = time;
  this._reason = reason;
}

ActionRejectAfter.prototype = Object.create(Action.prototype);

ActionRejectAfter.prototype.extractLeft = function() {
  return [this._reason];
};

ActionRejectAfter.prototype._exec = function(rej) {
  var id = setTimeout(rej, this._time, this._reason);
  return function() { clearTimeout(id); };
};

(ActionRejectAfter.prototype).toString = function() {
  return ("Action.rejectAfter(" + (toString(this._time)) + ", " + (toString(this._reason)) + ")");
};

//v8 optimization
toFastProperties(ActionRejectAfter);
toFastProperties(ActionRejectAfter.prototype);

function ActionAfter(time, value) {
  this._time = time;
  this._value = value;
}

ActionAfter.prototype = Object.create(Action.prototype);

ActionAfter.prototype.extractRight = function() {
  return [this._value];
};

ActionAfter.prototype._exec = function(rej, res) {
  var id = setTimeout(res, this._time, this._value);
  return function () { clearTimeout(id); };
};

(ActionAfter.prototype).toString = function() {
  return ("Action.after(" + (toString(this._time)) + ", " + (toString(this._value)) + ")");
};

//v8 optimization
toFastProperties(ActionAfter);
toFastProperties(ActionAfter.prototype);

function SwapAction(parent) {
  this._parent = parent;
}

SwapAction.prototype = Object.create(Action.prototype);

SwapAction.prototype._exec = function(rej, res) {
  return this._parent._exec(res, rej);
};

(SwapAction.prototype).toString = function() {
  return ((this._parent.toString()) + ".swap()");
};

//v8 optimization
toFastProperties(SwapAction);
toFastProperties(SwapAction.prototype);

/*  */
function EmptyActionParallel(rej, res) {
  res([]);
}

function ActionParallel(max, actions) {
  this._actions = actions;
  this._length = actions.length;
  this._max = Math.min(this._length, max);
  if (actions.length === 0) { this._exec = EmptyActionParallel; }
}

ActionParallel.prototype = Object.create(Action.prototype);

ActionParallel.prototype._exec = function(rej, res) {
  var inst = this, cancels = new Array(inst._max), out = new Array(inst._length);
  var i = inst._max, ok = 0;
  var cancelAll = function() {
    for (var n = 0; n < inst._max; n++) { cancels[n] && cancels[n](); }
  };
  var run = function(action, j, c) {
    cancels[c] = action._exec(function(reason) {
      cancelAll();
      rej(reason);
    }, function(value) {
      out[j] = value;
      ok = ok + 1;
      if (i < inst._length) { run(inst._actions[i], i++, c); }
      else if (ok === inst._length) { res(out); }
    });
  };
  for (var n = 0; n < inst._max; n++) { run(inst._actions[n], n, n); }
  return cancelAll;
};

(ActionParallel.prototype).toString = function() {
  return ("Action.parallel(" + (toString(this._max)) + ", [" + (this._actions.map(showFunction).join(', ')) + "])");
};

//v8 optimization
toFastProperties(ActionParallel);
toFastProperties(ActionParallel.prototype);

function ActionParallelAp(mval, mfunc) {
  this._mval = mval;
  this._mfunc = mfunc;
}

ActionParallelAp.prototype = Object.create(Action.prototype);

ActionParallelAp.prototype._exec = function(rej, res) {
  var func, val, okval = false, okfunc = false, rejected = false, c1, c2;
  function ActionParallelApRej(x) {
    if (rejected === false) {
      rejected = true;
      rej(x);
    }
  }
  c1 = this._mval._exec(ActionParallelApRej, function(x) {
    c1 = emptyFn;
    if (okval === false) { return void (okfunc = true, val = x); }
    res(func(x));
  });
  c2 = this._mfunc._exec(ActionParallelApRej, function(f) {
    c2 = emptyFn;
    if (okfunc === false) { return void (okval = true, func = f); }
    res(f(val));
  });
  return function() {
    c1();
    c2();
  };
};

(ActionParallelAp.prototype).toString = function() {
  return ("new ActionParallelAp(" + (this._mval.toString()) + ", " + (this._mfunc.toString()) + ")");
};

//v8 optimization
toFastProperties(ActionParallelAp);
toFastProperties(ActionParallelAp.prototype);

function RaceAction(left, right) {
  this._left = left;
  this._right = right;
}

RaceAction.prototype = Object.create(Action.prototype);

RaceAction.prototype._exec = function(rej, res) {
  var cancelled = false, lcancel = emptyFn, rcancel = emptyFn;
  var cancel = function() { cancelled = true; lcancel(); rcancel(); };
  var reject = function(x) { cancel(); rej(x); };
  var resolve = function(x) { cancel(); res(x); };
  lcancel = this._left._exec(reject, resolve);
  cancelled || (rcancel = this._right._exec(reject, resolve));
  return cancel;
};

(RaceAction.prototype).toString = function() {
  return ((this._left.toString()) + ".race(" + (this._right.toString()) + ")");
};

//v8 optimization
toFastProperties(RaceAction);
toFastProperties(RaceAction.prototype);

var COLD =  4;
var PENDING = 8;
var REJECTED = 16;
var RESOLVED = 32;
var FULLFILLED = REJECTED | RESOLVED;
var ACTIVE = FULLFILLED | PENDING;
var NO_STATE = 0;

function AndAction(left, right){
  this._left = left;
  this._right = right;
}

AndAction.prototype = Object.create(Action.prototype);

AndAction.prototype._exec = function(rej, res) {
  var state = NO_STATE, val, lcancel = emptyFn, rcancel = emptyFn;
  lcancel = this._left._exec(
    function (e) { state = REJECTED; rcancel(); rej(e); },
    function (_) { return state & REJECTED ? rej(val) : state & RESOLVED ? res(val) : (state = RESOLVED); }
  );
  rcancel = this._right._exec(
    function (e) { return state & RESOLVED ? rej(e) : (state = REJECTED, val = e); },
    function (x) { return state & RESOLVED ? res(x) : (state = RESOLVED, val = x); }
  );
  return function() { lcancel(); rcancel(); };
};

(AndAction.prototype).toString = function() {
  return ((this._left.toString()) + ".and(" + (this._right.toString()) + ")");
};

//v8 optimization
toFastProperties(AndAction);
toFastProperties(AndAction.prototype);

//----------

function OrAction(left, right) {
  this._left = left;
  this._right = right;
}

OrAction.prototype = Object.create(Action.prototype);

OrAction.prototype._exec = function(rej, res) {
  var state = NO_STATE, val, err, lcancel = emptyFn, rcancel = emptyFn;
  lcancel = this._left._exec(
    function (_) { return state = REJECTED ? rej(err) : state & RESOLVED ? res(val) : (state = REJECTED); },
    function (x) { state = RESOLVED; rcancel(); res(x); }
  );
  state & RESOLVED || (rcancel = this._right._exec(
    function (e) { return state & RESOLVED || (state & REJECTED ? rej(e) : (err = e, state = REJECTED)); },
    function (x) { return state & RESOLVED || (state & REJECTED ? res(x) : (val = x, state = RESOLVED)); }
  ));
  return function() { lcancel(); rcancel(); };
};

(OrAction.prototype).toString = function() {
  return ((this._left.toString()) + ".or(" + (this._right.toString()) + ")");
};

//v8 optimization
toFastProperties(OrAction);
toFastProperties(OrAction.prototype);

//----------

function BothAction(left, right) {
  this._left = left;
  this._right = right;
}

BothAction.prototype = Object.create(Action.prototype);

BothAction.prototype._exec = function(rej, res) {
   var state = NO_STATE, lcancel = emptyFn, rcancel = emptyFn;
  var tuple = new Array(2);
  lcancel = this._left._exec(function(e) {
    state = REJECTED; rcancel(); rej(e);
  }, function (x) {
    tuple[0] = x;
    if (state & RESOLVED) { res(tuple); }
    else { (state = RESOLVED); }
  });
  state & REJECTED || (rcancel = this._right._exec(function(e) {
    state = REJECTED; lcancel(); rej(e);
  }, function(x) {
    tuple[1] = x;
    if (state & RESOLVED) { res(tuple); }
    else { (state = RESOLVED); }
  }));
  return function(){ lcancel(); rcancel(); };
};

(BothAction.prototype).toString = function() {
  return ((this._left.toString()) + ".both(" + (this._right.toString()) + ")");
};

//v8 optimization
toFastProperties(BothAction);
toFastProperties(BothAction.prototype);

function FoldAction(parent, lfold, rfold) {
  this._parent = parent;
  this._lfold = lfold;
  this._rfold = rfold;
}

FoldAction.prototype = Object.create(Action.prototype);

FoldAction.prototype._exec = function(rej, res) {
  var inst = this;
  return inst._parent._exec(function(x) {
    res(inst._lfold(x));
  }, function(x) {
    res(inst._rfold(x));
  });
};

(FoldAction.prototype).toString = function() {
  return ((this._parent.toString()) + ".fold(" + (showFunction(this._lfold)) + ", " + (showFunction(this._rfold)) + ")");
};

//v8 optimization
toFastProperties(FoldAction);
toFastProperties(FoldAction.prototype);

var fn = function (x) { return x; };

function LoggerAction(parent, mapper) {
  this._parent = parent;
  this._mapper = mapper ? mapper : fn;
}

LoggerAction.prototype = Object.create(Action.prototype);

LoggerAction.prototype._exec = function(rej, res) {
  var inst = this;
  return inst._parent._exec(rej, function(x) {
    res(x);
    
    console.log(("Action Logger called\n" + (inst.toString())));
    console.dir(inst._mapper(x), {colors:true});
    console.log("\n");
  });
};

LoggerAction.prototype.toString = function(){
  return ((this._parent.toString()) + ".log(" + (showFunction(this._mapper)) + ")");
};

//v8 optimization
toFastProperties(LoggerAction);
toFastProperties(LoggerAction.prototype);

function HookAction(acquire, dispose, consume) {
  this._acquire = acquire;
  this._dispose = dispose;
  this._consume = consume;
}

HookAction.prototype = Object.create(Action.prototype);

HookAction.prototype._exec = function(rej, res) {
  var inst = this;
  var cancel, cancelAcquire = emptyFn;
  cancelAcquire = inst._acquire._exec(rej, function(resource) {
    var disposer = function(callback) {
      return cancel = inst._dispose(resource)._exec(rej, callback);
    };
    var cancelConsume = inst._consume(resource)._exec(
      function (x) { return disposer(function (_) { return rej(x); }); },
      function (x) { return disposer(function (_) { return res(x); }); }
    );
    cancel = function() {
      disposer(emptyFn)();
      cancelAcquire();
      cancelConsume();
    };
  });
  cancel = cancel || cancelAcquire;
  return function () { return cancel && cancel(); };
};

HookAction.prototype.toString = function() {
  return ((this._acquire.toString()) + ".hook(" + (showFunction(this._dispose)) + ", " + (showFunction(this._consume)) + ")");
};

//v8 optimization
toFastProperties(HookAction);
toFastProperties(HookAction.prototype);

//----------

function FinallyAction(computation, cleanup) {
  this._computation = computation;
  this._cleanup = cleanup;
}

FinallyAction.prototype = Object.create(Action.prototype);

FinallyAction.prototype._exec = function(rej, res) {
  var inst = this;
  var cancel;
  var cancelComputation = inst._computation._exec(function(e) {
    cancel = inst._cleanup._exec(rej, function() { rej(e); });
  }, function(x) {
    cancel = inst._cleanup._exec(rej, function() { res(x); });
  });
  if (cancel) { return cancel; }
  cancel = function() {
    cancelComputation();
    inst._cleanup._exec(emptyFn, emptyFn)();
  };
  return function () { return cancel && cancel(); };
};

(FinallyAction.prototype).toString = function() {
  return ((this._computation.toString()) + ".finally(" + (this._cleanup.toString()) + ")");
};

//v8 optimization
toFastProperties(FinallyAction);
toFastProperties(FinallyAction.prototype);

//----------

function ActionNever() { }

ActionNever.prototype = Object.create(Action.prototype);

ActionNever.prototype._exec = function() {
  return emptyFn;
};

(ActionNever.prototype).toString = function() {
  return 'Action.never';
};

//v8 optimization
toFastProperties(ActionNever);
toFastProperties(ActionNever.prototype);

function ActionTry(fn) {
  this._fn = fn;
}

ActionTry.prototype = Object.create(Action.prototype);

ActionTry.prototype._exec = function(rej, res) {
  var r;
  try { r = this._fn(); } catch (e) { rej(e); return emptyFn }
  res(r);
  return emptyFn;
};

(ActionTry.prototype).toString = function() {
  return ("Action.try(" + (toString(this._fn)) + ")");
};

//v8 optimization
toFastProperties(ActionTry);
toFastProperties(ActionTry.prototype);

//data Timing = Undetermined | Synchronous | Asynchronous
var Undetermined = 2;
var Synchronous = 4;
var Asynchronous = 8;

var nextValue = function (x) { return ({ done: false, value: x }); };
var iterationDone = function (x) { return ({ done: true, value: x }); };

function ChainRec(iterate, init) {
  this._iterate = iterate;
  this._init = init;
}

ChainRec.prototype = Object.create(Action.prototype);

ChainRec.prototype._exec = function(rej, res) {
  var inst = this;
  var cancel = emptyFn, i = 0;
  (function recur(state) {
    var timing = Undetermined;
    function chainRecRes(it) {
      i = i + 1;
      if (timing & Undetermined) {
        timing = Synchronous;
        state = it; //eslint-disable-line
      } else {
        recur(it);
      }
    }
    while (!state.done) {
      timing = Undetermined;
      var m = inst._iterate(nextValue, iterationDone, state.value);
      cancel = m._exec(rej, chainRecRes);
      if (~(timing & Synchronous)) {
        timing = Asynchronous;
        return;
      }
    }
    res(state.value);
  }(nextValue(inst._init)));
  return function() { cancel(); };
};

(ChainRec.prototype).toString = function ChainRec$toString(){
  return ("Action.chainRec(" + (showFunction(this._iterate)) + ", " + (toString(this._init)) + ")");
};

//v8 optimization
toFastProperties(ChainRec);
toFastProperties(ChainRec.prototype);

function ActionDo(generator) {
  this._generator = generator;
}

ActionDo.prototype = Object.create(Action.prototype);

ActionDo.prototype._exec = function(rej, res) {
  var iterator = this._generator();
  var recurser = new ChainRec(function(next, _, x) {
    var iteration = iterator.next(x);
    return iteration.done ? new Identity(iteration) : iteration.value.map(next);
  }, undefined);
  return recurser._exec(rej, res);
};

(ActionDo.prototype).toString = function() {
  return ("Action.do(" + (showFunction(this._generator)) + ")");
};

//v8 optimization
toFastProperties(ActionDo);
toFastProperties(ActionDo.prototype);

function CacheAction(pure) {
  this._pure = pure;
  this._cancel = emptyFn;
  this._queue = [];
  this._queued = 0;
  this._value = null;
  this._state = COLD;
}


function Queued(rej, res) {
  this[REJECTED] = rej;
  this[RESOLVED] = res;
}

CacheAction.prototype = Object.create(Action.prototype);

CacheAction.prototype.extractLeft = function() {
  return this._state & REJECTED ? [this._value] : [];
};

CacheAction.prototype.extractRight = function(){
  return this._state & RESOLVED ? [this._value] : [];
};

CacheAction.prototype._addToQueue = function(rej, res) {
  var inst = this;
  if (inst._state & FULLFILLED) { return emptyFn; }
  var i = inst._queue.push(new Queued(rej, res)) - 1;
  inst._queued = inst._queued + 1;
  return function CacheAction$removeFromQueue() {
    if (inst._state & FULLFILLED) { return; }
    inst._queue[i] = undefined;
    inst._queued = inst._queued - 1;
    if (inst._queued === 0) { inst.reset(); }
  };
};

CacheAction.prototype._drainQueue = function() {
  if (this._state & (COLD | PENDING)) { return; }
  if (this._queued === 0) { return; }
  var queue = this._queue;
  var length = queue.length;
  var state = this._state;
  var value = this._value;
  for (var i = 0; i < length; i++) {
    queue[i] && queue[i][state](value);
    queue[i] = undefined;
  }
  this._queue = undefined;
  this._queued = 0;
};

CacheAction.prototype.reject = function(reason) {
  if (this._state & FULLFILLED) { return; }
  this._value = reason;
  this._state = REJECTED;
  this._drainQueue();
};

CacheAction.prototype.resolve = function(value) {
  if (this._state & FULLFILLED) { return; }
  this._value = value;
  this._state = RESOLVED;
  this._drainQueue();
};

CacheAction.prototype.run = function() {
  var inst = this;
  if (inst._state & ACTIVE) { return; }
  inst._state = PENDING;
  inst._cancel = inst._pure._exec(
    function CacheAction$fork$rej(x) { inst.reject(x); },
    function CacheAction$fork$res(x) { inst.resolve(x); }
  );
};

CacheAction.prototype.reset = function CacheAction$reset() {
  if (this._state & COLD) { return; }
  if (this._state & FULLFILLED) { this._cancel(); }
  this._cancel = emptyFn;
  this._queue = [];
  this._queued = 0;
  this._value = undefined;
  this._state = COLD;
};

CacheAction.prototype._exec = function CacheAction$fork(rej, res) {
  var inst = this;
  var cancel = emptyFn;
  switch (inst._state) {
    case PENDING: cancel = inst._addToQueue(rej, res); break;
    case REJECTED: rej(inst._value); break;
    case RESOLVED: res(inst._value); break;
    default: cancel = inst._addToQueue(rej, res); inst.run();
  }
  return cancel;
};

CacheAction.prototype.toString = function(){
  return ((this._pure.toString()) + ".cache()");
};

//v8 optimization
toFastProperties(CacheAction);
toFastProperties(CacheAction.prototype);

function ActionWrap(fn, a, b, c) {
  this._length = arguments.length - 1;
  this._fn = fn;
  this._a = a;
  this._b = b;
  this._c = c;
  this._exec = ActionWrap.EX[this._length - 1];
}

ActionWrap.EX = [
  function(rej, res) {
    var r;
    try { r = this._fn(this._a); } catch (e) { rej(e); return emptyFn }
    res(r);
    return emptyFn;
  },
  function(rej, res) {
    var r;
    try { r = this._fn(this._a, this._b); } catch (e) { rej(e); return emptyFn }
    res(r);
    return emptyFn;
  },
  function(rej, res) {
    var r;
    try { r = this._fn(this._a, this._b, this._c); } catch (e) { rej(e); return emptyFn }
    res(r);
    return emptyFn;
  }
];

ActionWrap.prototype = Object.create(Action.prototype);

(ActionWrap.prototype).toString = function() {
  var args = [this._a, this._b, this._c].slice(0, this._length).map(showFunction).join(', ');
  var name = "wrap" + (this._length > 1 ? this._length : '');
  return ("Action." + name + "(" + (toString(this._fn)) + ", " + args + ")");
};

//v8 optimization
toFastProperties(ActionWrap);
toFastProperties(ActionWrap.prototype);

function ActionFromPromise(fn, a, b, c) {
  this._length = arguments.length - 1;
  this._fn = fn;
  this._a = a;
  this._b = b;
  this._c = c;
  this._exec = ActionFromPromise.EX[this._length - 1];
}

ActionFromPromise.EX = [
  function(rej, res) {
    var promise = this._fn(this._a);
    promise.then(res, rej);
    return emptyFn;
  },
  function(rej, res) {
    var promise = this._fn(this._a, this._b);
    promise.then(res, rej);
    return emptyFn;
  },
  function(rej, res) {
    var promise = this._fn(this._a, this._b, this._c);
    promise.then(res, rej);
    return emptyFn;
  }
];

ActionFromPromise.prototype = Object.create(Action.prototype);

ActionFromPromise.prototype.toString = function(){
  var args = [this._a, this._b, this._c].slice(0, this._length).map(showFunction).join(', ');
  var name = "fromPromise" + (this._length > 1 ? this._length : '');
  return ("Action." + name + "(" + (toString(this._fn)) + ", " + args + ")");
};

//v8 optimization
toFastProperties(ActionFromPromise);
toFastProperties(ActionFromPromise.prototype);

function ActionNode(computation) {
  this._computation = computation;
}

ActionNode.prototype = Object.create(Action.prototype);

ActionNode.prototype._exec = function(rej, res) {
  var open = true;
  this._computation(function(a, b) {
    if (open) {
      a ? rej(a) : res(b);
      open = false;
    }
  });
  return function () { return open = false; };
};

ActionNode.prototype.toString = function(){
  return ("Action.node(" + (showFunction(this._computation)) + ")");
};

//v8 optimization
toFastProperties(ActionNode);
toFastProperties(ActionNode.prototype);

var $$type = '@@type';

  function type$1(x) {
    return x != null &&
           x.constructor != null &&
           x.constructor.prototype !== x &&
           typeof x.constructor[$$type] === 'string' ?
      x.constructor[$$type] :
      Object.prototype.toString.call(x).slice('[object '.length, -']'.length);
  }

var $alt = 'fantasy-land/alt';
  var $ap$1 = 'fantasy-land/ap';
  var $map$1 = 'fantasy-land/map';
  var $of = 'fantasy-land/of';
  var $zero = 'fantasy-land/zero';

  //concurrify :: Applicative m
  //           => (TypeRep m, m a, (m a, m a) -> m a, (m a, m (a -> b)) -> m b)
  //           -> Concurrently m
  function makeParallel(Repr, zero, alt, ap){

    function Concurrently(sequential){
      this.sequential = sequential;
    }

    function construct(x){
      return new Concurrently(x);
    }

    var proto = Concurrently.prototype = construct.prototype = {constructor: construct};


    var mzero = new Concurrently(zero);
    construct[$zero] = function Concurrently$zero(){
      return mzero;
    };

    construct[$of] = function Concurrently$of(value){
      return new Concurrently(Z.of(Repr, value));
    };

    proto[$map$1] = function Concurrently$map(mapper){
      return new Concurrently(Z.map(mapper, this.sequential));
    };

    proto[$ap$1] = function Concurrently$ap(m){
      return new Concurrently(ap(this.sequential, m.sequential));
    };

    proto[$alt] = function Concurrently$alt(m){
      return new Concurrently(alt(this.sequential, m.sequential));
    };

    return construct;

  }

var action_type = 'brisk-control/Action';
var verifyAction = function (m) { return m instanceof Action || type$1(m) === action_type; };


function Action(f){
  return new BaseAction(f);
}

Action.prototype.extractLeft = function() { return [] };
Action.prototype.extractRight = function(){ return [] };
var of = function (x) { return new Identity(x); };

Action.prototype.ap = function(m) {
  return new ApplicativeAction(this, m);
};

Action.prototype.map = function(f) {
  return new MapAction(this, f);
};

Action.prototype.bimap = function(f, g) {
  return new BimapAction(this, f, g);
};

Action.prototype.chain = function(f) {
  return new ChainAction(this, f);
};

Action.prototype.chainRej = function(f) {
  return new ChainRejAction(this, f);
};

Action.prototype.mapRej = function(f) {
  return new MapRejAction(this, f);
};

Action.prototype.swap = function() {
  return new SwapAction(this);
};

Action.prototype.race = function(m) {
  return new RaceAction(this, m);
};

Action.prototype.and = function(m) {
  return new AndAction(this, m);
};

Action.prototype.or = function(m) {
  return new OrAction(this, m);
};

Action.prototype.both = function(m) {
  return new BothAction(this, m);
};

Action.prototype.fold = function(f, g) {
  return new FoldAction(this, f, g);
};

Action.prototype.hook = function(dispose, consume) {
  return new HookAction(this, dispose, consume);
};

Action.prototype.finally = function(m) {
  return new FinallyAction(this, m);
};

Action.prototype.cache = function() {
  return new CacheAction(this);
};

Action.prototype.log = function(f){
  return new LoggerAction(this, f);
};

var exec = function(rej, res){
  return this._exec(rej, res);
};

Action.prototype.exec = exec;
//backwards compatibility
Action.prototype.fork = exec;

Action.prototype.value = function(f) {
  return this._exec(function(e) {
    throw new Error(
      ("ActionInst.value was called on a rejected Action\n  Actual: Action.reject(" + (toString(e)) + ")")
    );
  }, f);
};

Action.prototype.promise = function() {
  var inst = this;
  return new Promise(function(resolve, reject) {
    inst._exec(reject, resolve);
  });
};

function ChainRecAction(f, init) {
  if (arguments.length === 1) { return function (init) { return new ChainRec(f, init); }; }
  return new ChainRec(f, init);
}
//Static methods
//-------------------------------------
Action.ap = function(values, func) {
  if (arguments.length === 1) { return function (func) { return ap(values, func); }; }
  return ap(values, func);
};

Action.map = function (mapper, m) {
  if (arguments.length === 1) { return function (m) { return map(mapper, m); }; }
  return map(mapper, m);
};

Action.bimap = function(lmapper, rmapper, m) {
  if (arguments.length === 1) { return curryN(3, bimap)(lmapper); }
  if (arguments.length === 2) { return function (m) { return bimap(lmapper, rmapper, m); }; }
  return bimap(lmapper, rmapper, m);
};

Action.chain = function(chainer, m) {
  if (arguments.length === 1) { return function (m) { return chain(chainer, m); }; }
  return chain(chainer, m);
};


Action.and = function and(left, right) {
  if (arguments.length === 1) { return function (right) { return new AndAction(left, right); }; }
  return new AndAction(left, right);
};

Action.both = function(left, right) {
  if (arguments.length === 1) { return function (right) { return new BothAction(left, right); }; }
  return new BothAction(left, right);
};

Action.reject = function(x) {
  return new ActionReject(x);
};

Action.after = function(n, x) {
  if (arguments.length === 1) { return function (x) { return new ActionAfter(n, x); }; }
  return new ActionAfter(n, x);
};

Action.rejectAfter = function(time, reason) {
  if (arguments.length === 1) { return function (reason) { return new ActionRejectAfter(time, reason); }; }
  return new ActionRejectAfter(time, reason);
};

Action.try = function(f) {
  return new ActionTry(f);
};

Action.wrap = function(f, x) {
  if (arguments.length === 1) { return function (x) { return new ActionWrap(f, x); }; }
  return new ActionWrap(f, x);
};

Action.wrap2 = function(f, x, y) {
  switch (arguments.length) {
    case 1: return curryN(2, function (x, y) { return new ActionWrap(f, x, y); });
    case 2: return function (y) { return new ActionWrap(f, x, y); };
    default:
      return new ActionWrap(f, x, y);
  }
};

Action.wrap3 = function(f, x, y, z) {
  switch (arguments.length) {
    case 1: return curryN(3, function (x, y, z) { return new ActionWrap(f, x, y, z); });
    case 2: return curryN(2, function (y, z) { return new ActionWrap(f, x, y, z); });
    case 3: return function (z) { return new ActionWrap(f, x, y, z); };
    default:
      return new ActionWrap(f, x, y, z);
  }
};

Action.fromPromise = function(f, x) {
  if (arguments.length === 1) { return function (x) { return new ActionFromPromise(f, x); }; }
  return new ActionFromPromise(f, x);
};

Action.fromPromise2 = function(f, x, y) {
  switch (arguments.length) {
    case 1: return curryN(2, function (x, y) { return new ActionFromPromise(f, x, y); });
    case 2: return function (y) { return new ActionFromPromise(f, x, y); };
    default:
      return new ActionFromPromise(f, x, y);
  }
};

Action.fromPromise3 = function(f, x, y, z) {
  switch (arguments.length) {
    case 1: return curryN(3, function (x, y, z) { return new ActionFromPromise(f, x, y, z); });
    case 2: return curryN(2, function (y, z) { return new ActionFromPromise(f, x, y, z); });
    case 3: return function (z) { return new ActionFromPromise(f, x, y, z); };
    default:
      return new ActionFromPromise(f, x, y, z);
  }
};

Action.node = function(f) {
  return new ActionNode(f);
};

Action.parallel = function(i, ms) {
  if (arguments.length === 1) { return function (ms) { return new ActionParallel(i, ms); }; }
  return new ActionParallel(i, ms);
};

Action.do = function(f) {
  return new ActionDo(f);
};

Action.chainRej = function(chainer, m) {
  if (arguments.length === 1) { return function (m) { return new ChainRejAction(m, chainer); }; }
  return new ChainRejAction(m, chainer);
};

Action.mapRej = function(mapper, m) {
  if (arguments.length === 1) { return function (m) { return new MapRejAction(m, mapper); }; }
  return new MapRejAction(m, mapper);
};

Action.race = function(right, left) {
  if (arguments.length === 1) { return function (left) { return new RaceAction(left, right); }; }
 return new RaceAction(left, right);
};

Action.or = function(left, right) {
  if (arguments.length === 1) { return function (right) { return new OrAction(left, right); }; }
  return new OrAction(left, right);
};

Action.finally = function(right, left) {
  if (arguments.length === 1) { return function (left) { return new FinallyAction(left, right); }; }
  return new FinallyAction(left, right);
};

Action.value = function(cont, m) {
  if (arguments.length === 1) { return function (m) { return m.value(cont); }; }
  return m.value(cont);
};

Action.try = function(f) {
  return new ActionTry(f);
};

Action.swap = function(m) {
  return new SwapAction(m);
};

Action.promise = function(m) {
  return m.promise();
};

Action.cache = function(m) {
  return new CacheAction(m);
};

Action.extractLeft = function(m) {
  return m.extractLeft();
};

Action.extractRight = function(m) {
  return m.extractRight();
};

Action.exec = function(f, g, m) {  
  if (arguments.length === 1) { return curryN(2, function (g, m) { return m._exec(f, g); }); }
  if (arguments.length === 2) { return function (m) { return m._exec(f, g); }; }
  return m._exec(f, g);
};

Action.fold = function(f, g, m) {
  if (arguments.length === 1) { return curryN(2, function (g, m) { return new FoldAction(m, f, g); }) }
  if (arguments.length === 2) { return function (m) { return new FoldAction(m, f, g); }; }
  return new FoldAction(m, f, g);
};

Action.hook = function hook(acquire, cleanup, consume) {
  if (arguments.length === 1) { return curryN(2, function (cleanup, consume) { return new HookAction(acquire, cleanup, consume); }); }
  if (arguments.length === 2) { return function (consume) { return new HookAction(acquire, cleanup, consume); }; }
  return new HookAction(acquire, cleanup, consume);
};

Action.Par = makeParallel(Action, Action.never, Action.race, function (mval, mfunc) {
  return new ActionParallelAp(mval, mfunc);
});

Action.seq = function seq(par) {
  return par.sequential;
};

Action.fork = Action.exec;
Action.never = new ActionNever;
//Fantasy-Land compatibility.
Action.of = of;
Action['fantasy-land/of'] = of;
Action['fantasy-land/chainRec'] = ChainRecAction;
Action.prototype['fantasy-land/ap'] = Action.prototype.ap;
Action.prototype['fantasy-land/map'] = Action.prototype.map;
Action.prototype['fantasy-land/bimap'] = Action.prototype.bimap;
Action.prototype['fantasy-land/chain'] = Action.prototype.chain;

Action['@@type'] = action_type;
Action.chainRec = ChainRecAction;
Action.verifyAction = verifyAction;
//v8 optimization
toFastProperties(Action);
toFastProperties(Action.prototype);

Action.Action = Action;

function BaseIO(computation){
  this.computation = computation;
}

BaseIO.prototype = Object.create(IO.prototype);

BaseIO.prototype._runIO = function(){
  return this.computation()
};

BaseIO.prototype.toString = function() {
  return ("IO(" + (showFunction(this._computation)) + ")");
};

//v8 optimization
toFastProperties(BaseIO);
toFastProperties(BaseIO.prototype);

function ChainIO(parent, chainer){
  this._parent = parent;
  this._chainer = chainer;
}

ChainIO.prototype = Object.create(IO.prototype);

ChainIO.prototype._runIO = function(){
  return this._chainer(this.parent._runIO())
};

ChainIO.prototype.toString = function() {
  return ((this._parent.toString()) + ".chain(" + (showFunction(this._chainer)) + ")");
};

//v8 optimization
toFastProperties(ChainIO);
toFastProperties(ChainIO.prototype);

var nextValue$1 = function (x) { return ({ done: false, value: x }); };
var iterationDone$1 = function (x) { return ({ done: true, value: x }); };

function ChainRecIO(iterate, init) {
  this._iterate = iterate;
  this._init = init;
}

ChainRecIO.prototype = Object.create(IO.prototype);

ChainRecIO.prototype._runIO = function () {
  var this$1 = this;

  var state = nextValue$1(this._init);
  while (state.done === false) {
     state = this$1._iterate(nextValue$1, iterationDone$1, state.value);
  }
  return state.value
};

ChainRecIO.prototype.toString = function () {
  return  ("IO.chainRec(" + (showFunction(this._iterate)) + ", " + (toString(this._init)) + ")");
};

//v8 optimization
toFastProperties(ChainRecIO);
toFastProperties(ChainRecIO.prototype);

function IdentityIO(value){
  this._value = value;
}

IdentityIO.prototype = Object.create(IO.prototype);

IdentityIO.prototype._runIO = function(){
  return this._value
};

IdentityIO.prototype.toString = function() {
  return ("IO.of(" + (toString(this._value)) + ")");
};

//v8 optimization
toFastProperties(IdentityIO);
toFastProperties(IdentityIO.prototype);

function ApplicativeIO(mval, mfunc){
  this._mval = mval;
  this._mfunc = mfunc;
}

ApplicativeIO.prototype = Object.create(IO.prototype);

ApplicativeIO.prototype._runIO = function(){
  var f = this._mval._runIO();
  return f(this._mfunc._runIO())
};

ApplicativeIO.prototype.toString = function() {
  return ((this._mval.toString()) + ".ap(" + (this._mfunc.toString()) + ")");
};

//v8 optimization
toFastProperties(ApplicativeIO);
toFastProperties(ApplicativeIO.prototype);

function MapIO(parent, mapper){
  this._parent = parent;
  this._mapper = mapper;
}

MapIO.prototype = Object.create(IO.prototype);

MapIO.prototype._runIO = function(){
 
  return this._mapper(this._parent._runIO())
};

MapIO.prototype.toString = function() {
  return ((this._parent.toString()) + ".map(" + (showFunction(this._mapper)) + ")");
};

//v8 optimization
toFastProperties(MapIO);
toFastProperties(MapIO.prototype);

var io_type = 'brisk-control/IO';
var of$1 = function (x) { return new IdentityIO(x); };

function IO(computation){
  return new BaseIO(computation)
}

IO.prototype.chain = function(f){
  return new ChainIO(this, f)
};

IO.prototype.map = function(f){
  return new MapIO(this, f)
};

IO.prototype.ap = function(m){
  return new ApplicativeIO(this, m)
};

IO.prototype.run = function() {
  return this._runIO()
};

IO.prototype.runIO = function() {
  return this._runIO()
};

function ChainRec$1(f, init) {
  if (arguments.length === 1) { return function (init) { return new ChainRecIO(f, init); }; }
  return new ChainRecIO(f, init)
}

IO.run = function(io){
  return io.run()
};

IO.runIO = function(io){
  return io.run()
};

IO.chainRec = ChainRec$1;

IO.of = of$1;

IO['fantasy-land/of'] = of$1;
IO['fantasy-land/chainRec'] = ChainRec$1;
IO.prototype['fantasy-land/ap'] = IO.prototype.ap;
IO.prototype['fantasy-land/map'] = IO.prototype.map;
IO.prototype['fantasy-land/chain'] = IO.prototype.chain;

IO.IO = function(computation){
  return new BaseIO(computation)
};

IO['@@type'] = io_type;

//v8 optimization
toFastProperties(IO);
toFastProperties(IO.prototype);

function Reader(run) {
  if (!(this instanceof Reader)) {
    return new Reader(run);
  }
  this.run = run;
}

Reader.run = function(reader) {
  return reader.run.apply(reader, [].slice.call(arguments, 1));
};

Reader.prototype['@@type'] = 'ramda-fantasy/Reader';

Reader.prototype.chain = function(f) {
  var reader = this;
  return new Reader(function(r) {
    return f(reader.run(r)).run(r);
  });
};

Reader.prototype.ap = function(a) {
  return this.chain(function(f) {
    return a.map(f);
  });
};

Reader.prototype.map = function(f) {
  return this.chain(function(a) {
    return Reader.of(f(a));
  });
};

Reader.prototype.of = function(a) {
  return new Reader(function() {
    return a;
  });
};
Reader.of = Reader.prototype.of;

Reader.ask = Reader(function (x){ return x; });

Reader.prototype.toString = function() {
  return 'Reader(' + toString(this.run) + ')';
};

Reader.T = function(M) {
  var ReaderT = function ReaderT(run) {
    if (!(this instanceof ReaderT)) {
      return new ReaderT(run);
    }
    this.run = run;
  };

  ReaderT.lift = function (x) { return ReaderT(function (_) { return x; }); };

  ReaderT.ask = ReaderT(M.of);

  ReaderT.prototype.of = ReaderT.of = function(a) {
    return ReaderT(function() {
      return M.of(a);
    });
  };

  ReaderT.prototype.chain = function(f) {
    var readerT = this;
    return ReaderT(function(e) {
      var m = readerT.run(e);
      return m.chain(function(a) {
        return f(a).run(e);
      });
    });
  };

  ReaderT.prototype.map = function(f) {
    return this.chain(function(a) {
      return ReaderT.of(f(a));
    });
  };

  ReaderT.prototype.ap = function(a) {
    var readerT = this;
    return ReaderT(function(e) {
      return readerT.run(e).ap(a.run(e));
    });
  };

  ReaderT.prototype.toString = function() {
    return 'ReaderT[' + M.name + '](' + toString(this.run) + ')';
  };

  return ReaderT;
};

//v8 optimization
toFastProperties(Reader);
toFastProperties(Reader.prototype);

var index = {
  Either: Either,
  Action: Action,
  IO: IO,
  Maybe: Maybe$1,
  Reader: Reader,
  Future:Action
};

return index;

})));
