import {show} from './fn';
import {ordinal, namespace, name, version} from './const';
import type from 'sanctuary-type-identifiers';

export const error = message => {
  throw new Error(message);
};

export const typeError = message => {
  throw new TypeError(message);
};

export const invalidArgument = (it, at, expected, actual) => typeError(
  `${it} expects its ${ordinal[at]} argument to ${expected}\n  Actual: ${show(actual)}`
);

export const invalidContext = (it, actual) => typeError(
  `${it} was invoked outside the context of a Future. You might want to use`
  + ` a dispatcher instead\n  Called on: ${show(actual)}`
);

const invalidNamespace = (m, x) => (
  `The Future was not created by ${namespace}. `
+ `Make sure you transform other Futures to ${namespace} Futures. `
+ `Got ${x ? `a Future from ${x}` : 'an unscoped Future'}.`
+ '\n  See: https://github.com/fluture-js/Fluture#casting-futures'
);

const invalidVersion = (m, x) => (
  `The Future was created by ${x < version ? 'an older' : 'a newer'} version of ${namespace}. `
+ 'This means that one of the sources which creates Futures is outdated. '
+ 'Update this source, or transform its created Futures to be compatible.'
+ '\n  See: https://github.com/fluture-js/Fluture#casting-futures'
);

export const invalidFuture = (it, at, m, s = '') => {
  const id = type.parse(type(m));
  const info = id.name === name ? '\n' + (
    id.namespace !== namespace ? invalidNamespace(m, id.namespace)
  : id.version !== version ? invalidVersion(m, id.version)
  : 'Nothing seems wrong. Contact the Fluture maintainers.') : '';
  typeError(
    `${it} expects ${ordinal[at] ? `its ${ordinal[at]} argument to be a valid Future` : at}.`
  + `${info}\n  Actual: ${show(m)} :: ${id.name}${s}`
  );
};
