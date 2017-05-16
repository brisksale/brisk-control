////      ____ _         _
////     / ___| |       | |_
////    | |__ | | _   _ |  _\   _  ___  ___
////    |  __|| || | | || || | | ||  _// _ \
////    | |   | || |_| || || |_| || | |  __/
////    |_|   |_| \__,_||_| \__,_||_|  \___\
////
(function(global, f){

  'use strict';

  /*istanbul ignore next*/
  if(module && typeof module.exports !== 'undefined'){
    module.exports = f(
      require('concurrify'),
      require('inspect-f'),
      require('sanctuary-type-classes'),
      require('sanctuary-type-identifiers')
    );
  }else{
    global.Fluture = f(
      global.concurrify,
      global.inspectf,
      global.sanctuaryTypeClasses,
      global.sanctuaryTypeIdentifiers
    );
  }

}(/*istanbul ignore next*/(global || window || this), function(concurrify, inspectf, Z, type){

  'use strict';

  ///////////////////
  // Type checking //
  ///////////////////

  const TYPEOF_FUTURE = 'fluture/Future';
  const FL = {
    map: 'fantasy-land/map',
    bimap: 'fantasy-land/bimap',
    chain: 'fantasy-land/chain',
    chainRec: 'fantasy-land/chainRec',
    ap: 'fantasy-land/ap',
    of: 'fantasy-land/of'
  };

  function isFuture(m){
    return m instanceof Future || type(m) === TYPEOF_FUTURE;
  }

  function isThenable(m){
    return m instanceof Promise || Boolean(m) && typeof m.then === 'function';
  }

  function isFunction(f){
    return typeof f === 'function';
  }

  function isBinary(f){
    return f.length >= 2;
  }

  function isTernary(f){
    return f.length >= 3;
  }

  function isPositiveInteger(n){
    return n === Infinity || (typeof n === 'number' && n > 0 && n % 1 === 0);
  }

  function isObject(o){
    return o !== null && typeof o === 'object';
  }

  function isIterator(i){
    return isObject(i) && typeof i.next === 'function';
  }

  function isIteration(o){
    return isObject(o) && typeof o.done === 'boolean';
  }

  ///////////////
  // Utilities //
  ///////////////

  const show = Z.toString;
  const noop = function noop(){};
  const padf = (sf, s) => s.replace(/^/gm, sf).replace(sf, '');
  const showf = f => padf('  ', inspectf(2, f));
  const fid = f => f.name ? f.name : '<anonymous>';
  const ordinal = ['first', 'second', 'third', 'fourth', 'fifth'];
  const Next = x => ({done: false, value: x});
  const Done = x => ({done: true, value: x});

  //Partially apply a function with a single argument.
  function unaryPartial(f, a){
    return function partial(b, c, d){
      switch(arguments.length){
        case 1: return f(a, b);
        case 2: return f(a, b, c);
        default: return f(a, b, c, d);
      }
    };
  }

  //Partially apply a function with two arguments.
  function binaryPartial(f, a, b){
    return function partial(c, d){ return arguments.length === 1 ? f(a, b, c) : f(a, b, c, d) };
  }

  //Partially apply a function with three arguments.
  function ternaryPartial(f, a, b, c){
    return function partial(d){ return f(a, b, c, d) };
  }

  //Creates an error about an invalid argument.
  function invalidArgument(it, at, expected, actual){
    throw new TypeError(
      `${it} expects its ${ordinal[at]} argument to ${expected}\n  Actual: ${show(actual)}`
    );
  }

  //Creates an error message about a method being called with an invalid context.
  function invalidContext(it, actual){
    throw new TypeError(
      `${it} was invoked outside the context of a Future. You might want to use`
      + ` a dispatcher instead\n  Called on: ${show(actual)}`
    );
  }

  ////////////////
  // Base class //
  ////////////////

  function Future(f){
    if(!isFunction(f)) invalidArgument('Future', 0, 'be a function', f);
    return new SafeFuture(f);
  }

  function Future$of(x){
    return new FutureOf(x);
  }

  function Future$chainRec(f, init){
    if(arguments.length === 1) return unaryPartial(Future$chainRec, f);
    if(!isFunction(f)) invalidArgument('Future.chainRec', 0, 'be a function', f);
    return new ChainRec(f, init);
  }

  Future['@@type'] = TYPEOF_FUTURE;
  Future.prototype._f = null;
  Future.prototype.extractLeft = function Future$extractLeft(){ return [] };
  Future.prototype.extractRight = function Future$extractRight(){ return [] };
  Future.prototype.of = Future$of;

  Future.prototype.ap = function Future$ap(m){
    if(!isFuture(this)) invalidContext('Future#ap', this);
    if(!isFuture(m)) invalidArgument('Future#ap', 0, 'be a Future', m);
    return new FutureAp(this, m);
  };

  Future.prototype.map = function Future$map(f){
    if(!isFuture(this)) invalidContext('Future#map', this);
    if(!isFunction(f)) invalidArgument('Future#map', 0, 'be a function', f);
    return new FutureMap(this, f);
  };

  Future.prototype.bimap = function Future$bimap(f, g){
    if(!isFuture(this)) invalidContext('Future#bimap', this);
    if(!isFunction(f)) invalidArgument('Future#bimap', 0, 'be a function', f);
    if(!isFunction(g)) invalidArgument('Future#bimap', 1, 'be a function', g);
    return new FutureBimap(this, f, g);
  };

  Future.prototype.chain = function Future$chain(f){
    if(!isFuture(this)) invalidContext('Future#chain', this);
    if(!isFunction(f)) invalidArgument('Future#chain', 0, 'be a function', f);
    return new FutureChain(this, f);
  };

  Future.prototype.chainRej = function Future$chainRej(f){
    if(!isFuture(this)) invalidContext('Future.chainRej', this);
    if(!isFunction(f)) invalidArgument('Future.chainRej', 0, 'a function', f);
    return new FutureChainRej(this, f);
  };

  Future.prototype.mapRej = function Future$mapRej(f){
    if(!isFuture(this)) invalidContext('Future#mapRej', this);
    if(!isFunction(f)) invalidArgument('Future#mapRej', 0, 'be a function', f);
    return new FutureMapRej(this, f);
  };

  Future.prototype.swap = function Future$swap(){
    if(!isFuture(this)) invalidContext('Future#swap', this);
    return new FutureSwap(this);
  };

  Future.prototype.race = function Future$race(m){
    if(!isFuture(this)) invalidContext('Future#race', this);
    if(!isFuture(m)) invalidArgument('Future#race', 0, 'be a Future', m);
    return new FutureRace(this, m);
  };

  Future.prototype.and = function Future$and(m){
    if(!isFuture(this)) invalidContext('Future#and', this);
    if(!isFuture(m)) invalidArgument('Future#and', 0, 'be a Future', m);
    return new FutureAnd(this, m);
  };

  Future.prototype.or = function Future$or(m){
    if(!isFuture(this)) invalidContext('Future#or', this);
    if(!isFuture(m)) invalidArgument('Future#or', 0, 'be a Future', m);
    return new FutureOr(this, m);
  };

  Future.prototype.both = function Future$both(m){
    if(!isFuture(this)) invalidContext('Future#both', this);
    if(!isFuture(m)) invalidArgument('Future#both', 0, 'be a Future', m);
    return new FutureBoth(this, m);
  };

  Future.prototype.fold = function Future$fold(f, g){
    if(!isFuture(this)) invalidContext('Future#fold', this);
    if(!isFunction(f)) invalidArgument('Future#fold', 0, 'be a function', f);
    if(!isFunction(g)) invalidArgument('Future#fold', 1, 'be a function', g);
    return new FutureFold(this, f, g);
  };

  Future.prototype.hook = function Future$hook(dispose, consume){
    if(!isFuture(this)) invalidContext('Future#hook', this);
    if(!isFunction(dispose)) invalidArgument('Future#hook', 0, 'be a function', dispose);
    if(!isFunction(consume)) invalidArgument('Future#hook', 1, 'be a function', consume);
    return new FutureHook(this, dispose, consume);
  };

  Future.prototype.finally = function Future$finally(m){
    if(!isFuture(this)) invalidContext('Future#finally', this);
    if(!isFuture(m)) invalidArgument('Future#finally', 0, 'be a Future', m);
    return new FutureFinally(this, m);
  };

  Future.prototype.cache = function Future$cache(){
    if(!isFuture(this)) invalidContext('Future#cache', this);
    return new CachedFuture(this);
  };

  Future.prototype.fork = function Future$fork(rej, res){
    if(!isFuture(this)) invalidContext('Future#fork', this);
    if(!isFunction(rej)) invalidArgument('Future#fork', 0, 'be a function', rej);
    if(!isFunction(res)) invalidArgument('Future#fork', 1, 'be a function', res);
    return this._f(rej, res);
  };

  Future.prototype.value = function Future$value(f){
    if(!isFuture(this)) invalidContext('Future#value', this);
    if(!isFunction(f)) invalidArgument('Future#value', 0, 'be a function', f);
    return this._f(function Future$value$rej(e){
      throw new Error(
        `Future#value was called on a rejected Future\n  Actual: Future.reject(${show(e)})`
      );
    }, f);
  };

  Future.prototype.promise = function Future$promise(){
    if(!isFuture(this)) invalidContext('Future#promise', this);
    const _this = this;
    return new Promise(function Future$promise$do(resolve, reject){
      _this._f(reject, resolve);
    });
  };

  Future.of = Future$of;
  Future.chainRec = Future$chainRec;
  Future.Future = Future;
  Future.isFuture = isFuture;

  function ap$mval(mval, mfunc){
    if(!Z.Apply.test(mfunc)) invalidArgument('Future.ap', 1, 'be an Apply', mfunc);
    return Z.ap(mval, mfunc);
  }

  Future.ap = function ap(mval, mfunc){
    if(!Z.Apply.test(mval)) invalidArgument('Future.ap', 0, 'be an Apply', mval);
    if(arguments.length === 1) return unaryPartial(ap$mval, mval);
    return ap$mval(mval, mfunc);
  };

  function map$mapper(mapper, m){
    if(!Z.Functor.test(m)) invalidArgument('Future.map', 1, 'be a Functor', m);
    return Z.map(mapper, m);
  }

  Future.map = function map(mapper, m){
    if(!isFunction(mapper)) invalidArgument('Future.map', 0, 'be a Function', mapper);
    if(arguments.length === 1) return unaryPartial(map$mapper, mapper);
    return map$mapper(mapper, m);
  };

  function bimap$lmapper$rmapper(lmapper, rmapper, m){
    if(!Z.Bifunctor.test(m)) invalidArgument('Future.bimap', 2, 'be a Bifunctor', m);
    return Z.bimap(lmapper, rmapper, m);
  }

  function bimap$lmapper(lmapper, rmapper, m){
    if(!isFunction(rmapper)) invalidArgument('Future.bimap', 1, 'be a Function', rmapper);
    if(arguments.length === 2) return binaryPartial(bimap$lmapper$rmapper, lmapper, rmapper);
    return bimap$lmapper$rmapper(lmapper, rmapper, m);
  }

  Future.bimap = function bimap(lmapper, rmapper, m){
    if(!isFunction(lmapper)) invalidArgument('Future.bimap', 0, 'be a Function', lmapper);
    if(arguments.length === 1) return unaryPartial(bimap$lmapper, lmapper);
    if(arguments.length === 2) return bimap$lmapper(lmapper, rmapper);
    return bimap$lmapper(lmapper, rmapper, m);
  };

  function chain$chainer(chainer, m){
    if(!Z.Chain.test(m)) invalidArgument('Future.chain', 1, 'be a Chain', m);
    return Z.chain(chainer, m);
  }

  Future.chain = function chain(chainer, m){
    if(!isFunction(chainer)) invalidArgument('Future.chain', 0, 'be a Function', chainer);
    if(arguments.length === 1) return unaryPartial(chain$chainer, chainer);
    return chain$chainer(chainer, m);
  };

  function and$left(left, right){
    if(!isFuture(right)) invalidArgument('Future.and', 1, 'be a Future', right);
    return new FutureAnd(left, right);
  }

  Future.and = function and(left, right){
    if(!isFuture(left)) invalidArgument('Future.and', 0, 'be a Future', left);
    if(arguments.length === 1) return unaryPartial(and$left, left);
    return and$left(left, right);
  };

  function both$left(left, right){
    if(!isFuture(right)) invalidArgument('Future.both', 1, 'be a Future', right);
    return new FutureBoth(left, right);
  }

  Future.both = function both(left, right){
    if(!isFuture(left)) invalidArgument('Future.both', 0, 'be a Future', left);
    if(arguments.length === 1) return unaryPartial(both$left, left);
    return both$left(left, right);
  };

  Future.reject = function Future$reject(x){
    return new FutureReject(x);
  };

  function Future$after$n(n, x){
    return new FutureAfter(n, x);
  }

  Future.after = function Future$after(n, x){
    if(!isPositiveInteger(n)) invalidArgument('Future.after', 0, 'be a positive integer', n);
    if(arguments.length === 1) return unaryPartial(Future$after$n, n);
    return Future$after$n(n, x);
  };

  function rejectAfter$time(time, reason){
    return new FutureRejectAfter(time, reason);
  }

  Future.rejectAfter = function rejectAfter(time, reason){
    if(!isPositiveInteger(time)) invalidArgument(
      'Future.rejectAfter', 0, 'be a positive integer', time
    );
    if(arguments.length === 1) return unaryPartial(rejectAfter$time, time);
    return rejectAfter$time(time, reason);
  };

  Future.try = function Future$try(f){
    if(!isFunction(f)) invalidArgument('Future.try', 0, 'be a function', f);
    return new FutureTry(f);
  };

  Future.encase = function Future$encase(f, x){
    if(arguments.length === 1) return unaryPartial(Future$encase, f);
    if(!isFunction(f)) invalidArgument('Future.encase', 0, 'be a function', f);
    return new FutureEncase(f, x);
  };

  Future.encase2 = function Future$encase2(f, x, y){
    switch(arguments.length){
      case 1: return unaryPartial(Future$encase2, f);
      case 2: return binaryPartial(Future$encase2, f, x);
      default:
        if(!isFunction(f)) invalidArgument('Future.encase2', 0, 'be a function', f);
        if(!isBinary(f)) invalidArgument('Future.encase2', 0, 'take two arguments', f);
        return new FutureEncase(f, x, y);
    }
  };

  Future.encase3 = function Future$encase3(f, x, y, z){
    switch(arguments.length){
      case 1: return unaryPartial(Future$encase3, f);
      case 2: return binaryPartial(Future$encase3, f, x);
      case 3: return ternaryPartial(Future$encase3, f, x, y);
      default:
        if(!isFunction(f)) invalidArgument('Future.encase3', 0, 'be a function', f);
        if(!isTernary(f)) invalidArgument('Future.encase3', 0, 'take three arguments', f);
        return new FutureEncase(f, x, y, z);
    }
  };

  Future.fromPromise = function Future$fromPromise(f, x){
    if(arguments.length === 1) return unaryPartial(Future$fromPromise, f);
    if(!isFunction(f)) invalidArgument('Future.fromPromise', 0, 'be a function', f);
    return new FutureFromPromise(f, x);
  };

  Future.fromPromise2 = function Future$fromPromise2(f, x, y){
    switch(arguments.length){
      case 1: return unaryPartial(Future$fromPromise2, f);
      case 2: return binaryPartial(Future$fromPromise2, f, x);
      default:
        if(!isFunction(f)) invalidArgument('Future.fromPromise2', 0, 'be a function', f);
        if(!isBinary(f)) invalidArgument('Future.fromPromise2', 0, 'take two arguments', f);
        return new FutureFromPromise(f, x, y);
    }
  };

  Future.fromPromise3 = function Future$fromPromise3(f, x, y, z){
    switch(arguments.length){
      case 1: return unaryPartial(Future$fromPromise3, f);
      case 2: return binaryPartial(Future$fromPromise3, f, x);
      case 3: return ternaryPartial(Future$fromPromise3, f, x, y);
      default:
        if(!isFunction(f))
          invalidArgument('Future.fromPromise3', 0, 'be a function', f);
        if(!isTernary(f))
          invalidArgument('Future.fromPromise3', 0, 'take three arguments', f);
        return new FutureFromPromise(f, x, y, z);
    }
  };

  Future.node = function Future$node(f){
    if(!isFunction(f)) invalidArgument('Future.node', 0, 'be a function', f);
    return new FutureNode(f);
  };

  function parallel$i(i, ms){
    if(!Array.isArray(ms)) invalidArgument('Future.parallel', 1, 'be an array', ms);
    return new FutureParallel(i, ms);
  }

  Future.parallel = function parallel(i, ms){
    if(!isPositiveInteger(i)) invalidArgument('Future.parallel', 0, 'be a positive integer', i);
    if(arguments.length === 1) return unaryPartial(parallel$i, i);
    return parallel$i(i, ms);
  };

  Future.do = function Future$do(f){
    if(!isFunction(f)) invalidArgument('Future.do', 0, 'be a function', f);
    return new FutureDo(f);
  };

  function chainRej$chainer(chainer, m){
    if(!isFuture(m)) invalidArgument('Future.chainRej', 1, 'be a Future', m);
    return new FutureChainRej(m, chainer);
  }

  Future.chainRej = function chainRej(chainer, m){
    if(!isFunction(chainer)) invalidArgument('Future.chainRej', 0, 'be a Function', chainer);
    if(arguments.length === 1) return unaryPartial(chainRej$chainer, chainer);
    return chainRej$chainer(chainer, m);
  };

  function mapRej$mapper(mapper, m){
    if(!isFuture(m)) invalidArgument('Future.mapRej', 1, 'be a Future', m);
    return new FutureMapRej(m, mapper);
  }

  Future.mapRej = function mapRej(mapper, m){
    if(!isFunction(mapper)) invalidArgument('Future.mapRej', 0, 'be a Function', mapper);
    if(arguments.length === 1) return unaryPartial(mapRej$mapper, mapper);
    return mapRej$mapper(mapper, m);
  };

  function race$right(right, left){
    if(!isFuture(left)) invalidArgument('Future.race', 1, 'be a Future', left);
    return new FutureRace(left, right);
  }

  Future.race = function race(right, left){
    if(!isFuture(right)) invalidArgument('Future.race', 0, 'be a Future', right);
    if(arguments.length === 1) return unaryPartial(race$right, right);
    return race$right(right, left);
  };

  function or$left(left, right){
    if(!isFuture(right)) invalidArgument('Future.or', 1, 'be a Future', right);
    return new FutureOr(left, right);
  }

  Future.or = function or(left, right){
    if(!isFuture(left)) invalidArgument('Future.or', 0, 'be a Future', left);
    if(arguments.length === 1) return unaryPartial(or$left, left);
    return or$left(left, right);
  };

  function finally$right(right, left){
    if(!isFuture(left)) invalidArgument('Future.finally', 1, 'be a Future', left);
    return new FutureFinally(left, right);
  }

  Future.finally = function finally$(right, left){
    if(!isFuture(right)) invalidArgument('Future.finally', 0, 'be a Future', right);
    if(arguments.length === 1) return unaryPartial(finally$right, right);
    return finally$right(right, left);
  };

  function value$cont(cont, m){
    if(!isFuture(m)) invalidArgument('Future.value', 1, 'be a Future', m);
    return m.value(cont);
  }

  Future.value = function value(cont, m){
    if(!isFunction(cont)) invalidArgument('Future.value', 0, 'be a Function', cont);
    if(arguments.length === 1) return unaryPartial(value$cont, cont);
    return value$cont(cont, m);
  };

  Future.swap = function swap(m){
    if(!isFuture(m)) invalidArgument('Future.swap', 0, 'be a Future', m);
    return new FutureSwap(m);
  };

  Future.promise = function promise(m){
    if(!isFuture(m)) invalidArgument('Future.promise', 0, 'be a Future', m);
    return m.promise();
  };

  Future.cache = function cache(m){
    if(!isFuture(m)) invalidArgument('Future.cache', 0, 'be a Future', m);
    return new CachedFuture(m);
  };

  Future.extractLeft = function extractLeft(m){
    if(!isFuture(m)) invalidArgument('Future.extractLeft', 0, 'be a Future', m);
    return m.extractLeft();
  };

  Future.extractRight = function extractRight(m){
    if(!isFuture(m)) invalidArgument('Future.extractRight', 0, 'be a Future', m);
    return m.extractRight();
  };

  function fork$f$g(f, g, m){
    if(!isFuture(m)) invalidArgument('Future.fork', 2, 'be a Future', m);
    return m._f(f, g);
  }

  function fork$f(f, g, m){
    if(!isFunction(g)) invalidArgument('Future.fork', 1, 'be a function', g);
    if(arguments.length === 2) return binaryPartial(fork$f$g, f, g);
    return fork$f$g(f, g, m);
  }

  Future.fork = function fork(f, g, m){
    if(!isFunction(f)) invalidArgument('Future.fork', 0, 'be a function', f);
    if(arguments.length === 1) return unaryPartial(fork$f, f);
    if(arguments.length === 2) return fork$f(f, g);
    return fork$f(f, g, m);
  };

  function fold$f$g(f, g, m){
    if(!isFuture(m)) invalidArgument('Future.fold', 2, 'be a Future', m);
    return new FutureFold(m, f, g);
  }

  function fold$f(f, g, m){
    if(!isFunction(g)) invalidArgument('Future.fold', 1, 'be a function', g);
    if(arguments.length === 2) return binaryPartial(fold$f$g, f, g);
    return fold$f$g(f, g, m);
  }

  Future.fold = function fold(f, g, m){
    if(!isFunction(f)) invalidArgument('Future.fold', 0, 'be a function', f);
    if(arguments.length === 1) return unaryPartial(fold$f, f);
    if(arguments.length === 2) return fold$f(f, g);
    return fold$f(f, g, m);
  };

  function hook$acquire$cleanup(acquire, cleanup, consume){
    if(!isFunction(consume)) invalidArgument('Future.hook', 2, 'be a Future', consume);
    return new FutureHook(acquire, cleanup, consume);
  }

  function hook$acquire(acquire, cleanup, consume){
    if(!isFunction(cleanup)) invalidArgument('Future.hook', 1, 'be a function', cleanup);
    if(arguments.length === 2) return binaryPartial(hook$acquire$cleanup, acquire, cleanup);
    return hook$acquire$cleanup(acquire, cleanup, consume);
  }

  Future.hook = function hook(acquire, cleanup, consume){
    if(!isFuture(acquire)) invalidArgument('Future.hook', 0, 'be a Future', acquire);
    if(arguments.length === 1) return unaryPartial(hook$acquire, acquire);
    if(arguments.length === 2) return hook$acquire(acquire, cleanup);
    return hook$acquire(acquire, cleanup, consume);
  };

  //Utilities.
  Future.util = {
    Next,
    Done,
    isFuture,
    isThenable,
    isFunction,
    isBinary,
    isTernary,
    isPositiveInteger,
    isObject,
    isIterator,
    isIteration,
    padf,
    showf,
    fid,
    unaryPartial,
    binaryPartial,
    ternaryPartial
  };

  //Fantasy-Land compatibility.
  Future[FL.of] = Future.of;
  Future[FL.chainRec] = Future$chainRec;
  Future.prototype[FL.ap] = Future.prototype.ap;
  Future.prototype[FL.map] = Future.prototype.map;
  Future.prototype[FL.bimap] = Future.prototype.bimap;
  Future.prototype[FL.chain] = Future.prototype.chain;

  /////////////////
  // Sub classes //
  /////////////////

  function check$fork$f(f, c){
    if(!(f === undefined || (isFunction(f) && f.length === 0))) throw new TypeError(
      'Future#fork expected the computation to return a nullary function or void'
      + `\n  Actual: ${show(f)}\n  From calling: ${showf(c)}`
    );
  }

  function SafeFuture(computation){
    this._computation = computation;
  }

  SafeFuture.prototype = Object.create(Future.prototype);

  SafeFuture.prototype._f = function SafeFuture$fork(rej, res){
    let open = true;
    const f = this._computation(function SafeFuture$fork$rej(x){
      if(open){
        open = false;
        rej(x);
      }
    }, function SafeFuture$fork$res(x){
      if(open){
        open = false;
        res(x);
      }
    });
    check$fork$f(f, this._computation);
    return function SafeFuture$fork$cancel(){
      open && f && f();
      open = false;
    };
  };

  SafeFuture.prototype.toString = function SafeFuture$toString(){
    return `Future(${showf(this._computation)})`;
  };

  //----------

  //data Timing = Undetermined | Synchronous | Asynchronous
  const Undetermined = 0;
  const Synchronous = 1;
  const Asynchronous = 2;

  function check$chainRec$f(m, f, i, x){
    if(!isFuture(m)) throw new TypeError(
      'Future.chainRec expects the function its given to return a Future every'
      + ' time it is called. The value returned from'
      + (ordinal[i] ? ` the ${ordinal[i]} call` : ` call ${i}`)
      + ' was not a Future.'
      + `\n  Actual: ${show(m)}\n  From calling: ${showf(f)}\n  With: (Next, Done, ${show(x)})`
    );
  }

  function check$chainRec$it(it, i){
    if(!isIteration(it)) throw new TypeError(
      'Future.chainRec expects the function its given to return a Future of an'
      + ' Iteration every time it is called. The Future returned from'
      + (ordinal[i] ? ` the ${ordinal[i]} call` : ` call ${i}`)
      + ' did not resolve to a member of Iteration.'
      + '\n  You can create an uncomplete or complete Iteration using the next'
      + ' or done functions respectively. These are passed into your callback'
      + ' as first and second arguments.'
      + `\n  Actual: Future.of(${show(it)})`
    );
  }

  function ChainRec(iterate, init){
    this._iterate = iterate;
    this._init = init;
  }

  ChainRec.prototype = Object.create(Future.prototype);

  ChainRec.prototype._f = function ChainRec$fork(rej, res){
    const _this = this;
    let cancel = noop, i = 0;
    (function Future$chainRec$recur(state){
      let timing = Undetermined;
      function Future$chainRec$res(it){
        check$chainRec$it(it, i);
        i = i + 1;
        if(timing === Undetermined){
          timing = Synchronous;
          state = it; //eslint-disable-line
        }else{
          Future$chainRec$recur(it);
        }
      }
      while(!state.done){
        timing = Undetermined;
        const m = _this._iterate(Next, Done, state.value);
        check$chainRec$f(m, _this._iterate, i, state.value);
        cancel = m._f(rej, Future$chainRec$res);
        if(timing !== Synchronous){
          timing = Asynchronous;
          return;
        }
      }
      res(state.value);
    }(Next(_this._init)));
    return function Future$chainRec$cancel(){ cancel() };
  };

  ChainRec.prototype.toString = function ChainRec$toString(){
    return `Future.chainRec(${showf(this._iterate)}, ${show(this._init)})`;
  };

  //----------

  function CachedFuture(pure){
    this._pure = pure;
    this._cancel = noop;
    this._queue = [];
    this._queued = 0;
    this._value = null;
    this._state = Cold;
  }

  const Cold = CachedFuture.Cold = 0;
  const Pending = CachedFuture.Pending = 1;
  const Rejected = CachedFuture.Rejected = 2;
  const Resolved = CachedFuture.Resolved = 3;

  function Queued(rej, res){
    this[Rejected] = rej;
    this[Resolved] = res;
  }

  CachedFuture.prototype = Object.create(Future.prototype);

  CachedFuture.prototype.extractLeft = function CachedFuture$extractLeft(){
    return this._state === Rejected ? [this._value] : [];
  };

  CachedFuture.prototype.extractRight = function CachedFuture$extractRight(){
    return this._state === Resolved ? [this._value] : [];
  };

  CachedFuture.prototype._addToQueue = function CachedFuture$addToQueue(rej, res){
    const _this = this;
    if(_this._state > Pending) return noop;
    const i = _this._queue.push(new Queued(rej, res)) - 1;
    _this._queued = _this._queued + 1;
    return function CachedFuture$removeFromQueue(){
      if(_this._state > Pending) return;
      _this._queue[i] = undefined;
      _this._queued = _this._queued - 1;
      if(_this._queued === 0) _this.reset();
    };
  };

  CachedFuture.prototype._drainQueue = function CachedFuture$drainQueue(){
    if(this._state <= Pending) return;
    if(this._queued === 0) return;
    const queue = this._queue;
    const length = queue.length;
    const state = this._state;
    const value = this._value;
    for(let i = 0; i < length; i++){
      queue[i] && queue[i][state](value);
      queue[i] = undefined;
    }
    this._queue = undefined;
    this._queued = 0;
  };

  CachedFuture.prototype.reject = function CachedFuture$reject(reason){
    if(this._state > Pending) return;
    this._value = reason;
    this._state = Rejected;
    this._drainQueue();
  };

  CachedFuture.prototype.resolve = function CachedFuture$resolve(value){
    if(this._state > Pending) return;
    this._value = value;
    this._state = Resolved;
    this._drainQueue();
  };

  CachedFuture.prototype.run = function CachedFuture$run(){
    const _this = this;
    if(_this._state > Cold) return;
    _this._state = Pending;
    _this._cancel = _this._pure._f(
      function CachedFuture$fork$rej(x){ _this.reject(x) },
      function CachedFuture$fork$res(x){ _this.resolve(x) }
    );
  };

  CachedFuture.prototype.reset = function CachedFuture$reset(){
    if(this._state === Cold) return;
    if(this._state > Pending) this._cancel();
    this._cancel = noop;
    this._queue = [];
    this._queued = 0;
    this._value = undefined;
    this._state = Cold;
  };

  CachedFuture.prototype._f = function CachedFuture$fork(rej, res){
    const _this = this;
    let cancel = noop;
    switch(_this._state){
      case 1: cancel = _this._addToQueue(rej, res); break;
      case 2: rej(_this._value); break;
      case 3: res(_this._value); break;
      default: cancel = _this._addToQueue(rej, res); _this.run();
    }
    return cancel;
  };

  CachedFuture.prototype.toString = function CachedFuture$toString(){
    return `${this._pure.toString()}.cache()`;
  };

  //----------

  function FutureOf(value){
    this._value = value;
  }

  FutureOf.prototype = Object.create(Future.prototype);

  FutureOf.prototype.extractRight = function FutureOf$extractRight(){
    return [this._value];
  };

  FutureOf.prototype._f = function FutureOf$fork(rej, res){
    res(this._value);
    return noop;
  };

  FutureOf.prototype.toString = function FutureOf$toString(){
    return `Future.of(${show(this._value)})`;
  };

  //----------

  function FutureReject(reason){
    this._reason = reason;
  }

  FutureReject.prototype = Object.create(Future.prototype);

  FutureReject.prototype.extractLeft = function FutureReject$extractLeft(){
    return [this._reason];
  };

  FutureReject.prototype._f = function FutureReject$fork(rej){
    rej(this._reason);
    return noop;
  };

  FutureReject.prototype.toString = function FutureReject$toString(){
    return `Future.reject(${show(this._reason)})`;
  };

  //----------

  function FutureNode(computation){
    this._computation = computation;
  }

  FutureNode.prototype = Object.create(Future.prototype);

  FutureNode.prototype._f = function FutureNode$fork(rej, res){
    let open = true;
    this._computation(function FutureNode$fork$done(a, b){
      if(open){
        a ? rej(a) : res(b);
        open = false;
      }
    });
    return function FutureNode$fork$cancel(){ open = false };
  };

  FutureNode.prototype.toString = function FutureNode$toString(){
    return `Future.node(${showf(this._computation)})`;
  };

  //----------

  function FutureAfter(time, value){
    this._time = time;
    this._value = value;
  }

  FutureAfter.prototype = Object.create(Future.prototype);

  FutureAfter.prototype.extractRight = function FutureAfter$extractRight(){
    return [this._value];
  };

  FutureAfter.prototype._f = function FutureAfter$fork(rej, res){
    const id = setTimeout(res, this._time, this._value);
    return function FutureAfter$fork$cancel(){ clearTimeout(id) };
  };

  FutureAfter.prototype.toString = function FutureAfter$toString(){
    return `Future.after(${show(this._time)}, ${show(this._value)})`;
  };

  //----------

  function FutureRejectAfter(time, reason){
    this._time = time;
    this._reason = reason;
  }

  FutureRejectAfter.prototype = Object.create(Future.prototype);

  FutureRejectAfter.prototype.extractLeft = function FutureRejectAfter$extractLeft(){
    return [this._reason];
  };

  FutureRejectAfter.prototype._f = function FutureRejectAfter$fork(rej){
    const id = setTimeout(rej, this._time, this._reason);
    return function FutureRejectAfter$fork$cancel(){ clearTimeout(id) };
  };

  FutureRejectAfter.prototype.toString = function FutureRejectAfter$toString(){
    return `Future.rejectAfter(${show(this._time)}, ${show(this._reason)})`;
  };

  //----------

  function check$parallel$m(m, i){
    if(!isFuture(m)) throw new TypeError(
      'Future.parallel expects its second argument to be an array of Futures.'
      + ` The value at position ${i} in the array was not a Future\n  Actual: ${show(m)}`
    );
  }

  function FutureParallel$emptyFork(rej, res){
    res([]);
  }

  function FutureParallel(max, futures){
    this._futures = futures;
    this._length = futures.length;
    this._max = Math.min(this._length, max);
    if(futures.length === 0) this._f = FutureParallel$emptyFork;
  }

  FutureParallel.prototype = Object.create(Future.prototype);

  FutureParallel.prototype._f = function FutureParallel$fork(rej, res){
    const _this = this, cancels = new Array(_this._max), out = new Array(_this._length);
    let i = _this._max, ok = 0;
    const cancelAll = function Future$parallel$cancel(){
      for(let n = 0; n < _this._max; n++) cancels[n] && cancels[n]();
    };
    const run = function FutureParallel$fork$run(future, j, c){
      check$parallel$m(future, j);
      cancels[c] = future._f(function Future$parallel$fork$rej(reason){
        cancelAll();
        rej(reason);
      }, function Future$parallel$fork$res(value){
        out[j] = value;
        ok = ok + 1;
        if(i < _this._length) run(_this._futures[i], i++, c);
        else if(ok === _this._length) res(out);
      });
    };
    for(let n = 0; n < _this._max; n++) run(_this._futures[n], n, n);
    return cancelAll;
  };

  FutureParallel.prototype.toString = function FutureParallel$toString(){
    return `Future.parallel(${show(this._max)}, [${this._futures.map(show).join(', ')}])`;
  };

  //----------

  function check$do$g(g){
    if(!isIterator(g)) invalidArgument(
      'Future.do', 0, 'return an iterator, maybe you forgot the "*"', g
    );
  }

  function check$do$next(o){
    if(!isIteration(o)) throw new TypeError(
      'Future.do was given an invalid generator:'
      + ' Its iterator did not return a valid iteration from iterator.next()'
      + `\n  Actual: ${show(o)}`
    );
    if(!o.done && !isFuture(o.value)) throw new TypeError(
      'A non-Future was produced by iterator.next() in Future.do.'
      + ' If you\'re using a generator, make sure you always `yield` a Future'
      + `\n  Actual: ${o.value}`
    );
  }

  function FutureDo(generator){
    this._generator = generator;
  }

  FutureDo.prototype = Object.create(Future.prototype);

  FutureDo.prototype._f = function FutureDo$fork(rej, res){
    const iterator = this._generator();
    check$do$g(iterator);
    const recurser = new ChainRec(function Future$do$next(next, _, x){
      const iteration = iterator.next(x);
      check$do$next(iteration);
      return iteration.done ? new FutureOf(iteration) : iteration.value.map(next);
    }, undefined);
    return recurser._f(rej, res);
  };

  FutureDo.prototype.toString = function FutureDo$toString(){
    return `Future.do(${showf(this._generator)})`;
  };

  //----------

  function FutureTry(fn){
    this._fn = fn;
  }

  FutureTry.prototype = Object.create(Future.prototype);

  FutureTry.prototype._f = function FutureTry$0$fork(rej, res){
    let r;
    try{ r = this._fn() }catch(e){ rej(e); return noop }
    res(r);
    return noop;
  };

  FutureTry.prototype.toString = function FutureTry$toString(){
    return `Future.try(${show(this._fn)})`;
  };

  //----------

  function FutureEncase(fn, a, b, c){
    this._length = arguments.length - 1;
    this._fn = fn;
    this._a = a;
    this._b = b;
    this._c = c;
    this._f = FutureEncase.FS[this._length];
  }

  FutureEncase.FS = {
    1: function FutureEncase$1$fork(rej, res){
      let r;
      try{ r = this._fn(this._a) }catch(e){ rej(e); return noop }
      res(r);
      return noop;
    },
    2: function FutureEncase$2$fork(rej, res){
      let r;
      try{ r = this._fn(this._a, this._b) }catch(e){ rej(e); return noop }
      res(r);
      return noop;
    },
    3: function FutureEncase$3$fork(rej, res){
      let r;
      try{ r = this._fn(this._a, this._b, this._c) }catch(e){ rej(e); return noop }
      res(r);
      return noop;
    }
  };

  FutureEncase.prototype = Object.create(Future.prototype);

  FutureEncase.prototype.toString = function FutureEncase$toString(){
    const args = [this._a, this._b, this._c].slice(0, this._length).map(show).join(', ');
    const name = `encase${this._length > 1 ? this._length : ''}`;
    return `Future.${name}(${show(this._fn)}, ${args})`;
  };

  //----------

  function check$fromPromise$p(p, f, a, b, c){
    if(!isThenable(p)) throw new TypeError(
      'Future.fromPromise expects the function its given to return a Promise/Thenable'
      + `\n  Actual: ${show(p)}\n  From calling: ${showf(f)}`
      + `\n  With a: ${show(a)}`
      + (arguments.length > 3 ? `\n  With b: ${show(b)}` : '')
      + (arguments.length > 4 ? `\n  With c: ${show(c)}` : '')
    );
  }

  function FutureFromPromise(fn, a, b, c){
    this._length = arguments.length - 1;
    this._fn = fn;
    this._a = a;
    this._b = b;
    this._c = c;
    this._f = FutureFromPromise.FS[this._length];
  }

  FutureFromPromise.FS = {
    1: function FutureFromPromise$1$fork(rej, res){
      const promise = this._fn(this._a);
      check$fromPromise$p(promise, this._fn, this._a);
      promise.then(res, rej);
      return noop;
    },
    2: function FutureFromPromise$2$fork(rej, res){
      const promise = this._fn(this._a, this._b);
      check$fromPromise$p(promise, this._fn, this._a, this._b);
      promise.then(res, rej);
      return noop;
    },
    3: function FutureFromPromise$3$fork(rej, res){
      const promise = this._fn(this._a, this._b, this._c);
      check$fromPromise$p(promise, this._fn, this._a, this._b, this._c);
      promise.then(res, rej);
      return noop;
    }
  };

  FutureFromPromise.prototype = Object.create(Future.prototype);

  FutureFromPromise.prototype.toString = function FutureFromPromise$toString(){
    const args = [this._a, this._b, this._c].slice(0, this._length).map(show).join(', ');
    const name = `fromPromise${this._length > 1 ? this._length : ''}`;
    return `Future.${name}(${show(this._fn)}, ${args})`;
  };

  //----------

  function check$chain$f(m, f, x){
    if(!isFuture(m)) throw new TypeError(
      'Future#chain expects the function its given to return a Future'
      + `\n  Actual: ${show(m)}\n  From calling: ${showf(f)}\n  With: ${show(x)}`
    );
  }

  function FutureChain(parent, chainer){
    this._parent = parent;
    this._chainer = chainer;
  }

  FutureChain.prototype = Object.create(Future.prototype);

  FutureChain.prototype._f = function FutureChain$fork(rej, res){
    const _this = this;
    let cancel;
    const r = _this._parent._f(rej, function FutureChain$fork$res(x){
      const m = _this._chainer(x);
      check$chain$f(m, _this._chainer, x);
      cancel = m._f(rej, res);
    });
    return cancel || (cancel = r, function FutureChain$fork$cancel(){ cancel() });
  };

  FutureChain.prototype.toString = function FutureChain$toString(){
    return `${this._parent.toString()}.chain(${showf(this._chainer)})`;
  };

  //----------

  function check$chainRej$f(m, f, x){
    if(!isFuture(m)) throw new TypeError(
      'Future.chainRej expects the function its given to return a Future'
      + `\n  Actual: ${show(m)}\n  From calling: ${showf(f)}\n  With: ${show(x)}`
    );
  }

  function FutureChainRej(parent, chainer){
    this._parent = parent;
    this._chainer = chainer;
  }

  FutureChainRej.prototype = Object.create(Future.prototype);

  FutureChainRej.prototype._f = function FutureChainRej$fork(rej, res){
    const _this = this;
    let cancel;
    const r = _this._parent._f(function FutureChainRej$fork$rej(x){
      const m = _this._chainer(x);
      check$chainRej$f(m, _this._chainer, x);
      cancel = m._f(rej, res);
    }, res);
    return cancel || (cancel = r, function FutureChainRej$fork$cancel(){ cancel() });
  };

  FutureChainRej.prototype.toString = function FutureChainRej$toString(){
    return `${this._parent.toString()}.chainRej(${showf(this._chainer)})`;
  };

  //----------

  function FutureMap(parent, mapper){
    this._parent = parent;
    this._mapper = mapper;
  }

  FutureMap.prototype = Object.create(Future.prototype);

  FutureMap.prototype._f = function FutureMap$fork(rej, res){
    const _this = this;
    return _this._parent._f(rej, function FutureMap$fork$res(x){
      res(_this._mapper(x));
    });
  };

  FutureMap.prototype.toString = function FutureMap$toString(){
    return `${this._parent.toString()}.map(${showf(this._mapper)})`;
  };

  //----------

  function FutureMapRej(parent, mapper){
    this._parent = parent;
    this._mapper = mapper;
  }

  FutureMapRej.prototype = Object.create(Future.prototype);

  FutureMapRej.prototype._f = function FutureMapRej$fork(rej, res){
    const _this = this;
    return _this._parent._f(function FutureMapRej$fork$rej(x){
      rej(_this._mapper(x));
    }, res);
  };

  FutureMapRej.prototype.toString = function FutureMapRej$toString(){
    return `${this._parent.toString()}.mapRej(${showf(this._mapper)})`;
  };

  //----------

  function FutureBimap(parent, lmapper, rmapper){
    this._parent = parent;
    this._lmapper = lmapper;
    this._rmapper = rmapper;
  }

  FutureBimap.prototype = Object.create(Future.prototype);

  FutureBimap.prototype._f = function FutureBimap$fork(rej, res){
    const _this = this;
    return _this._parent._f(function FutureBimap$fork$rej(x){
      rej(_this._lmapper(x));
    }, function FutureBimap$fork$res(x){
      res(_this._rmapper(x));
    });
  };

  FutureBimap.prototype.toString = function FutureBimap$toString(){
    return `${this._parent.toString()}.bimap(${showf(this._lmapper)}, ${showf(this._rmapper)})`;
  };

  //----------

  function check$ap$f(f){
    if(!isFunction(f)) throw new TypeError(
      'Future#ap expects its first argument to be a Future of a Function'
      + `\n  Actual: Future.of(${show(f)})`
    );
  }

  function FutureAp(mval, mfunc){
    this._mval = mval;
    this._mfunc = mfunc;
  }

  FutureAp.prototype = Object.create(Future.prototype);

  FutureAp.prototype._f = function FutureAp$fork(rej, res){
    const _this = this;
    let cancel;
    const r = _this._mval._f(rej, function FutureAp$fork$res$x(x){
      cancel = _this._mfunc._f(rej, function FutureAp$fork$res$f(f){
        check$ap$f(f);
        cancel = noop;
        res(f(x));
      });
    });
    return cancel || (cancel = r, function FutureAp$fork$cancel(){ cancel() });
  };

  FutureAp.prototype.toString = function FutureAp$toString(){
    return `${this._mval.toString()}.ap(${this._mfunc.toString()})`;
  };

  //----------

  function FutureParallelAp(mval, mfunc){
    this._mval = mval;
    this._mfunc = mfunc;
  }

  FutureParallelAp.prototype = Object.create(Future.prototype);

  FutureParallelAp.prototype._f = function FutureParallelAp$fork(rej, res){
    let func, val, okval = false, okfunc = false, rejected = false, c1, c2;
    function FutureParallelAp$rej(x){
      if(!rejected){
        rejected = true;
        rej(x);
      }
    }
    c1 = this._mval._f(FutureParallelAp$rej, function FutureParallelAp$fork$resVal(x){
      c1 = noop;
      if(!okval) return void (okfunc = true, val = x);
      check$ap$f(func);
      res(func(x));
    });
    c2 = this._mfunc._f(FutureParallelAp$rej, function FutureParallelAp$fork$resFunc(f){
      c2 = noop;
      if(!okfunc) return void (okval = true, func = f);
      check$ap$f(f);
      res(f(val));
    });
    return function FutureParallelAp$fork$cancel(){
      c1();
      c2();
    };
  };

  FutureParallelAp.prototype.toString = function FutureParallelAp$toString(){
    return `new FutureParallelAp(${this._mval.toString()}, ${this._mfunc.toString()})`;
  };

  //----------

  function FutureSwap(parent){
    this._parent = parent;
  }

  FutureSwap.prototype = Object.create(Future.prototype);

  FutureSwap.prototype._f = function FutureSwap$fork(rej, res){
    return this._parent._f(res, rej);
  };

  FutureSwap.prototype.toString = function FutureSwap$toString(){
    return `${this._parent.toString()}.swap()`;
  };

  //----------

  function FutureRace(left, right){
    this._left = left;
    this._right = right;
  }

  FutureRace.prototype = Object.create(Future.prototype);

  FutureRace.prototype._f = function FutureRace$fork(rej, res){
    let cancelled = false, lcancel = noop, rcancel = noop;
    const cancel = function FutureRace$fork$cancel(){ cancelled = true; lcancel(); rcancel() };
    const reject = function FutureRace$fork$rej(x){ cancel(); rej(x) };
    const resolve = function FutureRace$fork$res(x){ cancel(); res(x) };
    lcancel = this._left._f(reject, resolve);
    cancelled || (rcancel = this._right._f(reject, resolve));
    return cancel;
  };

  FutureRace.prototype.toString = function FutureRace$toString(){
    return `${this._left.toString()}.race(${this._right.toString()})`;
  };

  //----------

  function FutureAnd(left, right){
    this._left = left;
    this._right = right;
  }

  FutureAnd.prototype = Object.create(Future.prototype);

  FutureAnd.prototype._f = function FutureAnd$fork(rej, res){
    let rejected = false, resolved = false, val, lcancel = noop, rcancel = noop;
    lcancel = this._left._f(
      e => {rejected = true; rcancel(); rej(e)},
      _ => rejected ? rej(val) : resolved ? res(val) : (resolved = true)
    );
    rcancel = this._right._f(
      e => resolved ? rej(e) : (rejected = true, val = e),
      x => resolved ? res(x) : (resolved = true, val = x)
    );
    return function FutureAnd$fork$cancel(){ lcancel(); rcancel() };
  };

  FutureAnd.prototype.toString = function FutureAnd$toString(){
    return `${this._left.toString()}.and(${this._right.toString()})`;
  };

  //----------

  function FutureOr(left, right){
    this._left = left;
    this._right = right;
  }

  FutureOr.prototype = Object.create(Future.prototype);

  FutureOr.prototype._f = function FutureOr$fork(rej, res){
    let resolved = false, rejected = false, val, err, lcancel = noop, rcancel = noop;
    lcancel = this._left._f(
      _ => rejected ? rej(err) : resolved ? res(val) : (rejected = true),
      x => {resolved = true; rcancel(); res(x)}
    );
    resolved || (rcancel = this._right._f(
      e => resolved || (rejected ? rej(e) : (err = e, rejected = true)),
      x => resolved || (rejected ? res(x) : (val = x, resolved = true))
    ));
    return function FutureOr$fork$cancel(){ lcancel(); rcancel() };
  };

  FutureOr.prototype.toString = function FutureOr$toString(){
    return `${this._left.toString()}.or(${this._right.toString()})`;
  };

  //----------

  function FutureBoth(left, right){
    this._left = left;
    this._right = right;
  }

  FutureBoth.prototype = Object.create(Future.prototype);

  FutureBoth.prototype._f = function FutureBoth$fork(rej, res){
    let resolved = false, rejected = false, lcancel = noop, rcancel = noop;
    const tuple = new Array(2);
    lcancel = this._left._f(function FutureBoth$fork$rejLeft(e){
      rejected = true; rcancel(); rej(e);
    }, function FutureBoth$fork$resLeft(x){
      tuple[0] = x;
      if(resolved) res(tuple);
      else (resolved = true);
    });
    rejected || (rcancel = this._right._f(function FutureBoth$fork$rejRight(e){
      rejected = true; lcancel(); rej(e);
    }, function FutureBoth$fork$resRight(x){
      tuple[1] = x;
      if(resolved) res(tuple);
      else (resolved = true);
    }));
    return function FutureBoth$fork$cancel(){ lcancel(); rcancel() };
  };

  FutureBoth.prototype.toString = function FutureBoth$toString(){
    return `${this._left.toString()}.both(${this._right.toString()})`;
  };

  //----------

  function FutureFold(parent, lfold, rfold){
    this._parent = parent;
    this._lfold = lfold;
    this._rfold = rfold;
  }

  FutureFold.prototype = Object.create(Future.prototype);

  FutureFold.prototype._f = function FutureFold$fork(rej, res){
    const _this = this;
    return _this._parent._f(function FutureFold$fork$rej(x){
      res(_this._lfold(x));
    }, function FutureFold$fork$res(x){
      res(_this._rfold(x));
    });
  };

  FutureFold.prototype.toString = function FutureFold$toString(){
    return `${this._parent.toString()}.fold(${showf(this._lfold)}, ${showf(this._rfold)})`;
  };

  //----------

  function check$hook$f(m, f, x){
    if(!isFuture(m)) throw new TypeError(
      'Future#hook expects the first function its given to return a Future'
      + `\n  Actual: ${show(m)}\n  From calling: ${showf(f)}\n  With: ${show(x)}`
    );
  }

  function check$hook$g(m, g, x){
    if(!isFuture(m)) throw new TypeError(
      'Future#hook expects the second function its given to return a Future'
      + `\n  Actual: ${show(m)}\n  From calling: ${showf(g)}\n  With: ${show(x)}`
    );
  }

  function FutureHook(acquire, dispose, consume){
    this._acquire = acquire;
    this._dispose = dispose;
    this._consume = consume;
  }

  FutureHook.prototype = Object.create(Future.prototype);

  FutureHook.prototype._f = function FutureHook$fork(rej, res){
    const _this = this;
    let cancel, cancelAcquire = noop;
    cancelAcquire = _this._acquire._f(rej, function FutureHook$fork$res(resource){
      const disposer = function FutureHook$dispose(callback){
        const disposal = _this._dispose(resource);
        check$hook$f(disposal, _this._dispose, resource);
        cancel = disposal._f(rej, callback);
        return cancel;
      };
      const consumption = _this._consume(resource);
      check$hook$g(consumption, _this._consume, resource);
      const cancelConsume = consumption._f(
        x => disposer(_ => rej(x)),
        x => disposer(_ => res(x))
      );
      cancel = function FutureHook$fork$cancelConsume(){
        disposer(noop)();
        cancelAcquire();
        cancelConsume();
      };
    });
    cancel = cancel || cancelAcquire;
    return function FutureHook$fork$cancel(){ cancel() };
  };

  FutureHook.prototype.toString = function FutureHook$toString(){
    return `${this._acquire.toString()}.hook(${showf(this._dispose)}, ${showf(this._consume)})`;
  };

  //----------

  function FutureFinally(computation, cleanup){
    this._computation = computation;
    this._cleanup = cleanup;
  }

  FutureFinally.prototype = Object.create(Future.prototype);

  FutureFinally.prototype._f = function FutureFinally$fork(rej, res){
    const _this = this;
    let cancel;
    const cancelComputation = _this._computation._f(function FutureFinally$fork$rej(e){
      cancel = _this._cleanup._f(rej, function FutureFinally$fork$rej$res(){ rej(e) });
    }, function FutureFinally$fork$res(x){
      cancel = _this._cleanup._f(rej, function FutureFinally$fork$res$res(){ res(x) });
    });
    if(cancel) return cancel;
    cancel = function FutureFinally$fork$cancelBoth(){
      cancelComputation();
      _this._cleanup._f(noop, noop)();
    };
    return function FutureFinally$fork$cancel(){ cancel() };
  };

  FutureFinally.prototype.toString = function FutureFinally$toString(){
    return `${this._computation.toString()}.finally(${this._cleanup.toString()})`;
  };

  //----------

  function FutureNever(){}

  FutureNever.prototype = Object.create(Future.prototype);

  FutureNever.prototype._f = function FutureNever$fork(){
    return noop;
  };

  FutureNever.prototype.toString = function FutureNever$toString(){
    return 'Future.never';
  };

  Future.never = new FutureNever;

  Future.classes = {
    SafeFuture,
    ChainRec,
    CachedFuture,
    FutureOf,
    FutureReject,
    FutureRejectAfter,
    FutureNode,
    FutureAfter,
    FutureParallel,
    FutureDo,
    FutureTry,
    FutureEncase,
    FutureFromPromise,
    FutureChain,
    FutureChainRej,
    FutureMap,
    FutureMapRej,
    FutureBimap,
    FutureAp,
    FutureParallelAp,
    FutureSwap,
    FutureRace,
    FutureAnd,
    FutureOr,
    FutureBoth,
    FutureFold,
    FutureHook,
    FutureFinally,
    FutureNever
  };

  //////////////
  // Parallel //
  //////////////

  const ParallelFuture = concurrify(Future, Future.never, Future.race, function(mval, mfunc){
    return new FutureParallelAp(mval, mfunc);
  });

  function isParallel(x){
    return x instanceof ParallelFuture || type(x) === ParallelFuture['@@type'];
  }

  Future.Par = ParallelFuture;
  Future.seq = function seq(par){
    if(!isParallel(par)) invalidArgument('Future.seq', 0, 'to be a Par', par);
    return par.sequential;
  };

  return Future;

}));
