import {Core, isFuture} from './core';
import {noop, show, showf, partial1, partial2} from './internal/fn';
import {isFunction} from './internal/is';
import {invalidArgument, invalidFuture} from './internal/throw';

function check$dispose(m, f, x){
  if(!isFuture(m)) invalidFuture(
    'Future.hook',
    'the first function its given to return a Future',
    m,
    `\n  From calling: ${showf(f)}\n  With: ${show(x)}`
  );
}

function check$consume(m, f, x){
  if(!isFuture(m)) invalidFuture(
    'Future.hook',
    'the second function its given to return a Future',
    m,
    `\n  From calling: ${showf(f)}\n  With: ${show(x)}`
  );
}

export function Hook(acquire, dispose, consume){
  this._acquire = acquire;
  this._dispose = dispose;
  this._consume = consume;
}

Hook.prototype = Object.create(Core);

Hook.prototype._fork = function Hook$fork(rej, res){

  const {_acquire, _dispose, _consume} = this;
  let cancel, cancelAcquire = noop, cancelConsume = noop, resource, value, cont = noop;

  function Hook$done(){
    cont(value);
  }

  function Hook$dispose(){
    const disposal = _dispose(resource);
    check$dispose(disposal, _dispose, resource);
    cancel = disposal._fork(rej, Hook$done);
    return cancel;
  }

  function Hook$cancelConsuption(){
    cancelConsume();
    Hook$dispose()();
  }

  function Hook$consumptionRejected(x){
    cont = rej;
    value = x;
    Hook$dispose();
  }

  function Hook$consumptionResolved(x){
    cont = res;
    value = x;
    Hook$dispose();
  }

  function Hook$acquireResolved(x){
    resource = x;
    const consumption = _consume(resource);
    check$consume(consumption, _consume, resource);
    cancel = Hook$cancelConsuption;
    cancelConsume = consumption._fork(Hook$consumptionRejected, Hook$consumptionResolved);
  }

  cancelAcquire = _acquire._fork(rej, Hook$acquireResolved);

  cancel = cancel || cancelAcquire;

  return function Hook$fork$cancel(){ cancel() };

};

Hook.prototype.toString = function Hook$toString(){
  const {_acquire, _dispose, _consume} = this;
  return `Future.hook(${_acquire.toString()}, ${showf(_dispose)}, ${showf(_consume)})`;
};

function hook$acquire$cleanup(acquire, cleanup, consume){
  if(!isFunction(consume)) invalidArgument('Future.hook', 2, 'be a Future', consume);
  return new Hook(acquire, cleanup, consume);
}

function hook$acquire(acquire, cleanup, consume){
  if(!isFunction(cleanup)) invalidArgument('Future.hook', 1, 'be a function', cleanup);
  if(arguments.length === 2) return partial2(hook$acquire$cleanup, acquire, cleanup);
  return hook$acquire$cleanup(acquire, cleanup, consume);
}

export function hook(acquire, cleanup, consume){
  if(!isFuture(acquire)) invalidFuture('Future.hook', 0, acquire);
  if(arguments.length === 1) return partial1(hook$acquire, acquire);
  if(arguments.length === 2) return hook$acquire(acquire, cleanup);
  return hook$acquire(acquire, cleanup, consume);
}
