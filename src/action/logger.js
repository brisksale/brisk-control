'use strict';
import Action from "./action.js"
import {emptyFn, showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';
import {toString} from '../internal/invokers';

const fn = x => x;

export function LoggerAction(parent, mapper) {
  this._parent = parent;
  this._mapper = mapper ? mapper : fn;
}

LoggerAction.prototype = Object.create(Action.prototype);

LoggerAction.prototype._exec = function(rej, res) {
  const inst = this;
  return inst._parent._exec(rej, function(x) {
    res(x);
    
    console.log(`Action Logger called\n${inst.toString()}`);
    console.dir(inst._mapper(x), {colors:true})
    console.log(`\n`);
  });
};

LoggerAction.prototype.toString = function(){
  return `${this._parent.toString()}.log(${showFunction(this._mapper)})`;
};

//v8 optimization
toFastProperties(LoggerAction);
toFastProperties(LoggerAction.prototype);