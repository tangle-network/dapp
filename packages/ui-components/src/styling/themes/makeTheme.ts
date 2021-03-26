import { createMuiTheme, ThemeOptions } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';

import { lightMainThemeOverrides } from './overides/light-theme-overrides';
import { darkMainTheme } from './dark-theme';
import { lightMainTheme } from './light-theme';

const makeTheme = (opt: Partial<ThemeOptions>, type: 'dark' | 'light'): Theme => {
  const themeOpts = type === 'dark' ? darkMainTheme : lightMainTheme;
  let row: ThemeOptions = { ...themeOpts, overrides: { ...lightMainThemeOverrides } };
  if (opt && opt.direction === 'ltr') {
    row = {
      ...row,
      typography: {
        ...themeOpts.typography,
        fontFamily: ['Roboto Slab', 'serif'].join(','),
      },
    };
  }
  return createMuiTheme({
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
