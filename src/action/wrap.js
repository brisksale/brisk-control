'use strict';
import Action from "./action.js"
import {emptyFn, showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';
import {toString} from '../internal/invokers';

export function ActionWrap(fn, a, b, c) {
  this._length = arguments.length - 1;
  this._fn = fn;
  this._a = a;
  this._b = b;
  this._c = c;
  this._exec = ActionWrap.EX[this._length - 1];
}

ActionWrap.EX = [
  function(rej, res) {
    let r;
    try { r = this._fn(this._a) } catch (e) { rej(e); return emptyFn }
    res(r);
    return emptyFn;
  },
  function(rej, res) {
    let r;
    try { r = this._fn(this._a, this._b) } catch (e) { rej(e); return emptyFn }
    res(r);
    return emptyFn;
  },
  function(rej, res) {
    let r;
    try { r = this._fn(this._a, this._b, this._c) } catch (e) { rej(e); return emptyFn }
    res(r);
    return emptyFn;
  }
];

ActionWrap.prototype = Object.create(Action.prototype);

(ActionWrap.prototype).toString = function() {
  const args = [this._a, this._b, this._c].slice(0, this._length).map(showFunction).join(', ');
  const name = `wrap${this._length > 1 ? this._length : ''}`;
  return `Action.${name}(${toString(this._fn)}, ${args})`;
};

//v8 optimization
toFastProperties(ActionWrap);
toFastProperties(ActionWrap.prototype);