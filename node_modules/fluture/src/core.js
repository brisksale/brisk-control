/*eslint no-param-reassign:0, no-cond-assign:0, no-unmodified-loop-condition:0 */

import Denque from 'denque';

import {show, showf, noop, moop} from './internal/fn';
import {isFunction} from './internal/is';
import {error, typeError, invalidArgument, invalidContext, invalidFuture} from './internal/throw';
import {FL, $$type} from './internal/const';
import type from 'sanctuary-type-identifiers';

const throwRejection = x => error(
  `Future#value was called on a rejected Future\n  Actual: Future.reject(${show(x)})`
);

export function Future(computation){
  if(!isFunction(computation)) invalidArgument('Future', 0, 'be a Function', computation);
  return new Computation(computation);
}

export function isFuture(x){
  return x instanceof Future || type(x) === $$type;
}

Future.prototype[FL.ap] = function Future$FL$ap(other){
  return other._ap(this);
};

Future.prototype[FL.map] = function Future$FL$map(mapper){
  return this._map(mapper);
};

Future.prototype[FL.bimap] = function Future$FL$bimap(lmapper, rmapper){
  return this._bimap(lmapper, rmapper);
};

Future.prototype[FL.chain] = function Future$FL$chain(mapper){
  return this._chain(mapper);
};

Future.prototype.ap = function Future$ap(other){
  if(!isFuture(this)) invalidContext('Future#ap', this);
  if(!isFuture(other)) invalidFuture('Future#ap', 0, other);
  return this._ap(other);
};

Future.prototype.map = function Future$map(mapper){
  if(!isFuture(this)) invalidContext('Future#map', this);
  if(!isFunction(mapper)) invalidArgument('Future#map', 0, 'to be a Function', mapper);
  return this._map(mapper);
};

Future.prototype.bimap = function Future$bimap(lmapper, rmapper){
  if(!isFuture(this)) invalidContext('Future#bimap', this);
  if(!isFunction(lmapper)) invalidArgument('Future#bimap', 0, 'to be a Function', lmapper);
  if(!isFunction(rmapper)) invalidArgument('Future#bimap', 1, 'to be a Function', rmapper);
  return this._bimap(lmapper, rmapper);
};

Future.prototype.chain = function Future$chain(mapper){
  if(!isFuture(this)) invalidContext('Future#chain', this);
  if(!isFunction(mapper)) invalidArgument('Future#chain', 0, 'to be a Function', mapper);
  return this._chain(mapper);
};

Future.prototype.mapRej = function Future$mapRej(mapper){
  if(!isFuture(this)) invalidContext('Future#mapRej', this);
  if(!isFunction(mapper)) invalidArgument('Future#mapRej', 0, 'to be a Function', mapper);
  return this._mapRej(mapper);
};

Future.prototype.chainRej = function Future$chainRej(mapper){
  if(!isFuture(this)) invalidContext('Future#chainRej', this);
  if(!isFunction(mapper)) invalidArgument('Future#chainRej', 0, 'to be a Function', mapper);
  return this._chainRej(mapper);
};

Future.prototype.race = function Future$race(other){
  if(!isFuture(this)) invalidContext('Future#race', this);
  if(!isFuture(other)) invalidFuture('Future#race', 0, other);
  return this._race(other);
};

Future.prototype.both = function Future$both(other){
  if(!isFuture(this)) invalidContext('Future#both', this);
  if(!isFuture(other)) invalidFuture('Future#both', 0, other);
  return this._both(other);
};

Future.prototype.and = function Future$and(other){
  if(!isFuture(this)) invalidContext('Future#and', this);
  if(!isFuture(other)) invalidFuture('Future#and', 0, other);
  return this._and(other);
};

Future.prototype.or = function Future$or(other){
  if(!isFuture(this)) invalidContext('Future#or', this);
  if(!isFuture(other)) invalidFuture('Future#or', 0, other);
  return this._or(other);
};

Future.prototype.swap = function Future$swap(){
  if(!isFuture(this)) invalidContext('Future#ap', this);
  return this._swap();
};

