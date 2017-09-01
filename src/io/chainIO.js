'use strict';
import IO from "./io.js"
import {showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';

export function ChainIO(parent, chainer){
  this._parent = parent
  this._chainer = chainer
}

ChainIO.prototype = Object.create(IO.prototype)

ChainIO.prototype._runIO = function(){
  return this._chainer(this.parent._runIO())
}

ChainIO.prototype.toString = function() {
  return `${this._parent.toString()}.chain(${showFunction(this._chainer)})`;
};

//v8 optimization
toFastProperties(ChainIO);
toFastProperties(ChainIO.prototype);