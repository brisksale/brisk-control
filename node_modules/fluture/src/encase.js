import {Core} from './core';
import {noop, show, partial1, partial2, partial3} from './internal/fn';
import {isFunction} from './internal/is';
import {invalidArgument} from './internal/throw';

function Encase$0$fork(rej, res){
  let r;
  try{ r = this._fn() }catch(e){ rej(e); return noop }
  res(r);
  return noop;
}

function Encase$1$fork(rej, res){
  let r;
  try{ r = this._fn(this._a) }catch(e){ rej(e); return noop }
  res(r);
  return noop;
}

function Encase$2$fork(rej, res){
  let r;
  try{ r = this._fn(this._a, this._b) }catch(e){ rej(e); return noop }
  res(r);
  return noop;
}

function Encase$3$fork(rej, res){
  let r;
  try{ r = this._fn(this._a, this._b, this._c) }catch(e){ rej(e); return noop }
  res(r);
  return noop;
}

const forks = [Encase$0$fork, Encase$1$fork, Encase$2$fork, Encase$3$fork];

function Encase(fn, a, b, c){
  this._length = arguments.length - 1;
  this._fn = fn;
  this._a = a;
  this._b = b;
  this._c = c;
  this._fork = forks[this._length];
}

Encase.prototype = Object.create(Core);

Encase.prototype.toString = function Encase$toString(){
  const args = [this._a, this._b, this._c].slice(0, this._length).map(show).map(x => `, ${x}`);
  const name = this._length ? `encase${this._length > 1 ? this._length : ''}` : 'try';
  return `Future.${name}(${show(this._fn)}${args.join('')})`;
};

export function attempt(f){
  if(!isFunction(f)) invalidArgument('Future.try', 0, 'be a function', f);
  return new Encase(f);
}

export function encase(f, x){
  if(!isFunction(f)) invalidArgument('Future.encase', 0, 'be a function', f);
  if(arguments.length === 1) return partial1(encase, f);
  return new Encase(f, x);
}

export function encase2(f, x, y){
  if(!isFunction(f)) invalidArgument('Future.encase2', 0, 'be a function', f);
  switch(arguments.length){
    case 1: return partial1(encase2, f);
    case 2: return partial2(encase2, f, x);
    default: return new Encase(f, x, y);
  }
}

export function encase3(f, x, y, z){
  if(!isFunction(f)) invalidArgument('Future.encase3', 0, 'be a function', f);
  switch(arguments.length){
    case 1: return partial1(encase3, f);
    case 2: return partial2(encase3, f, x);
    case 3: return partial3(encase3, f, x, y);
    default: return new Encase(f, x, y, z);
  }
}
