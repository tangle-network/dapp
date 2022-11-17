import React from 'react';
import { notificationApi } from '../components';
import { ToggleThemeModeFunc } from '../hooks/useDarkMode';

export interface IWebbUIContext {
  theme: {
    isDarkMode: boolean;
    toggleThemeMode: ToggleThemeModeFunc;
  };

  customMainComponent: React.ReactElement | undefined;

  setMainComponent: (component: React.ReactElement | undefined) => void;

  notificationApi: typeof notificationApi;
}

export type WebbUIProviderProps = {
  /**
   * If `true`, the `WebbUIProvider` will provide a error handler for inside components
   */
  hasErrorBoudary?: boolean;

  children?: React.ReactNode;
};
