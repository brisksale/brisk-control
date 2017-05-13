import {Core} from './core';
import {noop, show, showf, partial1, partial2, partial3} from './internal/fn';
import {isThenable, isFunction} from './internal/is';
import {invalidArgument, typeError} from './internal/throw';

function escape(f){
  return function imprisoned(x){
    setTimeout(function escaped(){ f(x) }, 0);
  };
}

function check$promise(p, f, a, b, c){
  return isThenable(p) ? p : typeError(
    'Future.encaseP expects the function its given to return a Promise/Thenable'
    + `\n  Actual: ${show(p)}\n  From calling: ${showf(f)}`
    + `\n  With a: ${show(a)}`
    + (arguments.length > 3 ? `\n  With b: ${show(b)}` : '')
    + (arguments.length > 4 ? `\n  With c: ${show(c)}` : '')
  );
}

function EncaseP$0$fork(rej, res){
  const {_fn} = this;
  check$promise(_fn(), _fn).then(escape(res), escape(rej));
  return noop;
}

function EncaseP$1$fork(rej, res){
  const {_fn, _a} = this;
  check$promise(_fn(_a), _fn, _a).then(escape(res), escape(rej));
  return noop;
}

function EncaseP$2$fork(rej, res){
  const {_fn, _a, _b} = this;
  check$promise(_fn(_a, _b), _fn, _a, _b).then(escape(res), escape(rej));
  return noop;
}

function EncaseP$3$fork(rej, res){
  const {_fn, _a, _b, _c} = this;
  check$promise(_fn(_a, _b, _c), _fn, _a, _b, _c).then(escape(res), escape(rej));
  return noop;
}

const forks = [EncaseP$0$fork, EncaseP$1$fork, EncaseP$2$fork, EncaseP$3$fork];

function EncaseP(fn, a, b, c){
  this._length = arguments.length - 1;
  this._fn = fn;
  this._a = a;
  this._b = b;
  this._c = c;
  this._fork = forks[this._length];
}

EncaseP.prototype = Object.create(Core);

EncaseP.prototype.toString = function EncaseP$toString(){
  const args = [this._a, this._b, this._c].slice(0, this._length).map(show).join(', ');
  const name = `encaseP${this._length > 1 ? this._length : ''}`;
  return `Future.${name}(${show(this._fn)}, ${args})`;
};

export function tryP(f){
  if(!isFunction(f)) invalidArgument('Future.tryP', 0, 'be a function', f);
  return new EncaseP(f);
}

export function encaseP(f, x){
  if(!isFunction(f)) invalidArgument('Future.encaseP', 0, 'be a function', f);
  if(arguments.length === 1) return partial1(encaseP, f);
  return new EncaseP(f, x);
}

export function encaseP2(f, x, y){
  if(!isFunction(f)) invalidArgument('Future.encaseP2', 0, 'be a function', f);
  switch(arguments.length){
    case 1: return partial1(encaseP2, f);
    case 2: return partial2(encaseP2, f, x);
    default: return new EncaseP(f, x, y);
  }
}

export function encaseP3(f, x, y, z){
  if(!isFunction(f)) invalidArgument('Future.encaseP3', 0, 'be a function', f);
  switch(arguments.length){
    case 1: return partial1(encaseP3, f);
    case 2: return partial2(encaseP3, f, x);
    case 3: return partial3(encaseP3, f, x, y);
    default: return new EncaseP(f, x, y, z);
  }
}
