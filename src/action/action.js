'use strict';
import {
  toString, ap, chain,
  map, bimap
} from '../internal/invokers';
import {BaseAction} from './base';
import {Identity, ApplicativeAction, MapAction, BimapAction, ChainAction} from './fantasyMethods';
import {ChainRejAction, MapRejAction, ActionReject} from './rejection';
import {ActionAfter, ActionRejectAfter} from './timerActions';
import {SwapAction} from './swap';
import {ActionParallel, ActionParallelAp, RaceAction} from './parallel';
import {AndAction, OrAction, BothAction} from './logical';
import {FoldAction} from './fold';
import {LoggerAction} from './logger';
import {HookAction, FinallyAction, ActionTry, ActionNever} from './fineControl';
import {ChainRec, ActionDo} from './recursion';
import {CacheAction} from './cached';
import {ActionWrap} from './wrap';
import {ActionFromPromise, ActionNode} from './convert';
import {type} from '../internal/type';
import curryN from "../internal/curry";
import {makeParallel} from '../internal/parallel';
import {toFastProperties} from '../internal/toFastProp';

const action_type = 'brisk-control/Action';
const verifyAction = m => 
  m instanceof Action || type(m) === action_type;


function Action(f){
  return new BaseAction(f);
}

Action.prototype.extractLeft = function() { return [] };
Action.prototype.extractRight = function(){ return [] };
const of = (x) => new Identity(x);

Action.prototype.ap = function(m) {
  return new ApplicativeAction(this, m);
};

Action.prototype.map = function(f) {
  return new MapAction(this, f);
};

Action.prototype.bimap = function(f, g) {
  return new BimapAction(this, f, g);
};

Action.prototype.chain = function(f) {
  return new ChainAction(this, f);
};

Action.prototype.chainRej = function(f) {
  return new ChainRejAction(this, f);
};

Action.prototype.mapRej = function(f) {
  return new MapRejAction(this, f);
};

Action.prototype.swap = function() {
  return new SwapAction(this);
};

Action.prototype.race = function(m) {
  return new RaceAction(this, m);
};

Action.prototype.and = function(m) {
  return new AndAction(this, m);
};

Action.prototype.or = function(m) {
  return new OrAction(this, m);
};

Action.prototype.both = function(m) {
  return new BothAction(this, m);
};

Action.prototype.fold = function(f, g) {
  return new FoldAction(this, f, g);
};

Action.prototype.hook = function(dispose, consume) {
  return new HookAction(this, dispose, consume);
};

Action.prototype.finally = function(m) {
  return new FinallyAction(this, m);
};

Action.prototype.cache = function() {
  return new CacheAction(this);
};

Action.prototype.log = function(f){
  return new LoggerAction(this, f);
}

const exec = function(rej, res){
  return this._exec(rej, res);
}

Action.prototype.exec = exec
//backwards compatibility
Action.prototype.fork = exec;

Action.prototype.value = function(f) {
  return this._exec(function(e) {
    throw new Error(
      `ActionInst.value was called on a rejected Action\n  Actual: Action.reject(${toString(e)})`
    );
  }, f);
};

Action.prototype.promise = function() {
  const inst = this;
  return new Promise(function(resolve, reject) {
    inst._exec(reject, resolve);
  });
};

function ChainRecAction(f, init) {
  if (arguments.length === 1) return init => new ChainRec(f, init);
  return new ChainRec(f, init);
}
//Static methods
//-------------------------------------
Action.ap = function(values, func) {
  if (arguments.length === 1) return func => ap(values, func);
  return ap(values, func);
};

Action.map = function (mapper, m) {
  if (arguments.length === 1) return m => map(mapper, m);
  return map(mapper, m);
};

Action.bimap = function(lmapper, rmapper, m) {
  if (arguments.length === 1) return curryN(3, bimap)(lmapper);
  if (arguments.length === 2) return m => bimap(lmapper, rmapper, m);
  return bimap(lmapper, rmapper, m);
};

Action.chain = function(chainer, m) {
  if (arguments.length === 1) return m => chain(chainer, m);
  return chain(chainer, m);
};


Action.and = function and(left, right) {
  if (arguments.length === 1) return right => new AndAction(left, right);
  return new AndAction(left, right);
};

Action.both = function(left, right) {
  if (arguments.length === 1) return right => new BothAction(left, right);
  return new BothAction(left, right);
};

Action.reject = function(x) {
  return new ActionReject(x);
};

Action.after = function(n, x) {
  if (arguments.length === 1) return x => new ActionAfter(n, x);
  return new ActionAfter(n, x);
};

Action.rejectAfter = function(time, reason) {
  if (arguments.length === 1) return reason => new ActionRejectAfter(time, reason);
  return new ActionRejectAfter(time, reason);
};

Action.try = function(f) {
  return new ActionTry(f);
};

Action.wrap = function(f, x) {
  if (arguments.length === 1) return x => new ActionWrap(f, x);
  return new ActionWrap(f, x);
};