Future.prototype.fold = function Future$fold(lmapper, rmapper){
  if(!isFuture(this)) invalidContext('Future#ap', this);
  if(!isFunction(lmapper)) invalidArgument('Future#fold', 0, 'to be a Function', lmapper);
  if(!isFunction(rmapper)) invalidArgument('Future#fold', 1, 'to be a Function', rmapper);
  return this._fold(lmapper, rmapper);
};

Future.prototype.finally = function Future$finally(other){
  if(!isFuture(this)) invalidContext('Future#finally', this);
  if(!isFuture(other)) invalidFuture('Future#finally', 0, other);
  return this._finally(other);
};

Future.prototype.lastly = function Future$lastly(other){
  if(!isFuture(this)) invalidContext('Future#lastly', this);
  if(!isFuture(other)) invalidFuture('Future#lastly', 0, other);
  return this._finally(other);
};

Future.prototype.fork = function Future$fork(rej, res){
  if(!isFuture(this)) invalidContext('Future#fork', this);
  if(!isFunction(rej)) invalidArgument('Future#fork', 0, 'to be a Function', rej);
  if(!isFunction(res)) invalidArgument('Future#fork', 0, 'to be a Function', res);
  return this._fork(rej, res);
};

Future.prototype.value = function Future$value(res){
  if(!isFuture(this)) invalidContext('Future#value', this);
  if(!isFunction(res)) invalidArgument('Future#value', 0, 'to be a Function', res);
  return this._fork(throwRejection, res);
};

Future.prototype.promise = function Future$promise(){
  return new Promise((res, rej) => this._fork(rej, res));
};

Future.prototype.isRejected = function Future$isRejected(){
  return false;
};

Future.prototype.isResolved = function Future$isResolved(){
  return false;
};

Future.prototype.isSettled = function Future$isSettled(){
  return this.isRejected() || this.isResolved();
};

Future.prototype.extractLeft = function Future$extractLeft(){
  return [];
};

Future.prototype.extractRight = function Future$extractRight(){
  return [];
};

export const Core = Object.create(Future.prototype);

Core._ap = function Core$ap(other){
  return new Sequence(this, [new ApAction(other)]);
};

Core._map = function Core$map(mapper){
  return new Sequence(this, [new MapAction(mapper)]);
};

Core._bimap = function Core$bimap(lmapper, rmapper){
  return new Sequence(this, [new BimapAction(lmapper, rmapper)]);
};

Core._chain = function Core$chain(mapper){
  return new Sequence(this, [new ChainAction(mapper)]);
};

Core._mapRej = function Core$mapRej(mapper){
  return new Sequence(this, [new MapRejAction(mapper)]);
};

Core._chainRej = function Core$chainRej(mapper){
  return new Sequence(this, [new ChainRejAction(mapper)]);
};

Core._race = function Core$race(other){
  return new Sequence(this, [new RaceAction(other)]);
};

Core._both = function Core$both(other){
  return new Sequence(this, [new BothAction(other)]);
};

Core._and = function Core$and(other){
  return new Sequence(this, [new AndAction(other)]);
};

Core._or = function Core$or(other){
  return new Sequence(this, [new OrAction(other)]);
};

Core._swap = function Core$swap(){
  return new Sequence(this, [new SwapAction]);
};

Core._fold = function Core$fold(lmapper, rmapper){
  return new Sequence(this, [new FoldAction(lmapper, rmapper)]);
};

Core._finally = function Core$finally(other){
  return new Sequence(this, [new FinallyAction(other)]);
};

function check$fork(f, c){
  if(!(f === undefined || (isFunction(f) && f.length === 0))) typeError(
    'Future expected its computation to return a nullary function or void'
    + `\n  Actual: ${show(f)}\n  From calling: ${showf(c)}`
  );
}

export function Computation(computation){
  this._computation = computation;
}

Computation.prototype = Object.create(Core);

