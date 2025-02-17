import type { StorybookConfig } from '@storybook/react-vite';

export default {
  core: {
    disableTelemetry: true,
  },
  stories: [
    '../src/stories/**/*.mdx',
    '../src/stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/theming',
    '@storybook/addon-a11y',
    '@chromatic-com/storybook',
    '@storybook/addon-themes',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: 'vite.config.ts',
      },
    },
  },
} satisfies StorybookConfig;
