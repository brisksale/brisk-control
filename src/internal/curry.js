'use strict';
//these are just util curry functions for the use of the library.
//they are built for performance and dont have the same functinality as ramda
function c2(...args){
  let fresh = []
  let i = 0;
  const j = this.params.length
  const total = j + args.length
  while(i < total){
    if(i < j) fresh.push(this.params[i]);
    else fresh.push(args[i - j]);
    i = i + 1
  }
  switch(fresh.length){
    case 1: return x => this.f(fresh[0], x)
    case 2: return this.f(fresh[0], fresh[1]);
    default: return c2.bind({f:this.f, params:fresh}) 
  }
}

function c3(...args){
  let fresh = []
  let i = 0;
  const j = this.params.length
  const total = j + args.length
  while(i < total){
    if(i < j) fresh.push(this.params[i]);
    else fresh.push(args[i - j]);
    i = i + 1
  }
  switch(fresh.length){
    case 2: return x => this.f(fresh[0], fresh[1], x)
    case 3: return this.f(fresh[0], fresh[1], fresh[2]);
    default: return c3.bind({f:this.f, params:fresh}) 
  }
}

function cN(...args){
  let fresh = []
  let i = 0;
  const j = this.params.length
  const total = j + args.length
  while(i < total){
    if(i < j) fresh.push(this.params[i]);
    else fresh.push(args[i - j]);
    i = i + 1
  }
  switch(fresh.length){
    case this.size - 1: return x => this.f(...fresh, x);
    case this.size: return this.f(...fresh);
    default: return cN.bind({f:this.f, params:fresh, size:this.size}) 
  }
}

export default function curryN(n,f){
  const meta = {
    f:f,
    params: [],
    size:n
  }
  switch(n){
    case 2: return c2.bind(meta);
    case 3: return c3.bind(meta);
    default: return cN.bind(meta);
  } 
}