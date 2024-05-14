import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';

export default (config) =>
  config.output.map((outputCfg) => ({
    ...config,
    onwarn(warning, warn) {
      if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
        return;
      }
      warn(warning);
    },
    output: {
      ...outputCfg,
      sourcemap: false,
    },
    plugins: [
      resolve(),
      typescript({
        tsconfig: 'libs/tailwind-preset/tsconfig.lib.json',
        useTsconfigDeclarationDir: true,
      }),
      commonjs(),
    ],
  }));
