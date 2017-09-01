'use strict';
import IO from "./io.js"
import {showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';

export function MapIO(parent, mapper){
  this._parent = parent;
  this._mapper = mapper;
}

MapIO.prototype = Object.create(IO.prototype)

MapIO.prototype._runIO = function(){
 
  return this._mapper(this._parent._runIO())
}

MapIO.prototype.toString = function() {
  return `${this._parent.toString()}.map(${showFunction(this._mapper)})`;
};

//v8 optimization
toFastProperties(MapIO);
toFastProperties(MapIO.prototype);