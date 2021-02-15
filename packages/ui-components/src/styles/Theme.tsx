import React from 'react';

import { LightTheme } from '@webb-dapp/ui-components/styles/lightTheme';
import { DarkTheme } from '@webb-dapp/ui-components/styles/darktheme';
import { useStore } from '@webb-dapp/react-environment';

type ThemeProps = {};

const Theme: React.FC<ThemeProps> = ({}) => {
  const ui = useStore('ui');
  const isDarkTheme = ui.theme === 'primary';
  return <>{isDarkTheme ? <DarkTheme /> : <LightTheme />}</>;
};
export default Theme;
