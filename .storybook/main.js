module.exports = {
  stories: [],
  addons: [
    '@storybook/addon-actions',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-addon-react-router-v6',
    '@storybook/theming',
    '@storybook/addon-a11y',
    'storybook-tailwind-dark-mode',
  ],
  features: {
    interactionsDebugger: true,
  },
  // uncomment the property below if you want to apply some webpack config globally
  // webpackFinal: async (config, { configType }) => {
  //
  //   return config;
  // },
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: true,
  },
};
