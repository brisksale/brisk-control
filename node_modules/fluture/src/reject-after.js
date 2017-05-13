import {Core, isNever, never} from './core';
import {After} from './after';
import {show, partial1} from './internal/fn';
import {isUnsigned} from './internal/is';
import {invalidArgument} from './internal/throw';

export function RejectAfter(time, value){
  this._time = time;
  this._value = value;
}

RejectAfter.prototype = Object.create(Core);

RejectAfter.prototype._race = function RejectAfter$race(other){
  return other.isSettled()
       ? other
       : isNever(other)
       ? this
       : (other instanceof After || other instanceof RejectAfter)
       ? other._time < this._time ? other : this
       : Core._race.call(this, other);
};

RejectAfter.prototype._swap = function RejectAfter$swap(){
  return new After(this._time, this._value);
};

RejectAfter.prototype._fork = function RejectAfter$_fork(rej){
  const id = setTimeout(rej, this._time, this._value);
  return () => { clearTimeout(id) };
};

RejectAfter.prototype.extractLeft = function RejectAfter$extractLeft(){
  return [this._value];
};

RejectAfter.prototype.toString = function RejectAfter$toString(){
  return `Future.rejectAfter(${show(this._time)}, ${show(this._value)})`;
};

function rejectAfter$time(time, reason){
  return time === Infinity ? never : new RejectAfter(time, reason);
}

export function rejectAfter(time, reason){
  if(!isUnsigned(time)) invalidArgument('Future.rejectAfter', 0, 'be a positive integer', time);
  if(arguments.length === 1) return partial1(rejectAfter$time, time);
  return rejectAfter$time(time, reason);
}
