'use strict';
import Action from "./action.js"
import {emptyFn, showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';
import {toString} from '../internal/invokers';

export function SwapAction(parent) {
  this._parent = parent;
}

SwapAction.prototype = Object.create(Action.prototype);

SwapAction.prototype._exec = function(rej, res) {
  return this._parent._exec(res, rej);
};

(SwapAction.prototype).toString = function() {
  return `${this._parent.toString()}.swap()`;
};

//v8 optimization
toFastProperties(SwapAction);
toFastProperties(SwapAction.prototype);