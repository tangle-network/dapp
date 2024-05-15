import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import svgr from '@svgr/rollup';
import copy from 'rollup-plugin-copy';
import image from '@rollup/plugin-image';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

export default (config) =>
  config.output.map((outputCfg) => {
    return {
      ...config,
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        warn(warning);
      },
      output: {
        ...outputCfg,
        sourcemap: true,
      },
      plugins: [
        peerDepsExternal(),
        resolve(),
        copy({
          targets: [
            {
              src: 'libs/icons/src/tokens/*',
              dest: 'dist/libs/icons/tokens',
            },
            {
              src: 'libs/icons/src/chains/*',
              dest: 'dist/libs/icons/chains',
            },
          ],
        }),
        svgr(),
        typescript({
          tsconfig: 'libs/icons/tsconfig.lib.json',
          useTsconfigDeclarationDir: true,
        }),
        image(),
        commonjs(),
      ],
    };
  });
