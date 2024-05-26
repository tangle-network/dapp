import copy from 'rollup-plugin-copy';
import modify from 'rollup-plugin-modify';
import bundleRollup from '@nx/react/plugins/bundle-rollup.js';
import preserveDirectives from 'rollup-plugin-preserve-directives';

const plugins = [
  copy({
    targets: [
      {
        src: 'libs/webb-ui-components/src/fonts/*',
        dest: 'dist/libs/webb-ui-components/fonts/',
      },
    ],
  }),
  modify({
    find: '../icons/tokens/',
    replace: './icons/tokens/',
  }),
  // preserveDirectives(),
];

const SAFELY_IGNORE_WARNING_CODES = new Set([
  'MODULE_LEVEL_DIRECTIVE',
  'THIS_IS_UNDEFINED',
]);

export default function getRollupOptions(options) {
  const opts = bundleRollup(options);

  opts.plugins = [
    ...plugins,
    ...(Array.isArray(opts.plugins) ? opts.plugins : []),
  ];

  const originalOnwarn = opts.onwarn;

  opts.onwarn = (warning, warn) => {
    console.log(`[WARN] ${warning.code}: ${warning.message}`);
    if (
      SAFELY_IGNORE_WARNING_CODES.has(warning.code) ||
      warning.message.includes('node_modules') // Ignore warnings from node_modules
    ) {
      return;
    }

    if (typeof originalOnwarn === 'function') {
      originalOnwarn(warning, warn);
    } else {
      warn(warning);
    }
  };

  options.output = Array.isArray(options.output)
    ? options.output.map((output) => ({
        ...output,
        preserveModules: true,
      }))
    : {
        ...options.output,
        preserveModules: true,
      };

  return opts;
}
