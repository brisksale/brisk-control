'use strict';
import Action from "./action.js"
import {emptyFn, showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';


export function BaseAction(computation){
  this._computation = computation;
}

BaseAction.prototype = Object.create(Action.prototype);

BaseAction.prototype._exec = function(rej, res) {
  let open = true;
  const f = this._computation(function(x) {
    if (open) {
      open = false;
      rej(x);
    }
  }, function(x) {
    if (open) {
      open = false;
      res(x);
    }
  });
  
  return open === false ? emptyFn :
    function cancel() {
      open && f && f();
      open = false;
    };
};

BaseAction.prototype.toString = function() {
  return `Action(${showFunction(this._computation)})`;
};

//v8 optimization
toFastProperties(BaseAction);
toFastProperties(BaseAction.prototype);

