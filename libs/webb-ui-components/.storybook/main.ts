import type { StorybookConfig } from '@storybook/nextjs';
import path, { dirname, join } from 'node:path';

// These options were migrated by @nx/storybook:convert-to-inferred from the project.json file.
const configValues = { default: {}, ci: {} };

// Determine the correct configValue to use based on the configuration
const nxConfiguration = process.env.NX_TASK_TARGET_CONFIGURATION ?? 'default';

const options = {
  ...configValues.default,
  // @ts-expect-error: Ignore TypeScript error for indexing configValues with a dynamic key
  ...(configValues[nxConfiguration] ?? {}),
};

export default {
  core: {
    disableTelemetry: true,
  },
  stories: [
    '../src/stories/**/*.mdx',
    '../src/stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-actions'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('@storybook/theming'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-webpack5-compiler-swc'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-themes'),
    '@nx/react/plugins/storybook',
  ],
  webpackFinal: async (config) => {
    config.module?.rules?.push({
      test: /\.css$/,
      use: [
        {
          loader: 'postcss-loader',
          options: {
            postcssOptions: {
              plugins: [require('tailwindcss'), require('autoprefixer')],
            },
          },
        },
      ],
      include: path.resolve(__dirname, '../'),
    });

    config.module?.rules?.forEach((rule) => {
      if (typeof rule !== 'object' || rule === null) {
        return;
      }

      if (!(rule.test instanceof RegExp)) {
        return;
      }

      if (!rule.test.test('.svg')) {
        return;
      }

      rule.exclude = /\.svg$/;
    });

    config.module?.rules?.push(
      {
        test: /\.svg$/i,
        type: 'asset',
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.svg$/i,
        resourceQuery: { not: [/url/] }, // exclude react component if *.svg?url
        use: ['@svgr/webpack'],
      },
    );

    return config;
  },
  framework: '@storybook/nextjs',
  swc: () => ({
    jsc: {
      transform: {
        react: {
          runtime: 'automatic',
        },
      },
    },
  }),
} satisfies StorybookConfig;

function getAbsolutePath(value: string) {
  const absolutePath = dirname(require.resolve(join(value, 'package.json')));
  return absolutePath;
}
