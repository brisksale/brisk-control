'use strict';
import Action from "./action.js"
import {emptyFn, showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';
import {toString} from '../internal/invokers';

export function HookAction(acquire, dispose, consume) {
  this._acquire = acquire;
  this._dispose = dispose;
  this._consume = consume;
}

HookAction.prototype = Object.create(Action.prototype);

HookAction.prototype._exec = function(rej, res) {
  const inst = this;
  let cancel, cancelAcquire = emptyFn;
  cancelAcquire = inst._acquire._exec(rej, function(resource) {
    const disposer = function(callback) {
      return cancel = inst._dispose(resource)._exec(rej, callback);
    };
    const cancelConsume = inst._consume(resource)._exec(
      x => disposer(_ => rej(x)),
      x => disposer(_ => res(x))
    );
    cancel = function() {
      disposer(emptyFn)();
      cancelAcquire();
      cancelConsume();
    };
  });
  cancel = cancel || cancelAcquire;
  return () => cancel && cancel();
};

HookAction.prototype.toString = function() {
  return `${this._acquire.toString()}.hook(${showFunction(this._dispose)}, ${showFunction(this._consume)})`;
};

//v8 optimization
toFastProperties(HookAction);
toFastProperties(HookAction.prototype);

//----------

export function FinallyAction(computation, cleanup) {
  this._computation = computation;
  this._cleanup = cleanup;
}

FinallyAction.prototype = Object.create(Action.prototype);

FinallyAction.prototype._exec = function(rej, res) {
  const inst = this;
  let cancel;
  const cancelComputation = inst._computation._exec(function(e) {
    cancel = inst._cleanup._exec(rej, function() { rej(e) });
  }, function(x) {
    cancel = inst._cleanup._exec(rej, function() { res(x) });
  });
  if (cancel) return cancel;
  cancel = function() {
    cancelComputation();
    inst._cleanup._exec(emptyFn, emptyFn)();
  };
  return () => cancel && cancel();
};

(FinallyAction.prototype).toString = function() {
  return `${this._computation.toString()}.finally(${this._cleanup.toString()})`;
};

//v8 optimization
toFastProperties(FinallyAction);
toFastProperties(FinallyAction.prototype);

//----------

export function ActionNever() { }

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

export function ActionTry(fn) {
  this._fn = fn;
}

ActionTry.prototype = Object.create(Action.prototype);

ActionTry.prototype._exec = function(rej, res) {
  let r;
  try { r = this._fn() } catch (e) { rej(e); return emptyFn }
  res(r);
  return emptyFn;
};

(ActionTry.prototype).toString = function() {
  return `Action.try(${toString(this._fn)})`;
};

//v8 optimization
toFastProperties(ActionTry);
toFastProperties(ActionTry.prototype);