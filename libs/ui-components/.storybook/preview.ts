import { withThemeByClassName } from '@storybook/addon-themes';
import { Preview } from '@storybook/react/*';
import '../src/tailwind.css';
import './override.css';

export const parameters: Preview['parameters'] = {
  controls: {
    expanded: true,
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};

export const decorators = [
  withThemeByClassName({
    themes: {
      light: '',
      dark: 'dark',
    },
    defaultTheme: 'light',
  }),
];

export default {
  decorators,
  parameters,
  tags: ['autodocs'],
};
