"use strict"
export {toString} from "ramda";
const $bimap = 'fantasy-land/bimap';
const $chain = 'fantasy-land/chain';
const $map = 'fantasy-land/map';
const $ap = 'fantasy-land/ap';

export const bimap = (lmapper, rmapper, m) => 
  m[$bimap](lmapper, rmapper);

export const chain = (chainer, m) => 
  m[$chain](chainer);

export const map = (mapper, m) =>
  m[$map](mapper);

export const ap = (values, func) => 
  func[$ap](values);
