import { basePallet } from './base-pallet';

export const darkPallet = {
  ...basePallet,
  type: 'dark',
  primaryText: '#FFFFFF',
  secondaryText: '#a3a0b7',
  borderColor: 'rgba(255, 255, 255, 0.22)',
  borderColor2: 'rgba(56, 60, 64, 1)',

  tabHeader: '#22262B',

  background: 'radial-gradient(102.76% 90.28% at 47.6% 114.36%, #010240 0%, #000000 100%)',
  cardBackground: '#181818',
  menuBackground: '#000',
  componentBackground: `#242324`,

  lightSelectionBackground: '#131313',
  heavySelectionBackground: 'rgba(255, 255, 255, 0.07)',
  heavySelectionBorder: '1px solid rgba(255, 255, 255, 0.19)',
  layer1Background: '#242324',
  layer2Background: '#131313',
  layer3Background: 'rgba(56, 60, 64, 1)',
};
