import { WebbColorsType } from '@webb-dapp/page-statistics/types';
import { useDarkMode } from '@webb-dapp/webb-ui-components/hooks/useDarkMode';
import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from '../../tailwind.config.js';
const fullConfig = resolveConfig(tailwindConfig);
export const useThemeColorsConfig = () => {
  useDarkMode();
  return fullConfig.theme?.colors as unknown as WebbColorsType;
};
