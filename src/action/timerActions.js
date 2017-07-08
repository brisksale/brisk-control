'use strict';
import Action from "./action.js"
import {emptyFn, showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';
import {toString} from '../internal/invokers';

export function ActionRejectAfter(time, reason) {
  this._time = time;
  this._reason = reason;
}

ActionRejectAfter.prototype = Object.create(Action.prototype);

ActionRejectAfter.prototype.extractLeft = function() {
  return [this._reason];
};

ActionRejectAfter.prototype._exec = function(rej) {
  const id = setTimeout(rej, this._time, this._reason);
  return function() { clearTimeout(id) };
};

(ActionRejectAfter.prototype).toString = function() {
  return `Action.rejectAfter(${toString(this._time)}, ${toString(this._reason)})`;
};

//v8 optimization
toFastProperties(ActionRejectAfter);
toFastProperties(ActionRejectAfter.prototype);

export function ActionAfter(time, value) {
  this._time = time;
  this._value = value;
}

ActionAfter.prototype = Object.create(Action.prototype);

ActionAfter.prototype.extractRight = function() {
  return [this._value];
};

ActionAfter.prototype._exec = function(rej, res) {
  const id = setTimeout(res, this._time, this._value);
  return function () { clearTimeout(id) };
};

(ActionAfter.prototype).toString = function() {
  return `Action.after(${toString(this._time)}, ${toString(this._value)})`;
};

//v8 optimization
toFastProperties(ActionAfter);
toFastProperties(ActionAfter.prototype);
