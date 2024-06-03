import type { StorybookConfig } from '@storybook/nextjs';
import path from 'node:path';
import remarkGfm from 'remark-gfm';

// eslint-disable-next-line @nx/enforce-module-boundaries
import rootMain from '../../../.storybook/main';

export default {
  stories: [
    ...rootMain.stories,
    '../src/stories/**/*.mdx',
    '../src/stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    ...rootMain.addons,
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      },
    },
    '@storybook/addon-themes',
    '@nx/react/plugins/storybook',
  ],
  webpackFinal: async (config, { configType }) => {
    // apply any global webpack configs that might have been specified in .storybook/main.js
    if (
      'webpackFinal' in rootMain &&
      typeof rootMain.webpackFinal === 'function'
    ) {
      config = await rootMain.webpackFinal(config, {
        configType,
      });
    }

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
} satisfies StorybookConfig;
