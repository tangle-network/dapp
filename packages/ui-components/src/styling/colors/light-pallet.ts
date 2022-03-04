import { basePallet } from './base-pallet';

export const lightPallet = {
  ...basePallet,
  type: 'light',
  primaryText: '#474553',

  tabHeader: '#EBEEFD',
  borderColor: 'rgba(0, 0, 0, 0.13)',
  borderColor2: 'rgba(242, 244, 249, 1)',

  background: '#ffffff',
  cardBackground: '#fff',
  componentBackground: `#ffffff`,
  menuBackground: '#ffffff',

  lightSelectionBackground: '#F0F0F0',
  heavySelectionBackground: '#E3E3E3',
  heavySelectionBorder: '1px solid #C5C5C5',
  layer1Background: 'white',
  layer2Background: '#F4F4F4',
  layer3Background: 'white',
};
