import { useStore } from '@nepoche/react-environment';
import { DarkTheme } from './darktheme';
import { LightTheme } from './lightTheme';
import React from 'react';

export const Theme: React.FC = () => {
  const { theme } = useStore('ui');
  const isDarkTheme = theme === 'dark';

  return <>{isDarkTheme ? <DarkTheme /> : <LightTheme />}</>;
};
