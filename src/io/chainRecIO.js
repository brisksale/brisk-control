'use strict';
import IO from "./io.js"
import { emptyFn, showFunction } from "../internal/util";
import { toFastProperties } from '../internal/toFastProp';
import { toString } from '../internal/invokers';

const nextValue = x => ({ done: false, value: x });
const iterationDone = x => ({ done: true, value: x });

export function ChainRecIO(iterate, init) {
  this._iterate = iterate;
  this._init = init;
}

ChainRecIO.prototype = Object.create(IO.prototype)

ChainRecIO.prototype._runIO = function () {
  let state = nextValue(this._init);
  while (state.done === false) {
     state = this._iterate(nextValue, iterationDone, state.value);
  }
  return state.value
}

ChainRecIO.prototype.toString = function () {
  return  `IO.chainRec(${showFunction(this._iterate)}, ${toString(this._init)})`;
};

//v8 optimization
toFastProperties(ChainRecIO);
toFastProperties(ChainRecIO.prototype);