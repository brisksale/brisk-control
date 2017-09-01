'use strict';
import Either from "./either.js"
import {toFastProperties} from '../internal/toFastProp';
import {toString} from '../internal/invokers';
import {has, isFunction, concat, equals} from '../internal/helper';

const concatRight = function(other){
  return other.isLeft ? this : new Right(concat(this.value, other.value))
}

const mapRight = function(f){
  return new Right(f(this.value))
}

const bimapRight = function(f, g){
  return new Right(g(this.value));
}

const chainRight = function(f){
  return f(this.value)
}

const altRight = function(other){
  return this
}

const reduceRight = function (f, x) {
  return f(x, this.value)
};

const traverseRight = function(typeRep, f){
  return new Right(f(this.value))
}
const extendRight = function(f){
  return new Right(f(this));
}

const eitherRight =  function(l, r){
  return r(this.value)
}

export function Right(x){
  this.value = x
  this.isLeft = false
  this.isRight = true
  if(isSemiGroup(x)){
    this['fantasy-land/concat'] = concatRight
    this.concat = concatRight
  }
}

Right.prototype = Object.create(Maybe.prototype);

Right.prototype.map = mapRight

Right.prototype['fantasy-land/map'] = mapRight

Right.prototype['fantasy-land/bimap'] = bimapRight

Right.prototype.bimap = bimapRight

Right.prototype.chain = chainRight

Right.prototype['fantasy-land/chain'] = chainRight

Right.prototype.alt = altRight

Right.prototype['fantasy-land/alt'] = altRight

Right.prototype.reduce = reduceRight

Right.prototype['fantasy-land/reduce'] = reduceRight

Right.prototype.traverse = traverseRight

Right.prototype['fantasy-land/traverse'] = traverseRight

Right.prototype.extend = extendRight

Right.prototype['fantasy-land/extend'] = extendRight

Right.prototype.either = eitherRight

Right.prototype.toString = function(){
  return `Right(${toString(this.value)})`
}

//v8 optimization
toFastProperties(Right);
toFastProperties(Right.prototype);
