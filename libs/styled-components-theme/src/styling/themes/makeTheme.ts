import { adaptV4Theme, createTheme, DeprecatedThemeOptions, Theme } from '@mui/material/styles';

import { themeOverrides } from './overides/light-theme-overrides';
import { darkMainTheme } from './dark-theme';
import { lightMainTheme } from './light-theme';

export const makeTheme = (opt: Partial<DeprecatedThemeOptions>, type: 'dark' | 'light'): Theme => {
  const themeOpts = type === 'dark' ? darkMainTheme : lightMainTheme;
  let row: DeprecatedThemeOptions = { ...themeOpts, overrides: { ...themeOverrides } };
  if (opt && opt.direction === 'ltr') {
    row = {
      ...row,
      typography: {
        ...themeOpts.typography,
        fontFamily: ['Roboto Slab', 'serif'].join(','),
      },
    };
  }
  return createTheme(
    adaptV4Theme({
      ...row,
      ...opt,
      props: {
        MuiButtonBase: {
          disableRipple: true,
        },
      },
    })
  );
};
