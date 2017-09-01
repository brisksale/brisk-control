'use strict';
import Maybe from "./maybe.js"
import {toFastProperties} from '../internal/toFastProp';
import {toString} from '../internal/invokers';
import {has, isFunction, concat, equals} from '../internal/helper';

const isSemiGroup = x => isFunction(x.concat) ||  isFunction(x['fantasy-land/concat']) 

const concatJust = function(other){
  return other.isNothing ? this : new Just(concat(this.value, other.value))
}

const equalJust = function(other){
  return other.isJust && equals(this.value, other.value)
}
const lteJust = function(other){
  return other.isJust && (this.value <= other.value)
}

const mapJust = function(f){
  return new Just(f(this.value))
}

const apJust = function(other){
  return other.isJust ? this.map(other.value) : other
}

const chainJust = function(f){
  return f(this.value)
}

const altJust = function(other){
  return this
}

const reduceJust = function(f, x){
  return f(x, this.value)
}

const traverseJust = function(typeRep, f){
  return new Just(f(this.value))
}

const extendJust = function(f){
  return new Just(f(this))
}

export function Just(x){
  this.value = x
  this.isNothing = false
  this.isJust = true
  if(isSemiGroup(x)){
    this['fantasy-land/concat'] = concatJust
    this.concat = concatJust
  }
}

Just.prototype = Object.create(Maybe.prototype);

Just.prototype.equals = equalJust

Just.prototype['fantasy-land/equals'] = equalJust

Just.prototype.lte = lteJust

Just.prototype['fantasy-land/lte'] = lteJust

Just.prototype.map = mapJust

Just.prototype['fantasy-land/map'] = mapJust

Just.prototype.ap = apJust

Just.prototype['fantasy-land/ap'] = apJust

Just.prototype.chain = chainJust

Just.prototype['fantasy-land/chain'] = chainJust

Just.prototype.alt = altJust

Just.prototype['fantasy-land/alt'] = altJust

Just.prototype.reduce = reduceJust

Just.prototype['fantasy-land/reduce'] = reduceJust

Just.prototype.traverse = traverseJust

Just.prototype['fantasy-land/traverse'] = traverseJust

Just.prototype.extend = extendJust

Just.prototype['fantasy-land/extend'] = extendJust

Just.prototype.getOrElse = function(x){
  return this.value
}

Just.prototype.toString = function(){
  return `Just(${toString(this.value)})`
}

//v8 optimization
toFastProperties(Just);
toFastProperties(Just.prototype);