Computation.prototype._fork = function Computation$_fork(rej, res){
  let open = true;
  const f = this._computation(function Computation$rej(x){
    if(open){
      open = false;
      rej(x);
    }
  }, function Computation$res(x){
    if(open){
      open = false;
      res(x);
    }
  });
  check$fork(f, this._computation);
  return function Computation$cancel(){
    open && f && f();
    open = false;
  };
};

Computation.prototype.toString = function Computation$toString(){
  return `Future(${showf(this._computation)})`;
};

export function Rejected(value){
  this._value = value;
}

Rejected.prototype = Object.create(Core);

Rejected.prototype._ap = moop;
Rejected.prototype._map = moop;
Rejected.prototype._chain = moop;
Rejected.prototype._race = moop;
Rejected.prototype._both = moop;
Rejected.prototype._and = moop;

Rejected.prototype._or = function Rejected$or(other){
  return other;
};

Rejected.prototype._finally = function Rejected$finally(other){
  return other._and(this);
};

Rejected.prototype._swap = function Rejected$swap(){
  return new Resolved(this._value);
};

Rejected.prototype._fork = function Rejected$_fork(rej){
  rej(this._value);
  return noop;
};

Rejected.prototype.isRejected = function Rejected$isRejected(){
  return true;
};

Rejected.prototype.extractLeft = function Rejected$extractLeft(){
  return [this._value];
};

Rejected.prototype.toString = function Rejected$toString(){
  return `Future.reject(${show(this._value)})`;
};

export const reject = x => new Rejected(x);

export function Resolved(value){
  this._value = value;
}

Resolved.prototype = Object.create(Core);

Resolved.prototype._race = moop;
Resolved.prototype._mapRej = moop;
Resolved.prototype._or = moop;

Resolved.prototype._and = function Resolved$and(other){
  return other;
};

Resolved.prototype._both = function Resolved$both(other){
  return other._map(x => [this._value, x]);
};

Resolved.prototype._swap = function Resolved$swap(){
  return new Rejected(this._value);
};

Resolved.prototype._finally = function Resolved$finally(other){
  return other._map(() => this._value);
};

Resolved.prototype._fork = function _fork(rej, res){
  res(this._value);
  return noop;
};

Resolved.prototype.isResolved = function Resolved$isResolved(){
  return true;
};

Resolved.prototype.extractRight = function Resolved$extractRight(){
  return [this._value];
};

Resolved.prototype.toString = function Resolved$toString(){
  return `Future.of(${show(this._value)})`;
};

export const of = x => new Resolved(x);

function Never(){}

Never.prototype = Object.create(Future.prototype);

Never.prototype._ap = moop;
Never.prototype._map = moop;
Never.prototype._bimap = moop;
Never.prototype._chain = moop;
Never.prototype._mapRej = moop;
Never.prototype._chainRej = moop;
Never.prototype._both = moop;
Never.prototype._or = moop;
Never.prototype._swap = moop;
Never.prototype._fold = moop;
Never.prototype._finally = moop;

Never.prototype._race = function Never$race(other){
  return other;
};

Never.prototype._fork = function Never$_fork(){
  return noop;
};

Never.prototype.toString = function Never$toString(){
  return 'Future.never';
};

export const never = new Never();
export const isNever = x => x === never;

function Eager(future){
  this.rej = noop;
  this.res = noop;
  this.rejected = false;
  this.resolved = false;
  this.value = null;
  this.cancel = future._fork(x => {
    this.value = x;
    this.rejected = true;
    this.cancel = noop;
    this.rej(x);
  }, x => {
    this.value = x;
    this.resolved = true;
    this.cancel = noop;
    this.res(x);
  });
}

Eager.prototype = Object.create(Core);

Eager.prototype._fork = function Eager$_fork(rej, res){
  if(this.rejected) rej(this.value);
  else if(this.resolved) res(this.value);
  else{
    this.rej = rej;
    this.res = res;
  }
  return this.cancel;
};

