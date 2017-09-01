'use strict';
import {Just} from './just'
import {Nothing} from './nothing'
import Either from '../either/either'
import {toFastProperties} from '../internal/toFastProp';
import curryN from "../internal/curry";

const {Left, Right} = Either

const maybe_type = 'brisk-control/Maybe'

function Maybe(){}

Maybe.prototype.inspect = function() { 
  return this.toString(); 
}

Maybe['@@type'] = maybe_type

const nothing = new Nothing()

Maybe.Nothing = nothing

Maybe.Just = function(x){
  return new Just(x)
}

Maybe['fantasy-land/of'] = function(x){
  return new Just(x)
}

Maybe.of = function(x){
  return new Just(x)
}

const returnNothing = function(){
  return nothing
}

Maybe['fantasy-land/empty'] = returnNothing 

Maybe.empty = returnNothing 

Maybe['fantasy-land/zero'] = returnNothing

Maybe.zero = returnNothing

Maybe.isJust = function(maybe){
  return maybe.isJust
}

Maybe.fromMaybe = function(x, maybe) {
  if (arguments.length === 1) return maybe => maybe.isJust ? maybe.value : x;
  return maybe.isJust ? maybe.value : x;
}

Maybe.maybeToNullable = function(maybe){
  return maybe.isJust ? maybe.value : null
}

Maybe.toMaybe = function(x){
  return x == null ? nothing : new Just(x);
}

Maybe.maybe = function (x, f, maybe) {
  if (arguments.length === 1) return curryN(2, (f, maybe) => Maybe.fromMaybe(x, maybe.map(f)));
  if (arguments.length === 2) return maybe => Maybe.fromMaybe(x, maybe.map(f));
  return Maybe.fromMaybe(x, maybe.map(f));
}

Maybe.maybeToEither = function(x, maybe){
  if (arguments.length === 1) return maybe => maybe.isNothing ? Left(x) : Right(maybe.value);
  return maybe.isNothing ? Left(x) : Right(maybe.value);
}
//encase justs
//v8 optimization
toFastProperties(Maybe);
toFastProperties(Maybe.prototype);

export default Maybe