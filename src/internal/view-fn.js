  'use strict';

  function checkn(n) {
    if(typeof n !== 'number') {
      throw new TypeError(
        'inspectf expects its first argument to be a number'
      );
    }
  }

  function checkf(f) {
    if(typeof f !== 'function') {
      throw new TypeError(
        'inspectf expects its second argument to be a function'
      );
    }
  }

  const RSPACE = /^ */;
  const RCODE = /\s*[^\s]/;
  const RTABS = /\t/g;
  const REOL = /\n\r?/;

  function isCode(line) {
    return RCODE.test(line);
  }

  function getPadding(line) {
    return line.match(RSPACE)[0].length;
  }

  function guessIndentation(lines) {
    const filtered = lines.filter(isCode);
    const paddings = filtered.map(getPadding);
    const depth = paddings.reduce(Math.min, Infinity);
    const tabsize = paddings
    .map(function(x) { return x - depth; })
    .find(function(x) { return x > 1; }) || 2;
    return {depth: depth, tabsize: tabsize};
  }

  function pad(n) {
    return (new Array(n + 1)).join(' ');
  }

  function show(f, indentation) {
    return f.toString().replace(RTABS, indentation);
  }

  function toLines(s) {
    return s.split(REOL);
  }

  function fixIndentation(lines, indentation) {
    const info = guessIndentation(lines.slice(1));
    const RPAD = new RegExp(pad(info.tabsize), 'g');
    return lines.map(function(line) {
      return line.slice(Math.min(info.depth, getPadding(line)))
      .replace(RPAD, '\t').replace(RTABS, indentation);
    }).join('\n');
  }

  export function inspectf(n, f) {
    checkn(n);
    if(arguments.length < 2) {
      return function inspectf$partial(f) { return inspectf(n, f); };
    }
    checkf(f);
    if(f.toString !== Function.prototype.toString) {return f.toString();}
    let i = pad(n), shown = show(f, i), lines = toLines(shown, i);
    if(lines.length < 2) {return shown;}
    return fixIndentation(lines, i);
  };