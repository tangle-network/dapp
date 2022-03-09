import { createTheme, ThemeOptions } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createTheme';

import { themeOverrides } from './overides/light-theme-overrides';
import { darkMainTheme } from './dark-theme';
import { lightMainTheme } from './light-theme';

const makeTheme = (opt: Partial<ThemeOptions>, type: 'dark' | 'light'): Theme => {
  const themeOpts = type === 'dark' ? darkMainTheme : lightMainTheme;
  let row: ThemeOptions = { ...themeOpts, overrides: { ...themeOverrides } };
  if (opt && opt.direction === 'ltr') {
    row = {
      ...row,
      typography: {
        ...themeOpts.typography,
        fontFamily: ['Roboto Slab', 'serif'].join(','),
      },
    };
  }
  return createTheme({
    ...row,
    ...opt,
    props: {
      MuiButtonBase: {
        disableRipple: true,
      },
    },
  });
};
export default makeTheme;
