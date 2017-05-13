import {
  Future,
  isFuture,
  reject,
  of,
  never,
  isNever
} from './core';

import * as dispatchers from './dispatchers';

import {after} from './after';
import {cache} from './cache';
import {chainRec} from './chain-rec';
import {encase, encase2, encase3, attempt} from './encase';
import {encaseP, encaseP2, encaseP3, tryP} from './encase-p';
import {go} from './go';
import {hook} from './hook';
import {node} from './node';
import {Par, seq} from './par';
import {parallel} from './parallel';
import {rejectAfter} from './reject-after';

import {error} from './internal/throw';

if(typeof Object.create !== 'function') error('Please polyfill Object.create to use Fluture');
if(typeof Object.assign !== 'function') error('Please polyfill Object.assign to use Fluture');
if(typeof Array.isArray !== 'function') error('Please polyfill Array.isArray to use Fluture');

export default Object.assign(Future, dispatchers, {
  Future,
  isFuture,
  reject,
  of,
  never,
  isNever,
  after,
  cache,
  encaseP,
  encaseP2,
  encaseP3,
  tryP,
  hook,
  node,
  Par,
  seq,
  parallel,
  rejectAfter,
  chainRec,
  encase,
  encase2,
  encase3,
  attempt,
  go,
  try: attempt,
  do: go
});
