'use strict';
import Action from "./action.js"
import {emptyFn, showFunction} from "../internal/util";
import {toFastProperties} from '../internal/toFastProp';
import {toString} from '../internal/invokers';

export function Identity(value) {
  this._value = value;
}

Identity.prototype = Object.create(Action.prototype);

Identity.prototype.extractRight = function() {
  return [this._value];
};

Identity.prototype._exec = function(rej, res) {
  res(this._value);
  return emptyFn;
};

Identity.prototype.toString = function(){
  return `Action.of(${toString(this._value)})`;
};

//v8 optimization
toFastProperties(Identity);
toFastProperties(Identity.prototype);

//__________________________________________________________//

export function ApplicativeAction(mval, mfunc) {
  this._mval = mval;
  this._mfunc = mfunc;
}

ApplicativeAction.prototype = Object.create(Action.prototype);

ApplicativeAction.prototype._exec = function(rej, res) {
  const inst = this;
  let cancel;
  const r = inst._mval._exec(rej, function(x) {
    cancel = inst._mfunc._exec(rej, function(f) {
      cancel = emptyFn;
      res(f(x));
    });
  });
  return cancel || (cancel = r, () => cancel && cancel());
};

ApplicativeAction.prototype.toString = function(){
  return `${this._mval.toString()}.ap(${this._mfunc.toString()})`;
};

//v8 optimization
toFastProperties(ApplicativeAction);
toFastProperties(ApplicativeAction.prototype);

//___________________________________________________________//

export function MapAction(parent, mapper) {
  this._parent = parent;
  this._mapper = mapper;
}

MapAction.prototype = Object.create(Action.prototype);

MapAction.prototype._exec = function(rej, res) {
  const inst = this;
  return inst._parent._exec(rej, function(x) {
    res(inst._mapper(x));
  });
};

MapAction.prototype.toString = function(){
  return `${this._parent.toString()}.map(${showFunction(this._mapper)})`;
};

//v8 optimization
toFastProperties(MapAction);
toFastProperties(MapAction.prototype);

//___________________________________________________________//

export function BimapAction(parent, lmapper, rmapper) {
  this._parent = parent;
  this._lmapper = lmapper;
  this._rmapper = rmapper;
}

BimapAction.prototype = Object.create(Action.prototype);

BimapAction.prototype._exec = function(rej, res) {
  const inst = this;
  return inst._parent._exec(function(x) {
    rej(inst._lmapper(x));
  }, function(x) {
    res(inst._rmapper(x));
  });
};

BimapAction.prototype.toString = function(){
  return `${this._parent.toString()}.bimap(${showFunction(this._lmapper)}, ${showFunction(this._rmapper)})`;
};

//v8 optimization
toFastProperties(BimapAction);
toFastProperties(BimapAction.prototype);

//___________________________________________________________//

export function ChainAction(parent, chainer) {
  this._parent = parent;
  this._chainer = chainer;
}

ChainAction.prototype = Object.create(Action.prototype);

ChainAction.prototype._exec = function(rej, res) {
  const inst = this;
  let cancel;
  const r = inst._parent._exec(rej, function(x) {
    const m = inst._chainer(x);
    cancel = m._exec(rej, res);
  });
  return cancel || (cancel = r, () => cancel && cancel());
};

ChainAction.prototype.toString = function() {
  return `${this._parent.toString()}.chain(${showFunction(this._chainer)})`;
};

//v8 optimization
toFastProperties(ChainAction);
toFastProperties(ChainAction.prototype);