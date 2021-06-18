import { DarkTheme } from '@webb-dapp/ui-components/styles/darktheme';
import { LightTheme } from '@webb-dapp/ui-components/styles/lightTheme';
import React from 'react';
import { useStore } from '@webb-dapp/react-environment';

type ThemeProps = {};

const Theme: React.FC<ThemeProps> = () => {
  const { theme } = useStore('ui');
  const isDarkTheme = theme === 'dark';

  return <>{isDarkTheme ? <DarkTheme /> : <LightTheme />}</>;
};
export default Theme;
