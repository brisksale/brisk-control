'use strict';
import {Left} from './left'
import {Right} from './right'
import Maybe from '../maybe/maybe'
import {toFastProperties} from '../internal/toFastProp';
import curryN from "../internal/curry";
import {equals} from '../internal/helper';

const {Just, Nothing} = Maybe

const either_type = 'brisk-control/Either'

const equalEither = function(other){
  return this.isLeft === other.isLeft && equals(this.value, other.value);
}

const lteEither = function (other) {
  return this.isLeft === other.isLeft ?
    this.value <= other.value :
    this.isLeft;
}

const apEither = function(other){
  return other.isRight ? this.map(other.value) : other;
}

function Either(){}

Either.prototype.inspect = function() { 
  return this.toString(); 
}

Either.prototype.equals = equalEither

Either.prototype['fantasy-land/equals'] = equalEither

Either.prototype.lte = lteEither

Either.prototype['fantasy-land/lte'] = lteEither

Either.prototype.ap = apEither

Either.prototype['fantasy-land/ap'] = apEither

Either['@@type'] = either_type

Either.isLeft = function(either){
  return either.isLeft
}

Either.isRight = function(either){
  return either.isRight
}


Either.fromEither = function(x, either) {
  if (arguments.length === 1) return either => either.isRight ? either.value : x;
  return either.isRight ? either.value : x;
}

Either.toEither = function(x, y){
  return y == null ? new Left(x) : new Right(y);
}

Either.either = function (l, r, either) {
  if (arguments.length === 1) return curryN(2, (r, either) => either.isLeft ? l(either.value) : r(either.value));
  if (arguments.length === 2) return either => either.isLeft ? l(either.value) : r(either.value);
  return either.isLeft ? l(either.value) : r(either.value);
}
Either.tagBy = function(pred, a){
  if (arguments.length === 1) return a => pred(a) ? new Right(a) : new Left(a);
  return pred(a) ? new Right(a) : new Left(a);
}

Either.Left = function(value){
  return new Left(value)
}

Either.Right = function(value){
  return new Right(value)
}

Either['fantasy-land/of'] = function(value){
  return new Right(value)
}

Either.of = function(value){
  return new Right(value)
}

Either.eitherToMaybe = function(either){
  return either.isLeft ? Nothing : Just(either.value);
}

// look into lefts rights encase
//v8 optimization
toFastProperties(Either);
toFastProperties(Either.prototype);

export default Either