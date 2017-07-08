'use strict';
import Action from "./action.js"
import {emptyFn, showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';
import {toString} from '../internal/invokers';

export function ActionFromPromise(fn, a, b, c) {
  this._length = arguments.length - 1;
  this._fn = fn;
  this._a = a;
  this._b = b;
  this._c = c;
  this._exec = ActionFromPromise.EX[this._length - 1];
}

ActionFromPromise.EX = [
  function(rej, res) {
    const promise = this._fn(this._a);
    promise.then(res, rej);
    return emptyFn;
  },
  function(rej, res) {
    const promise = this._fn(this._a, this._b);
    promise.then(res, rej);
    return emptyFn;
  },
  function(rej, res) {
    const promise = this._fn(this._a, this._b, this._c);
    promise.then(res, rej);
    return emptyFn;
  }
];

ActionFromPromise.prototype = Object.create(Action.prototype);

ActionFromPromise.prototype.toString = function(){
  const args = [this._a, this._b, this._c].slice(0, this._length).map(showFunction).join(', ');
  const name = `fromPromise${this._length > 1 ? this._length : ''}`;
  return `Action.${name}(${toString(this._fn)}, ${args})`;
};

//v8 optimization
toFastProperties(ActionFromPromise);
toFastProperties(ActionFromPromise.prototype);

export function ActionNode(computation) {
  this._computation = computation;
}

ActionNode.prototype = Object.create(Action.prototype);

ActionNode.prototype._exec = function(rej, res) {
  let open = true;
  this._computation(function(a, b) {
    if (open) {
      a ? rej(a) : res(b);
      open = false;
    }
  });
  return () => open = false;
};

ActionNode.prototype.toString = function(){
  return `Action.node(${showFunction(this._computation)})`;
};

//v8 optimization
toFastProperties(ActionNode);
toFastProperties(ActionNode.prototype);

