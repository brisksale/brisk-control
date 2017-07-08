'use strict';
import Action from "./action.js"
import {emptyFn, showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';

export function FoldAction(parent, lfold, rfold) {
  this._parent = parent;
  this._lfold = lfold;
  this._rfold = rfold;
}

FoldAction.prototype = Object.create(Action.prototype);

FoldAction.prototype._exec = function(rej, res) {
  const inst = this;
  return inst._parent._exec(function(x) {
    res(inst._lfold(x));
  }, function(x) {
    res(inst._rfold(x));
  });
};

(FoldAction.prototype).toString = function() {
  return `${this._parent.toString()}.fold(${showFunction(this._lfold)}, ${showFunction(this._rfold)})`;
};

//v8 optimization
toFastProperties(FoldAction);
toFastProperties(FoldAction.prototype);