
  'use strict';

  const $alt = 'fantasy-land/alt';
  const $ap = 'fantasy-land/ap';
  const $map = 'fantasy-land/map';
  const $of = 'fantasy-land/of';
  const $zero = 'fantasy-land/zero';

  //concurrify :: Applicative m
  //           => (TypeRep m, m a, (m a, m a) -> m a, (m a, m (a -> b)) -> m b)
  //           -> Concurrently m
  export function makeParallel(Repr, zero, alt, ap){

    function Concurrently(sequential){
      this.sequential = sequential;
    }

    function construct(x){
      return new Concurrently(x);
    }

    const proto = Concurrently.prototype = construct.prototype = {constructor: construct};


    const mzero = new Concurrently(zero);
    construct[$zero] = function Concurrently$zero(){
      return mzero;
    };

    construct[$of] = function Concurrently$of(value){
      return new Concurrently(Z.of(Repr, value));
    };

    proto[$map] = function Concurrently$map(mapper){
      return new Concurrently(Z.map(mapper, this.sequential));
    };

    proto[$ap] = function Concurrently$ap(m){
      return new Concurrently(ap(this.sequential, m.sequential));
    };

    proto[$alt] = function Concurrently$alt(m){
      return new Concurrently(alt(this.sequential, m.sequential));
    };

    return construct;

  };
