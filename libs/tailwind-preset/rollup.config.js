const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');

module.exports = (config) => {
  return {
    ...config,
    output: {
      ...(config.output ?? {}),
      sourcemap: false,
    },
    plugins: [
      resolve(),
      typescript({
        tsconfig: 'libs/tailwind-preset/tsconfig.lib.json',
      }),
      commonjs(),
    ],
  };
};
