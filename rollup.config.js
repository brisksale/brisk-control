import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs';
// import nodeResolve from 'rollup-plugin-node-resolve';
// const flow = require('rollup-plugin-flow')
// export default {
//   entry:'index.js',
//   format: 'cjs',
//   plugins: [ flow({ pretty: true }), 
//   resolve({
//     // pass custom options to the resolve plugin
//     customResolveOptions: {
//       moduleDirectory: 'node_modules'
//     }
//   }),
//   commonjs(),
//   ],
//   moduleName:'brisksale-algebraic-types',
//   dest: 'bundle.js' // equivalent to --output
// };
import buble from 'rollup-plugin-buble';

const pkg = require('./package.json');

const dependencies = {
  'ramda': 'ramda'
};

export default {
  entry: 'src/index.js',
  plugins: [buble()],
  external: Object.keys(dependencies),
  globals: dependencies,
  format: 'umd',
  moduleName: 'brisksale-algebraic-types',
  dest: 'dist/bundle.js'
};

// export default {
//   entry: 'src/index.js',
//   plugins: [resolve({
//     customResolveOptions: {
//       moduleDirectory: 'node_modules'
//     }
//   }), commonjs()],
//   external: Object.keys(dependencies),
//   globals: dependencies,
//   format: 'cjs',
//   moduleName: 'brisksale-algebraic-types',
//   dest: 'index.js'
// };