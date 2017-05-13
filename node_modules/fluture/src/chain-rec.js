import {Future, Core} from './core';
import {Next, Done} from './internal/iteration';
import {Undetermined, Synchronous, Asynchronous} from './internal/timing';
import {show, showf, noop} from './internal/fn';
import {FL} from './internal/const';

export function ChainRec(step, init){
  this._step = step;
  this._init = init;
}

ChainRec.prototype = Object.create(Core);

ChainRec.prototype._fork = function ChainRec$_fork(rej, res){

  const {_step, _init} = this;
  let timing = Undetermined, cancel = noop, state = Next(_init);

  function resolved(it){
    state = it;
    timing = timing === Undetermined ? Synchronous : drain();
  }

  function drain(){
    while(!state.done){
      timing = Undetermined;
      const m = _step(Next, Done, state.value);
      cancel = m._fork(rej, resolved);
      if(timing !== Synchronous){
        timing = Asynchronous;
        return;
      }
    }
    res(state.value);
  }

  drain();

  return function Future$chainRec$cancel(){ cancel() };

};

ChainRec.prototype.toString = function ChainRec$toString(){
  return `Future.chainRec(${showf(this._step)}, ${show(this._init)})`;
};

export function chainRec(step, init){
  return new ChainRec(step, init);
}

Future[FL.chainRec] = chainRec;