export class Action{
  rejected(x){ return new Rejected(x) }
  resolved(x){ return new Resolved(x) }
  run(){ return this }
  cancel(){}
}
const check$ap = f => isFunction(f) ? f : typeError(
  'Future#ap expects its first argument to be a Future of a Function'
  + `\n  Actual: Future.of(${show(f)})`
);
export class ApAction extends Action{
  constructor(other){ super(); this.other = other }
  resolved(f){ check$ap(f); return this.other._map(x => f(x)) }
  toString(){ return `ap(${this.other.toString()})` }
}
export class MapAction extends Action{
  constructor(mapper){ super(); this.mapper = mapper }
  resolved(x){ return new Resolved(this.mapper(x)) }
  toString(){ return `map(${showf(this.mapper)})` }
}
export class BimapAction extends Action{
  constructor(lmapper, rmapper){ super(); this.lmapper = lmapper; this.rmapper = rmapper }
  rejected(x){ return new Rejected(this.lmapper(x)) }
  resolved(x){ return new Resolved(this.rmapper(x)) }
  toString(){ return `bimap(${showf(this.lmapper)}, ${showf(this.rmapper)})` }
}
const check$chain = (m, f, x) => isFuture(m) ? m : invalidFuture(
  'Future#chain',
  'the function its given to return a Future',
  m,
  `\n  From calling: ${showf(f)}\n  With: ${show(x)}`
);
export class ChainAction extends Action{
  constructor(mapper){ super(); this.mapper = mapper }
  resolved(x){ return check$chain(this.mapper(x), this.mapper, x) }
  toString(){ return `chain(${showf(this.mapper)})` }
}
export class MapRejAction extends Action{
  constructor(mapper){ super(); this.mapper = mapper }
  rejected(x){ return new Rejected(this.mapper(x)) }
  toString(){ return `mapRej(${showf(this.mapper)})` }
}
const check$chainRej = (m, f, x) => isFuture(m) ? m : invalidFuture(
  'Future#chainRej',
  'the function its given to return a Future',
  m,
  `\n  From calling: ${showf(f)}\n  With: ${show(x)}`
);
export class ChainRejAction extends Action{
  constructor(mapper){ super(); this.mapper = mapper }
  rejected(x){ return check$chainRej(this.mapper(x), this.mapper, x) }
  toString(){ return `chainRej(${showf(this.mapper)})` }
}
export class SwapAction extends Action{
  constructor(){ super(); return SwapAction.instance || (SwapAction.instance = this) }
  rejected(x){ return new Resolved(x) }
  resolved(x){ return new Rejected(x) }
  toString(){ return 'swap()' }
}
export class FoldAction extends Action{
  constructor(lmapper, rmapper){ super(); this.lmapper = lmapper; this.rmapper = rmapper }
  rejected(x){ return new Resolved(this.lmapper(x)) }
  resolved(x){ return new Resolved(this.rmapper(x)) }
  toString(){ return `fold(${showf(this.lmapper)}, ${showf(this.rmapper)})` }
}
export class FinallyAction extends Action{
  constructor(other){ super(); this.other = other }
  cancel(){ this.other._fork(noop, noop)() }
  rejected(x){ return this.other._and(new Rejected(x)) }
  resolved(x){ return this.other._map(() => x) }
  toString(){ return `finally(${this.other.toString()})` }
}
export class AndAction extends Action{
  constructor(other){ super(); this.other = other }
  resolved(){ return this.other }
  toString(){ return `and(${this.other.toString()})` }
}
export class OrAction extends Action{
  constructor(other){ super(); this.other = other }
  rejected(){ return this.other }
  toString(){ return `or(${this.other.toString()})` }
}
export class RaceAction extends Action{
  constructor(other){ super(); this.other = other }
  run(early){ return new RaceActionState(early, this.other) }
  toString(){ return `race(${this.other.toString()})` }
}
export class RaceActionState extends RaceAction{
  constructor(early, other){
    super(other);
    this.cancel = other._fork(x => early(new Rejected(x), this), x => early(new Resolved(x), this));
  }
  rejected(x){ this.cancel(); return new Rejected(x) }
  resolved(x){ this.cancel(); return new Resolved(x) }
}
export class BothAction extends Action{
  constructor(other){ super(); this.other = other }
  run(early){ return new BothActionState(early, this.other) }
  resolved(x){ return this.other._map(y => [x, y]) }
  toString(){ return `both(${this.other.toString()})` }
}
export class BothActionState extends BothAction{
  constructor(early, other){
    super(new Eager(other));
    this.cancel = this.other.fork(x => early(new Rejected(x), this), noop);
  }
}

