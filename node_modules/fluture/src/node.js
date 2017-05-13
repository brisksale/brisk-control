import {Core} from './core';
import {showf} from './internal/fn';
import {isFunction} from './internal/is';
import {invalidArgument} from './internal/throw';

export function Node(computation){
  this._computation = computation;
}

Node.prototype = Object.create(Core);

Node.prototype._fork = function Node$_fork(rej, res){
  let open = true;
  this._computation(function Node$fork$done(a, b){
    if(open){
      open = false;
      a ? rej(a) : res(b);
    }
  });
  return function Node$fork$cancel(){ open = false };
};

Node.prototype.toString = function Node$toString(){
  return `Future.node(${showf(this._computation)})`;
};

export function node(f){
  if(!isFunction(f)) invalidArgument('Future.node', 0, 'be a function', f);
  return new Node(f);
}
