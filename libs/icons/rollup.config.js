import modify from 'rollup-plugin-modify';
import copy from 'rollup-plugin-copy';
import bundleRollup from '@nx/react/plugins/bundle-rollup.js';

export default function getRollupOptions(options) {
  const opts = bundleRollup(options);

  opts.plugins = [
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
    modify({
      find: '!!@svgr/webpack!../',
      replace: '!!@svgr/webpack!./',
    }),
    ...(Array.isArray(opts.plugins) ? opts.plugins : []),
  ];

  return opts;
}
