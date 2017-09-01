'use strict';
import IO from "./io.js"
import {showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';

export function BaseIO(computation){
  this.computation = computation
}

BaseIO.prototype = Object.create(IO.prototype)

BaseIO.prototype._runIO = function(){
  return this.computation()
}

BaseIO.prototype.toString = function() {
  return `IO(${showFunction(this._computation)})`;
};

//v8 optimization
toFastProperties(BaseIO);
toFastProperties(BaseIO.prototype);