import { useLocalStorage } from '@webb-dapp/react-hooks/useLocalStorage';
import { DarkTheme } from '@webb-dapp/ui-components/styles/darktheme';
import { LightTheme } from '@webb-dapp/ui-components/styles/lightTheme';
import React from 'react';

type ThemeProps = {};

const Theme: React.FC<ThemeProps> = () => {
  const [theme, setTheme] = useLocalStorage('_theme');
  const isDarkTheme = false;

  return <>{isDarkTheme ? <DarkTheme /> : <LightTheme />}</>;
};
export default Theme;
