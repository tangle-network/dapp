const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const svgr = require('@svgr/rollup');
const copy = require('rollup-plugin-copy');
const image = require('@rollup/plugin-image');

module.exports = (config) => {
  return {
    ...config,
    output: {
      ...(config.output ?? {}),
      sourcemap: false,
    },
    plugins: [
      resolve(),
      copy({
        targets: [
          {
            src: 'libs/icons/src/tokens/*',
            dest: 'dist/libs/icons/tokens',
          },
        ],
      }),

      svgr(),
      typescript({
        tsconfig: 'libs/icons/tsconfig.lib.json',
      }),
      image(),
      commonjs(),
    ],
  };
};
