
import { inspectf } from './view-fn';

const startPosPad = (sf, s) =>
  s.replace(/^/gm, sf).replace(sf, '');

export const showFunction = f =>
  startPosPad('  ', inspectf(2, f));

export const emptyFn = function emptyFn() { };





