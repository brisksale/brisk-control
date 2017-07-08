import { equals as _equals } from 'ramda';

import { inspectf } from './view-fn';

const startPosPad = (sf, s) =>
  s.replace(/^/gm, sf).replace(sf, '');

export const showFunction = f =>
  startPosPad('  ', inspectf(2, f));

export const emptyFn = function emptyFn() { };



export const baseMap = function (f) {
  return f(this.value);
}

export const getEquals = function (constructor) {
  return function equals(that) {
    return that instanceof constructor && _equals(this.value, that.value);
  };
}

export const extend = function (Child, Parent) {
  function Ctor() {
    this.constructor = Child;
  }
  Ctor.prototype = Parent.prototype;
  Child.prototype = new Ctor();
  Child.super_ = Parent.prototype;
}

export const identity = function (x) { return x; }

export const notImplemented = function (str) {
  return function () {
    throw new Error(str + ' is not implemented');
  };
}

export const notCallable = function (fn) {
  return function () {
    throw new Error(fn + ' cannot be called directly');
  };
}

export const returnThis = function () { return this; }

export const chainRecNext = function (v) {
  return { isNext: true, value: v };
}

export const chainRecDone = function (v) {
  return { isNext: false, value: v };
}

export const deriveAp = function (Type) {
  return function (fa) {
    return this.chain(function (f) {
      return fa.chain(function (a) {
        return Type.of(f(a));
      });
    });
  };
}

export const deriveMap = function (Type) {
  return function (f) {
    return this.chain(function (a) {
      return Type.of(f(a));
    });
  };
}



