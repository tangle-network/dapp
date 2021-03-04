import { useStore } from '@webb-dapp/react-environment';
import { useLocalStorage } from '@webb-dapp/react-hooks/useLocalStorage';
import { DarkTheme } from '@webb-dapp/ui-components/styles/darktheme';
import { LightTheme } from '@webb-dapp/ui-components/styles/lightTheme';
import React, { useEffect } from 'react';

type ThemeProps = {};

const Theme: React.FC<ThemeProps> = () => {
  const ui = useStore('ui');
  const [theme, setTheme] = useLocalStorage('_theme');
  const isDarkTheme = theme ? theme === 'primary' : true;
  useEffect(() => {
    if (theme !== ui.theme) {
      setTheme(ui.theme);
    }
  }, [setTheme, theme, ui.theme]);
  return <>{isDarkTheme ? <DarkTheme /> : <LightTheme />}</>;
};
export default Theme;
