'use strict';
import IO from "./io.js"
import {showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';

export function ApplicativeIO(mval, mfunc){
  this._mval = mval;
  this._mfunc = mfunc;
}

ApplicativeIO.prototype = Object.create(IO.prototype)

ApplicativeIO.prototype._runIO = function(){
  let f = this._mval._runIO()
  return f(this._mfunc._runIO())
}

ApplicativeIO.prototype.toString = function() {
  return `${this._mval.toString()}.ap(${this._mfunc.toString()})`;
};

//v8 optimization
toFastProperties(ApplicativeIO);
toFastProperties(ApplicativeIO.prototype);