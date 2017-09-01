'use strict';
import Either from "./either.js"
import {toFastProperties} from '../internal/toFastProp';
import {toString} from '../internal/invokers';
import {has, isFunction, concat, equals} from '../internal/helper';

const concatLeft = function(other){
  return other.isLeft ? new Left(concat(this.value, other.value)) : other
}

const mapLeft = function(f){
  return this
}

const bimapLeft = function(f, g){
  return new Left(f(this.value));
}

const chainLeft = function(f){
  return this
}

const altLeft = function(other){
  return other
}

const reduceLeft = function (f, x) {
  return x
};

const traverseLeft =  function(typeRep, f){
  return typeRep === Array 
              ? [this] 
              : typeRep === Function
                ? x => this
                : typeRep['fantasy-land/of'](this)
}

const extendLeft = function(f){
  return this
}

const eitherLeft =  function(l, r){
  return l(this.value)
}

export function Left(x){
  this.value = x
  this.isRight = false
  this.isLeft = true
  if(isSemiGroup(x)){
    this['fantasy-land/concat'] = concatLeft
    this.concat = concatLeft
  }
}

Left.prototype = Object.create(Maybe.prototype);

Left.prototype.map = mapLeft

Left.prototype['fantasy-land/map'] = mapLeft

Left.prototype['fantasy-land/bimap'] = bimapLeft

Left.prototype.bimap = bimapLeft

Left.prototype.chain = chainLeft

Left.prototype['fantasy-land/chain'] = chainLeft

Left.prototype.alt = altLeft

Left.prototype['fantasy-land/alt'] = altLeft

Left.prototype.reduce = reduceLeft

Left.prototype['fantasy-land/reduce'] = reduceLeft

Left.prototype.traverse = traverseLeft

Left.prototype['fantasy-land/traverse'] = traverseLeft

Left.prototype.extend = extendLeft

Left.prototype['fantasy-land/extend'] = extendLeft

Left.prototype.either = eitherLeft

Left.prototype.toString = function(){
  return `Left(${toString(this.value)})`
}

//v8 optimization
toFastProperties(Left);
toFastProperties(Left.prototype);
