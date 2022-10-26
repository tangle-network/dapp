import { DeprecatedThemeOptions } from '@mui/material/styles';
import tinycolor from 'tinycolor2';

import { darkPallet } from '../colors';
import { FontFamilies } from '../fonts/font-families.enum';

const lightenRate = 5;
const darkenRate = 5;

export const darkMainTheme: DeprecatedThemeOptions = {
  palette: {
    primary: {
      main: darkPallet.primary,
      light: tinycolor(darkPallet.primary).lighten(lightenRate).toHexString(),
      dark: tinycolor(darkPallet.primary).darken(darkenRate).toHexString(),
      contrastText: '#FFF',
    },
    secondary: {
      main: darkPallet.secondary,
      light: tinycolor(darkPallet.secondary).lighten(lightenRate).toHexString(),
      dark: tinycolor(darkPallet.secondary).darken(darkenRate).toHexString(),
      contrastText: '#FFF',
    },
    warning: {
      main: darkPallet.warning,
      light: tinycolor(darkPallet.warning).lighten(lightenRate).toHexString(),
      dark: tinycolor(darkPallet.warning).darken(darkenRate).toHexString(),
      contrastText: '#FFF',
    },
    success: {
      main: darkPallet.success,
      light: tinycolor(darkPallet.success).lighten(lightenRate).toHexString(),
      dark: tinycolor(darkPallet.success).darken(darkenRate).toHexString(),
      contrastText: '#FFF',
    },
    info: {
      main: darkPallet.info,
      light: tinycolor(darkPallet.info).lighten(lightenRate).toHexString(),
      dark: tinycolor(darkPallet.info).darken(darkenRate).toHexString(),
      contrastText: '#FFF',
    },
    text: {
      primary: darkPallet.primaryText,
      secondary: darkPallet.secondaryText,
      disabled: tinycolor(darkPallet.primaryText).lighten(lightenRate).toHexString(),
    },
    background: {
      default: darkPallet.componentBackground,
      paper: darkPallet.background,
    },
    mode: 'dark',
  },
  typography: {
    allVariants: {
      color: darkPallet.primaryText,
    },
    htmlFontSize: 17,
    fontSize: 12,
    fontFamily: [FontFamilies.Bitum, 'serif'].join(','),
  },
  overrides: {
    MuiBackdrop: {
      root: {
        backgroundColor: darkPallet.background,
      },
    },
    MuiMenu: {
      paper: {
        boxShadow: '0px 3px 11px 0px #E8EAFC, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A',
      },
    },
    MuiSelect: {
      icon: {
        color: '#B9B9B9',
      },
    },
    MuiListItemText: {
      root: {
        padding: '0',
      },
    },
    MuiPaper: {
      root: {
        backgroundColor: '#F6F7FF',

        boxShadow: '0px 3px 11px 0px #E8EAFC, 0 3px 3px -2px #B2B2B21A, 0 1px 8px 0 #9A9A9A1A',
      },
    },
    MuiTableRow: {
      root: {
        height: 56,
      },
    },
    MuiTableCell: {
      root: {
        borderBottom: '1px solid rgba(224, 224, 224, .5)',
      },
      head: {
        fontSize: '0.95rem',
      },
      body: {
        fontSize: '0.95rem',
      },
    },
    MuiLinearProgress: {
      root: {
        backgroundColor: '#FFFFFF',
        color: '#FFFFFF',
      },
      bar: {
        backgroundColor: darkPallet.accentColor,
        color: darkPallet.accentColor,
      },
    },
  },
};
