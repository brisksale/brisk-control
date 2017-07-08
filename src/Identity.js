import {toString} from "ramda";
import * as util from './internal/util';
import {toFastProperties} from './internal/toFastProp';

/**
 * A data type that holds a value and exposes a monadic api.
 */

/**
 * Constructs a new `Identity[a]` data type that holds a single
 * value `a`.
 * @param {*} a Value of any type
 * @sig a -> Identity[a]
 */
export default function Identity(x) {
  if (!(this instanceof Identity)) {
    return new Identity(x);
  }
  this.value = x;
}

Identity.prototype['@@type'] = 'ramda-fantasy/Identity';

/**
 * Applicative specification. Creates a new `Identity[a]` holding the value `a`.
 * @param {*} a Value of any type
 * @returns Identity[a]
 * @sig a -> Identity[a]
 */
Identity.of = function(x) {
  return new Identity(x);
};
Identity.prototype.of = Identity.of;

/**
 * Functor specification. Creates a new `Identity[a]` mapping function `f` onto
 * `a` returning any value b.
 * @param {Function} f Maps `a` to any value `b`
 * @returns Identity[b]
 * @sig @Identity[a] => (a -> b) -> Identity[b]
 */
Identity.prototype.map = function(f) {
  return new Identity(f(this.value));
};

/**
 * Apply specification. Applies the function inside the `Identity[a]`
 * type to another applicative type.
 * @param {Applicative[a]} app Applicative that will apply its function
 * @returns Applicative[b]
 * @sig (Identity[a -> b], f: Applicative[_]) => f[a] -> f[b]
 */
Identity.prototype.ap = function(app) {
  return app.map(this.value);
};

/**
 * Chain specification. Transforms the value of the `Identity[a]`
 * type using an unary function to monads. The `Identity[a]` type
 * should contain a function, otherwise an error is thrown.
 *
 * @param {Function} fn Transforms `a` into a `Monad[b]`
 * @returns Monad[b]
 * @sig (Identity[a], m: Monad[_]) => (a -> m[b]) -> m[b]
 */
Identity.prototype.chain = function(fn) {
  return fn(this.value);
};

// chainRec
Identity.chainRec = Identity.prototype.chainRec = function(f, i) {
  var state = util.chainRecNext(i);
  while (state.isNext) {
    state = f(util.chainRecNext, util.chainRecDone, state.value).get();
  }
  return Identity(state.value);
};

/**
 * Returns the value of `Identity[a]`
 *
 * @returns a
 * @sig (Identity[a]) => a
 */
Identity.prototype.get = function() {
  return this.value;
};

// equality method to enable testing
Identity.prototype.equals = util.getEquals(Identity);

Identity.prototype.toString = function() {
  return 'Identity(' + toString(this.value) + ')';
};


//v8 optimization
toFastProperties(Identity);
toFastProperties(Identity.prototype);
