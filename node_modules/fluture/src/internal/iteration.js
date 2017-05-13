import {isObject, isBoolean} from './is';

export const Next = x => ({done: false, value: x});
export const Done = x => ({done: true, value: x});
export const isIteration = x => isObject(x) && isBoolean(x.done);