Action.wrap2 = function(f, x, y) {
  switch (arguments.length) {
    case 1: return curryN(2, (x, y) => new ActionWrap(f, x, y));
    case 2: return y => new ActionWrap(f, x, y);
    default:
      return new ActionWrap(f, x, y);
  }
};

Action.wrap3 = function(f, x, y, z) {
  switch (arguments.length) {
    case 1: return curryN(3, (x, y, z) => new ActionWrap(f, x, y, z));
    case 2: return curryN(2, (y, z) => new ActionWrap(f, x, y, z));
    case 3: return z => new ActionWrap(f, x, y, z);
    default:
      return new ActionWrap(f, x, y, z);
  }
};

Action.fromPromise = function(f, x) {
  if (arguments.length === 1) return x => new ActionFromPromise(f, x);
  return new ActionFromPromise(f, x);
};

Action.fromPromise2 = function(f, x, y) {
  switch (arguments.length) {
    case 1: return curryN(2, (x, y) => new ActionFromPromise(f, x, y));
    case 2: return y => new ActionFromPromise(f, x, y);
    default:
      return new ActionFromPromise(f, x, y);
  }
};

Action.fromPromise3 = function(f, x, y, z) {
  switch (arguments.length) {
    case 1: return curryN(3, (x, y, z) => new ActionFromPromise(f, x, y, z));
    case 2: return curryN(2, (y, z) => new ActionFromPromise(f, x, y, z));
    case 3: return z => new ActionFromPromise(f, x, y, z);
    default:
      return new ActionFromPromise(f, x, y, z);
  }
};

Action.node = function(f) {
  return new ActionNode(f);
};

Action.parallel = function(i, ms) {
  if (arguments.length === 1) return ms => new ActionParallel(i, ms);
  return new ActionParallel(i, ms);
};

Action.do = function(f) {
  return new ActionDo(f);
};

Action.chainRej = function(chainer, m) {
  if (arguments.length === 1) return m => new ChainRejAction(m, chainer);
  return new ChainRejAction(m, chainer);
};

Action.mapRej = function(mapper, m) {
  if (arguments.length === 1) return m => new MapRejAction(m, mapper);
  return new MapRejAction(m, mapper);
};

Action.race = function(right, left) {
  if (arguments.length === 1) return left => new RaceAction(left, right);
 return new RaceAction(left, right);
};

Action.or = function(left, right) {
  if (arguments.length === 1) return right => new OrAction(left, right);
  return new OrAction(left, right);
};

Action.finally = function(right, left) {
  if (arguments.length === 1) return left => new FinallyAction(left, right);
  return new FinallyAction(left, right);
};

Action.value = function(cont, m) {
  if (arguments.length === 1) return m => m.value(cont);
  return m.value(cont);
};

Action.try = function(f) {
  return new ActionTry(f);
};

Action.swap = function(m) {
  return new SwapAction(m);
};

Action.promise = function(m) {
  return m.promise();
};

Action.cache = function(m) {
  return new CacheAction(m);
};

Action.extractLeft = function(m) {
  return m.extractLeft();
};

Action.extractRight = function(m) {
  return m.extractRight();
};

Action.exec = function(f, g, m) {  
  if (arguments.length === 1) return curryN(2, (g, m) => m._exec(f, g));
  if (arguments.length === 2) return (m) => m._exec(f, g);
  return m._exec(f, g);
};

Action.fold = function(f, g, m) {
  if (arguments.length === 1) return curryN(2, (g, m) => new FoldAction(m, f, g))
  if (arguments.length === 2) return m => new FoldAction(m, f, g);
  return new FoldAction(m, f, g);
};

Action.hook = function hook(acquire, cleanup, consume) {
  if (arguments.length === 1) return curryN(2, (cleanup, consume) => new HookAction(acquire, cleanup, consume));
  if (arguments.length === 2) return consume => new HookAction(acquire, cleanup, consume);
  return new HookAction(acquire, cleanup, consume);
};

Action.Par = makeParallel(Action, Action.never, Action.race, function (mval, mfunc) {
  return new ActionParallelAp(mval, mfunc);
});

Action.seq = function seq(par) {
  return par.sequential;
};

Action.fork = Action.exec;
Action.never = new ActionNever;
//Fantasy-Land compatibility.
Action.of = of;
Action['fantasy-land/of'] = of;
Action['fantasy-land/chainRec'] = ChainRecAction;
Action.prototype['fantasy-land/ap'] = Action.prototype.ap;
Action.prototype['fantasy-land/map'] = Action.prototype.map;
Action.prototype['fantasy-land/bimap'] = Action.prototype.bimap;
Action.prototype['fantasy-land/chain'] = Action.prototype.chain;

Action['@@type'] = action_type;
Action.chainRec = ChainRecAction;
Action.verifyAction = verifyAction;
//v8 optimization
toFastProperties(Action);
toFastProperties(Action.prototype);

Action.Action = Action;

export default Action;