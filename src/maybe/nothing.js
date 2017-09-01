'use strict';
import Maybe from "./maybe.js"
import {toFastProperties} from '../internal/toFastProp';
import {toString} from '../internal/invokers';
import {has, isFunction, concat, equals} from '../internal/helper';

const concatNothing = function(other){
  return other
}

const equalNothing = function(other){
  return other.isNothing
}

const lteNothing = function(other){
  return true
}

const mapNothing = function(f){
  return this
}

const apNothing = function(other){
  return this
}

const chainNothing = function(f){
  return this
}

const altNothing = function(other){
  return other
}

const reduceNothing = function(f, x){
  return x
}

const traverseNothing = function(typeRep, f){
  return typeRep === Array 
              ? [this] 
              : typeRep === Function
                ? x => this
                : typeRep['fantasy-land/of'](this)
}

const extendNothing = function(f){
  return this
}

export function Nothing(){
  this.isNothing = true
  this.isJust = false
  this['fantasy-land/concat'] = concatNothing
  this.concat = concatNothing
}

Nothing.prototype = Object.create(Maybe.prototype);

Nothing.prototype.equals = equalNothing

Nothing.prototype['fantasy-land/equals'] = equalNothing

Nothing.prototype.lte = lteNothing

Nothing.prototype['fantasy-land/lte'] = lteNothing

Nothing.prototype.map = mapNothing

Nothing.prototype['fantasy-land/map'] = mapNothing

Nothing.prototype.ap = apNothing

Nothing.prototype['fantasy-land/ap'] = apNothing

Nothing.prototype.chain = chainNothing

Nothing.prototype['fantasy-land/chain'] = chainNothing

Nothing.prototype.alt = altNothing

Nothing.prototype['fantasy-land/alt'] = altNothing

Nothing.prototype.reduce = reduceNothing

Nothing.prototype['fantasy-land/reduce'] = reduceNothing

Nothing.prototype.traverse = traverseNothing

Nothing.prototype['fantasy-land/traverse'] = traverseNothing

Nothing.prototype.extend = extendNothing

Nothing.prototype['fantasy-land/extend'] = extendNothing

Nothing.prototype.getOrElse = function(x){
  return x
}

Nothing.prototype.toString = function(){
  return `Nothing`
}

//v8 optimization
toFastProperties(Nothing);
toFastProperties(Nothing.prototype);
