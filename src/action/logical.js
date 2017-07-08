'use strict';
import Action from "./action.js"
import {emptyFn, showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';
import {toString} from '../internal/invokers';
import {REJECTED, RESOLVED, NO_STATE} from '../internal/bitMask';

export function AndAction(left, right){
  this._left = left;
  this._right = right;
}

AndAction.prototype = Object.create(Action.prototype);

AndAction.prototype._exec = function(rej, res) {
  let state = NO_STATE, val, lcancel = emptyFn, rcancel = emptyFn;
  lcancel = this._left._exec(
    e => { state = REJECTED; rcancel(); rej(e) },
    _ => state & REJECTED ? rej(val) : state & RESOLVED ? res(val) : (state = RESOLVED)
  );
  rcancel = this._right._exec(
    e => state & RESOLVED ? rej(e) : (state = REJECTED, val = e),
    x => state & RESOLVED ? res(x) : (state = RESOLVED, val = x)
  );
  return function() { lcancel(); rcancel() };
};

(AndAction.prototype).toString = function() {
  return `${this._left.toString()}.and(${this._right.toString()})`;
};

//v8 optimization
toFastProperties(AndAction);
toFastProperties(AndAction.prototype);

//----------

export function OrAction(left, right) {
  this._left = left;
  this._right = right;
}

OrAction.prototype = Object.create(Action.prototype);

OrAction.prototype._exec = function(rej, res) {
  let state = NO_STATE, val, err, lcancel = emptyFn, rcancel = emptyFn;
  lcancel = this._left._exec(
    _ => state = REJECTED ? rej(err) : state & RESOLVED ? res(val) : (state = REJECTED),
    x => { state = RESOLVED; rcancel(); res(x) }
  );
  state & RESOLVED || (rcancel = this._right._exec(
    e => state & RESOLVED || (state & REJECTED ? rej(e) : (err = e, state = REJECTED)),
    x => state & RESOLVED || (state & REJECTED ? res(x) : (val = x, state = RESOLVED))
  ));
  return function() { lcancel(); rcancel() };
};

(OrAction.prototype).toString = function() {
  return `${this._left.toString()}.or(${this._right.toString()})`;
};

//v8 optimization
toFastProperties(OrAction);
toFastProperties(OrAction.prototype);

//----------

export function BothAction(left, right) {
  this._left = left;
  this._right = right;
}

BothAction.prototype = Object.create(Action.prototype);

BothAction.prototype._exec = function(rej, res) {
   let state = NO_STATE, lcancel = emptyFn, rcancel = emptyFn;
  const tuple = new Array(2);
  lcancel = this._left._exec(function(e) {
    state = REJECTED; rcancel(); rej(e);
  }, function (x) {
    tuple[0] = x;
    if (state & RESOLVED) res(tuple);
    else (state = RESOLVED);
  });
  state & REJECTED || (rcancel = this._right._exec(function(e) {
    state = REJECTED; lcancel(); rej(e);
  }, function(x) {
    tuple[1] = x;
    if (state & RESOLVED) res(tuple);
    else (state = RESOLVED);
  }));
  return function(){ lcancel(); rcancel() };
};

(BothAction.prototype).toString = function() {
  return `${this._left.toString()}.both(${this._right.toString()})`;
};

//v8 optimization
toFastProperties(BothAction);
toFastProperties(BothAction.prototype);