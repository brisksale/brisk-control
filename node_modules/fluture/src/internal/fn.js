import Z from 'sanctuary-type-classes';
import inspectf from 'inspect-f';

export const noop = function noop(){};
export const moop = function moop(){ return this };
export const show = Z.toString;
export const padf = (sf, s) => s.replace(/^/gm, sf).replace(sf, '');
export const showf = f => padf('  ', inspectf(2, f));

export const mapArray = (xs, f) => {
  const l = xs.length, ys = new Array(l);
  for(let i = 0; i < l; i++) ys[i] = f(xs[i], i, xs);
  return ys;
};

export const partial1 = (f, a) => function bound1(b, c, d){
  switch(arguments.length){
    case 1: return f(a, b);
    case 2: return f(a, b, c);
    default: return f(a, b, c, d);
  }
};

export const partial2 = (f, a, b) => function bound2(c, d){
  return arguments.length === 1 ? f(a, b, c) : f(a, b, c, d);
};

export const partial3 = (f, a, b, c) => function bound3(d){
  return f(a, b, c, d);
};
