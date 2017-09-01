'use strict';
import {toFastProperties} from '../internal/toFastProp';
import {BaseIO} from './baseIO';
import {ChainIO} from './chainIO';
import {ChainRecIO} from './chainRecIO';
import {IdentityIO} from './identityIO';
import {ApplicativeIO} from './applicativeIO';
import {MapIO} from './mapIO';

const io_type = 'brisk-control/IO';
const of = x => new IdentityIO(x);

function IO(computation){
  return new BaseIO(computation)
}

IO.prototype.chain = function(f){
  return new ChainIO(this, f)
}

IO.prototype.map = function(f){
  return new MapIO(this, f)
}

IO.prototype.ap = function(m){
  return new ApplicativeIO(this, m)
}

IO.prototype.run = function() {
  return this._runIO()
};

IO.prototype.runIO = function() {
  return this._runIO()
};

function ChainRec(f, init) {
  if (arguments.length === 1) return init => new ChainRecIO(f, init);
  return new ChainRecIO(f, init)
}

IO.run = function(io){
  return io.run()
}

IO.runIO = function(io){
  return io.run()
}

IO.chainRec = ChainRec;

IO.of = of

IO['fantasy-land/of'] = of;
IO['fantasy-land/chainRec'] = ChainRec;
IO.prototype['fantasy-land/ap'] = IO.prototype.ap;
IO.prototype['fantasy-land/map'] = IO.prototype.map;
IO.prototype['fantasy-land/chain'] = IO.prototype.chain;

IO.IO = function(computation){
  return new BaseIO(computation)
}

IO['@@type'] = io_type;

//v8 optimization
toFastProperties(IO);
toFastProperties(IO.prototype);

export default IO

