'use strict';
import Action from "./action.js"
import {emptyFn, showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';
import {COLD, REJECTED, RESOLVED, FULLFILLED, ACTIVE, PENDING} from '../internal/bitMask';
export function CacheAction(pure) {
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
  const inst = this;
  if (inst._state & FULLFILLED) return emptyFn;
  const i = inst._queue.push(new Queued(rej, res)) - 1;
  inst._queued = inst._queued + 1;
  return function CacheAction$removeFromQueue() {
    if (inst._state & FULLFILLED) return;
    inst._queue[i] = undefined;
    inst._queued = inst._queued - 1;
    if (inst._queued === 0) inst.reset();
  };
};

CacheAction.prototype._drainQueue = function() {
  if (this._state & (COLD | PENDING)) return;
  if (this._queued === 0) return;
  const queue = this._queue;
  const length = queue.length;
  const state = this._state;
  const value = this._value;
  for (let i = 0; i < length; i++) {
    queue[i] && queue[i][state](value);
    queue[i] = undefined;
  }
  this._queue = undefined;
  this._queued = 0;
};

CacheAction.prototype.reject = function(reason) {
  if (this._state & FULLFILLED) return;
  this._value = reason;
  this._state = REJECTED;
  this._drainQueue();
};

CacheAction.prototype.resolve = function(value) {
  if (this._state & FULLFILLED) return;
  this._value = value;
  this._state = RESOLVED;
  this._drainQueue();
};

CacheAction.prototype.run = function() {
  const inst = this;
  if (inst._state & ACTIVE) return;
  inst._state = PENDING;
  inst._cancel = inst._pure._exec(
    function CacheAction$fork$rej(x) { inst.reject(x) },
    function CacheAction$fork$res(x) { inst.resolve(x) }
  );
};

CacheAction.prototype.reset = function CacheAction$reset() {
  if (this._state & COLD) return;
  if (this._state & FULLFILLED) this._cancel();
  this._cancel = emptyFn;
  this._queue = [];
  this._queued = 0;
  this._value = undefined;
  this._state = COLD;
};

CacheAction.prototype._exec = function CacheAction$fork(rej, res) {
  const inst = this;
  let cancel = emptyFn;
  switch (inst._state) {
    case PENDING: cancel = inst._addToQueue(rej, res); break;
    case REJECTED: rej(inst._value); break;
    case RESOLVED: res(inst._value); break;
    default: cancel = inst._addToQueue(rej, res); inst.run();
  }
  return cancel;
};

CacheAction.prototype.toString = function(){
  return `${this._pure.toString()}.cache()`;
};

//v8 optimization
toFastProperties(CacheAction);
toFastProperties(CacheAction.prototype);