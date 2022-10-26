import React from 'react';
import { ToggleThemeModeFunc } from '../hooks/useDarkMode';

export interface IWebbUIContext {
  theme: {
    isDarkMode: boolean;
    toggleThemeMode: ToggleThemeModeFunc;
  };
}

export type WebbUIProviderProps = {
  /**
   * If `true`, the `WebbUIProvider` will provide a error handler for inside components
   */
  hasErrorBoudary?: boolean;
  children?: React.ReactNode;
};
