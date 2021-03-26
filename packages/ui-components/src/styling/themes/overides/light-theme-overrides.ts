/* eslint-disable sort-keys */
import { ThemeOptions } from '@material-ui/core';

export const lightMainThemeOverrides: ThemeOptions['overrides'] = {
  MuiButton: {
    root: {},
  },

  MuiTypography: {
    root: {
      fontFamily: ['Roboto Slab', 'sans-serif'].join(','),
    },
    h1: {
      fontSize: '3rem',
    },
    h2: {
      fontSize: '2rem',
    },
    h3: {
      fontSize: '1.64rem',
    },
    h4: {
      fontSize: '1.5rem',
    },
    h5: {
      fontSize: '1.285rem',
    },
    h6: {
      fontSize: '.9rem',
    },
  },
};
