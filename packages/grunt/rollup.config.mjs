import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: {
    dir: 'tasks',
    format: 'commonjs'
  },
  plugins: [
    typescript(),
  ]
};
