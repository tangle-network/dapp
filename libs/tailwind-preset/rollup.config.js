const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');

module.exports = (config) =>
  config.output.map((outputCfg) => ({
    ...config,
    output: {
      ...outputCfg,
      sourcemap: false,
    },
    plugins: [
      resolve(),
      typescript({
        tsconfig: 'libs/tailwind-preset/tsconfig.lib.json',
      }),
      commonjs(),
    ],
  }));
