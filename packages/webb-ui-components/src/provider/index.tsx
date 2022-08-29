import React, { createContext, useMemo } from 'react';

import { ToggleThemeModeFunc, useDarkMode } from '../hooks';

export interface IWebbUIContext {
  theme: {
    isDarkMode: boolean;
    toggleThemeMode: ToggleThemeModeFunc;
  };
}

export const WebbUIContext = createContext<null | IWebbUIContext>(null);

export type WebbUIProviderProps = {};

export const WebbUIProvider: React.FC<WebbUIProviderProps> = ({ children }) => {
  const [isDarkMode, toggleMode] = useDarkMode();

  const theme = useMemo<IWebbUIContext['theme']>(
    () => ({
      isDarkMode,
      toggleThemeMode: toggleMode,
    }),
    [isDarkMode, toggleMode]
  );

  return <WebbUIContext.Provider value={{ theme }}>{children}</WebbUIContext.Provider>;
};
