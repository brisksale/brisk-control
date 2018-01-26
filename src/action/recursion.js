'use strict';
import Action from "./action.js"
import {emptyFn, showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';
import {toString} from '../internal/invokers';
import {Identity} from './fantasyMethods';

//data Timing = Undetermined | Synchronous | Asynchronous
const Undetermined = 2;
const Synchronous = 4;
const Asynchronous = 8;

const nextValue = x => ({ done: false, value: x });
const iterationDone = x => ({ done: true, value: x });

export function ChainRec(iterate, init) {
  this._iterate = iterate;
  this._init = init;
}

ChainRec.prototype = Object.create(Action.prototype);

ChainRec.prototype._exec = function(rej, res) {
     const inst = this;
     let cancel = emptyFn, i = 0;
     (function recur(state) {
       let timing = Undetermined;
       function chainRecRes(it) {
         i = i + 1;
         if (timing === Undetermined) {
           timing = Synchronous;
           state = it; //eslint-disable-line
         } else {
           recur(it);
         }
       }
       while (!state.done) {
         timing = Undetermined;
         const m = inst._iterate(nextValue, iterationDone, state.value);
         cancel = m._exec(rej, chainRecRes);
         if (!(timing === Synchronous)) {
           timing = Asynchronous;
           return;
         }
       }
       res(state.value);
     }(nextValue(inst._init)));
     return function() { cancel(); };
   };

(ChainRec.prototype).toString = function ChainRec$toString(){
  return `Action.chainRec(${showFunction(this._iterate)}, ${toString(this._init)})`;
};

//v8 optimization
toFastProperties(ChainRec);
toFastProperties(ChainRec.prototype);

export function ActionDo(generator) {
  this._generator = generator;
}

ActionDo.prototype = Object.create(Action.prototype);

ActionDo.prototype._exec = function(rej, res) {
  const iterator = this._generator();
  const recurser = new ChainRec(function(next, _, x) {
    const iteration = iterator.next(x);
    return iteration.done ? new Identity(iteration) : iteration.value.map(next);
  }, undefined);
  return recurser._exec(rej, res);
};

(ActionDo.prototype).toString = function() {
  return `Action.do(${showFunction(this._generator)})`;
};

//v8 optimization
toFastProperties(ActionDo);
toFastProperties(ActionDo.prototype);
