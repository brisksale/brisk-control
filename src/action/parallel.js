/*  */
'use strict';
import Action from "./action.js"
import {emptyFn, showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';
import {toString} from '../internal/invokers';


function EmptyActionParallel(rej, res) {
  res([]);
}

export function ActionParallel(max, actions) {
  this._actions = actions;
  this._length = actions.length;
  this._max = Math.min(this._length, max);
  if (actions.length === 0) this._exec = EmptyActionParallel;
}

ActionParallel.prototype = Object.create(Action.prototype);

ActionParallel.prototype._exec = function(rej, res) {
  const inst = this, cancels = new Array(inst._max), out = new Array(inst._length);
  let i = inst._max, ok = 0;
  const cancelAll = function() {
    for (let n = 0; n < inst._max; n++) cancels[n] && cancels[n]();
  };
  const run = function(action, j, c) {
    cancels[c] = action._exec(function(reason) {
      cancelAll();
      rej(reason);
    }, function(value) {
      out[j] = value;
      ok = ok + 1;
      if (i < inst._length) run(inst._actions[i], i++, c);
      else if (ok === inst._length) res(out);
    });
  };
  for (let n = 0; n < inst._max; n++) run(inst._actions[n], n, n);
  return cancelAll;
};

(ActionParallel.prototype).toString = function() {
  return `Action.parallel(${toString(this._max)}, [${this._actions.map(showFunction).join(', ')}])`;
};

//v8 optimization
toFastProperties(ActionParallel);
toFastProperties(ActionParallel.prototype);

export function ActionParallelAp(mval, mfunc) {
  this._mval = mval;
  this._mfunc = mfunc;
}

ActionParallelAp.prototype = Object.create(Action.prototype);

ActionParallelAp.prototype._exec = function(rej, res) {
  let func, val, okval = false, okfunc = false, rejected = false, c1, c2;
  function ActionParallelApRej(x) {
    if (rejected === false) {
      rejected = true;
      rej(x);
    }
  }
  c1 = this._mval._exec(ActionParallelApRej, function(x) {
    c1 = emptyFn;
    if (okval === false) return void (okfunc = true, val = x);
    res(func(x));
  });
  c2 = this._mfunc._exec(ActionParallelApRej, function(f) {
    c2 = emptyFn;
    if (okfunc === false) return void (okval = true, func = f);
    res(f(val));
  });
  return function() {
    c1();
    c2();
  };
};

(ActionParallelAp.prototype).toString = function() {
  return `new ActionParallelAp(${this._mval.toString()}, ${this._mfunc.toString()})`;
};

//v8 optimization
toFastProperties(ActionParallelAp);
toFastProperties(ActionParallelAp.prototype);

export function RaceAction(left, right) {
  this._left = left;
  this._right = right;
}

RaceAction.prototype = Object.create(Action.prototype);

RaceAction.prototype._exec = function(rej, res) {
  let cancelled = false, lcancel = emptyFn, rcancel = emptyFn;
  const cancel = function() { cancelled = true; lcancel(); rcancel() };
  const reject = function(x) { cancel(); rej(x) };
  const resolve = function(x) { cancel(); res(x) };
  lcancel = this._left._exec(reject, resolve);
  cancelled || (rcancel = this._right._exec(reject, resolve));
  return cancel;
};

(RaceAction.prototype).toString = function() {
  return `${this._left.toString()}.race(${this._right.toString()})`;
};

//v8 optimization
toFastProperties(RaceAction);
toFastProperties(RaceAction.prototype);