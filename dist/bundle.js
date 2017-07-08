(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('ramda')) :
	typeof define === 'function' && define.amd ? define(['ramda'], factory) :
	(global['brisksale-algebraic-types'] = factory(global.ramda));
}(this, (function (ramda) { 'use strict';

function checkn(n) {
    if(typeof n !== 'number') {
      throw new TypeError(
        'inspectf expects its first argument to be a number'
      );
    }
  }

  function checkf(f) {
    if(typeof f !== 'function') {
      throw new TypeError(
        'inspectf expects its second argument to be a function'
      );
    }
  }

  var RSPACE = /^ */;
  var RCODE = /\s*[^\s]/;
  var RTABS = /\t/g;
  var REOL = /\n\r?/;

  function isCode(line) {
    return RCODE.test(line);
  }

  function getPadding(line) {
    return line.match(RSPACE)[0].length;
  }

  function guessIndentation(lines) {
    var filtered = lines.filter(isCode);
    var paddings = filtered.map(getPadding);
    var depth = paddings.reduce(Math.min, Infinity);
    var tabsize = paddings
    .map(function(x) { return x - depth; })
    .find(function(x) { return x > 1; }) || 2;
    return {depth: depth, tabsize: tabsize};
  }

  function pad(n) {
    return (new Array(n + 1)).join(' ');
  }

  function show(f, indentation) {
    return f.toString().replace(RTABS, indentation);
  }

  function toLines(s) {
    return s.split(REOL);
  }

  function fixIndentation(lines, indentation) {
    var info = guessIndentation(lines.slice(1));
    var RPAD = new RegExp(pad(info.tabsize), 'g');
    return lines.map(function(line) {
      return line.slice(Math.min(info.depth, getPadding(line)))
      .replace(RPAD, '\t').replace(RTABS, indentation);
    }).join('\n');
  }

  function inspectf(n, f) {
    checkn(n);
    if(arguments.length < 2) {
      return function inspectf$partial(f) { return inspectf(n, f); };
    }
    checkf(f);
    if(f.toString !== Function.prototype.toString) {return f.toString();}
    var i = pad(n), shown = show(f, i), lines = toLines(shown, i);
    if(lines.length < 2) {return shown;}
    return fixIndentation(lines, i);
  }

var startPosPad = function (sf, s) { return s.replace(/^/gm, sf).replace(sf, ''); };

var showFunction = function (f) { return startPosPad('  ', inspectf(2, f)); };

var emptyFn = function emptyFn() { };



var baseMap = function (f) {
  return f(this.value);
};

var getEquals = function (constructor) {
  return function equals$$1(that) {
    return that instanceof constructor && ramda.equals(this.value, that.value);
  };
};

var extend = function (Child, Parent) {
  function Ctor() {
    this.constructor = Child;
  }
  Ctor.prototype = Parent.prototype;
  Child.prototype = new Ctor();
  Child.super_ = Parent.prototype;
};

var identity$1 = function (x) { return x; };





var returnThis = function () { return this; };

var chainRecNext = function (v) {
  return { isNext: true, value: v };
};

var chainRecDone = function (v) {
  return { isNext: false, value: v };
};

var deriveAp = function (Type) {
  return function (fa) {
    return this.chain(function (f) {
      return fa.chain(function (a) {
        return Type.of(f(a));
      });
    });
  };
};

var deriveMap = function (Type) {
  return function (f) {
    return this.chain(function (a) {
      return Type.of(f(a));
    });
  };
};

var fastProto = null;
//%HasFastProperties
// --allow-natives-syntax to check whether an object has fast properties.
function FastObject(o) {
	if (fastProto !== null && typeof fastProto.property) {
		var result = fastProto;
		fastProto = FastObject.prototype = null;
		return result;
	}
	fastProto = FastObject.prototype = o == null ? Object.create(null) : o;
	return new FastObject;
}

// Initialize the inline property cache of FastObject
FastObject();

function toFastProperties(o) {
	return FastObject(o);
}

function Either(left, right) {
  switch (arguments.length) {
    case 0:
      throw new TypeError('no arguments to Either');
    case 1:
      return function(right) {
        return right == null ? Either.Left(left) : Either.Right(right);
      };
    default:
      return right == null ? Either.Left(left) : Either.Right(right);
  }
}

Either.prototype['@@type'] = 'ramda-fantasy/Either';

Either.prototype.map = returnThis;

Either.of = Either.prototype.of = function(value) {
  return Either.Right(value);
};

Either.prototype.chain = returnThis; // throw?

Either.either = ramda.curry(function either(leftFn, rightFn, e) {
  if (e instanceof _Left) {
    return leftFn(e.value);
  } else if (e instanceof _Right) {
    return rightFn(e.value);
  } else {
    throw new TypeError('invalid type given to Either.either');
  }
});

Either.isLeft = function(x) {
  return x.isLeft;
};

Either.isRight = function(x) {
  return x.isRight;
};


// Right
function _Right(x) {
  this.value = x;
}
extend(_Right, Either);

_Right.prototype.isRight = true;
_Right.prototype.isLeft = false;

_Right.prototype.map = function(fn) {
  return new _Right(fn(this.value));
};

_Right.prototype.ap = function(that) {
  return that.map(this.value);
};

_Right.prototype.chain = function(f) {
  return f(this.value);
};

//chainRec
Either.chainRec = Either.prototype.chainRec = function(f, i) {
  var res, state = chainRecNext(i);
  while (state.isNext) {
    res = f(chainRecNext, chainRecDone, state.value);
    if (Either.isLeft(res)) {
      return res;
    }
    state = res.value;
  }
  return Either.Right(state.value);
};

_Right.prototype.bimap = function(_, f) {
  return new _Right(f(this.value));
};

_Right.prototype.extend = function(f) {
  return new _Right(f(this));
};

_Right.prototype.toString = function() {
  return 'Either.Right(' + ramda.toString(this.value) + ')';
};

_Right.prototype.equals = getEquals(_Right);

Either.Right = function(value) {
  return new _Right(value);
};


// Left
function _Left(x) {
  this.value = x;
}
extend(_Left, Either);

_Left.prototype.isLeft = true;
_Left.prototype.isRight = false;

_Left.prototype.ap = returnThis;

_Left.prototype.bimap = function(f) {
  return new _Left(f(this.value));
};

_Left.prototype.extend = returnThis;

_Left.prototype.toString = function() {
  return 'Either.Left(' + ramda.toString(this.value) + ')';
};

_Left.prototype.equals = getEquals(_Left);

Either.Left = function(value) {
  return new _Left(value);
};


// either
Either.prototype.either = function instanceEither(leftFn, rightFn) {
  return this.isLeft ? leftFn(this.value) : rightFn(this.value);
};

//v8 optimization
toFastProperties(Either);
toFastProperties(Either.prototype);

var $bimap = 'fantasy-land/bimap';
var $chain = 'fantasy-land/chain';
var $map = 'fantasy-land/map';
var $ap = 'fantasy-land/ap';

var bimap = function (lmapper, rmapper, m) { return m[$bimap](lmapper, rmapper); };

var chain = function (chainer, m) { return m[$chain](chainer); };

var map = function (mapper, m) { return m[$map](mapper); };

var ap = function (values, func) { return func[$ap](values); };

function BaseAction(computation){
  this._computation = computation;
}

BaseAction.prototype = Object.create(Action.prototype);

BaseAction.prototype._exec = function(rej, res) {
  var open = true;
  var f = this._computation(function(x) {
    if (open) {
      open = false;
      rej(x);
    }
  }, function(x) {
    if (open) {
      open = false;
      res(x);
    }
  });
  
  return open === false ? emptyFn :
    function cancel() {
      open && f && f();
      open = false;
    };
};

BaseAction.prototype.toString = function() {
  return ("Action(" + (showFunction(this._computation)) + ")");
};

//v8 optimization
toFastProperties(BaseAction);
toFastProperties(BaseAction.prototype);

function Identity(value) {
  this._value = value;
}

Identity.prototype = Object.create(Action.prototype);

Identity.prototype.extractRight = function() {
  return [this._value];
};

Identity.prototype._exec = function(rej, res) {
  res(this._value);
  return emptyFn;
};

Identity.prototype.toString = function(){
  return ("Action.of(" + (ramda.toString(this._value)) + ")");
};

//v8 optimization
toFastProperties(Identity);
toFastProperties(Identity.prototype);

//__________________________________________________________//

function ApplicativeAction(mval, mfunc) {
  this._mval = mval;
  this._mfunc = mfunc;
}

ApplicativeAction.prototype = Object.create(Action.prototype);

ApplicativeAction.prototype._exec = function(rej, res) {
  var inst = this;
  var cancel;
  var r = inst._mval._exec(rej, function(x) {
    cancel = inst._mfunc._exec(rej, function(f) {
      cancel = emptyFn;
      res(f(x));
    });
  });
  return cancel || (cancel = r, function () { return cancel && cancel(); });
};

ApplicativeAction.prototype.toString = function(){
  return ((this._mval.toString()) + ".ap(" + (this._mfunc.toString()) + ")");
};

//v8 optimization
toFastProperties(ApplicativeAction);
toFastProperties(ApplicativeAction.prototype);

//___________________________________________________________//

function MapAction(parent, mapper) {
  this._parent = parent;
  this._mapper = mapper;
}

MapAction.prototype = Object.create(Action.prototype);

MapAction.prototype._exec = function(rej, res) {
  var inst = this;
  return inst._parent._exec(rej, function(x) {
    res(inst._mapper(x));
  });
};

MapAction.prototype.toString = function(){
  return ((this._parent.toString()) + ".map(" + (showFunction(this._mapper)) + ")");
};

//v8 optimization
toFastProperties(MapAction);
toFastProperties(MapAction.prototype);

//___________________________________________________________//

function BimapAction(parent, lmapper, rmapper) {
  this._parent = parent;
  this._lmapper = lmapper;
  this._rmapper = rmapper;
}

BimapAction.prototype = Object.create(Action.prototype);

BimapAction.prototype._exec = function(rej, res) {
  var inst = this;
  return inst._parent._exec(function(x) {
    rej(inst._lmapper(x));
  }, function(x) {
    res(inst._rmapper(x));
  });
};

BimapAction.prototype.toString = function(){
  return ((this._parent.toString()) + ".bimap(" + (showFunction(this._lmapper)) + ", " + (showFunction(this._rmapper)) + ")");
};

//v8 optimization
toFastProperties(BimapAction);
toFastProperties(BimapAction.prototype);

//___________________________________________________________//

function ChainAction(parent, chainer) {
  this._parent = parent;
  this._chainer = chainer;
}

ChainAction.prototype = Object.create(Action.prototype);

ChainAction.prototype._exec = function(rej, res) {
  var inst = this;
  var cancel;
  var r = inst._parent._exec(rej, function(x) {
    var m = inst._chainer(x);
    cancel = m._exec(rej, res);
  });
  return cancel || (cancel = r, function () { return cancel && cancel(); });
};

ChainAction.prototype.toString = function() {
  return ((this._parent.toString()) + ".chain(" + (showFunction(this._chainer)) + ")");
};

//v8 optimization
toFastProperties(ChainAction);
toFastProperties(ChainAction.prototype);

function ChainRejAction(parent, chainer) {
  this._parent = parent;
  this._chainer = chainer;
}

ChainRejAction.prototype = Object.create(Action.prototype);

ChainRejAction.prototype._exec = function(rej, res) {
  var inst = this;
  var cancel;
  var r = inst._parent._exec(function(x) {
    var m = inst._chainer(x);
    cancel = m._exec(rej, res);
  }, res);
  return cancel || (cancel = r, function() { cancel ? cancel() : null; });
};

(ChainRejAction.prototype).toString = function() {
  return ((this._parent.toString()) + ".chainRej(" + (showFunction(this._chainer)) + ")");
};

//v8 optimization
toFastProperties(ChainRejAction);
toFastProperties(ChainRejAction.prototype);

function MapRejAction(parent, mapper) {
  this._parent = parent;
  this._mapper = mapper;
}

MapRejAction.prototype = Object.create(Action.prototype);

MapRejAction.prototype._exec = function(rej, res) {
  var inst = this;
  return inst._parent._exec(function(x) {
    rej(inst._mapper(x));
  }, res);
};

(MapRejAction.prototype).toString = function() {
  return ((this._parent.toString()) + ".mapRej(" + (showFunction(this._mapper)) + ")");
};

//v8 optimization
toFastProperties(MapRejAction);
toFastProperties(MapRejAction.prototype);

function ActionReject(reason) {
  this._reason = reason;
}

ActionReject.prototype = Object.create(Action.prototype);

ActionReject.prototype.extractLeft = function() {
  return [this._reason];
};

ActionReject.prototype._exec = function(rej) {
  rej(this._reason);
  return emptyFn;
};

(ActionReject.prototype).toString = function() {
  return ("Action.reject(" + (ramda.toString(this._reason)) + ")");
};

//v8 optimization
toFastProperties(ActionReject);
toFastProperties(ActionReject.prototype);

function ActionRejectAfter(time, reason) {
  this._time = time;
  this._reason = reason;
}

ActionRejectAfter.prototype = Object.create(Action.prototype);

ActionRejectAfter.prototype.extractLeft = function() {
  return [this._reason];
};

ActionRejectAfter.prototype._exec = function(rej) {
  var id = setTimeout(rej, this._time, this._reason);
  return function() { clearTimeout(id); };
};

(ActionRejectAfter.prototype).toString = function() {
  return ("Action.rejectAfter(" + (ramda.toString(this._time)) + ", " + (ramda.toString(this._reason)) + ")");
};

//v8 optimization
toFastProperties(ActionRejectAfter);
toFastProperties(ActionRejectAfter.prototype);

function ActionAfter(time, value) {
  this._time = time;
  this._value = value;
}

ActionAfter.prototype = Object.create(Action.prototype);

ActionAfter.prototype.extractRight = function() {
  return [this._value];
};

ActionAfter.prototype._exec = function(rej, res) {
  var id = setTimeout(res, this._time, this._value);
  return function () { clearTimeout(id); };
};

(ActionAfter.prototype).toString = function() {
  return ("Action.after(" + (ramda.toString(this._time)) + ", " + (ramda.toString(this._value)) + ")");
};

//v8 optimization
toFastProperties(ActionAfter);
toFastProperties(ActionAfter.prototype);

function SwapAction(parent) {
  this._parent = parent;
}

SwapAction.prototype = Object.create(Action.prototype);

SwapAction.prototype._exec = function(rej, res) {
  return this._parent._exec(res, rej);
};

(SwapAction.prototype).toString = function() {
  return ((this._parent.toString()) + ".swap()");
};

//v8 optimization
toFastProperties(SwapAction);
toFastProperties(SwapAction.prototype);

/*  */
function EmptyActionParallel(rej, res) {
  res([]);
}

function ActionParallel(max, actions) {
  this._actions = actions;
  this._length = actions.length;
  this._max = Math.min(this._length, max);
  if (actions.length === 0) { this._exec = EmptyActionParallel; }
}

ActionParallel.prototype = Object.create(Action.prototype);

ActionParallel.prototype._exec = function(rej, res) {
  var inst = this, cancels = new Array(inst._max), out = new Array(inst._length);
  var i = inst._max, ok = 0;
  var cancelAll = function() {
    for (var n = 0; n < inst._max; n++) { cancels[n] && cancels[n](); }
  };
  var run = function(action, j, c) {
    cancels[c] = action._exec(function(reason) {
      cancelAll();
      rej(reason);
    }, function(value) {
      out[j] = value;
      ok = ok + 1;
      if (i < inst._length) { run(inst._actions[i], i++, c); }
      else if (ok === inst._length) { res(out); }
    });
  };
  for (var n = 0; n < inst._max; n++) { run(inst._actions[n], n, n); }
  return cancelAll;
};

(ActionParallel.prototype).toString = function() {
  return ("Action.parallel(" + (ramda.toString(this._max)) + ", [" + (this._actions.map(showFunction).join(', ')) + "])");
};

//v8 optimization
toFastProperties(ActionParallel);
toFastProperties(ActionParallel.prototype);

function ActionParallelAp(mval, mfunc) {
  this._mval = mval;
  this._mfunc = mfunc;
}

ActionParallelAp.prototype = Object.create(Action.prototype);

ActionParallelAp.prototype._exec = function(rej, res) {
  var func, val, okval = false, okfunc = false, rejected = false, c1, c2;
  function ActionParallelApRej(x) {
    if (rejected === false) {
      rejected = true;
      rej(x);
    }
  }
  c1 = this._mval._exec(ActionParallelApRej, function(x) {
    c1 = emptyFn;
    if (okval === false) { return void (okfunc = true, val = x); }
    res(func(x));
  });
  c2 = this._mfunc._exec(ActionParallelApRej, function(f) {
    c2 = emptyFn;
    if (okfunc === false) { return void (okval = true, func = f); }
    res(f(val));
  });
  return function() {
    c1();
    c2();
  };
};

(ActionParallelAp.prototype).toString = function() {
  return ("new ActionParallelAp(" + (this._mval.toString()) + ", " + (this._mfunc.toString()) + ")");
};

//v8 optimization
toFastProperties(ActionParallelAp);
toFastProperties(ActionParallelAp.prototype);

function RaceAction(left, right) {
  this._left = left;
  this._right = right;
}

RaceAction.prototype = Object.create(Action.prototype);

RaceAction.prototype._exec = function(rej, res) {
  var cancelled = false, lcancel = emptyFn, rcancel = emptyFn;
  var cancel = function() { cancelled = true; lcancel(); rcancel(); };
  var reject = function(x) { cancel(); rej(x); };
  var resolve = function(x) { cancel(); res(x); };
  lcancel = this._left._exec(reject, resolve);
  cancelled || (rcancel = this._right._exec(reject, resolve));
  return cancel;
};

(RaceAction.prototype).toString = function() {
  return ((this._left.toString()) + ".race(" + (this._right.toString()) + ")");
};

//v8 optimization
toFastProperties(RaceAction);
toFastProperties(RaceAction.prototype);

var COLD =  4;
var PENDING = 8;
var REJECTED = 16;
var RESOLVED = 32;
var FULLFILLED = REJECTED | RESOLVED;
var ACTIVE = FULLFILLED | PENDING;
var NO_STATE = 0;

function AndAction(left, right){
  this._left = left;
  this._right = right;
}

AndAction.prototype = Object.create(Action.prototype);

AndAction.prototype._exec = function(rej, res) {
  var state = NO_STATE, val, lcancel = emptyFn, rcancel = emptyFn;
  lcancel = this._left._exec(
    function (e) { state = REJECTED; rcancel(); rej(e); },
    function (_) { return state & REJECTED ? rej(val) : state & RESOLVED ? res(val) : (state = RESOLVED); }
  );
  rcancel = this._right._exec(
    function (e) { return state & RESOLVED ? rej(e) : (state = REJECTED, val = e); },
    function (x) { return state & RESOLVED ? res(x) : (state = RESOLVED, val = x); }
  );
  return function() { lcancel(); rcancel(); };
};

(AndAction.prototype).toString = function() {
  return ((this._left.toString()) + ".and(" + (this._right.toString()) + ")");
};

//v8 optimization
toFastProperties(AndAction);
toFastProperties(AndAction.prototype);

//----------

function OrAction(left, right) {
  this._left = left;
  this._right = right;
}

OrAction.prototype = Object.create(Action.prototype);

OrAction.prototype._exec = function(rej, res) {
  var state = NO_STATE, val, err, lcancel = emptyFn, rcancel = emptyFn;
  lcancel = this._left._exec(
    function (_) { return state = REJECTED ? rej(err) : state & RESOLVED ? res(val) : (state = REJECTED); },
    function (x) { state = RESOLVED; rcancel(); res(x); }
  );
  state & RESOLVED || (rcancel = this._right._exec(
    function (e) { return state & RESOLVED || (state & REJECTED ? rej(e) : (err = e, state = REJECTED)); },
    function (x) { return state & RESOLVED || (state & REJECTED ? res(x) : (val = x, state = RESOLVED)); }
  ));
  return function() { lcancel(); rcancel(); };
};

(OrAction.prototype).toString = function() {
  return ((this._left.toString()) + ".or(" + (this._right.toString()) + ")");
};

//v8 optimization
toFastProperties(OrAction);
toFastProperties(OrAction.prototype);

//----------

function BothAction(left, right) {
  this._left = left;
  this._right = right;
}

BothAction.prototype = Object.create(Action.prototype);

BothAction.prototype._exec = function(rej, res) {
   var state = NO_STATE, lcancel = emptyFn, rcancel = emptyFn;
  var tuple = new Array(2);
  lcancel = this._left._exec(function(e) {
    state = REJECTED; rcancel(); rej(e);
  }, function (x) {
    tuple[0] = x;
    if (state & RESOLVED) { res(tuple); }
    else { (state = RESOLVED); }
  });
  state & REJECTED || (rcancel = this._right._exec(function(e) {
    state = REJECTED; lcancel(); rej(e);
  }, function(x) {
    tuple[1] = x;
    if (state & RESOLVED) { res(tuple); }
    else { (state = RESOLVED); }
  }));
  return function(){ lcancel(); rcancel(); };
};

(BothAction.prototype).toString = function() {
  return ((this._left.toString()) + ".both(" + (this._right.toString()) + ")");
};

//v8 optimization
toFastProperties(BothAction);
toFastProperties(BothAction.prototype);

function FoldAction(parent, lfold, rfold) {
  this._parent = parent;
  this._lfold = lfold;
  this._rfold = rfold;
}

FoldAction.prototype = Object.create(Action.prototype);

FoldAction.prototype._exec = function(rej, res) {
  var inst = this;
  return inst._parent._exec(function(x) {
    res(inst._lfold(x));
  }, function(x) {
    res(inst._rfold(x));
  });
};

(FoldAction.prototype).toString = function() {
  return ((this._parent.toString()) + ".fold(" + (showFunction(this._lfold)) + ", " + (showFunction(this._rfold)) + ")");
};

//v8 optimization
toFastProperties(FoldAction);
toFastProperties(FoldAction.prototype);

var fn = function (x) { return x; };

function LoggerAction(parent, mapper) {
  this._parent = parent;
  this._mapper = mapper ? mapper : fn;
}

LoggerAction.prototype = Object.create(Action.prototype);

LoggerAction.prototype._exec = function(rej, res) {
  var inst = this;
  return inst._parent._exec(rej, function(x) {
    res(x);
    
    console.log(("Action Logger called\n" + (inst.toString())));
    console.dir(inst._mapper(x), {colors:true});
    console.log("\n");
  });
};

LoggerAction.prototype.toString = function(){
  return ((this._parent.toString()) + ".log(" + (showFunction(this._mapper)) + ")");
};

//v8 optimization
toFastProperties(LoggerAction);
toFastProperties(LoggerAction.prototype);

function HookAction(acquire, dispose, consume) {
  this._acquire = acquire;
  this._dispose = dispose;
  this._consume = consume;
}

HookAction.prototype = Object.create(Action.prototype);

HookAction.prototype._exec = function(rej, res) {
  var inst = this;
  var cancel, cancelAcquire = emptyFn;
  cancelAcquire = inst._acquire._exec(rej, function(resource) {
    var disposer = function(callback) {
      return cancel = inst._dispose(resource)._exec(rej, callback);
    };
    var cancelConsume = inst._consume(resource)._exec(
      function (x) { return disposer(function (_) { return rej(x); }); },
      function (x) { return disposer(function (_) { return res(x); }); }
    );
    cancel = function() {
      disposer(emptyFn)();
      cancelAcquire();
      cancelConsume();
    };
  });
  cancel = cancel || cancelAcquire;
  return function () { return cancel && cancel(); };
};

HookAction.prototype.toString = function() {
  return ((this._acquire.toString()) + ".hook(" + (showFunction(this._dispose)) + ", " + (showFunction(this._consume)) + ")");
};

//v8 optimization
toFastProperties(HookAction);
toFastProperties(HookAction.prototype);

//----------

function FinallyAction(computation, cleanup) {
  this._computation = computation;
  this._cleanup = cleanup;
}

FinallyAction.prototype = Object.create(Action.prototype);

FinallyAction.prototype._exec = function(rej, res) {
  var inst = this;
  var cancel;
  var cancelComputation = inst._computation._exec(function(e) {
    cancel = inst._cleanup._exec(rej, function() { rej(e); });
  }, function(x) {
    cancel = inst._cleanup._exec(rej, function() { res(x); });
  });
  if (cancel) { return cancel; }
  cancel = function() {
    cancelComputation();
    inst._cleanup._exec(emptyFn, emptyFn)();
  };
  return function () { return cancel && cancel(); };
};

(FinallyAction.prototype).toString = function() {
  return ((this._computation.toString()) + ".finally(" + (this._cleanup.toString()) + ")");
};

//v8 optimization
toFastProperties(FinallyAction);
toFastProperties(FinallyAction.prototype);

//----------

function ActionNever() { }

ActionNever.prototype = Object.create(Action.prototype);

ActionNever.prototype._exec = function() {
  return emptyFn;
};

(ActionNever.prototype).toString = function() {
  return 'Action.never';
};

//v8 optimization
toFastProperties(ActionNever);
toFastProperties(ActionNever.prototype);

function ActionTry(fn) {
  this._fn = fn;
}

ActionTry.prototype = Object.create(Action.prototype);

ActionTry.prototype._exec = function(rej, res) {
  var r;
  try { r = this._fn(); } catch (e) { rej(e); return emptyFn }
  res(r);
  return emptyFn;
};

(ActionTry.prototype).toString = function() {
  return ("Action.try(" + (ramda.toString(this._fn)) + ")");
};

//v8 optimization
toFastProperties(ActionTry);
toFastProperties(ActionTry.prototype);

//data Timing = Undetermined | Synchronous | Asynchronous
var Undetermined = 2;
var Synchronous = 4;
var Asynchronous = 8;

var nextValue = function (x) { return ({ done: false, value: x }); };
var iterationDone = function (x) { return ({ done: true, value: x }); };

function ChainRec(iterate, init) {
  this._iterate = iterate;
  this._init = init;
}

ChainRec.prototype = Object.create(Action.prototype);

ChainRec.prototype._exec = function(rej, res) {
  var inst = this;
  var cancel = emptyFn, i = 0;
  (function recur(state) {
    var timing = Undetermined;
    function chainRecRes(it) {
      i = i + 1;
      if (timing & Undetermined) {
        timing = Synchronous;
        state = it; //eslint-disable-line
      } else {
        recur(it);
      }
    }
    while (!state.done) {
      timing = Undetermined;
      var m = inst._iterate(nextValue, iterationDone, state.value);
      cancel = m._exec(rej, chainRecRes);
      if (~(timing & Synchronous)) {
        timing = Asynchronous;
        return;
      }
    }
    res(state.value);
  }(nextValue(inst._init)));
  return function() { cancel(); };
};

(ChainRec.prototype).toString = function ChainRec$toString(){
  return ("Action.chainRec(" + (showFunction(this._iterate)) + ", " + (ramda.toString(this._init)) + ")");
};

//v8 optimization
toFastProperties(ChainRec);
toFastProperties(ChainRec.prototype);

function ActionDo(generator) {
  this._generator = generator;
}

ActionDo.prototype = Object.create(Action.prototype);

ActionDo.prototype._exec = function(rej, res) {
  var iterator = this._generator();
  var recurser = new ChainRec(function(next, _, x) {
    var iteration = iterator.next(x);
    return iteration.done ? new Identity(iteration) : iteration.value.map(next);
  }, undefined);
  return recurser._exec(rej, res);
};

(ActionDo.prototype).toString = function() {
  return ("Action.do(" + (showFunction(this._generator)) + ")");
};

//v8 optimization
toFastProperties(ActionDo);
toFastProperties(ActionDo.prototype);

function CacheAction(pure) {
  this._pure = pure;
  this._cancel = emptyFn;
  this._queue = [];
  this._queued = 0;
  this._value = null;
  this._state = COLD;
}


function Queued(rej, res) {
  this[REJECTED] = rej;
  this[RESOLVED] = res;
}

CacheAction.prototype = Object.create(Action.prototype);

CacheAction.prototype.extractLeft = function() {
  return this._state & REJECTED ? [this._value] : [];
};

CacheAction.prototype.extractRight = function(){
  return this._state & RESOLVED ? [this._value] : [];
};

CacheAction.prototype._addToQueue = function(rej, res) {
  var inst = this;
  if (inst._state & FULLFILLED) { return emptyFn; }
  var i = inst._queue.push(new Queued(rej, res)) - 1;
  inst._queued = inst._queued + 1;
  return function CacheAction$removeFromQueue() {
    if (inst._state & FULLFILLED) { return; }
    inst._queue[i] = undefined;
    inst._queued = inst._queued - 1;
    if (inst._queued === 0) { inst.reset(); }
  };
};

CacheAction.prototype._drainQueue = function() {
  if (this._state & (COLD | PENDING)) { return; }
  if (this._queued === 0) { return; }
  var queue = this._queue;
  var length = queue.length;
  var state = this._state;
  var value = this._value;
  for (var i = 0; i < length; i++) {
    queue[i] && queue[i][state](value);
    queue[i] = undefined;
  }
  this._queue = undefined;
  this._queued = 0;
};

CacheAction.prototype.reject = function(reason) {
  if (this._state & FULLFILLED) { return; }
  this._value = reason;
  this._state = REJECTED;
  this._drainQueue();
};

CacheAction.prototype.resolve = function(value) {
  if (this._state & FULLFILLED) { return; }
  this._value = value;
  this._state = RESOLVED;
  this._drainQueue();
};

CacheAction.prototype.run = function() {
  var inst = this;
  if (inst._state & ACTIVE) { return; }
  inst._state = PENDING;
  inst._cancel = inst._pure._exec(
    function CacheAction$fork$rej(x) { inst.reject(x); },
    function CacheAction$fork$res(x) { inst.resolve(x); }
  );
};

CacheAction.prototype.reset = function CacheAction$reset() {
  if (this._state & COLD) { return; }
  if (this._state & FULLFILLED) { this._cancel(); }
  this._cancel = emptyFn;
  this._queue = [];
  this._queued = 0;
  this._value = undefined;
  this._state = COLD;
};

CacheAction.prototype._exec = function CacheAction$fork(rej, res) {
  var inst = this;
  var cancel = emptyFn;
  switch (inst._state) {
    case PENDING: cancel = inst._addToQueue(rej, res); break;
    case REJECTED: rej(inst._value); break;
    case RESOLVED: res(inst._value); break;
    default: cancel = inst._addToQueue(rej, res); inst.run();
  }
  return cancel;
};

CacheAction.prototype.toString = function(){
  return ((this._pure.toString()) + ".cache()");
};

//v8 optimization
toFastProperties(CacheAction);
toFastProperties(CacheAction.prototype);

function ActionWrap(fn, a, b, c) {
  this._length = arguments.length - 1;
  this._fn = fn;
  this._a = a;
  this._b = b;
  this._c = c;
  this._exec = ActionWrap.EX[this._length - 1];
}

ActionWrap.EX = [
  function(rej, res) {
    var r;
    try { r = this._fn(this._a); } catch (e) { rej(e); return emptyFn }
    res(r);
    return emptyFn;
  },
  function(rej, res) {
    var r;
    try { r = this._fn(this._a, this._b); } catch (e) { rej(e); return emptyFn }
    res(r);
    return emptyFn;
  },
  function(rej, res) {
    var r;
    try { r = this._fn(this._a, this._b, this._c); } catch (e) { rej(e); return emptyFn }
    res(r);
    return emptyFn;
  }
];

ActionWrap.prototype = Object.create(Action.prototype);

(ActionWrap.prototype).toString = function() {
  var args = [this._a, this._b, this._c].slice(0, this._length).map(showFunction).join(', ');
  var name = "wrap" + (this._length > 1 ? this._length : '');
  return ("Action." + name + "(" + (ramda.toString(this._fn)) + ", " + args + ")");
};

//v8 optimization
toFastProperties(ActionWrap);
toFastProperties(ActionWrap.prototype);

function ActionFromPromise(fn, a, b, c) {
  this._length = arguments.length - 1;
  this._fn = fn;
  this._a = a;
  this._b = b;
  this._c = c;
  this._exec = ActionFromPromise.EX[this._length - 1];
}

ActionFromPromise.EX = [
  function(rej, res) {
    var promise = this._fn(this._a);
    promise.then(res, rej);
    return emptyFn;
  },
  function(rej, res) {
    var promise = this._fn(this._a, this._b);
    promise.then(res, rej);
    return emptyFn;
  },
  function(rej, res) {
    var promise = this._fn(this._a, this._b, this._c);
    promise.then(res, rej);
    return emptyFn;
  }
];

ActionFromPromise.prototype = Object.create(Action.prototype);

ActionFromPromise.prototype.toString = function(){
  var args = [this._a, this._b, this._c].slice(0, this._length).map(showFunction).join(', ');
  var name = "fromPromise" + (this._length > 1 ? this._length : '');
  return ("Action." + name + "(" + (ramda.toString(this._fn)) + ", " + args + ")");
};

//v8 optimization
toFastProperties(ActionFromPromise);
toFastProperties(ActionFromPromise.prototype);

function ActionNode(computation) {
  this._computation = computation;
}

ActionNode.prototype = Object.create(Action.prototype);

ActionNode.prototype._exec = function(rej, res) {
  var open = true;
  this._computation(function(a, b) {
    if (open) {
      a ? rej(a) : res(b);
      open = false;
    }
  });
  return function () { return open = false; };
};

ActionNode.prototype.toString = function(){
  return ("Action.node(" + (showFunction(this._computation)) + ")");
};

//v8 optimization
toFastProperties(ActionNode);
toFastProperties(ActionNode.prototype);

var $$type = '@@type';

  function type(x) {
    return x != null &&
           x.constructor != null &&
           x.constructor.prototype !== x &&
           typeof x.constructor[$$type] === 'string' ?
      x.constructor[$$type] :
      Object.prototype.toString.call(x).slice('[object '.length, -']'.length);
  }

//these are just util curry functions for the use of the library.
//they are built for performance and dont have the same functinality as ramda
function c2(){
  var this$1 = this;
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  var fresh = [];
  var i = 0;
  var j = this.params.length;
  var total = j + args.length;
  while(i < total){
    if(i < j) { fresh.push(this$1.params[i]); }
    else { fresh.push(args[i - j]); }
    i = i + 1;
  }
  switch(fresh.length){
    case 1: return function (x) { return this$1.f(fresh[0], x); }
    case 2: return this.f(fresh[0], fresh[1]);
    default: return c2.bind({f:this.f, params:fresh}) 
  }
}

function c3(){
  var this$1 = this;
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  var fresh = [];
  var i = 0;
  var j = this.params.length;
  var total = j + args.length;
  while(i < total){
    if(i < j) { fresh.push(this$1.params[i]); }
    else { fresh.push(args[i - j]); }
    i = i + 1;
  }
  switch(fresh.length){
    case 2: return function (x) { return this$1.f(fresh[0], fresh[1], x); }
    case 3: return this.f(fresh[0], fresh[1], fresh[2]);
    default: return c3.bind({f:this.f, params:fresh}) 
  }
}

function cN(){
  var this$1 = this;
  var args = [], len = arguments.length;
  while ( len-- ) args[ len ] = arguments[ len ];

  var fresh = [];
  var i = 0;
  var j = this.params.length;
  var total = j + args.length;
  while(i < total){
    if(i < j) { fresh.push(this$1.params[i]); }
    else { fresh.push(args[i - j]); }
    i = i + 1;
  }
  switch(fresh.length){
    case this.size - 1: return function (x) { return (ref = this$1).f.apply(ref, fresh.concat( [x] ))
      var ref; };
    case this.size: return (ref = this).f.apply(ref, fresh);
    default: return cN.bind({f:this.f, params:fresh, size:this.size}) 
  }
  var ref;
}

function curryN(n,f){
  var meta = {
    f:f,
    params: [],
    size:n
  };
  switch(n){
    case 2: return c2.bind(meta);
    case 3: return c3.bind(meta);
    default: return cN.bind(meta);
  } 
}

var $alt = 'fantasy-land/alt';
  var $ap$1 = 'fantasy-land/ap';
  var $map$1 = 'fantasy-land/map';
  var $of = 'fantasy-land/of';
  var $zero = 'fantasy-land/zero';

  //concurrify :: Applicative m
  //           => (TypeRep m, m a, (m a, m a) -> m a, (m a, m (a -> b)) -> m b)
  //           -> Concurrently m
  function makeParallel(Repr, zero, alt, ap){

    function Concurrently(sequential){
      this.sequential = sequential;
    }

    function construct(x){
      return new Concurrently(x);
    }

    var proto = Concurrently.prototype = construct.prototype = {constructor: construct};


    var mzero = new Concurrently(zero);
    construct[$zero] = function Concurrently$zero(){
      return mzero;
    };

    construct[$of] = function Concurrently$of(value){
      return new Concurrently(Z.of(Repr, value));
    };

    proto[$map$1] = function Concurrently$map(mapper){
      return new Concurrently(Z.map(mapper, this.sequential));
    };

    proto[$ap$1] = function Concurrently$ap(m){
      return new Concurrently(ap(this.sequential, m.sequential));
    };

    proto[$alt] = function Concurrently$alt(m){
      return new Concurrently(alt(this.sequential, m.sequential));
    };

    return construct;

  }

var action_type = 'BriskSale/Action';
var verifyAction = function (m) { return m instanceof Action || type(m) === action_type; };


function Action(f){
  return new BaseAction(f);
}

Action.prototype.extractLeft = function() { return [] };
Action.prototype.extractRight = function(){ return [] };
var of = function (x) { return new Identity(x); };

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
};

var exec = function(rej, res){
  return this._exec(rej, res);
};

Action.prototype.exec = exec;
//backwards compatibility
Action.prototype.fork = exec;

Action.prototype.value = function(f) {
  return this._exec(function(e) {
    throw new Error(
      ("ActionInst.value was called on a rejected Action\n  Actual: Action.reject(" + (ramda.toString(e)) + ")")
    );
  }, f);
};

Action.prototype.promise = function() {
  var inst = this;
  return new Promise(function(resolve, reject) {
    inst._exec(reject, resolve);
  });
};

function ChainRecAction(f, init) {
  if (arguments.length === 1) { return function (init) { return new ChainRec(f, init); }; }
  return new ChainRec(f, init);
}
//Static methods
//-------------------------------------
Action.ap = function(values, func) {
  if (arguments.length === 1) { return function (func) { return ap(values, func); }; }
  return ap(values, func);
};

Action.map = function (mapper, m) {
  if (arguments.length === 1) { return function (m) { return map(mapper, m); }; }
  return map(mapper, m);
};

Action.bimap = function(lmapper, rmapper, m) {
  if (arguments.length === 1) { return curryN(3, bimap)(lmapper); }
  if (arguments.length === 2) { return function (m) { return bimap(lmapper, rmapper, m); }; }
  return bimap(lmapper, rmapper, m);
};

Action.chain = function(chainer, m) {
  if (arguments.length === 1) { return function (m) { return chain(chainer, m); }; }
  return chain(chainer, m);
};


Action.and = function and(left, right) {
  if (arguments.length === 1) { return function (right) { return new AndAction(left, right); }; }
  return new AndAction(left, right);
};

Action.both = function(left, right) {
  if (arguments.length === 1) { return function (right) { return new BothAction(left, right); }; }
  return new BothAction(left, right);
};

Action.reject = function(x) {
  return new ActionReject(x);
};

Action.after = function(n, x) {
  if (arguments.length === 1) { return function (x) { return new ActionAfter(n, x); }; }
  return new ActionAfter(n, x);
};

Action.rejectAfter = function(time, reason) {
  if (arguments.length === 1) { return function (reason) { return new ActionRejectAfter(time, reason); }; }
  return new ActionRejectAfter(time, reason);
};

Action.try = function(f) {
  return new ActionTry(f);
};

Action.wrap = function(f, x) {
  if (arguments.length === 1) { return function (x) { return new ActionWrap(f, x); }; }
  return new ActionWrap(f, x);
};

Action.wrap2 = function(f, x, y) {
  switch (arguments.length) {
    case 1: return curryN(2, function (x, y) { return new ActionWrap(f, x, y); });
    case 2: return function (y) { return new ActionWrap(f, x, y); };
    default:
      return new ActionWrap(f, x, y);
  }
};

Action.wrap3 = function(f, x, y, z) {
  switch (arguments.length) {
    case 1: return curryN(3, function (x, y, z) { return new ActionWrap(f, x, y, z); });
    case 2: return curryN(2, function (y, z) { return new ActionWrap(f, x, y, z); });
    case 3: return function (z) { return new ActionWrap(f, x, y, z); };
    default:
      return new ActionWrap(f, x, y, z);
  }
};

Action.fromPromise = function(f, x) {
  if (arguments.length === 1) { return function (x) { return new ActionFromPromise(f, x); }; }
  return new ActionFromPromise(f, x);
};

Action.fromPromise2 = function(f, x, y) {
  switch (arguments.length) {
    case 1: return curryN(2, function (x, y) { return new ActionFromPromise(f, x, y); });
    case 2: return function (y) { return new ActionFromPromise(f, x, y); };
    default:
      return new ActionFromPromise(f, x, y);
  }
};

Action.fromPromise3 = function(f, x, y, z) {
  switch (arguments.length) {
    case 1: return curryN(3, function (x, y, z) { return new ActionFromPromise(f, x, y, z); });
    case 2: return curryN(2, function (y, z) { return new ActionFromPromise(f, x, y, z); });
    case 3: return function (z) { return new ActionFromPromise(f, x, y, z); };
    default:
      return new ActionFromPromise(f, x, y, z);
  }
};

Action.node = function(f) {
  return new ActionNode(f);
};

Action.parallel = function(i, ms) {
  if (arguments.length === 1) { return function (ms) { return new ActionParallel(i, ms); }; }
  return new ActionParallel(i, ms);
};

Action.do = function(f) {
  return new ActionDo(f);
};

Action.chainRej = function(chainer, m) {
  if (arguments.length === 1) { return function (m) { return new ChainRejAction(m, chainer); }; }
  return new ChainRejAction(m, chainer);
};

Action.mapRej = function(mapper, m) {
  if (arguments.length === 1) { return function (m) { return new MapRejAction(m, mapper); }; }
  return new MapRejAction(m, mapper);
};

Action.race = function(right, left) {
  if (arguments.length === 1) { return function (left) { return new RaceAction(left, right); }; }
 return new RaceAction(left, right);
};

Action.or = function(left, right) {
  if (arguments.length === 1) { return function (right) { return new OrAction(left, right); }; }
  return new OrAction(left, right);
};

Action.finally = function(right, left) {
  if (arguments.length === 1) { return function (left) { return new FinallyAction(left, right); }; }
  return new FinallyAction(left, right);
};

Action.value = function(cont, m) {
  if (arguments.length === 1) { return function (m) { return m.value(cont); }; }
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
  if (arguments.length === 1) { return curryN(2, function (g, m) { return m._exec(f, g); }); }
  if (arguments.length === 2) { return function (m) { return m._exec(f, g); }; }
  return m._exec(f, g);
};

Action.fold = function(f, g, m) {
  if (arguments.length === 1) { return curryN(2, function (g, m) { return new FoldAction(m, f, g); }) }
  if (arguments.length === 2) { return function (m) { return new FoldAction(m, f, g); }; }
  return new FoldAction(m, f, g);
};

Action.hook = function hook(acquire, cleanup, consume) {
  if (arguments.length === 1) { return curryN(2, function (cleanup, consume) { return new HookAction(acquire, cleanup, consume); }); }
  if (arguments.length === 2) { return function (consume) { return new HookAction(acquire, cleanup, consume); }; }
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

/**
 * A data type that holds a value and exposes a monadic api.
 */

/**
 * Constructs a new `Identity[a]` data type that holds a single
 * value `a`.
 * @param {*} a Value of any type
 * @sig a -> Identity[a]
 */
function Identity$1(x) {
  if (!(this instanceof Identity$1)) {
    return new Identity$1(x);
  }
  this.value = x;
}

Identity$1.prototype['@@type'] = 'ramda-fantasy/Identity';

/**
 * Applicative specification. Creates a new `Identity[a]` holding the value `a`.
 * @param {*} a Value of any type
 * @returns Identity[a]
 * @sig a -> Identity[a]
 */
Identity$1.of = function(x) {
  return new Identity$1(x);
};
Identity$1.prototype.of = Identity$1.of;

/**
 * Functor specification. Creates a new `Identity[a]` mapping function `f` onto
 * `a` returning any value b.
 * @param {Function} f Maps `a` to any value `b`
 * @returns Identity[b]
 * @sig @Identity[a] => (a -> b) -> Identity[b]
 */
Identity$1.prototype.map = function(f) {
  return new Identity$1(f(this.value));
};

/**
 * Apply specification. Applies the function inside the `Identity[a]`
 * type to another applicative type.
 * @param {Applicative[a]} app Applicative that will apply its function
 * @returns Applicative[b]
 * @sig (Identity[a -> b], f: Applicative[_]) => f[a] -> f[b]
 */
Identity$1.prototype.ap = function(app) {
  return app.map(this.value);
};

/**
 * Chain specification. Transforms the value of the `Identity[a]`
 * type using an unary function to monads. The `Identity[a]` type
 * should contain a function, otherwise an error is thrown.
 *
 * @param {Function} fn Transforms `a` into a `Monad[b]`
 * @returns Monad[b]
 * @sig (Identity[a], m: Monad[_]) => (a -> m[b]) -> m[b]
 */
Identity$1.prototype.chain = function(fn) {
  return fn(this.value);
};

// chainRec
Identity$1.chainRec = Identity$1.prototype.chainRec = function(f, i) {
  var state = chainRecNext(i);
  while (state.isNext) {
    state = f(chainRecNext, chainRecDone, state.value).get();
  }
  return Identity$1(state.value);
};

/**
 * Returns the value of `Identity[a]`
 *
 * @returns a
 * @sig (Identity[a]) => a
 */
Identity$1.prototype.get = function() {
  return this.value;
};

// equality method to enable testing
Identity$1.prototype.equals = getEquals(Identity$1);

Identity$1.prototype.toString = function() {
  return 'Identity(' + ramda.toString(this.value) + ')';
};


//v8 optimization
toFastProperties(Identity$1);
toFastProperties(Identity$1.prototype);

function IO(fn) {
  if (!(this instanceof IO)) {
    return new IO(fn);
  }
  this.fn = fn;
}

IO.prototype['@@type'] = 'ramda-fantasy/IO';

// `f` must return an IO
IO.prototype.chain = function(f) {
  var io = this;
  return new IO(function() {
    var next = f(io.fn.apply(io, arguments));
    return next.fn.apply(next, arguments);
  });
};

//chainRec
IO.chainRec = IO.prototype.chainRec = function(f, i) {
  return new IO(function() {
    var state = chainRecNext(i);
    while (state.isNext) {
      state = f(chainRecNext, chainRecDone, state.value).fn();
    }
    return state.value;
  });
};

IO.prototype.map = function(f) {
  var io = this;
  return new IO(ramda.compose(f, io.fn));
};

// `this` IO must wrap a function `f` that takes an IO (`thatIo`) as input
// `f` must return an IO
IO.prototype.ap = function(thatIo) {
  return this.chain(function(f) {
    return thatIo.map(f);
  });
};

IO.runIO = function(io) {
  return io.runIO.apply(io, [].slice.call(arguments, 1));
};

IO.prototype.runIO = function() {
  return this.fn.apply(this, arguments);
};

IO.prototype.run = IO.prototype.runIO;

IO.prototype.of = function(x) {
  return new IO(function() { return x; });
};

IO.of = IO.prototype.of;

IO.prototype.toString = function() {
  return 'IO(' + ramda.toString(this.fn) + ')';
};

//v8 optimization
toFastProperties(IO);
toFastProperties(IO.prototype);

function Maybe(x) {
  return x == null ? _nothing : Maybe.Just(x);
}

Maybe.prototype['@@type'] = 'ramda-fantasy/Maybe';

function Just(x) {
  this.value = x;
}
extend(Just, Maybe);

Just.prototype.isJust = true;
Just.prototype.isNothing = false;

function Nothing() {}
extend(Nothing, Maybe);

Nothing.prototype.isNothing = true;
Nothing.prototype.isJust = false;

var _nothing = new Nothing();

Maybe.Nothing = function() {
  return _nothing;
};

Maybe.Just = function(x) {
  return new Just(x);
};

Maybe.of = Maybe.Just;

Maybe.prototype.of = Maybe.Just;

Maybe.isJust = function(x) {
  return x.isJust;
};

Maybe.isNothing = function(x) {
  return x.isNothing;
};

Maybe.maybe = ramda.curry(function(nothingVal, justFn, m) {
  return m.reduce(function(_, x) {
    return justFn(x);
  }, nothingVal);
});

Maybe.toMaybe = Maybe;

// semigroup
Just.prototype.concat = function(that) {
  return that.isNothing ? this : this.of(
    this.value.concat(that.value)
  );
};

Nothing.prototype.concat = identity$1;

// functor
Just.prototype.map = function(f) {
  return this.of(f(this.value));
};

Nothing.prototype.map = returnThis;

// apply
// takes a Maybe that wraps a function (`app`) and applies its `map`
// method to this Maybe's value, which must be a function.
Just.prototype.ap = function(m) {
  return m.map(this.value);
};

Nothing.prototype.ap = returnThis;

// applicative
// `of` inherited from `Maybe`


// chain
//  f must be a function which returns a value
//  f must return a value of the same Chain
//  chain must return a value of the same Chain
Just.prototype.chain = baseMap;

Nothing.prototype.chain = returnThis;


//chainRec
Maybe.chainRec = Maybe.prototype.chainRec = function(f, i) {
  var res, state = chainRecNext(i);
  while (state.isNext) {
    res = f(chainRecNext, chainRecDone, state.value);
    if (Maybe.isNothing(res)) {
      return res;
    }
    state = res.value;
  }
  return Maybe.Just(state.value);
};


//
Just.prototype.datatype = Just;

Nothing.prototype.datatype = Nothing;

// monad
// A value that implements the Monad specification must also implement the Applicative and Chain specifications.
// see above.

// equality method to enable testing
Just.prototype.equals = getEquals(Just);

Nothing.prototype.equals = function(that) {
  return that === _nothing;
};

Maybe.prototype.isNothing = function() {
  return this === _nothing;
};

Maybe.prototype.isJust = function() {
  return this instanceof Just;
};

Just.prototype.getOrElse = function() {
  return this.value;
};

Nothing.prototype.getOrElse = function(a) {
  return a;
};

Just.prototype.reduce = function(f, x) {
  return f(x, this.value);
};

Nothing.prototype.reduce = function(f, x) {
  return x;
};

Just.prototype.toString = function() {
  return 'Maybe.Just(' + ramda.toString(this.value) + ')';
};

Nothing.prototype.toString = function() {
  return 'Maybe.Nothing()';
};

//v8 optimization
toFastProperties(Maybe);
toFastProperties(Maybe.prototype);

function Reader(run) {
  if (!(this instanceof Reader)) {
    return new Reader(run);
  }
  this.run = run;
}

Reader.run = function(reader) {
  return reader.run.apply(reader, [].slice.call(arguments, 1));
};

Reader.prototype['@@type'] = 'ramda-fantasy/Reader';

Reader.prototype.chain = function(f) {
  var reader = this;
  return new Reader(function(r) {
    return f(reader.run(r)).run(r);
  });
};

Reader.prototype.ap = function(a) {
  return this.chain(function(f) {
    return a.map(f);
  });
};

Reader.prototype.map = function(f) {
  return this.chain(function(a) {
    return Reader.of(f(a));
  });
};

Reader.prototype.of = function(a) {
  return new Reader(function() {
    return a;
  });
};
Reader.of = Reader.prototype.of;

Reader.ask = Reader(ramda.identity);

Reader.prototype.toString = function() {
  return 'Reader(' + ramda.toString(this.run) + ')';
};

Reader.T = function(M) {
  var ReaderT = function ReaderT(run) {
    if (!(this instanceof ReaderT)) {
      return new ReaderT(run);
    }
    this.run = run;
  };

  ReaderT.lift = ramda.compose(ReaderT, ramda.always);

  ReaderT.ask = ReaderT(M.of);

  ReaderT.prototype.of = ReaderT.of = function(a) {
    return ReaderT(function() {
      return M.of(a);
    });
  };

  ReaderT.prototype.chain = function(f) {
    var readerT = this;
    return ReaderT(function(e) {
      var m = readerT.run(e);
      return m.chain(function(a) {
        return f(a).run(e);
      });
    });
  };

  ReaderT.prototype.map = function(f) {
    return this.chain(function(a) {
      return ReaderT.of(f(a));
    });
  };

  ReaderT.prototype.ap = function(a) {
    var readerT = this;
    return ReaderT(function(e) {
      return readerT.run(e).ap(a.run(e));
    });
  };

  ReaderT.prototype.toString = function() {
    return 'ReaderT[' + M.name + '](' + ramda.toString(this.run) + ')';
  };

  return ReaderT;
};

//v8 optimization
toFastProperties(Reader);
toFastProperties(Reader.prototype);

function Tuple(x, y) {
  switch (arguments.length) {
    case 0:
      throw new TypeError('no arguments to Tuple');
    case 1:
      return function(y) {
        return new _Tuple(x, y);
      };
    default:
      return new _Tuple(x, y);
  }
}

function _Tuple(x, y) {
  this[0] = x;
  this[1] = y;
  this.length = 2;
}

function ensureConcat(xs) {
  xs.forEach(function(x) {
    if (typeof x.concat != 'function') {
      throw new TypeError(ramda.toString(x) + ' must be a semigroup to perform this operation');
    }
  });
}

Tuple.fst = function(x) {
  return x[0];
};

Tuple.snd = function(x) {
  return x[1];
};

_Tuple.prototype['@@type'] = 'ramda-fantasy/Tuple';

// semigroup
_Tuple.prototype.concat = function(x) {
  ensureConcat([this[0], this[1]]);
  return Tuple(this[0].concat(x[0]), this[1].concat(x[1]));
};

// functor
_Tuple.prototype.map = function(f) {
  return Tuple(this[0], f(this[1]));
};

// apply
_Tuple.prototype.ap = function(m) {
  ensureConcat([this[0]]);
  return Tuple(this[0].concat(m[0]), this[1](m[1]));
};

// setoid
_Tuple.prototype.equals = function(that) {
  return that instanceof _Tuple && ramda.equals(this[0], that[0]) && ramda.equals(this[1], that[1]);
};

_Tuple.prototype.toString = function() {
  return 'Tuple(' + ramda.toString(this[0]) + ', ' + ramda.toString(this[1]) + ')';
};

function T(M) {
  function StateT(run) {
    if (!(this instanceof StateT)) {
      return new StateT(run);
    }
    this._run = run;
  }
  StateT.prototype.run = function(s) {
    return this._run(s);
  };
  StateT.prototype.eval = function(s) {
    return Tuple.fst(this.run(s));
  };
  StateT.prototype.exec = function(s) {
    return Tuple.snd(this.run(s));
  };
  StateT.prototype.chain = function(f) {
    var state = this;
    return StateT(function(s) {
      return state._run(s).chain(function(t) {
        return f(Tuple.fst(t))._run(Tuple.snd(t));
      });
    });
  };
  StateT.of = StateT.prototype.of = function(a) {
    return StateT(function (s) {
      return M.of(Tuple(a, s));
    });
  };
  StateT.prototype.ap = deriveAp(StateT);
  StateT.prototype.map = deriveMap(StateT);
  StateT.tailRec = ramda.curry(function(stepFn, init) {
    return StateT(function(s) {
      return M.tailRec(function(t) {
        return stepFn(Tuple.fst(t))._run(Tuple.snd(t)).chain(function (t_) {
          return M.of(Tuple.fst(t_).bimap(
            function(a) { return Tuple(a, Tuple.snd(t_)); },
            function(b) { return Tuple(b, Tuple.snd(t_)); }
          ));
        });
      }, Tuple(init, s));
    });
  });
  StateT.lift = function(ma) {
    return StateT(function(s) {
      return ma.chain(function(a) {
        return M.of(Tuple(a, s));
      });
    });
  };
  StateT.get = StateT(function(s) {
    return M.of(Tuple(s, s));
  });
  StateT.gets = function(f) {
    return StateT(function(s) {
      return M.of(Tuple(f(s), s));
    });
  };
  StateT.put = function(s) {
    return StateT(function(_) {
      return M.of(Tuple(void _, s));
    });
  };
  StateT.modify = function(f) {
    return StateT(function(s) {
      return M.of(Tuple(void 0, f(s)));
    });
  };

  return StateT;
}
var State = T(Identity$1);
State.T = T;
State.prototype.run = function(s) {
  return this._run(s).value;
};

var index = {
  Either: Either,
  Action: Action,
  Identity: Identity$1,
  IO: IO,
  Maybe: Maybe,
  Reader: Reader,
  State: State,
  Tuple: Tuple,
  Future:Action
};
// module.exports = {
//   Action: require('./action/action'),
//   Future: require('./action/action'),
//   Identity: require('./Identity'),
//   IO: require('./IO'),
//   lift2: require('./lift2'),
//   lift3: require('./lift3'),
//   Maybe: require('./Maybe'),
//   Reader: require('./Reader'),
//   State: require('./State'),
//   Tuple: require('./Tuple'),
//   Futurize: require('futurize')
// };

return index;

})));
