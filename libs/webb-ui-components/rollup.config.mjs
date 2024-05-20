import commonjs from '@rollup/plugin-commonjs';
import image from '@rollup/plugin-image';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import svgr from '@svgr/rollup';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import copy from 'rollup-plugin-copy';
import modify from 'rollup-plugin-modify';
import postcss from 'rollup-plugin-postcss';
import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const SAFELY_IGNORE_WARNING_CODES = new Set([
  'MODULE_LEVEL_DIRECTIVE',
  'THIS_IS_UNDEFINED',
]);

const plugins = [
  peerDepsExternal(),
  json(),
  postcss({
    config: {
      path: join(dirname(fileURLToPath(import.meta.url)), 'postcss.config.js'),
    },
    extensions: ['.css'],
    minimize: false,
    extract: true,
    inject: false,
    external: ['react', 'react-dom'],
  }),
  resolve({
    preferBuiltins: true,
  }),
  copy({
    targets: [
      {
        src: 'libs/webb-ui-components/src/icons/tokens/*',
        dest: 'dist/libs/webb-ui-components/icons/tokens',
      },
      {
        src: 'libs/webb-ui-components/src/fonts/*',
        dest: 'dist/libs/webb-ui-components/fonts/',
      },
    ],
  }),
  typescript({
    tsconfig: 'libs/webb-ui-components/tsconfig.lib.json',
    useTsconfigDeclarationDir: true,
  }),
  svgr(),
  image(),
  commonjs(),
  modify({
    find: '../icons/tokens/',
    replace: './icons/tokens/',
  }),
];

export default (config) =>
  config.output.map((output) => ({
    ...config,
    onwarn(warning, warn) {
      if (
        SAFELY_IGNORE_WARNING_CODES.has(warning.code) ||
        warning.message.includes('node_modules') // Ignore warnings from node_modules
      ) {
        return;
      }

      warn(warning);
    },
    output: {
      ...output,
      sourcemap: true,
    },
    plugins,
  }));
