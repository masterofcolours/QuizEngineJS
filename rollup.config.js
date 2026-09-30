import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/quiz-engine.esm.js',
      format: 'es',
      sourcemap: true,
    },
    {
      file: 'dist/quiz-engine.cjs.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
    },
    {
      file: 'dist/quiz-engine.min.js',
      format: 'umd',
      name: 'QuizEngine',
      plugins: [terser()],
      sourcemap: true,
    }
  ]
};