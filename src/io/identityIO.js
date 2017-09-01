'use strict';
import IO from "./io.js"
import {emptyFn, showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';
import {toString} from '../internal/invokers';

export function IdentityIO(value){
  this._value = value;
}

IdentityIO.prototype = Object.create(IO.prototype)

IdentityIO.prototype._runIO = function(){
  return this._value
}

IdentityIO.prototype.toString = function() {
  return `IO.of(${toString(this._value)})`;
};

//v8 optimization
toFastProperties(IdentityIO);
toFastProperties(IdentityIO.prototype);