export function Sequence(spawn, actions = []){
  this._spawn = spawn;
  this._actions = actions;
}

Sequence.prototype = Object.create(Future.prototype);

Sequence.prototype._transform = function Sequence$_transform(action){
  return new Sequence(this._spawn, this._actions.concat([action]));
};

Sequence.prototype._ap = function Sequence$ap(other){
  return this._transform(new ApAction(other));
};

Sequence.prototype._map = function Sequence$map(mapper){
  return this._transform(new MapAction(mapper));
};

Sequence.prototype._bimap = function Sequence$bimap(lmapper, rmapper){
  return this._transform(new BimapAction(lmapper, rmapper));
};

Sequence.prototype._chain = function Sequence$chain(mapper){
  return this._transform(new ChainAction(mapper));
};

Sequence.prototype._mapRej = function Sequence$mapRej(mapper){
  return this._transform(new MapRejAction(mapper));
};

Sequence.prototype._chainRej = function Sequence$chainRej(mapper){
  return this._transform(new ChainRejAction(mapper));
};

Sequence.prototype._race = function Sequence$race(other){
  return isNever(other) ? this : this._transform(new RaceAction(other));
};

Sequence.prototype._both = function Sequence$both(other){
  return this._transform(new BothAction(other));
};

Sequence.prototype._and = function Sequence$and(other){
  return this._transform(new AndAction(other));
};

Sequence.prototype._or = function Sequence$or(other){
  return this._transform(new OrAction(other));
};

Sequence.prototype._swap = function Sequence$swap(){
  return this._transform(new SwapAction);
};

Sequence.prototype._fold = function Sequence$fold(lmapper, rmapper){
  return this._transform(new FoldAction(lmapper, rmapper));
};

Sequence.prototype._finally = function Sequence$finally(other){
  return this._transform(new FinallyAction(other));
};

Sequence.prototype._fork = function Sequence$_fork(rej, res){

  const actions = new Denque(this._actions);
  const runners = new Denque(this._actions.length);
  let action, cancel = noop, future = this._spawn, running, settled, async;

  function cancelAll(){
    cancel();
    action && action.cancel();
    while(running = runners.shift()) running.cancel();
    actions.clear();
    cancel = noop;
  }

  function absorb(m){
    settled = true;
    future = m;
    if(!(future instanceof Sequence)) return;
    for(let i = future._actions.length - 1; i >= 0; i--) actions.unshift(future._actions[i]);
    future = future._spawn;
  }

  function early(m, terminator){
    cancel();
    if(action !== terminator){
      action.cancel();
      while((running = runners.shift()) && running !== terminator) running.cancel();
    }
    absorb(m);
    if(async) drain();
  }

  function rejected(x){
    absorb(action.rejected(x));
    if(async) drain();
  }

  function resolved(x){
    absorb(action.resolved(x));
    if(async) drain();
  }

  function drain(){
    while(action = actions.shift() || runners.shift()){
      settled = false;
      async = false;
      cancel = future._fork(rejected, resolved);
      if(settled) continue;
      action = action.run(early);
      if(settled) continue;
      while(running = actions.shift()){
        const tmp = running.run(early);
        if(settled) break;
        runners.push(tmp);
      }
      if(settled) continue;
      async = true;
      return;
    }
    cancel = future._fork(rej, res);
  }

  drain();

  return cancelAll;

};

Sequence.prototype.toString = function Sequence$toString(){
  return `${this._spawn.toString()}${this._actions.map(x => `.${x.toString()}`).join('')}`;
};

Future['@@type'] = $$type;
Future[FL.of] = of;
