import { DeprecatedThemeOptions } from '@mui/material/styles';

import { FontFamilies } from '../../fonts/font-families.enum';

export const themeOverrides: DeprecatedThemeOptions['overrides'] = {
  MuiButton: {
    root: {},
  },

  MuiTypography: {
    root: {
      fontFamily: [FontFamilies.Bitum, 'sans-serif'].join(','),
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
    caption: {
      fontSize: '.8rem',
    },
    body1: {
      fontSize: '1rem',
    },
  },
};
