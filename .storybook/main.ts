import { StorybookConfig } from '@storybook/nextjs';

import { dirname, join } from 'node:path';

export default {
  stories: [],
  addons: [
    getAbsolutePath('@storybook/addon-actions'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
    getAbsolutePath('storybook-addon-remix-react-router'),
    getAbsolutePath('@storybook/theming'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('@storybook/addon-webpack5-compiler-babel'),
    getAbsolutePath('@chromatic-com/storybook'),
  ],
  // uncomment the property below if you want to apply some webpack config globally
  // webpackFinal: async (config, { configType }) => {
  //
  //   return config;
  // },
  framework: '@storybook/nextjs',
  docs: {
    autodocs: true,
  },
} as const satisfies StorybookConfig;

function getAbsolutePath(value: string) {
  return dirname(require.resolve(join(value, 'package.json')));
}
