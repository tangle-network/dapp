/* eslint-disable sort-keys */
import { ThemeOptions } from '@material-ui/core';
import tinycolor from 'tinycolor2';

import { lightPallet } from '../colors';
import { FontFamilies } from '../fonts/font-families.enum';

const lightenRate = 5;
const darkenRate = 15;

export const lightMainTheme: ThemeOptions = {
  palette: {
    primary: {
      main: lightPallet.primary,
      light: tinycolor(lightPallet.primary).lighten(lightenRate).toHexString(),
      dark: tinycolor(lightPallet.primary).darken(darkenRate).toHexString(),
      contrastText: '#FFF',
    },
    secondary: {
      main: lightPallet.secondary,
      light: tinycolor(lightPallet.secondary).lighten(lightenRate).toHexString(),
      dark: tinycolor(lightPallet.secondary).darken(darkenRate).toHexString(),
      contrastText: '#FFF',
    },
    warning: {
      main: lightPallet.warning,
      light: tinycolor(lightPallet.warning).lighten(lightenRate).toHexString(),
      dark: tinycolor(lightPallet.warning).darken(darkenRate).toHexString(),
      contrastText: '#FFF',
    },
    success: {
      main: lightPallet.success,
      light: tinycolor(lightPallet.success).lighten(lightenRate).toHexString(),
      dark: tinycolor(lightPallet.success).darken(darkenRate).toHexString(),
      contrastText: '#FFF',
    },
    info: {
      main: lightPallet.info,
      light: tinycolor(lightPallet.info).lighten(lightenRate).toHexString(),
      dark: tinycolor(lightPallet.info).darken(darkenRate).toHexString(),
      contrastText: '#FFF',
    },
    text: {
      primary: lightPallet.primaryText,
      secondary: lightPallet.secondaryText,
      hint: '#B9B9B9',
      disabled: tinycolor(lightPallet.primaryText).lighten(lightenRate).toHexString(),
    },
    background: {
      default: lightPallet.mainBackground,
      paper: lightPallet.background,
    },
  },
  typography: {
    htmlFontSize: 17,
    fontSize: 12,
    fontFamily: [FontFamilies.Bitum, 'serif'].join(','),
  },
  overrides: {
    MuiBackdrop: {
      root: {
        backgroundColor: lightPallet.backdrop,
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
  },
};
