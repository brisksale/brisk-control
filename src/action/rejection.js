'use strict';
import Action from "./action.js"
import {emptyFn, showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';
import {toString} from '../internal/invokers';

export function ChainRejAction(parent, chainer) {
  this._parent = parent;
  this._chainer = chainer;
}

ChainRejAction.prototype = Object.create(Action.prototype);

ChainRejAction.prototype._exec = function(rej, res) {
  const inst = this;
  let cancel;
  const r = inst._parent._exec(function(x) {
    const m = inst._chainer(x);
    cancel = m._exec(rej, res);
  }, res);
  return cancel || (cancel = r, function() { cancel ? cancel() : null });
};

(ChainRejAction.prototype).toString = function() {
  return `${this._parent.toString()}.chainRej(${showFunction(this._chainer)})`;
};

//v8 optimization
toFastProperties(ChainRejAction);
toFastProperties(ChainRejAction.prototype);

export function MapRejAction(parent, mapper) {
  this._parent = parent;
  this._mapper = mapper;
}

MapRejAction.prototype = Object.create(Action.prototype);

MapRejAction.prototype._exec = function(rej, res) {
  const inst = this;
  return inst._parent._exec(function(x) {
    rej(inst._mapper(x));
  }, res);
};

(MapRejAction.prototype).toString = function() {
  return `${this._parent.toString()}.mapRej(${showFunction(this._mapper)})`;
};

//v8 optimization
toFastProperties(MapRejAction);
toFastProperties(MapRejAction.prototype);

export function ActionReject(reason) {
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
  return `Action.reject(${toString(this._reason)})`;
};

//v8 optimization
toFastProperties(ActionReject);
toFastProperties(ActionReject.prototype);